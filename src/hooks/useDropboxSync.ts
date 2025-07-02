import { useState, useEffect, useCallback } from 'react';
import { DropboxSync } from '../utils/dropbox';
import { DropboxConfig, SyncStatus, SyncConflict } from '../types/dropbox';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_CONFIG: DropboxConfig = {
  accessToken: null,
  isConnected: false,
  lastSync: null,
  autoSync: true,
  syncInterval: 30 // 30 minutes
};

export function useDropboxSync() {
  const [config, setConfig] = useLocalStorage<DropboxConfig>('studorama-dropbox-config', DEFAULT_CONFIG);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isLoading: false,
    lastSync: config.lastSync,
    error: null,
    hasConflict: false
  });
  
  const [dropboxSync] = useState(() => new DropboxSync(config));

  // Update sync instance when config changes
  useEffect(() => {
    if (config.accessToken && !dropboxSync.isConnected()) {
      dropboxSync.connect(config.accessToken);
    } else if (!config.accessToken && dropboxSync.isConnected()) {
      dropboxSync.disconnect();
    }
  }, [config.accessToken, dropboxSync]);

  // Auto-sync interval
  useEffect(() => {
    if (!config.autoSync || !config.isConnected) return;

    const interval = setInterval(() => {
      syncData();
    }, config.syncInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [config.autoSync, config.isConnected, config.syncInterval]);

  // Connect to Dropbox
  const connectDropbox = useCallback(async () => {
    try {
      const authUrl = DropboxSync.getAuthUrl();
      const popup = window.open(authUrl, '_blank', 'width=600,height=700');
      
      // Listen for the auth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'DROPBOX_AUTH_SUCCESS') {
          const { accessToken } = event.data;
          setConfig(prev => ({
            ...prev,
            accessToken,
            isConnected: true
          }));
          setSyncStatus(prev => ({
            ...prev,
            error: null
          }));
          window.removeEventListener('message', handleMessage);
          popup?.close();
        } else if (event.data.type === 'DROPBOX_AUTH_ERROR') {
          setSyncStatus(prev => ({
            ...prev,
            error: event.data.error
          }));
          window.removeEventListener('message', handleMessage);
          popup?.close();
        }
      };
      
      window.addEventListener('message', handleMessage);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);
    } catch (error: any) {
      setSyncStatus(prev => ({
        ...prev,
        error: error.message
      }));
    }
  }, [setConfig]);

  // Disconnect from Dropbox
  const disconnectDropbox = useCallback(() => {
    dropboxSync.disconnect();
    setConfig(DEFAULT_CONFIG);
    setSyncStatus({
      isLoading: false,
      lastSync: null,
      error: null,
      hasConflict: false
    });
  }, [dropboxSync, setConfig]);

  // Get all local data for syncing
  const getAllLocalData = useCallback(() => {
    const data: any = {};
    
    // Get all Studorama data from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('studorama-')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch (error) {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    
    return {
      data,
      lastModified: localStorage.getItem('studorama-last-modified') || new Date().toISOString()
    };
  }, []);

  // Set all local data from sync
  const setAllLocalData = useCallback((syncedData: any) => {
    // Clear existing Studorama data
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('studorama-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Set new data
    Object.entries(syncedData.data).forEach(([key, value]) => {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    });
    
    localStorage.setItem('studorama-last-modified', new Date().toISOString());
  }, []);

  // Sync data
  const syncData = useCallback(async (strategy?: 'local' | 'remote') => {
    if (!dropboxSync.isConnected()) {
      setSyncStatus(prev => ({
        ...prev,
        error: 'Not connected to Dropbox'
      }));
      return;
    }

    setSyncStatus(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      const localData = getAllLocalData();
      const result = await dropboxSync.syncData(
        localData.data,
        localData.lastModified,
        strategy
      );

      if (result.success) {
        if (strategy === 'remote' && result.data) {
          setAllLocalData({ data: result.data });
        }
        
        setConfig(prev => ({
          ...prev,
          lastSync: new Date().toISOString()
        }));
        
        setSyncStatus(prev => ({
          ...prev,
          isLoading: false,
          lastSync: new Date().toISOString(),
          hasConflict: false,
          conflict: undefined
        }));
      } else if (result.conflict) {
        setSyncStatus(prev => ({
          ...prev,
          isLoading: false,
          hasConflict: true,
          conflict: result.conflict
        }));
      }
    } catch (error: any) {
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  }, [dropboxSync, getAllLocalData, setAllLocalData, setConfig]);

  // Resolve conflict
  const resolveConflict = useCallback(async (strategy: 'local' | 'remote') => {
    if (!syncStatus.conflict) return;
    
    setSyncStatus(prev => ({
      ...prev,
      isLoading: true
    }));

    try {
      if (strategy === 'local') {
        await dropboxSync.uploadData(syncStatus.conflict.localData);
      } else {
        setAllLocalData({ data: syncStatus.conflict.remoteData });
      }
      
      setConfig(prev => ({
        ...prev,
        lastSync: new Date().toISOString()
      }));
      
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        lastSync: new Date().toISOString(),
        hasConflict: false,
        conflict: undefined
      }));
    } catch (error: any) {
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  }, [syncStatus.conflict, dropboxSync, setAllLocalData, setConfig]);

  // Update config
  const updateConfig = useCallback((updates: Partial<DropboxConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, [setConfig]);

  // Get account info
  const getAccountInfo = useCallback(async () => {
    if (!dropboxSync.isConnected()) return null;
    
    try {
      return await dropboxSync.getAccountInfo();
    } catch (error) {
      console.error('Error getting account info:', error);
      return null;
    }
  }, [dropboxSync]);

  return {
    config,
    syncStatus,
    isConnected: config.isConnected,
    connectDropbox,
    disconnectDropbox,
    syncData,
    resolveConflict,
    updateConfig,
    getAccountInfo,
    getAllLocalData,
    setAllLocalData
  };
}