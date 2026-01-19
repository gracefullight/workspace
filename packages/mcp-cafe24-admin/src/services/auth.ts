import { exec } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { URL } from "node:url";
import axios, { type AxiosError } from "axios";
import { isAfter, parseISO, subMinutes } from "date-fns";

/**
 * All available Cafe24 OAuth scopes
 * Use __ALL__ as CAFE24_OAUTH_SCOPE to include all scopes
 */
const ALL_SCOPES = [
  // Category
  "mall.read_category",
  "mall.write_category",
  // Product
  "mall.read_product",
  "mall.write_product",
  // Collection
  "mall.read_collection",
  "mall.write_collection",
  // Supply
  "mall.read_supply",
  "mall.write_supply",
  // Personal
  "mall.read_personal",
  "mall.write_personal",
  // Order
  "mall.read_order",
  "mall.write_order",
  // Community
  "mall.read_community",
  "mall.write_community",
  // Customer
  "mall.read_customer",
  "mall.write_customer",
  // Notification
  "mall.read_notification",
  "mall.write_notification",
  // Store
  "mall.read_store",
  "mall.write_store",
  // Promotion
  "mall.read_promotion",
  "mall.write_promotion",
  // Design
  "mall.read_design",
  "mall.write_design",
  // Application
  "mall.read_application",
  "mall.write_application",
  // Salesreport (read only)
  "mall.read_salesreport",
  // Privacy
  "mall.read_privacy",
  "mall.write_privacy",
  // Mileage
  "mall.read_mileage",
  "mall.write_mileage",
  // Shipping
  "mall.read_shipping",
  "mall.write_shipping",
  // Translation
  "mall.read_translation",
  "mall.write_translation",
  // Analytics (read only)
  "mall.read_analytics",
] as const;

function openBrowser(url: string) {
  const start =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  exec(`${start} "${url}"`, (error) => {
    if (error) {
      console.error(`Failed to open browser: ${error.message}`);
    }
  });
}

interface OAuthTokenResponse {
  access_token: string;
  expires_at?: string; // ISO date string e.g., "2021-03-01T14:00:00.000"
  refresh_token?: string;
  refresh_token_expires_at?: string; // ISO date string
  client_id?: string;
  mall_id?: string;
  user_id?: string;
  scopes?: string[];
  issued_at?: string;
  shop_no?: string;
  token_type?: string;
}

interface TokenData {
  access_token: string;
  expires_at?: string; // ISO date string
  refresh_token?: string;
  refresh_token_expires_at?: string; // ISO date string
  mall_id?: string;
  scopes?: string[];
  issued_at?: string;
}

// Token storage directory
const TOKEN_DIR = path.join(os.homedir(), ".cafe24", "tokens");

/**
 * Get token file path for a specific mall
 */
function getTokenFilePath(mallId: string): string {
  return path.join(TOKEN_DIR, `${mallId}.json`);
}

/**
 * Ensure token directory exists
 */
function ensureTokenDir(): void {
  if (!fs.existsSync(TOKEN_DIR)) {
    fs.mkdirSync(TOKEN_DIR, { recursive: true, mode: 0o700 });
  }
}

/**
 * Load token data from file
 */
function loadTokenFromFile(mallId: string): TokenData | null {
  try {
    const filePath = getTokenFilePath(mallId);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as TokenData;
  } catch {
    return null;
  }
}

/**
 * Save token data to file
 */
function saveTokenToFile(mallId: string, data: TokenData): void {
  try {
    ensureTokenDir();
    const filePath = getTokenFilePath(mallId);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), { mode: 0o600 });
  } catch (error) {
    console.error(`Failed to save token to file: ${error}`);
  }
}

/**
 * Check if token is expired based on ISO date string
 * Uses date-fns for reliable date parsing and comparison
 */
