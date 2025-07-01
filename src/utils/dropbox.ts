import { Dropbox } from 'dropbox';
import { DropboxConfig, DropboxFile, SyncConflict } from '../types/dropbox';

const STUDORAMA_FOLDER = '/Studorama';
const DATA_FILE = `${STUDORAMA_FOLDER}/studorama-data.json`;

export class DropboxSync {
  private dbx: Dropbox | null = null;
  private config: DropboxConfig;

  constructor(config: DropboxConfig) {
    this.config = config;
    if (config.accessToken && config.appKey) {
      this.dbx = new Dropbox({ 
        accessToken: config.accessToken,
        clientId: config.appKey,
        fetch: fetch
      });
    }
  }

  // Initialize Dropbox OAuth flow with user's app key
  static getAuthUrl(appKey: string): string {
    if (!appKey) {
      throw new Error('Dropbox App Key is required');
    }
    
    const dbx = new Dropbox({ 
      clientId: appKey,
      fetch: fetch
    });
    return dbx.getAuthenticationUrl(`${window.location.origin}/dropbox-callback`);
  }

  // Complete OAuth flow with user's app key
  static async completeAuth(code: string, appKey: string): Promise<string> {
    if (!appKey) {
      throw new Error('Dropbox App Key is required');
    }

    try {
      const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: appKey,
          redirect_uri: `${window.location.origin}/dropbox-callback`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error_description || 'Failed to exchange code for token');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error completing Dropbox auth:', error);
      throw error;
    }
  }

  // Connect to Dropbox with user's credentials
  connect(accessToken: string, appKey: string): void {
    this.config.accessToken = accessToken;
    this.config.appKey = appKey;
    this.config.isConnected = true;
    this.dbx = new Dropbox({ 
      accessToken,
      clientId: appKey,
      fetch: fetch
    });
  }

  // Disconnect from Dropbox
  disconnect(): void {
    this.config.accessToken = null;
    this.config.isConnected = false;
    this.dbx = null;
  }

  // Check if connected
  isConnected(): boolean {
    return this.config.isConnected && this.dbx !== null && !!this.config.appKey;
  }

  // Create Studorama folder if it doesn't exist
  private async ensureFolder(): Promise<void> {
    if (!this.dbx) throw new Error('Not connected to Dropbox');

    try {
      await this.dbx.filesGetMetadata({ path: STUDORAMA_FOLDER });
    } catch (error: any) {
      if (error.status === 409) {
        // Folder doesn't exist, create it
        await this.dbx.filesCreateFolderV2({ path: STUDORAMA_FOLDER });
      } else {
        throw error;
      }
    }
  }

  // Upload data to Dropbox
  async uploadData(data: any): Promise<void> {
    if (!this.dbx) throw new Error('Not connected to Dropbox');

    await this.ensureFolder();

    const content = JSON.stringify({
      data,
      lastModified: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2);

    await this.dbx.filesUpload({
      path: DATA_FILE,
      contents: content,
      mode: 'overwrite',
      autorename: false
    });

    this.config.lastSync = new Date().toISOString();
  }

  // Download data from Dropbox
  async downloadData(): Promise<any> {
    if (!this.dbx) throw new Error('Not connected to Dropbox');

    try {
      const response = await this.dbx.filesDownload({ path: DATA_FILE });
      const fileBlob = (response.result as any).fileBinary;
      const content = await this.blobToText(fileBlob);
      const parsedData = JSON.parse(content);
      
      return {
        data: parsedData.data,
        lastModified: parsedData.lastModified,
        version: parsedData.version
      };
    } catch (error: any) {
      if (error.status === 409) {
        // File doesn't exist
        return null;
      }
      throw error;
    }
  }

  // Get file metadata
  async getFileMetadata(): Promise<DropboxFile | null> {
    if (!this.dbx) throw new Error('Not connected to Dropbox');

    try {
      const response = await this.dbx.filesGetMetadata({ path: DATA_FILE });
      const metadata = response.result as any;
      
      return {
        name: metadata.name,
        path: metadata.path_display,
        content: '',
        lastModified: metadata.server_modified,
        size: metadata.size
      };
    } catch (error: any) {
      if (error.status === 409) {
        return null;
      }
      throw error;
    }
  }

  // Check for conflicts
  async checkForConflicts(localData: any, localLastModified: string): Promise<SyncConflict | null> {
    const remoteFile = await this.downloadData();
    
    if (!remoteFile) {
      return null; // No remote file, no conflict
    }

    const remoteLastModified = remoteFile.lastModified;
    const localTime = new Date(localLastModified).getTime();
    const remoteTime = new Date(remoteLastModified).getTime();

    // If remote is newer and data is different
    if (remoteTime > localTime) {
      const localDataStr = JSON.stringify(localData);
      const remoteDataStr = JSON.stringify(remoteFile.data);
      
      if (localDataStr !== remoteDataStr) {
        return {
          localData,
          remoteData: remoteFile.data,
          localLastModified,
          remoteLastModified,
          conflictType: 'data_mismatch'
        };
      }
    }

    return null;
  }

  // Sync data with conflict resolution
  async syncData(
    localData: any, 
    localLastModified: string,
    strategy: 'local' | 'remote' | 'merge' = 'local'
  ): Promise<{ success: boolean; data?: any; conflict?: SyncConflict }> {
    try {
      const conflict = await this.checkForConflicts(localData, localLastModified);
      
      if (conflict) {
        if (strategy === 'local') {
          // Upload local data, overwriting remote
          await this.uploadData(localData);
          return { success: true, data: localData };
        } else if (strategy === 'remote') {
          // Use remote data
          return { success: true, data: conflict.remoteData };
        } else {
          // Return conflict for user resolution
          return { success: false, conflict };
        }
      } else {
        // No conflict, upload local data
        await this.uploadData(localData);
        return { success: true, data: localData };
      }
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    }
  }

  // Helper method to convert blob to text
  private async blobToText(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(blob);
    });
  }

  // Get account info
  async getAccountInfo(): Promise<any> {
    if (!this.dbx) throw new Error('Not connected to Dropbox');
    
    const response = await this.dbx.usersGetCurrentAccount();
    return response.result;
  }
}

// Utility functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatLastSync(dateString: string | null, language: string): string {
  if (!dateString) {
    return language === 'pt-BR' ? 'Nunca sincronizado' : 'Never synced';
  }
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) {
    return language === 'pt-BR' ? 'Agora mesmo' : 'Just now';
  } else if (diffMins < 60) {
    return language === 'pt-BR' ? `${diffMins} min atrás` : `${diffMins} min ago`;
  } else if (diffHours < 24) {
    return language === 'pt-BR' ? `${diffHours}h atrás` : `${diffHours}h ago`;
  } else {
    return language === 'pt-BR' ? `${diffDays} dias atrás` : `${diffDays} days ago`;
  }
}