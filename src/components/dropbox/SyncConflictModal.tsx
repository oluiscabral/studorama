import React from 'react';
import { X, AlertTriangle, Cloud, HardDrive, Calendar, FileText } from 'lucide-react';
import { SyncConflict } from '../../types/dropbox';
import { useLanguage } from '../../hooks/useLanguage';
import { formatLastSync } from '../../utils/dropbox';

interface SyncConflictModalProps {
  isOpen: boolean;
  conflict: SyncConflict | null;
  onResolve: (strategy: 'local' | 'remote') => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function SyncConflictModal({
  isOpen,
  conflict,
  onResolve,
  onClose,
  isLoading = false
}: SyncConflictModalProps) {
  const { language } = useLanguage();

  if (!isOpen || !conflict) return null;

  const getDataSummary = (data: any) => {
    const sessions = data['studorama-sessions'] || [];
    const apiSettings = data['studorama-api-settings'] || {};
    const languageSettings = data['studorama-language'] || {};
    
    return {
      sessions: Array.isArray(sessions) ? sessions.length : 0,
      hasApiKey: !!apiSettings.openaiApiKey,
      language: languageSettings.language || 'en-US'
    };
  };

  const localSummary = getDataSummary(conflict.localData);
  const remoteSummary = getDataSummary(conflict.remoteData);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {language === 'pt-BR' ? 'Conflito de Sincronização' : 'Sync Conflict'}
                </h2>
                <p className="text-orange-100 text-sm">
                  {language === 'pt-BR' 
                    ? 'Dados diferentes encontrados no local e na nuvem'
                    : 'Different data found locally and in the cloud'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-yellow-800 mb-1">
                    {language === 'pt-BR' ? 'Ação Necessária' : 'Action Required'}
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    {language === 'pt-BR' 
                      ? 'Seus dados locais e da nuvem são diferentes. Escolha qual versão manter:'
                      : 'Your local and cloud data are different. Choose which version to keep:'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Local Data */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">
                    {language === 'pt-BR' ? 'Dados Locais' : 'Local Data'}
                  </h3>
                  <p className="text-blue-700 text-sm">
                    {language === 'pt-BR' ? 'No seu navegador' : 'In your browser'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    {language === 'pt-BR' ? 'Sessões de Estudo' : 'Study Sessions'}
                  </span>
                  <span className="font-medium text-blue-900">{localSummary.sessions}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    {language === 'pt-BR' ? 'Chave da API' : 'API Key'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    localSummary.hasApiKey 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {localSummary.hasApiKey 
                      ? (language === 'pt-BR' ? 'Configurada' : 'Configured')
                      : (language === 'pt-BR' ? 'Não configurada' : 'Not configured')
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    {language === 'pt-BR' ? 'Idioma' : 'Language'}
                  </span>
                  <span className="font-medium text-blue-900">
                    {localSummary.language === 'pt-BR' ? 'Português' : 'English'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-blue-200">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600">
                    {formatLastSync(conflict.localLastModified, language)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onResolve('local')}
                disabled={isLoading}
                className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <HardDrive className="w-5 h-5 mr-2" />
                    {language === 'pt-BR' ? 'Usar Dados Locais' : 'Use Local Data'}
                  </>
                )}
              </button>
            </div>

            {/* Remote Data */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">
                    {language === 'pt-BR' ? 'Dados da Nuvem' : 'Cloud Data'}
                  </h3>
                  <p className="text-green-700 text-sm">
                    {language === 'pt-BR' ? 'No Dropbox' : 'In Dropbox'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">
                    {language === 'pt-BR' ? 'Sessões de Estudo' : 'Study Sessions'}
                  </span>
                  <span className="font-medium text-green-900">{remoteSummary.sessions}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">
                    {language === 'pt-BR' ? 'Chave da API' : 'API Key'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    remoteSummary.hasApiKey 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {remoteSummary.hasApiKey 
                      ? (language === 'pt-BR' ? 'Configurada' : 'Configured')
                      : (language === 'pt-BR' ? 'Não configurada' : 'Not configured')
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">
                    {language === 'pt-BR' ? 'Idioma' : 'Language'}
                  </span>
                  <span className="font-medium text-green-900">
                    {remoteSummary.language === 'pt-BR' ? 'Português' : 'English'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-green-200">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600">
                    {formatLastSync(conflict.remoteLastModified, language)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onResolve('remote')}
                disabled={isLoading}
                className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Cloud className="w-5 h-5 mr-2" />
                    {language === 'pt-BR' ? 'Usar Dados da Nuvem' : 'Use Cloud Data'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">
                  {language === 'pt-BR' ? 'Aviso Importante' : 'Important Warning'}
                </h4>
                <p className="text-red-700 text-sm">
                  {language === 'pt-BR' 
                    ? 'A escolha que você fizer substituirá permanentemente os outros dados. Esta ação não pode ser desfeita.'
                    : 'Your choice will permanently replace the other data. This action cannot be undone.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}