function isTokenExpiredByDate(expiresAt?: string): boolean {
  if (!expiresAt) {
    return true; // No expiration info means assume expired
  }

  try {
    const expirationDate = parseISO(expiresAt);
    const now = new Date();

    // Add 5 minute buffer before actual expiration
    const bufferedExpiration = subMinutes(expirationDate, 5);
    return isAfter(now, bufferedExpiration);
  } catch {
    return true; // Invalid date format means assume expired
  }
}

/**
 * Check if refresh token is expired
 * Uses date-fns for reliable date parsing and comparison
 */
function isRefreshTokenExpired(refreshTokenExpiresAt?: string): boolean {
  if (!refreshTokenExpiresAt) {
    return false; // No expiration info means assume valid
  }

  try {
    const expirationDate = parseISO(refreshTokenExpiresAt);
    return isAfter(new Date(), expirationDate);
  } catch {
    return true; // Invalid date format means assume expired
  }
}

// In-memory cache
let tokenData: TokenData | null = null;
let authorizationCode: string | null = process.env.CAFE24_AUTHORIZATION_CODE ?? null;
let callbackServer: http.Server | null = null;
let callbackPromise: Promise<string> | null = null;
let authorizeUrl: string | null = null;
let redirectUri: string | null = null;

function buildBasicAuthHeader(clientId: string, clientSecret: string): string {
  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  return `Basic ${encoded}`;
}

function storeTokenData(
  mallId: string,
  data: OAuthTokenResponse,
  fallbackRefreshToken?: string,
): void {
  const newTokenData: TokenData = {
    access_token: data.access_token,
    expires_at: data.expires_at,
    refresh_token: data.refresh_token ?? fallbackRefreshToken,
    refresh_token_expires_at: data.refresh_token_expires_at,
    mall_id: data.mall_id ?? mallId,
    scopes: data.scopes,
    issued_at: data.issued_at,
  };

  // Update in-memory cache
  tokenData = newTokenData;

  // Persist to file
  saveTokenToFile(mallId, newTokenData);
}

function resolveCallbackListenPort(): number {
  const configured = process.env.CAFE24_OAUTH_LISTEN_PORT;
  if (configured) {
    const parsed = Number(configured);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 8787;
}

function buildAuthorizeUrl(mallId: string, clientId: string, redirectUri: string): string {
  const configuredScope = process.env.CAFE24_OAUTH_SCOPE?.trim();

  // Handle __ALL__ reserved word to include all available scopes
  const scope =
    configuredScope === "__ALL__"
      ? ALL_SCOPES.join(",")
      : configuredScope || "mall.read_application,mall.write_application";

  const authorizeUrl = new URL(`https://${mallId}.cafe24api.com/api/v2/oauth/authorize`);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", scope);

  const state = process.env.CAFE24_OAUTH_STATE?.trim();
  if (state) {
    authorizeUrl.searchParams.set("state", state);
  }

  return authorizeUrl.toString();
}

function resolveLocalRedirectPath(): string {
  return process.env.CAFE24_REDIRECT_PATH?.trim() || "/cafe24/oauth/callback";
}

function resolveRemoteRedirectPath(localPath: string): string {
  const configured = process.env.CAFE24_OAUTH_REMOTE_PATH?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.CAFE24_OAUTH_REDIRECT_BASE_URL?.trim()) {
    return "/api/auth/callback/cafe24";
  }

  return localPath;
}

async function resolveCallbackBaseUrl(): Promise<string> {
  const configured = process.env.CAFE24_OAUTH_REDIRECT_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const port = resolveCallbackListenPort();
  return `http://localhost:${port}`;
}

function resolveRedirectUri(redirectPath: string): Promise<string> {
  return resolveCallbackBaseUrl().then((baseUrl) => `${baseUrl}${redirectPath}`);
}

async function getRedirectUri(redirectPath: string): Promise<string> {
  redirectUri = await resolveRedirectUri(redirectPath);
  return redirectUri;
}

function getLocalBridgeUrl(port: number, redirectPath: string): string {
  const baseUrl = process.env.CAFE24_OAUTH_LOCAL_BRIDGE_URL?.trim() || `http://localhost:${port}`;
  return `${baseUrl.replace(/\/$/, "")}${redirectPath}`;
}

