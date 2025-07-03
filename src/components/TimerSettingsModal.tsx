import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Timer, AlertTriangle, Zap } from 'lucide-react';
import { TimerSettings } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';

interface TimerSettingsModalProps {
  timerSettings: TimerSettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: TimerSettings) => void;
}

export default function TimerSettingsModal({ timerSettings, isOpen, onClose, onSave }: TimerSettingsModalProps) {
  const { t, language } = useLanguage();
  const { themeConfig } = useTheme();
  
  const [settings, setSettings] = useState<TimerSettings>(timerSettings);

  useEffect(() => {
    if (isOpen) {
      setSettings(timerSettings);
    }
  }, [isOpen, timerSettings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const updateSetting = <K extends keyof TimerSettings>(key: K, value: TimerSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-xl shadow-xl border max-w-lg w-full max-h-[90vh] overflow-hidden"
        style={{
          backgroundColor: themeConfig.colors.surface,
          borderColor: themeConfig.colors.border,
        }}
      >
        {/* Header */}
        <div 
          className="p-6 border-b"
          style={{ borderColor: themeConfig.colors.border }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: themeConfig.colors.primary + '20' }}
              >
                <Timer className="w-5 h-5" style={{ color: themeConfig.colors.primary }} />
              </div>
              <h2 className="text-xl font-semibold" style={{ color: themeConfig.colors.text }}>
                {language === 'pt-BR' ? 'Configurações de Timer' : 'Timer Settings'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ color: themeConfig.colors.textMuted }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto space-y-6">
          {/* Session Timer */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-5 h-5" style={{ color: themeConfig.colors.info }} />
              <h3 className="text-lg font-semibold" style={{ color: themeConfig.colors.text }}>
                {language === 'pt-BR' ? 'Timer da Sessão' : 'Session Timer'}
              </h3>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.sessionTimerEnabled}
                  onChange={(e) => updateSetting('sessionTimerEnabled', e.target.checked)}
                  className="w-4 h-4 rounded focus:ring-2"
                  style={{
                    accentColor: themeConfig.colors.primary,
                    '--tw-ring-color': themeConfig.colors.primary,
                  }}
                />
                <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                  {language === 'pt-BR' ? 'Habilitar timer da sessão' : 'Enable session timer'}
                </span>
              </label>
              
              {settings.sessionTimerEnabled && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.colors.text }}>
                    {language === 'pt-BR' ? 'Duração da sessão (minutos)' : 'Session duration (minutes)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="480"
                    value={settings.sessionTimerDuration || 30}
                    onChange={(e) => updateSetting('sessionTimerDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 outline-none transition-colors"
                    style={{
                      backgroundColor: themeConfig.colors.background,
                      borderColor: themeConfig.colors.border,
                      color: themeConfig.colors.text,
                      '--tw-ring-color': themeConfig.colors.primary,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Question Timer */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Timer className="w-5 h-5" style={{ color: themeConfig.colors.warning }} />
              <h3 className="text-lg font-semibold" style={{ color: themeConfig.colors.text }}>
                {language === 'pt-BR' ? 'Timer por Questão' : 'Question Timer'}
              </h3>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.questionTimerEnabled}
                  onChange={(e) => updateSetting('questionTimerEnabled', e.target.checked)}
                  className="w-4 h-4 rounded focus:ring-2"
                  style={{
                    accentColor: themeConfig.colors.primary,
                    '--tw-ring-color': themeConfig.colors.primary,
                  }}
                />
                <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                  {language === 'pt-BR' ? 'Habilitar timer por questão' : 'Enable question timer'}
                </span>
              </label>
              
              {settings.questionTimerEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.colors.text }}>
                      {language === 'pt-BR' ? 'Tempo por questão (segundos)' : 'Time per question (seconds)'}
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="600"
                      value={settings.questionTimerDuration || 60}
                      onChange={(e) => updateSetting('questionTimerDuration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 outline-none transition-colors"
                      style={{
                        backgroundColor: themeConfig.colors.background,
                        borderColor: themeConfig.colors.border,
                        color: themeConfig.colors.text,
                        '--tw-ring-color': themeConfig.colors.primary,
                      }}
                    />
                  </div>
                  
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.accumulateQuestionTime}
                      onChange={(e) => updateSetting('accumulateQuestionTime', e.target.checked)}
                      className="w-4 h-4 rounded focus:ring-2 mt-0.5"
                      style={{
                        accentColor: themeConfig.colors.primary,
                        '--tw-ring-color': themeConfig.colors.primary,
                      }}
                    />
                    <div>
                      <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                        {language === 'pt-BR' ? 'Acumular tempo entre questões' : 'Accumulate time between questions'}
                      </span>
                      <p className="text-sm mt-1" style={{ color: themeConfig.colors.textSecondary }}>
                        {language === 'pt-BR' 
                          ? 'O tempo não utilizado em uma questão será adicionado à próxima'
                          : 'Unused time from one question will be added to the next'
                        }
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Timer Behavior */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-5 h-5" style={{ color: themeConfig.colors.error }} />
              <h3 className="text-lg font-semibold" style={{ color: themeConfig.colors.text }}>
                {language === 'pt-BR' ? 'Comportamento do Timer' : 'Timer Behavior'}
              </h3>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={settings.showTimerWarnings}
                  onChange={(e) => updateSetting('showTimerWarnings', e.target.checked)}
                  className="w-4 h-4 rounded focus:ring-2 mt-0.5"
                  style={{
                    accentColor: themeConfig.colors.primary,
                    '--tw-ring-color': themeConfig.colors.primary,
                  }}
                />
                <div>
                  <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                    {language === 'pt-BR' ? 'Mostrar avisos de tempo' : 'Show timer warnings'}
                  </span>
                  <p className="text-sm mt-1" style={{ color: themeConfig.colors.textSecondary }}>
                    {language === 'pt-BR' 
                      ? 'Exibir avisos quando o tempo estiver acabando'
                      : 'Display warnings when time is running out'
                    }
                  </p>
                </div>
              </label>
              
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={settings.autoSubmitOnTimeout}
                  onChange={(e) => updateSetting('autoSubmitOnTimeout', e.target.checked)}
                  className="w-4 h-4 rounded focus:ring-2 mt-0.5"
                  style={{
                    accentColor: themeConfig.colors.primary,
                    '--tw-ring-color': themeConfig.colors.primary,
                  }}
                />
                <div>
                  <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                    {language === 'pt-BR' ? 'Enviar automaticamente quando o tempo acabar' : 'Auto-submit when time runs out'}
                  </span>
                  <p className="text-sm mt-1" style={{ color: themeConfig.colors.textSecondary }}>
                    {language === 'pt-BR' 
                      ? 'Enviar a resposta automaticamente quando o timer da questão expirar'
                      : 'Automatically submit the answer when the question timer expires'
                    }
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div 
            className="border rounded-lg p-4"
            style={{
              backgroundColor: themeConfig.colors.info + '10',
              borderColor: themeConfig.colors.info + '30'
            }}
          >
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 mt-0.5" style={{ color: themeConfig.colors.info }} />
              <div>
                <h4 className="font-medium mb-1" style={{ color: themeConfig.colors.info }}>
                  {language === 'pt-BR' ? 'Dica de Produtividade' : 'Productivity Tip'}
                </h4>
                <p className="text-sm" style={{ color: themeConfig.colors.info }}>
                  {language === 'pt-BR' 
                    ? 'Timers ajudam a manter o foco e criar um senso de urgência que pode melhorar a retenção de memória.'
                    : 'Timers help maintain focus and create a sense of urgency that can improve memory retention.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-6 border-t"
          style={{ borderColor: themeConfig.colors.border }}
        >
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: themeConfig.colors.surface,
                color: themeConfig.colors.textSecondary,
                border: `1px solid ${themeConfig.colors.border}`
              }}
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              style={{
                backgroundColor: themeConfig.colors.primary,
                color: '#ffffff'
              }}
            >
              <Save className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}