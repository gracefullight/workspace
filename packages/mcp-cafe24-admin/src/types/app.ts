export type AppExtensionType = "section" | "embedded";

export interface AppInfo extends Record<string, unknown> {
  version: string | null;
  version_expiration_date: string | null;
  initial_version: string | null;
  previous_version: string | null;
  extension_type: AppExtensionType | null;
}

export interface AppGetResponse extends Record<string, unknown> {
  app: AppInfo;
}

export interface AppUpdateRequest extends Record<string, unknown> {
  request: {
    version: string;
    extension_type: AppExtensionType;
  };
}

export interface AppUpdateResponse {
  app: {
    version: string;
    extension_type: AppExtensionType;
  };
}