// Assets directory path (relative to dist folder)
const ASSETS_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), "assets");

/**
 * Load success HTML page from assets
 */
function getSuccessHtml(): string {
  try {
    const htmlPath = path.join(ASSETS_DIR, "success.html");
    return fs.readFileSync(htmlPath, "utf-8");
  } catch {
    // Fallback if file not found
    return `<!DOCTYPE html><html><body><h1>Authorization Successful!</h1><p>You can close this window.</p></body></html>`;
  }
}

/**
 * Load error HTML page from assets and replace placeholder
 */
function getErrorHtml(errorMessage: string): string {
  try {
    const htmlPath = path.join(ASSETS_DIR, "error.html");
    const html = fs.readFileSync(htmlPath, "utf-8");
    return html.replace("{{ERROR_MESSAGE}}", errorMessage);
  } catch {
    // Fallback if file not found
    return `<!DOCTYPE html><html><body><h1>Authorization Failed</h1><p>${errorMessage}</p></body></html>`;
  }
}

async function waitForAuthorizationCode(
  _mallId: string,
  _clientId: string,
  redirectPath: string,
  expectedState?: string,
): Promise<string> {
  if (authorizationCode) {
    return authorizationCode;
  }

  if (callbackPromise) {
    return callbackPromise;
  }

  const port = resolveCallbackListenPort();

  callbackPromise = new Promise((resolve, reject) => {
    callbackServer = http.createServer((req, res) => {
      if (!req.url) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(getErrorHtml("Missing request URL"));
        return;
      }

      const requestUrl = new URL(req.url, `http://localhost:${port}`);
      if (requestUrl.pathname !== redirectPath) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(getErrorHtml("Not found"));
        return;
      }

      const error = requestUrl.searchParams.get("error");
      if (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(getErrorHtml(`Authorization failed: ${error}`));
        callbackServer?.close();
        callbackServer = null;
        callbackPromise = null;
        reject(new Error(`Authorization failed: ${error}`));
        return;
      }

      const state = requestUrl.searchParams.get("state");
      if (expectedState && state !== expectedState) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(getErrorHtml("Invalid state parameter"));
        return;
      }

      const code = requestUrl.searchParams.get("code");
      if (!code) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(getErrorHtml("Missing authorization code"));
        return;
      }

      authorizationCode = code;
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(getSuccessHtml());

      callbackServer?.close();
      callbackServer = null;
      callbackPromise = null;
      resolve(code);
    });

    callbackServer.listen(port, () => {
      const localBridgeUrl = getLocalBridgeUrl(port, redirectPath);
      callbackServer?.emit("ready", authorizeUrl);
      console.error(`Cafe24 OAuth local bridge URL: ${localBridgeUrl}`);

      setTimeout(
        () => {
          if (!authorizationCode) {
            callbackServer?.close();
            callbackServer = null;
            callbackPromise = null;
            reject(new Error("Timed out waiting for authorization code"));
          }
        },
        5 * 60 * 1000,
      );
    });

    callbackServer.on("error", (error) => {
      callbackServer = null;
      callbackPromise = null;
      reject(error);
    });
  });

  return callbackPromise;
}

export async function exchangeAuthorizationCode(
  mallId: string,
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string,
): Promise<OAuthTokenResponse> {
  const tokenUrl = `https://${mallId}.cafe24api.com/api/v2/oauth/token`;

  try {
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          Authorization: buildBasicAuthHeader(clientId, clientSecret),
        },
        timeout: 30000,
      },
    );

    const data = response.data as OAuthTokenResponse;
    storeTokenData(mallId, data);
    authorizationCode = null;

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 400:
            throw new Error("Bad Request: Invalid authorization code or redirect URI");
          case 401:
            throw new Error("Unauthorized: Invalid client ID or client secret");
          case 403:
            throw new Error("Forbidden: Access denied");
          default:
            throw new Error(`OAuth token exchange failed with status ${status}`);
        }
      } else {
        throw new Error("Network error during OAuth token exchange");
      }
    }
    throw error;
  }
}

