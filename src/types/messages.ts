// src/types/messages.ts

export type ExtensionMessage =
  | FetchManifestMessage
  | UpdateIgnoreListMessage
  | GetDetectedManifestsMessage
  | UpdateSettingsMessage
  | ClearHistoryMessage;

export interface FetchManifestMessage {
  action: 'fetch-manifest';
  url: string;
}

export interface UpdateIgnoreListMessage {
  action: 'update-ignore-list';
  url: string;
  ignore: boolean;
}

export interface GetDetectedManifestsMessage {
  action: 'get-detected';
  tabId: number;
}

export interface UpdateSettingsMessage {
  action: 'update-settings';
  settings: Partial<ExtensionSettings>;
}

export interface ClearHistoryMessage {
  action: 'clear-history';
}

export interface ExtensionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ExtensionSettings {
  autoInterceptEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  defaultView: 'raw' | 'structured' | 'timeline';
  syntaxTheme: string;
  ignoredUrls: string[];
  safelist: string[];
}
