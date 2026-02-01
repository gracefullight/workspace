export function setupFacebookSDK(appId?: string) {
  if (globalThis.window === undefined || !appId) {
    return;
  }

  // Set up fbAsyncInit before loading Facebook SDK script
  if (!globalThis.window.fbAsyncInit) {
    globalThis.window.fbAsyncInit = () => {
      if (globalThis.window.FB) {
        globalThis.window.FB.init({
          appId,
          cookie: true,
          version: "v18.0",
          xfbml: true,
        });
      }
    };
  }
}

export function ensureFacebookInitialized(appId?: string): typeof window.FB | null {
  if (globalThis.window === undefined) {
    return null;
  }

  // Set up fbAsyncInit if not already set (for when SDK loads asynchronously)
  setupFacebookSDK(appId);

  if (!globalThis.window.FB) {
    return null;
  }

  if (!appId) {
    console.error("Facebook App ID is not configured");
    return null;
  }

  const fb = globalThis.window.FB as typeof globalThis.window.FB & { getAppId?: () => string };
  if (fb.getAppId?.() === appId) {
    return globalThis.window.FB;
  }

  // If SDK is already loaded but not initialized, initialize it directly
  // fbAsyncInit will handle initialization if SDK loads after this call
  try {
    if (globalThis.window.FB.init && typeof globalThis.window.FB.init === "function") {
      globalThis.window.FB.init({
        appId,
        cookie: true,
        version: "v18.0",
        xfbml: true,
      });
    }
  } catch (error) {
    console.error("Failed to initialize Facebook SDK:", error);
    return null;
  }

  return globalThis.window.FB ?? null;
}