/**
 * Refresh access token using refresh_token
 */
export async function refreshToken(
  mallId: string,
  clientId: string,
  clientSecret: string,
  refreshTokenValue: string,
): Promise<OAuthTokenResponse> {
  if (!refreshTokenValue) {
    throw new Error("No refresh token available. Please authenticate using authorization code.");
  }

  const tokenUrl = `https://${mallId}.cafe24api.com/api/v2/oauth/token`;

  try {
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshTokenValue,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          Authorization: buildBasicAuthHeader(clientId, clientSecret),
        },
        timeout: 30000,
      },
    );

    const data = response.data as OAuthTokenResponse;
    storeTokenData(mallId, data, refreshTokenValue);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        throw new Error("Invalid or expired refresh token. Please authenticate again.");
      }
    }
    throw new Error("Failed to refresh token");
  }
}

/**
 * Get cached access token or obtain new one via OAuth
 */
export async function getAccessToken(
  mallId: string,
  clientId?: string,
  clientSecret?: string,
): Promise<string> {
  // Direct token from environment (no OAuth)
  if (!clientId || !clientSecret) {
    const token = process.env.CAFE24_ACCESS_TOKEN;
    if (!token) {
      throw new Error("CAFE24_ACCESS_TOKEN environment variable is required");
    }
    return token;
  }

  // Check environment variable first
  const envToken = process.env.CAFE24_ACCESS_TOKEN;
  if (envToken) {
    return envToken;
  }

  // Try to load token from file if not in memory
  if (!tokenData) {
    tokenData = loadTokenFromFile(mallId);
    if (tokenData) {
      console.error(`Loaded token from file for mall: ${mallId}`);
    }
  }

  // Check if we have a valid (non-expired) access token
  if (tokenData?.access_token && !isTokenExpiredByDate(tokenData.expires_at)) {
    console.error(`Using cached access token (expires: ${tokenData.expires_at})`);
    return tokenData.access_token;
  }

  // Try to refresh if we have a valid refresh token
  if (tokenData?.refresh_token && !isRefreshTokenExpired(tokenData.refresh_token_expires_at)) {
    console.error("Access token expired, refreshing using refresh token...");
    try {
      const newTokens = await refreshToken(mallId, clientId, clientSecret, tokenData.refresh_token);
      return newTokens.access_token;
    } catch (error) {
      console.error("Failed to refresh token, starting new OAuth flow:", error);
      // Clear invalid token data
      tokenData = null;
    }
  }

  // OAuth flow - need new authorization
  console.error("No valid token found, starting OAuth authorization flow...");

  const localRedirectPath = resolveLocalRedirectPath();
  const expectedState = process.env.CAFE24_OAUTH_STATE?.trim();

  if (!authorizeUrl) {
    const remoteRedirectPath = resolveRemoteRedirectPath(localRedirectPath);
    const resolvedRedirectUri = await getRedirectUri(remoteRedirectPath);
    authorizeUrl = buildAuthorizeUrl(mallId, clientId, resolvedRedirectUri);
    console.error(`Cafe24 OAuth redirect URI: ${resolvedRedirectUri}`);
    console.error(`Cafe24 OAuth authorize URL: ${authorizeUrl}`);
    openBrowser(authorizeUrl);
  }

  const code = await waitForAuthorizationCode(mallId, clientId, localRedirectPath, expectedState);
  const finalRedirectUri = redirectUri ?? (await getRedirectUri(localRedirectPath));
  const tokens = await exchangeAuthorizationCode(
    mallId,
    clientId,
    clientSecret,
    code,
    finalRedirectUri,
  );

  return tokens.access_token;
}

/**
 * Get current token data (for debugging)
 */
export function getTokenData(): TokenData | null {
  return tokenData;
}
