import { AlertTriangle, BookOpen, Brain, Check, ChevronRight, Clock, Eye, History, Info, Plus, Save, Settings, Target, Trash2, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { LearningSettings, StudySession } from '../types';
import IconButton from './ui/IconButton';

interface SessionEditModalProps {
  session: StudySession;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: {
    contexts?: string[];
    instructions?: string[];
    learningSettings?: LearningSettings;
    questionType?: 'multipleChoice' | 'dissertative' | 'mixed';
    enableLatex?: boolean;
    enableCodeVisualization?: boolean;
  }) => void;
}

export default function SessionEditModal({ session, isOpen, onClose, onSave }: SessionEditModalProps) {
  const { t, language } = useLanguage();
  const { themeConfig } = useTheme();
  
  // Form state
  const [contexts, setContexts] = useState<string[]>(session.contexts || []);
  const [instructions, setInstructions] = useState<string[]>(session.instructions || []);
  const [newContext, setNewContext] = useState('');
  const [newInstruction, setNewInstruction] = useState('');
  const [questionType, setQuestionType] = useState<'multipleChoice' | 'dissertative' | 'mixed'>(
    session.questionType || 'multipleChoice'
  );
  const [enableLatex, setEnableLatex] = useState(session.enableLatex || false);
  const [enableCodeVisualization, setEnableCodeVisualization] = useState(session.enableCodeVisualization || false);
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
  
  // UI state
  const [activeTab, setActiveTab] = useState<'basic' | 'learning' | 'advanced' | 'history'>('basic');
  const [hasChanges, setHasChanges] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Detect device type for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setContexts(session.contexts || []);
      setInstructions(session.instructions || []);
      setQuestionType(session.questionType || 'multipleChoice');
      setEnableLatex(session.enableLatex || false);
      setEnableCodeVisualization(session.enableCodeVisualization || false);
      setLearningSettings(session.learningSettings || {
        spacedRepetition: true,
        interleaving: true,
        elaborativeInterrogation: true,
        selfExplanation: true,
        desirableDifficulties: true,
        retrievalPractice: true,
        generationEffect: true
      });
      setNewContext('');
      setNewInstruction('');
      setHasChanges(false);
      setActiveTab('basic');
    }
  }, [isOpen, session]);

  // Track changes
  useEffect(() => {
    const hasContextsChange = JSON.stringify(contexts) !== JSON.stringify(session.contexts || []);
    const hasInstructionsChange = JSON.stringify(instructions) !== JSON.stringify(session.instructions || []);
    const hasQuestionTypeChange = questionType !== (session.questionType || 'multipleChoice');
    const hasLatexChange = enableLatex !== (session.enableLatex || false);
    const hasCodeChange = enableCodeVisualization !== (session.enableCodeVisualization || false);
    const hasLearningChange = JSON.stringify(learningSettings) !== JSON.stringify(session.learningSettings);
    setHasChanges(
      hasContextsChange || 
      hasInstructionsChange || 
      hasQuestionTypeChange || 
      hasLatexChange || 
      hasCodeChange || 
      hasLearningChange
    );
  }, [contexts, instructions, questionType, enableLatex, enableCodeVisualization, learningSettings, session]);

  if (!isOpen) return null;

  const addContext = () => {
    if (newContext.trim() && !contexts.includes(newContext.trim())) {
      setContexts([...contexts, newContext.trim()]);
      setNewContext('');
    }
  };

  const removeContext = (index: number) => {
    setContexts(contexts.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    if (newInstruction.trim() && !instructions.includes(newInstruction.trim())) {
      setInstructions([...instructions, newInstruction.trim()]);
      setNewInstruction('');
    }
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateLearningSettings = (setting: keyof LearningSettings) => {
    setLearningSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = () => {
    const updates: any = {};
    
    if (JSON.stringify(contexts) !== JSON.stringify(session.contexts || [])) {
      updates.contexts = contexts;
    }
    
    if (JSON.stringify(instructions) !== JSON.stringify(session.instructions || [])) {
      updates.instructions = instructions;
    }
    
    if (questionType !== (session.questionType || 'multipleChoice')) {
      updates.questionType = questionType;
    }
    
    if (enableLatex !== (session.enableLatex || false)) {
      updates.enableLatex = enableLatex;
    }
    
    if (enableCodeVisualization !== (session.enableCodeVisualization || false)) {
      updates.enableCodeVisualization = enableCodeVisualization;
    }
    
    if (JSON.stringify(learningSettings) !== JSON.stringify(session.learningSettings)) {
      updates.learningSettings = learningSettings;
    }
    
    onSave(updates);
    onClose();
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmMessage = language === 'pt-BR' 
        ? 'Você tem alterações não salvas. Deseja realmente sair sem salvar?'
        : 'You have unsaved changes. Are you sure you want to exit without saving?';
      
      if (window.confirm(confirmMessage)) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'pt-BR' ? 'pt-BR' : 'en-US');
  };

  const tabs = [
    { 
      id: 'basic', 
      label: language === 'pt-BR' ? 'Básico' : 'Basic', 
      icon: BookOpen,
      description: language === 'pt-BR' ? 'Contextos e instruções' : 'Contexts and instructions'
    },
    { 
      id: 'learning', 
      label: language === 'pt-BR' ? 'Técnicas' : 'Learning', 
      icon: Brain,
      description: language === 'pt-BR' ? 'Técnicas de aprendizado' : 'Learning techniques'
    },
    { 
      id: 'advanced', 
      label: language === 'pt-BR' ? 'Avançado' : 'Advanced', 
      icon: Settings,
      description: language === 'pt-BR' ? 'Configurações avançadas' : 'Advanced settings'
    },
    { 
      id: 'history', 
      label: language === 'pt-BR' ? 'Histórico' : 'History', 
      icon: History,
      description: language === 'pt-BR' ? 'Histórico de alterações' : 'Change history'
    },
  ];

  const learningTechniques = [
    { 
      key: 'spacedRepetition', 
      label: t.spacedRepetition, 
      desc: t.spacedRepetitionDesc,
      icon: Clock,
      color: themeConfig.colors.info
    },
    { 
      key: 'interleaving', 
      label: t.interleaving, 
      desc: t.interleavingDesc,
      icon: Target,
      color: themeConfig.colors.warning
    },
    { 
      key: 'elaborativeInterrogation', 
      label: t.elaborativeInterrogation, 
      desc: t.elaborativeInterrogationDesc,
      icon: Brain,
      color: themeConfig.colors.primary
    },
    { 
      key: 'selfExplanation', 
      label: t.selfExplanation, 
      desc: t.selfExplanationHow,
      icon: Settings,
      color: themeConfig.colors.success
    },
    { 
      key: 'retrievalPractice', 
      label: t.retrievalPractice, 
      desc: t.retrievalPracticeDesc,
      icon: Target,
      color: themeConfig.colors.secondary
    },
    { 
      key: 'desirableDifficulties', 
      label: t.desirableDifficulties, 
      desc: t.desirableDifficultiesHow,
      icon: Plus,
      color: themeConfig.colors.error
    },
    { 
      key: 'generationEffect', 
      label: t.generationEffect || 'Generation Effect', 
      desc: 'Learn by generating answers rather than just reading',
      icon: Zap,
      color: themeConfig.colors.accent
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
      <div 
        className={`rounded-2xl sm:rounded-3xl shadow-2xl border w-full overflow-hidden flex flex-col animate-scale-in ${
          deviceType === 'mobile' 
            ? 'max-w-sm max-h-[95vh]' 
            : deviceType === 'tablet'
            ? 'max-w-md max-h-[90vh]'
            : 'max-w-lg max-h-[85vh]'
        }`}
        style={{
          backgroundColor: themeConfig.colors.surface,
          borderColor: themeConfig.colors.border,
          boxShadow: `0 25px 50px ${themeConfig.colors.primary}20`,
        }}
      >
        {/* Header - Fixed */}
        <div 
          className="p-4 sm:p-5 md:p-6 border-b flex-shrink-0"
          style={{ 
            borderColor: themeConfig.colors.border,
            background: themeConfig.gradients.card
          }}
        >
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: themeConfig.gradients.primary,
                  boxShadow: `0 8px 25px ${themeConfig.colors.primary}30`
                }}
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold leading-tight" style={{ color: themeConfig.colors.text }}>
                  {language === 'pt-BR' ? 'Editar Sessão' : 'Edit Session'}
                </h2>
                <p className="text-xs sm:text-sm mt-0.5" style={{ color: themeConfig.colors.textSecondary }}>
                  {language === 'pt-BR' ? 'Personalize sua sessão de estudo' : 'Customize your study session'}
                </p>
              </div>
            </div>
            <IconButton
              icon={X}
              onClick={handleCancel}
              variant="ghost"
              size="md"
              aria-label="Close modal"
              className="hover:bg-gray-100 transition-colors"
            />
          </div>
          
          {/* Enhanced Tabs - Apple-style segmented control */}
          <div 
            className="flex p-1 rounded-xl sm:rounded-2xl shadow-inner overflow-x-auto"
            style={{ backgroundColor: themeConfig.colors.background }}
          >
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center justify-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  activeTab === id ? 'text-white shadow-lg transform scale-[1.02]' : ''
                }`}
                style={{
                  backgroundColor: activeTab === id ? themeConfig.colors.primary : 'transparent',
                  color: activeTab === id ? '#ffffff' : themeConfig.colors.textSecondary,
                }}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden xs:inline">{label}</span>
              </button>
            ))}
          </div>
          
          {/* Tab Description */}
          <p className="text-xs sm:text-sm mt-2 sm:mt-3 text-center" style={{ color: themeConfig.colors.textMuted }}>
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'basic' && (
            <div className="p-4 sm:p-5 md:p-6 space-y-5 sm:space-y-6">
              {/* Study Contexts */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm sm:text-base font-semibold" style={{ color: themeConfig.colors.text }}>
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeConfig.colors.primary }} />
                  <span>{language === 'pt-BR' ? 'Contextos de Estudo' : 'Study Contexts'}</span>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: themeConfig.colors.error + '20', color: themeConfig.colors.error }}>
                    {language === 'pt-BR' ? 'Obrigatório' : 'Required'}
                  </span>
                </label>
                
                {/* Add Context Input */}
                <div className="flex gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={newContext}
                    onChange={(e) => setNewContext(e.target.value)}
                    placeholder={language === 'pt-BR' ? 'ex: JavaScript, História Mundial, Biologia...' : 'e.g., JavaScript, World History, Biology...'}
                    className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:border-2 outline-none transition-all duration-200 text-sm"
                    style={{
                      backgroundColor: themeConfig.colors.background,
                      borderColor: newContext ? themeConfig.colors.primary : themeConfig.colors.border,
                      color: themeConfig.colors.text,
                      boxShadow: newContext ? `0 0 0 3px ${themeConfig.colors.primary}20` : 'none',
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && addContext()}
                  />
                  <button
                    onClick={addContext}
                    disabled={!newContext.trim()}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: themeConfig.colors.primary,
                      color: '#ffffff'
                    }}
                    title={language === 'pt-BR' ? 'Adicionar Contexto' : 'Add Context'}
                  >
                    <Plus className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">{language === 'pt-BR' ? 'Adicionar' : 'Add'}</span>
                  </button>
                </div>
                
                {/* Context List */}
                {contexts.length > 0 && (
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-xs sm:text-sm font-medium" style={{ color: themeConfig.colors.textSecondary }}>
                      {contexts.length} {language === 'pt-BR' ? 'contexto' + (contexts.length !== 1 ? 's' : '') : 'context' + (contexts.length !== 1 ? 's' : '')}
                    </p>
                    {contexts.map((context, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 sm:p-4 border-2 rounded-xl sm:rounded-2xl group hover:shadow-md transition-all duration-200"
                        style={{
                          backgroundColor: themeConfig.colors.background,
                          borderColor: themeConfig.colors.border
                        }}
                      >
                        <span className="text-xs sm:text-sm flex-1 mr-3 break-words leading-relaxed" style={{ color: themeConfig.colors.text }}>
                          {context}
                        </span>
                        <button
                          onClick={() => removeContext(index)}
                          className="p-2 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110 active:scale-95"
                          style={{ 
                            backgroundColor: themeConfig.colors.error + '20',
                            color: themeConfig.colors.error
                          }}
                          aria-label="Remove context"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {contexts.length === 0 && (
                  <div 
                    className="p-4 rounded-xl border-2 border-dashed text-center"
                    style={{
                      borderColor: themeConfig.colors.error + '50',
                      backgroundColor: themeConfig.colors.error + '10'
                    }}
                  >
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2" style={{ color: themeConfig.colors.error }} />
                    <p className="text-sm font-medium" style={{ color: themeConfig.colors.error }}>
                      {language === 'pt-BR' ? 'Pelo menos um contexto é obrigatório' : 'At least one context is required'}
                    </p>
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              <div className="space-y-3 sm:space-y-4">
                <label className="flex items-center space-x-2 text-sm sm:text-base font-semibold" style={{ color: themeConfig.colors.text }}>
                  <Info className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeConfig.colors.info }} />
                  <span>{language === 'pt-BR' ? 'Instruções Especiais (Opcional)' : 'Special Instructions (Optional)'}</span>
                </label>
                
                {/* Add Instruction Input */}
                <div className="flex gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={newInstruction}
                    onChange={(e) => setNewInstruction(e.target.value)}
                    placeholder={language === 'pt-BR' ? 'ex: Foque em conceitos práticos, inclua exemplos...' : 'e.g., Focus on practical concepts, include examples...'}
                    className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:border-2 outline-none transition-all duration-200 text-sm"
                    style={{
                      backgroundColor: themeConfig.colors.background,
                      borderColor: newInstruction ? themeConfig.colors.info : themeConfig.colors.border,
                      color: themeConfig.colors.text,
                      boxShadow: newInstruction ? `0 0 0 3px ${themeConfig.colors.info}20` : 'none',
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && addInstruction()}
                  />
                  <button
                    onClick={addInstruction}
                    disabled={!newInstruction.trim()}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: themeConfig.colors.info,
                      color: '#ffffff'
                    }}
                    title={language === 'pt-BR' ? 'Adicionar Instrução' : 'Add Instruction'}
                  >
                    <Plus className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">{language === 'pt-BR' ? 'Adicionar' : 'Add'}</span>
                  </button>
                </div>
                
                {/* Instructions List */}
                {instructions.length > 0 && (
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-xs sm:text-sm font-medium" style={{ color: themeConfig.colors.textSecondary }}>
                      {instructions.length} {language === 'pt-BR' ? 'instrução' + (instructions.length !== 1 ? 'ões' : '') : 'instruction' + (instructions.length !== 1 ? 's' : '')}
                    </p>
                    {instructions.map((instruction, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 sm:p-4 border-2 rounded-xl sm:rounded-2xl group hover:shadow-md transition-all duration-200"
                        style={{
                          backgroundColor: themeConfig.colors.background,
                          borderColor: themeConfig.colors.border
                        }}
                      >
                        <span className="text-xs sm:text-sm flex-1 mr-3 break-words leading-relaxed" style={{ color: themeConfig.colors.text }}>
                          {instruction}
                        </span>
                        <button
                          onClick={() => removeInstruction(index)}
                          className="p-2 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110 active:scale-95"
                          style={{ 
                            backgroundColor: themeConfig.colors.error + '20',
                            color: themeConfig.colors.error
                          }}
                          aria-label="Remove instruction"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Question Type */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm sm:text-base font-semibold" style={{ color: themeConfig.colors.text }}>
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeConfig.colors.warning }} />
                  <span>{t.questionType}</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'multipleChoice', label: t.multipleChoice, desc: t.quickAssessment, icon: Check },
                    { value: 'dissertative', label: t.dissertative, desc: t.deepAnalysis, icon: BookOpen },
                    { value: 'mixed', label: t.mixed, desc: t.interleavedPractice, icon: Zap }
                  ].map(({ value, label, desc, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setQuestionType(value as any)}
                      className={`p-3 sm:p-4 border-2 rounded-xl sm:rounded-2xl transition-all duration-200 text-left hover:shadow-md ${
                        questionType === value ? 'shadow-lg transform scale-[1.02]' : ''
                      }`}
                      style={{
                        borderColor: questionType === value ? themeConfig.colors.warning : themeConfig.colors.border,
                        backgroundColor: questionType === value 
                          ? themeConfig.colors.warning + '10' 
                          : themeConfig.colors.background,
                      }}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: themeConfig.colors.warning + '20' }}
                        >
                          <Icon className="w-4 h-4" style={{ color: themeConfig.colors.warning }} />
                        </div>
                        <span className="font-semibold text-sm" style={{ color: themeConfig.colors.text }}>
                          {label}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
                        {desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: themeConfig.colors.text }}>
                  {t.learningTechniques}
                </h3>
                <p className="text-xs sm:text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                  {language === 'pt-BR' 
                    ? 'Baseado na ciência do aprendizado eficaz'
                    : 'Based on the science of effective learning'
                  }
                </p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {learningTechniques.map(({ key, label, desc, icon: Icon, color }) => (
                  <label 
                    key={key}
                    className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md group"
                    style={{
                      borderColor: learningSettings[key as keyof LearningSettings] 
                        ? themeConfig.colors.primary 
                        : themeConfig.colors.border,
                      backgroundColor: learningSettings[key as keyof LearningSettings]
                        ? themeConfig.colors.primary + '10'
                        : themeConfig.colors.background,
                      transform: learningSettings[key as keyof LearningSettings] ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: color + '20' }}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-xs sm:text-sm" style={{ color: themeConfig.colors.text }}>
                            {label}
                          </span>
                          {learningSettings[key as keyof LearningSettings] && (
                            <Check className="w-4 h-4 flex-shrink-0" style={{ color: themeConfig.colors.primary }} />
                          )}
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
                          {desc}
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={learningSettings[key as keyof LearningSettings]}
                      onChange={() => updateLearningSettings(key as keyof LearningSettings)}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg focus:ring-2 mt-1 flex-shrink-0 transition-all duration-200"
                      style={{
                        accentColor: themeConfig.colors.primary,
                        '--tw-ring-color': themeConfig.colors.primary,
                      }}
                    />
                  </label>
                ))}
              </div>
              
              {/* Learning Techniques Info */}
              <div 
                className="mt-5 sm:mt-6 p-4 sm:p-5 rounded-xl sm:rounded-2xl border"
                style={{
                  backgroundColor: themeConfig.colors.info + '10',
                  borderColor: themeConfig.colors.info + '30'
                }}
              >
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: themeConfig.colors.info }} />
                  <div>
                    <h4 className="font-semibold text-sm mb-1 sm:mb-2" style={{ color: themeConfig.colors.info }}>
                      {language === 'pt-BR' ? 'Baseado em Pesquisa Científica' : 'Based on Scientific Research'}
                    </h4>
                    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: themeConfig.colors.info }}>
                      {language === 'pt-BR' 
                        ? 'Essas técnicas são baseadas no livro "Make It Stick" e podem melhorar a retenção de memória em até 200%.'
                        : 'These techniques are based on "Make It Stick" research and can improve memory retention by up to 200%.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="p-4 sm:p-5 md:p-6 space-y-5 sm:space-y-6">
              {/* Visualization Options */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold flex items-center space-x-2" style={{ color: themeConfig.colors.text }}>
                  <Eye className="w-5 h-5" style={{ color: themeConfig.colors.primary }} />
                  <span>{language === 'pt-BR' ? 'Opções de Visualização' : 'Visualization Options'}</span>
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md"
                    style={{
                      borderColor: enableLatex ? themeConfig.colors.primary : themeConfig.colors.border,
                      backgroundColor: enableLatex ? themeConfig.colors.primary + '10' : themeConfig.colors.background,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={enableLatex}
                      onChange={(e) => setEnableLatex(e.target.checked)}
                      className="w-5 h-5 rounded focus:ring-2 mt-0.5"
                      style={{
                        accentColor: themeConfig.colors.primary,
                        '--tw-ring-color': themeConfig.colors.primary,
                      }}
                    />
                    <div>
                      <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                        {language === 'pt-BR' ? 'Habilitar LaTeX/Matemática' : 'Enable LaTeX/Math'}
                      </span>
                      <p className="text-sm mt-1" style={{ color: themeConfig.colors.textSecondary }}>
                        {language === 'pt-BR' 
                          ? 'Renderizar expressões matemáticas e fórmulas LaTeX'
                          : 'Render mathematical expressions and LaTeX formulas'
                        }
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-3 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md"
                    style={{
                      borderColor: enableCodeVisualization ? themeConfig.colors.primary : themeConfig.colors.border,
                      backgroundColor: enableCodeVisualization ? themeConfig.colors.primary + '10' : themeConfig.colors.background,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={enableCodeVisualization}
                      onChange={(e) => setEnableCodeVisualization(e.target.checked)}
                      className="w-5 h-5 rounded focus:ring-2 mt-0.5"
                      style={{
                        accentColor: themeConfig.colors.primary,
                        '--tw-ring-color': themeConfig.colors.primary,
                      }}
                    />
                    <div>
                      <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                        {language === 'pt-BR' ? 'Habilitar Visualização de Código' : 'Enable Code Visualization'}
                      </span>
                      <p className="text-sm mt-1" style={{ color: themeConfig.colors.textSecondary }}>
                        {language === 'pt-BR' 
                          ? 'Destacar sintaxe de código e melhorar a legibilidade'
                          : 'Highlight code syntax and improve readability'
                        }
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Session Info */}
              <div 
                className="p-4 sm:p-5 rounded-xl border"
                style={{
                  backgroundColor: themeConfig.colors.info + '10',
                  borderColor: themeConfig.colors.info + '30'
                }}
              >
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: themeConfig.colors.info }} />
                  <div>
                    <h4 className="font-semibold text-sm mb-2" style={{ color: themeConfig.colors.info }}>
                      {language === 'pt-BR' ? 'Informações da Sessão' : 'Session Information'}
                    </h4>
                    <div className="space-y-1 text-xs" style={{ color: themeConfig.colors.info }}>
                      <p><strong>{language === 'pt-BR' ? 'Criada em:' : 'Created:'}</strong> {formatDate(session.createdAt)}</p>
                      <p><strong>{language === 'pt-BR' ? 'Status:' : 'Status:'}</strong> {session.status === 'completed' ? t.completed : t.inProgress}</p>
                      <p><strong>{language === 'pt-BR' ? 'Questões:' : 'Questions:'}</strong> {session.questions.length}</p>
                      {session.status === 'completed' && (
                        <p><strong>{language === 'pt-BR' ? 'Pontuação:' : 'Score:'}</strong> {session.score}%</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
              {/* Contexts History */}
              {session.contextsHistory && session.contextsHistory.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center space-x-2" style={{ color: themeConfig.colors.text }}>
                    <BookOpen className="w-5 h-5" style={{ color: themeConfig.colors.primary }} />
                    <span>{language === 'pt-BR' ? 'Histórico de Contextos' : 'Contexts History'}</span>
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {session.contextsHistory.map((entry) => (
                      <div 
                        key={entry.id}
                        className="p-3 sm:p-4 border-2 rounded-xl sm:rounded-2xl"
                        style={{
                          backgroundColor: themeConfig.colors.background,
                          borderColor: themeConfig.colors.border
                        }}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <ChevronRight className="w-4 h-4" style={{ color: themeConfig.colors.primary }} />
                          <span className="text-xs sm:text-sm font-medium" style={{ color: themeConfig.colors.text }}>
                            {language === 'pt-BR' ? 'Alteração de Contextos' : 'Contexts Change'}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm break-words mb-2" style={{ color: themeConfig.colors.text }}>
                          <div className="mb-1">
                            <span className="font-medium">{language === 'pt-BR' ? 'Anterior:' : 'Previous:'}</span>
                            <div className="ml-2">
                              {entry.previousContexts.map((ctx, i) => (
                                <span key={i} className="inline-block px-2 py-1 rounded-lg mr-1 mb-1" style={{ backgroundColor: themeConfig.colors.textMuted + '20', color: themeConfig.colors.textMuted }}>
                                  {ctx}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">{language === 'pt-BR' ? 'Novo:' : 'New:'}</span>
                            <div className="ml-2">
                              {entry.newContexts.map((ctx, i) => (
                                <span key={i} className="inline-block px-2 py-1 rounded-lg mr-1 mb-1" style={{ backgroundColor: themeConfig.colors.primary + '20', color: themeConfig.colors.primary }}>
                                  {ctx}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs" style={{ color: themeConfig.colors.textMuted }}>
                          {formatDate(entry.changedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions History */}
              {session.instructionHistory && session.instructionHistory.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center space-x-2" style={{ color: themeConfig.colors.text }}>
                    <Info className="w-5 h-5" style={{ color: themeConfig.colors.info }} />
                    <span>{language === 'pt-BR' ? 'Histórico de Instruções' : 'Instructions History'}</span>
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {session.instructionHistory.map((entry) => (
                      <div 
                        key={entry.id}
                        className="p-3 sm:p-4 border-2 rounded-xl sm:rounded-2xl"
                        style={{
                          backgroundColor: themeConfig.colors.background,
                          borderColor: themeConfig.colors.border
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span 
                              className={`text-xs px-2 py-1 rounded-full font-medium`}
                              style={{
                                backgroundColor: entry.action === 'added' ? themeConfig.colors.success + '20' : themeConfig.colors.error + '20',
                                color: entry.action === 'added' ? themeConfig.colors.success : themeConfig.colors.error
                              }}
                            >
                              {entry.action === 'added' ? (language === 'pt-BR' ? 'Adicionado' : 'Added') : (language === 'pt-BR' ? 'Removido' : 'Removed')}
                            </span>
                          </div>
                          <span className="text-xs" style={{ color: themeConfig.colors.textMuted }}>
                            {formatDate(entry.changedAt)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm break-words" style={{ color: themeConfig.colors.text }}>
                          {entry.instruction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Settings History */}
              {session.learningSettingsHistory && session.learningSettingsHistory.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center space-x-2" style={{ color: themeConfig.colors.text }}>
                    <Brain className="w-5 h-5" style={{ color: themeConfig.colors.accent }} />
                    <span>{language === 'pt-BR' ? 'Histórico de Técnicas' : 'Learning Techniques History'}</span>
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {session.learningSettingsHistory.map((entry) => (
                      <div 
                        key={entry.id}
                        className="p-3 sm:p-4 border-2 rounded-xl sm:rounded-2xl"
                        style={{
                          backgroundColor: themeConfig.colors.background,
                          borderColor: themeConfig.colors.border
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium" style={{ color: themeConfig.colors.text }}>
                            {language === 'pt-BR' ? 'Técnicas de aprendizado atualizadas' : 'Learning techniques updated'}
                          </span>
                          <span className="text-xs" style={{ color: themeConfig.colors.textMuted }}>
                            {formatDate(entry.changedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {(!session.contextsHistory?.length && !session.instructionHistory?.length && !session.learningSettingsHistory?.length) && (
                <div className="text-center py-8 sm:py-12">
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center"
                    style={{ backgroundColor: themeConfig.colors.textMuted + '20' }}
                  >
                    <History className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: themeConfig.colors.textMuted }} />
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold mb-2" style={{ color: themeConfig.colors.text }}>
                    {language === 'pt-BR' ? 'Nenhuma Alteração Ainda' : 'No Changes Yet'}
                  </h4>
                  <p className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                    {language === 'pt-BR' 
                      ? 'O histórico de alterações aparecerá aqui quando você fizer modificações na sessão.'
                      : 'Change history will appear here when you make modifications to the session.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div 
          className="p-4 sm:p-5 md:p-6 border-t flex-shrink-0"
          style={{ 
            borderColor: themeConfig.colors.border,
            background: themeConfig.gradients.card
          }}
        >
          {/* Changes Indicator */}
          {hasChanges && (
            <div 
              className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg sm:rounded-xl border text-center"
              style={{
                backgroundColor: themeConfig.colors.warning + '10',
                borderColor: themeConfig.colors.warning + '30'
              }}
            >
              <p className="text-xs sm:text-sm font-medium" style={{ color: themeConfig.colors.warning }}>
                {language === 'pt-BR' ? 'Você tem alterações não salvas' : 'You have unsaved changes'}
              </p>
            </div>
          )}
          
          {/* Validation Error */}
          {contexts.length === 0 && (
            <div 
              className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg sm:rounded-xl border text-center"
              style={{
                backgroundColor: themeConfig.colors.error + '10',
                borderColor: themeConfig.colors.error + '30'
              }}
            >
              <p className="text-xs sm:text-sm font-medium" style={{ color: themeConfig.colors.error }}>
                {language === 'pt-BR' ? 'Pelo menos um contexto é obrigatório' : 'At least one context is required'}
              </p>
            </div>
          )}
          
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 text-sm sm:text-base border-2 hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: themeConfig.colors.surface,
                color: themeConfig.colors.textSecondary,
                borderColor: themeConfig.colors.border
              }}
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || contexts.length === 0}
              className="flex-1 px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: hasChanges && contexts.length > 0 ? themeConfig.gradients.primary : themeConfig.colors.border,
                color: '#ffffff'
              }}
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>{hasChanges ? t.save : (language === 'pt-BR' ? 'Salvo' : 'Saved')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
