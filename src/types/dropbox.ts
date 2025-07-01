export interface DropboxConfig {
  appKey: string;
  accessToken: string | null;
  isConnected: boolean;
  lastSync: string | null;
  autoSync: boolean;
  syncInterval: number; // in minutes
}

export interface SyncConflict {
  localData: any;
  remoteData: any;
  localLastModified: string;
  remoteLastModified: string;
  conflictType: 'data_mismatch' | 'version_conflict';
}

export interface SyncStatus {
  isLoading: boolean;
  lastSync: string | null;
  error: string | null;
  hasConflict: boolean;
  conflict?: SyncConflict;
}

export interface DropboxFile {
  name: string;
  path: string;
  content: string;
  lastModified: string;
  size: number;
}

export interface ExportData {
  sessions: any[];
  apiSettings: any;
  languageSettings: any;
  dropboxConfig: any;
  exportDate: string;
  version: string;
}