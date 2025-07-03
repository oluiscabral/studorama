import { Brain, History, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { LearningSettings, StudySession, TimerSettings } from '../types';
import { getRandomModifierPlaceholder } from '../utils/i18n';
import IconButton from './ui/IconButton';

interface SessionEditModalProps {
  session: StudySession;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: {
    subject?: string;
    subjectModifiers?: string[];
    learningSettings?: LearningSettings;
    timerSettings?: TimerSettings;
  }) => void;
}

export default function SessionEditModal({ session, isOpen, onClose, onSave }: SessionEditModalProps) {
  const { t, language } = useLanguage();
  const { themeConfig } = useTheme();
  
  const [subject, setSubject] = useState(session.subject);
  const [subjectModifiers, setSubjectModifiers] = useState<string[]>(session.subjectModifiers || []);
  const [newModifier, setNewModifier] = useState('');
  const [learningSettings, setLearningSettings] = useState<LearningSettings>(
    session.learningSettings || {
      spacedRepetition: true,
      interleaving: true,
      elaborativeInterrogation: true,
      selfExplanation: true,
      desirableDifficulties: true,
      retrievalPractice: true,
      generationEffect: true
    }
  );
  const [activeTab, setActiveTab] = useState<'subject' | 'learning' | 'history'>('subject');

  useEffect(() => {
    if (isOpen) {
      setSubject(session.subject);
      setSubjectModifiers(session.subjectModifiers || []);
      setLearningSettings(session.learningSettings || {
        spacedRepetition: true,
        interleaving: true,
        elaborativeInterrogation: true,
        selfExplanation: true,
        desirableDifficulties: true,
        retrievalPractice: true,
        generationEffect: true
      });
    }
  }, [isOpen, session]);

  if (!isOpen) return null;

  const addModifier = () => {
    if (newModifier.trim() && !subjectModifiers.includes(newModifier.trim())) {
      setSubjectModifiers([...subjectModifiers, newModifier.trim()]);
      setNewModifier('');
    }
  };

  const removeModifier = (index: number) => {
    setSubjectModifiers(subjectModifiers.filter((_, i) => i !== index));
  };

  const updateLearningSettings = (setting: keyof LearningSettings) => {
    setLearningSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = () => {
    const updates: any = {};
    
    if (subject !== session.subject) {
      updates.subject = subject;
    }
    
    if (JSON.stringify(subjectModifiers) !== JSON.stringify(session.subjectModifiers || [])) {
      updates.subjectModifiers = subjectModifiers;
    }
    
    if (JSON.stringify(learningSettings) !== JSON.stringify(session.learningSettings)) {
      updates.learningSettings = learningSettings;
    }
    
    onSave(updates);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'pt-BR' ? 'pt-BR' : 'en-US');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div 
        className="rounded-lg sm:rounded-xl shadow-xl border w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          backgroundColor: themeConfig.colors.surface,
          borderColor: themeConfig.colors.border,
        }}
      >
        {/* Header - Fixed */}
        <div 
          className="p-3 sm:p-4 md:p-6 border-b flex-shrink-0"
          style={{ borderColor: themeConfig.colors.border }}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold truncate pr-2" style={{ color: themeConfig.colors.text }}>
              {language === 'pt-BR' ? 'Editar Sessão' : 'Edit Session'}
            </h2>
            <IconButton
              icon={X}
              onClick={onClose}
              variant="ghost"
              size="sm"
              aria-label="Close modal"
            />
          </div>
          
          {/* Tabs - Mobile Optimized */}
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'subject', label: language === 'pt-BR' ? 'Matéria' : 'Subject', icon: Save },
              { id: 'learning', label: language === 'pt-BR' ? 'Técnicas' : 'Learning', icon: Brain },
              { id: 'history', label: language === 'pt-BR' ? 'Histórico' : 'History', icon: History },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md sm:rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === id ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: activeTab === id ? themeConfig.colors.primary : 'transparent',
                  color: activeTab === id ? '#ffffff' : themeConfig.colors.textSecondary,
                }}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden xs:inline sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {activeTab === 'subject' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.colors.text }}>
                  {t.studySubject}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-offset-2 outline-none transition-colors text-sm sm:text-base"
                  style={{
                    backgroundColor: themeConfig.colors.background,
                    borderColor: themeConfig.colors.border,
                    color: themeConfig.colors.text,
                    '--tw-ring-color': themeConfig.colors.primary,
                  }}
                />
              </div>

              {/* Subject Modifiers */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.colors.text }}>
                  {t.subjectModifiers}
                </label>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newModifier}
                      onChange={(e) => setNewModifier(e.target.value)}
                      placeholder={getRandomModifierPlaceholder(language)}
                      className="flex-1 min-w-0 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 outline-none transition-colors text-sm"
                      style={{
                        backgroundColor: themeConfig.colors.background,
                        borderColor: themeConfig.colors.border,
                        color: themeConfig.colors.text,
                        '--tw-ring-color': themeConfig.colors.primary,
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && addModifier()}
                    />
                    <button
                      onClick={addModifier}
                      disabled={!newModifier.trim()}
                      className="px-2 sm:px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm flex-shrink-0 min-w-[40px]"
                      style={{
                        backgroundColor: themeConfig.colors.primary,
                        color: '#ffffff'
                      }}
                      title={t.addModifier}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">{language === 'pt-BR' ? 'Add' : 'Add'}</span>
                    </button>
                  </div>
                  
                  {subjectModifiers.length > 0 && (
                    <div className="space-y-2">
                      {subjectModifiers.map((modifier, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-2 sm:p-3 border rounded-lg"
                          style={{
                            backgroundColor: themeConfig.colors.background,
                            borderColor: themeConfig.colors.border
                          }}
                        >
                          <span className="text-xs sm:text-sm flex-1 mr-2 break-words" style={{ color: themeConfig.colors.text }}>
                            {modifier}
                          </span>
                          <IconButton
                            icon={Trash2}
                            onClick={() => removeModifier(index)}
                            variant="ghost"
                            size="xs"
                            style={{ color: themeConfig.colors.error }}
                            aria-label="Remove modifier"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold" style={{ color: themeConfig.colors.text }}>
                {t.learningTechniques}
              </h3>
              
              <div className="space-y-3">
                {[
                  { key: 'spacedRepetition', label: t.spacedRepetition, desc: t.spacedRepetitionDesc },
                  { key: 'interleaving', label: t.interleaving, desc: t.interleavingDesc },
                  { key: 'elaborativeInterrogation', label: t.elaborativeInterrogation, desc: t.elaborativeInterrogationDesc },
                  { key: 'selfExplanation', label: t.selfExplanation, desc: t.selfExplanationHow },
                  { key: 'retrievalPractice', label: t.retrievalPractice, desc: t.retrievalPracticeDesc },
                  { key: 'desirableDifficulties', label: t.desirableDifficulties, desc: t.desirableDifficultiesHow },
                  { key: 'generationEffect', label: t.generationEffect || 'Generation Effect', desc: 'Learn by generating answers rather than just reading' }
                ].map(({ key, label, desc }) => (
                  <label 
                    key={key}
                    className="flex items-start space-x-3 p-2 sm:p-3 border rounded-lg cursor-pointer transition-colors"
                    style={{
                      borderColor: themeConfig.colors.border,
                      backgroundColor: themeConfig.colors.background
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={learningSettings[key as keyof LearningSettings]}
                      onChange={() => updateLearningSettings(key as keyof LearningSettings)}
                      className="w-4 h-4 rounded focus:ring-2 mt-0.5 flex-shrink-0"
                      style={{
                        accentColor: themeConfig.colors.primary,
                        '--tw-ring-color': themeConfig.colors.primary,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-xs sm:text-sm" style={{ color: themeConfig.colors.text }}>
                        {label}
                      </div>
                      <div className="text-xs mt-1 leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
                        {desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Subject History */}
              {session.subjectHistory && session.subjectHistory.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3" style={{ color: themeConfig.colors.text }}>
                    {language === 'pt-BR' ? 'Histórico da Matéria' : 'Subject History'}
                  </h3>
                  <div className="space-y-2">
                    {session.subjectHistory.map((entry) => (
                      <div 
                        key={entry.id}
                        className="p-2 sm:p-3 border rounded-lg"
                        style={{
                          backgroundColor: themeConfig.colors.background,
                          borderColor: themeConfig.colors.border
                        }}
                      >
                        <div className="text-xs sm:text-sm break-words" style={{ color: themeConfig.colors.text }}>
                          <span style={{ color: themeConfig.colors.textMuted }}>
                            "{entry.previousSubject}"
                          </span>
                          {' → '}
                          <span style={{ color: themeConfig.colors.primary }}>
                            "{entry.newSubject}"
                          </span>
                        </div>
                        <div className="text-xs mt-1" style={{ color: themeConfig.colors.textMuted }}>
                          {formatDate(entry.changedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modifier History */}
              {session.modifierHistory && session.modifierHistory.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3" style={{ color: themeConfig.colors.text }}>
                    {language === 'pt-BR' ? 'Histórico de Modificadores' : 'Modifier History'}
                  </h3>
                  <div className="space-y-2">
                    {session.modifierHistory.map((entry) => (
                      <div 
                        key={entry.id}
                        className="p-2 sm:p-3 border rounded-lg"
                        style={{
                          backgroundColor: themeConfig.colors.background,
                          borderColor: themeConfig.colors.border
                        }}
                      >
                        <div className="flex flex-col xs:flex-row xs:items-center space-y-1 xs:space-y-0 xs:space-x-2">
                          <span 
                            className={`text-xs px-2 py-1 rounded-full font-medium inline-block`}
                            style={{
                              backgroundColor: entry.action === 'added' ? themeConfig.colors.success + '20' : themeConfig.colors.error + '20',
                              color: entry.action === 'added' ? themeConfig.colors.success : themeConfig.colors.error
                            }}
                          >
                            {entry.action === 'added' ? (language === 'pt-BR' ? 'Adicionado' : 'Added') : (language === 'pt-BR' ? 'Removido' : 'Removed')}
                          </span>
                          <span className="text-xs sm:text-sm break-words" style={{ color: themeConfig.colors.text }}>
                            {entry.modifier}
                          </span>
                        </div>
                        <div className="text-xs mt-1" style={{ color: themeConfig.colors.textMuted }}>
                          {formatDate(entry.changedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Settings History */}
              {session.learningSettingsHistory && session.learningSettingsHistory.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3" style={{ color: themeConfig.colors.text }}>
                    {language === 'pt-BR' ? 'Histórico de Técnicas' : 'Learning Techniques History'}
                  </h3>
                  <div className="space-y-2">
                    {session.learningSettingsHistory.map((entry) => (
                      <div 
                        key={entry.id}
                        className="p-2 sm:p-3 border rounded-lg"
                        style={{
                          backgroundColor: themeConfig.colors.background,
                          borderColor: themeConfig.colors.border
                        }}
                      >
                        <div className="text-xs sm:text-sm" style={{ color: themeConfig.colors.text }}>
                          {language === 'pt-BR' ? 'Técnicas de aprendizado atualizadas' : 'Learning techniques updated'}
                        </div>
                        <div className="text-xs mt-1" style={{ color: themeConfig.colors.textMuted }}>
                          {formatDate(entry.changedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!session.subjectHistory?.length && !session.modifierHistory?.length && !session.learningSettingsHistory?.length) && (
                <div className="text-center py-6 sm:py-8">
                  <History className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4" style={{ color: themeConfig.colors.textMuted }} />
                  <p className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                    {language === 'pt-BR' ? 'Nenhuma alteração registrada ainda' : 'No changes recorded yet'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div 
          className="p-3 sm:p-4 md:p-6 border-t flex-shrink-0"
          style={{ borderColor: themeConfig.colors.border }}
        >
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm"
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
              className="flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm"
              style={{
                backgroundColor: themeConfig.colors.primary,
                color: '#ffffff'
              }}
            >
              <Save className="w-4 h-4 flex-shrink-0" />
              <span>{t.save}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}