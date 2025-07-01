import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, FolderSync as Sync, Settings as SettingsIcon, User, HardDrive, Clock, AlertCircle, CheckCircle, Loader2, RefreshCw, Key, Download, Upload, FileText } from 'lucide-react';
import { useDropboxSync } from '../../hooks/useDropboxSync';
import { useLanguage } from '../../hooks/useLanguage';
import { formatLastSync, formatFileSize } from '../../utils/dropbox';
import { ExportData } from '../../types/dropbox';
import SyncConflictModal from './SyncConflictModal';

export default function DropboxSyncSettings() {
  const { language } = useLanguage();
  const { 
    config, 
    syncStatus, 
    isConnected, 
    connectDropbox, 
    disconnectDropbox, 
    syncData, 
    resolveConflict, 
    updateConfig,
    getAccountInfo,
    getAllLocalData,
    setAllLocalData
  } = useDropboxSync();

  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [appKey, setAppKey] = useState(config.appKey || '');
  const [isConnecting, setIsConnecting] = useState(false);

  // Load account info when connected
  useEffect(() => {
    if (isConnected) {
      getAccountInfo().then(setAccountInfo);
    } else {
      setAccountInfo(null);
    }
  }, [isConnected, getAccountInfo]);

  // Show conflict modal when conflict detected
  useEffect(() => {
    if (syncStatus.hasConflict) {
      setShowConflictModal(true);
    }
  }, [syncStatus.hasConflict]);

  const handleConnect = async () => {
    if (!appKey.trim()) {
      alert(language === 'pt-BR' ? 'Por favor, insira sua Dropbox App Key' : 'Please enter your Dropbox App Key');
      return;
    }

    setIsConnecting(true);
    // Store app key temporarily for the callback
    localStorage.setItem('dropbox-temp-app-key', appKey);
    
    try {
      await connectDropbox(appKey);
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    await syncData();
  };

  const handleConflictResolve = async (strategy: 'local' | 'remote') => {
    await resolveConflict(strategy);
    setShowConflictModal(false);
  };

  const handleExportData = () => {
    try {
      const localData = getAllLocalData();
      const exportData: ExportData = {
        sessions: localData.data['studorama-sessions'] || [],
        apiSettings: localData.data['studorama-api-settings'] || {},
        languageSettings: localData.data['studorama-language'] || {},
        dropboxConfig: { ...config, accessToken: null }, // Don't export access token
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studorama-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert(language === 'pt-BR' ? 'Erro ao exportar dados' : 'Error exporting data');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content) as ExportData;

        // Validate import data
        if (!importData.version || !importData.exportDate) {
          throw new Error('Invalid backup file format');
        }

        // Confirm import
        const confirmMessage = language === 'pt-BR' 
          ? `Importar backup de ${new Date(importData.exportDate).toLocaleDateString()}? Isso substituirá todos os dados atuais.`
          : `Import backup from ${new Date(importData.exportDate).toLocaleDateString()}? This will replace all current data.`;
        
        if (!confirm(confirmMessage)) return;

        // Import data
        const dataToImport = {
          'studorama-sessions': importData.sessions,
          'studorama-api-settings': importData.apiSettings,
          'studorama-language': importData.languageSettings,
        };

        setAllLocalData({ data: dataToImport });

        // Update dropbox config (without access token)
        if (importData.dropboxConfig) {
          updateConfig({
            ...importData.dropboxConfig,
            accessToken: config.accessToken // Keep current access token
          });
        }

        alert(language === 'pt-BR' ? 'Dados importados com sucesso!' : 'Data imported successfully!');
        
        // Refresh page to reflect changes
        window.location.reload();
      } catch (error) {
        console.error('Import error:', error);
        alert(language === 'pt-BR' ? 'Erro ao importar dados. Verifique o formato do arquivo.' : 'Error importing data. Please check the file format.');
      }
    };

    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const getSyncStatusIcon = () => {
    if (syncStatus.isLoading) {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />;
    }
    if (syncStatus.error) {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    if (syncStatus.hasConflict) {
      return <AlertCircle className="w-5 h-5 text-orange-600" />;
    }
    if (syncStatus.lastSync) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    return <Cloud className="w-5 h-5 text-gray-400" />;
  };

  const getSyncStatusText = () => {
    if (syncStatus.isLoading) {
      return language === 'pt-BR' ? 'Sincronizando...' : 'Syncing...';
    }
    if (syncStatus.error) {
      return syncStatus.error;
    }
    if (syncStatus.hasConflict) {
      return language === 'pt-BR' ? 'Conflito detectado' : 'Conflict detected';
    }
    if (syncStatus.lastSync) {
      return language === 'pt-BR' ? 'Sincronizado' : 'Synced';
    }
    return language === 'pt-BR' ? 'Nunca sincronizado' : 'Never synced';
  };

  return (
    <div className="space-y-6">
      {/* Import/Export Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'pt-BR' ? 'Importar/Exportar Dados' : 'Import/Export Data'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'pt-BR' 
                ? 'Faça backup ou restaure seus dados de um arquivo'
                : 'Backup or restore your data from a file'
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>{language === 'pt-BR' ? 'Exportar Dados' : 'Export Data'}</span>
          </button>

          <label className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>{language === 'pt-BR' ? 'Importar Dados' : 'Import Data'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <strong>{language === 'pt-BR' ? 'Nota:' : 'Note:'}</strong>{' '}
            {language === 'pt-BR' 
              ? 'Os dados exportados incluem suas sessões de estudo, configurações e preferências, mas não incluem tokens de acesso por segurança.'
              : 'Exported data includes your study sessions, settings, and preferences, but excludes access tokens for security.'
            }
          </p>
        </div>
      </div>

      {/* Dropbox Sync Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isConnected ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {isConnected ? (
                <Cloud className="w-5 h-5 text-green-600" />
              ) : (
                <CloudOff className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'pt-BR' ? 'Sincronização Dropbox' : 'Dropbox Sync'}
              </h3>
              <p className="text-sm text-gray-600">
                {isConnected 
                  ? (language === 'pt-BR' ? 'Conectado e sincronizando' : 'Connected and syncing')
                  : (language === 'pt-BR' ? 'Configure sua própria autenticação Dropbox' : 'Configure your own Dropbox authentication')
                }
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {isConnected 
              ? (language === 'pt-BR' ? 'Conectado' : 'Connected')
              : (language === 'pt-BR' ? 'Desconectado' : 'Disconnected')
            }
          </div>
        </div>

        {!isConnected ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                {language === 'pt-BR' ? 'Configure sua própria autenticação Dropbox' : 'Set up your own Dropbox authentication'}
              </h4>
              <p className="text-blue-800 text-sm mb-4">
                {language === 'pt-BR' 
                  ? 'Para manter o Studorama totalmente sem servidor, você precisa criar seu próprio app Dropbox e fornecer a App Key.'
                  : 'To keep Studorama fully serverless, you need to create your own Dropbox app and provide the App Key.'
                }
              </p>
              <div className="bg-blue-100 rounded-lg p-3 mb-4">
                <h5 className="font-medium text-blue-900 mb-2">
                  {language === 'pt-BR' ? 'Como obter sua Dropbox App Key:' : 'How to get your Dropbox App Key:'}
                </h5>
                <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
                  <li>{language === 'pt-BR' ? 'Visite' : 'Visit'} <a href="https://www.dropbox.com/developers/apps" target="_blank" rel="noopener noreferrer" className="underline">dropbox.com/developers/apps</a></li>
                  <li>{language === 'pt-BR' ? 'Clique em "Create app"' : 'Click "Create app"'}</li>
                  <li>{language === 'pt-BR' ? 'Escolha "Scoped access" e "Full Dropbox"' : 'Choose "Scoped access" and "Full Dropbox"'}</li>
                  <li>{language === 'pt-BR' ? 'Nomeie seu app (ex: "Meu Studorama")' : 'Name your app (e.g., "My Studorama")'}</li>
                  <li>{language === 'pt-BR' ? 'Nas configurações, adicione' : 'In settings, add'} <code className="bg-blue-200 px-1 rounded">{window.location.origin}/dropbox-callback</code> {language === 'pt-BR' ? 'como Redirect URI' : 'as Redirect URI'}</li>
                  <li>{language === 'pt-BR' ? 'Copie a "App key" e cole abaixo' : 'Copy the "App key" and paste below'}</li>
                </ol>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="w-4 h-4 inline mr-1" />
                {language === 'pt-BR' ? 'Sua Dropbox App Key' : 'Your Dropbox App Key'}
              </label>
              <input
                type="text"
                value={appKey}
                onChange={(e) => setAppKey(e.target.value)}
                placeholder={language === 'pt-BR' ? 'Cole sua App Key aqui...' : 'Paste your App Key here...'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {language === 'pt-BR' 
                  ? 'Sua App Key é armazenada localmente e nunca compartilhada.'
                  : 'Your App Key is stored locally and never shared.'
                }
              </p>
            </div>
            
            <button
              onClick={handleConnect}
              disabled={!appKey.trim() || isConnecting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isConnecting ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Cloud className="w-5 h-5 mr-2" />
              )}
              {isConnecting 
                ? (language === 'pt-BR' ? 'Conectando...' : 'Connecting...')
                : (language === 'pt-BR' ? 'Conectar ao Dropbox' : 'Connect to Dropbox')
              }
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Account Info */}
            {accountInfo && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    {accountInfo.name?.display_name || accountInfo.email}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>{accountInfo.email}</p>
                  {accountInfo.quota && (
                    <p className="mt-1">
                      {language === 'pt-BR' ? 'Armazenamento:' : 'Storage:'} {' '}
                      {formatFileSize(accountInfo.quota.used)} / {formatFileSize(accountInfo.quota.allocated)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Sync Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getSyncStatusIcon()}
                  <span className="font-medium text-gray-900">
                    {language === 'pt-BR' ? 'Status da Sincronização' : 'Sync Status'}
                  </span>
                </div>
                <button
                  onClick={handleSync}
                  disabled={syncStatus.isLoading}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${syncStatus.isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {language === 'pt-BR' ? 'Status:' : 'Status:'}
                  </span>
                  <span className={`font-medium ${
                    syncStatus.error ? 'text-red-600' : 
                    syncStatus.hasConflict ? 'text-orange-600' : 
                    'text-gray-900'
                  }`}>
                    {getSyncStatusText()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {language === 'pt-BR' ? 'Última sincronização:' : 'Last sync:'}
                  </span>
                  <span className="text-gray-900">
                    {formatLastSync(syncStatus.lastSync, language)}
                  </span>
                </div>
              </div>

              {syncStatus.hasConflict && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => setShowConflictModal(true)}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {language === 'pt-BR' ? 'Resolver Conflito' : 'Resolve Conflict'}
                  </button>
                </div>
              )}
            </div>

            {/* Sync Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <SettingsIcon className="w-4 h-4 mr-2" />
                {language === 'pt-BR' ? 'Configurações de Sincronização' : 'Sync Settings'}
              </h4>
              
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {language === 'pt-BR' ? 'Sincronização automática' : 'Auto sync'}
                  </span>
                  <input
                    type="checkbox"
                    checked={config.autoSync}
                    onChange={(e) => updateConfig({ autoSync: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
                
                {config.autoSync && (
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      {language === 'pt-BR' ? 'Intervalo de sincronização (minutos)' : 'Sync interval (minutes)'}
                    </label>
                    <select
                      value={config.syncInterval}
                      onChange={(e) => updateConfig({ syncInterval: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={5}>5 {language === 'pt-BR' ? 'minutos' : 'minutes'}</option>
                      <option value={15}>15 {language === 'pt-BR' ? 'minutos' : 'minutes'}</option>
                      <option value={30}>30 {language === 'pt-BR' ? 'minutos' : 'minutes'}</option>
                      <option value={60}>1 {language === 'pt-BR' ? 'hora' : 'hour'}</option>
                      <option value={180}>3 {language === 'pt-BR' ? 'horas' : 'hours'}</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Sync */}
            <button
              onClick={handleSync}
              disabled={syncStatus.isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {syncStatus.isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Sync className="w-5 h-5 mr-2" />
              )}
              {syncStatus.isLoading 
                ? (language === 'pt-BR' ? 'Sincronizando...' : 'Syncing...')
                : (language === 'pt-BR' ? 'Sincronizar Agora' : 'Sync Now')
              }
            </button>

            {/* Disconnect */}
            <button
              onClick={disconnectDropbox}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <CloudOff className="w-5 h-5 mr-2" />
              {language === 'pt-BR' ? 'Desconectar Dropbox' : 'Disconnect Dropbox'}
            </button>
          </div>
        )}
      </div>

      {/* Conflict Resolution Modal */}
      <SyncConflictModal
        isOpen={showConflictModal}
        conflict={syncStatus.conflict || null}
        onResolve={handleConflictResolve}
        onClose={() => setShowConflictModal(false)}
        isLoading={syncStatus.isLoading}
      />
    </div>
  );
}