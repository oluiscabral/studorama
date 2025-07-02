import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, RefreshCw, ArrowRight, BookOpen, FileText, List, Brain, Target, Clock, Lightbulb, HelpCircle, Settings, Plus, X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLanguage } from '../hooks/useLanguage';
import { StudySession, Question, LearningSettings, LearningTechniquesPreference } from '../types';
import { generateQuestion, generateDissertativeQuestion, evaluateAnswer, generateElaborativeQuestion, generateRetrievalQuestion } from '../utils/openai';
import { calculateNextReview, shouldReviewQuestion } from '../utils/spacedRepetition';
import { getRandomModifierPlaceholder } from '../utils/i18n';

const DEFAULT_LEARNING_SETTINGS: LearningSettings = {
  spacedRepetition: true,
  interleaving: true,
  elaborativeInterrogation: true,
  selfExplanation: true,
  desirableDifficulties: true,
  retrievalPractice: true,
  generationEffect: true
};

const DEFAULT_LEARNING_PREFERENCE: LearningTechniquesPreference = {
  rememberChoice: false,
  defaultSettings: DEFAULT_LEARNING_SETTINGS
};

export default function StudySessionComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const [sessions, setSessions] = useLocalStorage<StudySession[]>('studorama-sessions', []);
  const [learningPreference, setLearningPreference] = useLocalStorage<LearningTechniquesPreference>('studorama-learning-preference', DEFAULT_LEARNING_PREFERENCE);
  const [apiSettings] = useLocalStorage('studorama-api-settings', { 
    openaiApiKey: '',
    model: 'gpt-4o-mini',
    customPrompts: {
      multipleChoice: '',
      dissertative: '',
      evaluation: '',
      elaborativePrompt: '',
      retrievalPrompt: ''
    }
  });
  
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [dissertativeAnswer, setDissertativeAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [subject, setSubject] = useState('');
  const [subjectModifiers, setSubjectModifiers] = useState<string[]>([]);
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'dissertative' | 'mixed'>('multiple-choice');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [learningSettings, setLearningSettings] = useState<LearningSettings>(learningPreference.defaultSettings);
  const [rememberChoice, setRememberChoice] = useState(learningPreference.rememberChoice);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(3); // Changed back to 3 (middle)
  const [showElaborativePrompt, setShowElaborativePrompt] = useState(false);
  const [elaborativeResponse, setElaborativeResponse] = useState('');
  const [showSelfExplanation, setShowSelfExplanation] = useState(false);
  const [selfExplanation, setSelfExplanation] = useState('');

  // Learning techniques labels translation
  const getLearningTechniqueLabel = (key: string): string => {
    const labels: Record<string, { en: string; pt: string }> = {
      spacedRepetition: { en: 'Spaced Repetition', pt: 'Repetição Espaçada' },
      interleaving: { en: 'Interleaving', pt: 'Intercalação' },
      elaborativeInterrogation: { en: 'Elaborative Interrogation', pt: 'Interrogação Elaborativa' },
      selfExplanation: { en: 'Self Explanation', pt: 'Auto-Explicação' },
      desirableDifficulties: { en: 'Desirable Difficulties', pt: 'Dificuldades Desejáveis' },
      retrievalPractice: { en: 'Retrieval Practice', pt: 'Prática de Recuperação' },
      generationEffect: { en: 'Generation Effect', pt: 'Efeito de Geração' }
    };

    const label = labels[key];
    if (!label) return key;
    
    return language === 'pt-BR' ? label.pt : label.en;
  };

  // Check if we're continuing an existing session
  useEffect(() => {
    const sessionId = location.state?.sessionId;
    if (sessionId) {
      const existingSession = sessions.find(s => s.id === sessionId);
      if (existingSession) {
        setCurrentSession(existingSession);
        setSubject(existingSession.subject);
        setSubjectModifiers(existingSession.subjectModifiers || []);
        setQuestionType(existingSession.questionType || 'multiple-choice');
        setLearningSettings(existingSession.learningSettings || DEFAULT_LEARNING_SETTINGS);
        setSessionStarted(true);
        loadNextQuestion(existingSession);
      }
    }
  }, [location.state, sessions]);

  const getNextQuestionType = (session: StudySession): 'multiple-choice' | 'dissertative' => {
    if (questionType === 'mixed') {
      // Implement interleaving - mix question types for better learning
      if (learningSettings.interleaving) {
        const lastQuestions = session.questions.slice(-3);
        const lastTypes = lastQuestions.map(q => q.type);
        
        // If last 2 questions were the same type, switch
        if (lastTypes.length >= 2 && lastTypes[lastTypes.length - 1] === lastTypes[lastTypes.length - 2]) {
          return lastTypes[lastTypes.length - 1] === 'multiple-choice' ? 'dissertative' : 'multiple-choice';
        }
      }
      
      // Random selection with slight bias toward multiple choice for variety
      return Math.random() < 0.6 ? 'multiple-choice' : 'dissertative';
    }
    return questionType;
  };

  const addModifier = () => {
    setSubjectModifiers([...subjectModifiers, '']);
  };

  const removeModifier = (index: number) => {
    setSubjectModifiers(subjectModifiers.filter((_, i) => i !== index));
  };

  const updateModifier = (index: number, value: string) => {
    const newModifiers = [...subjectModifiers];
    newModifiers[index] = value;
    setSubjectModifiers(newModifiers);
  };

  const buildSubjectContext = () => {
    const validModifiers = subjectModifiers.filter(m => m.trim());
    if (validModifiers.length === 0) {
      return subject.trim();
    }
    return `${subject.trim()}. Context: ${validModifiers.join('. ')}`;
  };

  const startNewSession = async () => {
    if (!subject.trim()) return;
    if (!apiSettings.openaiApiKey) {
      alert(t.configureApiKeyFirst);
      return;
    }

    // Save learning preference if remember choice is checked
    if (rememberChoice !== learningPreference.rememberChoice || 
        JSON.stringify(learningSettings) !== JSON.stringify(learningPreference.defaultSettings)) {
      setLearningPreference({
        rememberChoice,
        defaultSettings: learningSettings
      });
    }

    const newSession: StudySession = {
      id: Date.now().toString(),
      subject: subject.trim(),
      subjectModifiers: subjectModifiers.filter(m => m.trim()),
      createdAt: new Date().toISOString(),
      questions: [],
      status: 'active',
      score: 0,
      totalQuestions: 0,
      questionType,
      learningSettings,
      spacedRepetition: {
        reviewIntervals: [1, 3, 7, 14, 30],
        currentInterval: 0,
        easeFactor: 2.5,
        reviewCount: 0
      }
    };

    setCurrentSession(newSession);
    setSessionStarted(true);
    loadNextQuestion(newSession);
  };

  const loadNextQuestion = async (session: StudySession) => {
    setLoading(true);
    setSelectedAnswer(null);
    setDissertativeAnswer('');
    setShowFeedback(false);
    setShowElaborativePrompt(false);
    setShowSelfExplanation(false);
    setElaborativeResponse('');
    setSelfExplanation('');
    setConfidenceLevel(3); // Reset to 3 (middle)

    try {
      // Check for spaced repetition questions first
      if (learningSettings.spacedRepetition) {
        const reviewQuestions = session.questions.filter(q => shouldReviewQuestion(q));
        if (reviewQuestions.length > 0 && Math.random() < 0.3) {
          // 30% chance to review a previous question
          const questionToReview = reviewQuestions[Math.floor(Math.random() * reviewQuestions.length)];
          setCurrentQuestion({
            ...questionToReview,
            id: Date.now().toString(), // New ID for tracking
            attempts: 0,
            userAnswer: undefined,
            isCorrect: undefined
          });
          setLoading(false);
          return;
        }
      }

      const nextType = getNextQuestionType(session);
      const subjectContext = buildSubjectContext();
      let questionData;
      
      if (nextType === 'dissertative') {
        questionData = await generateDissertativeQuestion(
          subjectContext, 
          apiSettings.openaiApiKey,
          apiSettings.model || 'gpt-4o-mini',
          apiSettings.customPrompts?.dissertative,
          language
        );
        
        const newQuestion: Question = {
          id: Date.now().toString(),
          question: questionData.question,
          correctAnswerText: questionData.sampleAnswer,
          attempts: 0,
          type: 'dissertative',
          difficulty: 'medium',
          reviewCount: 0,
          confidence: 3, // Changed back to 3
          retrievalStrength: 0.5
        };

        setCurrentQuestion(newQuestion);
      } else {
        // Apply desirable difficulties - make some questions harder
        const difficultyModifier = learningSettings.desirableDifficulties && Math.random() < 0.3 
          ? (language === 'pt-BR' 
              ? ' Torne esta questão mais desafiadora e que exija pensamento mais profundo.' 
              : ' Make this question more challenging and require deeper thinking.')
          : '';

        questionData = await generateQuestion(
          subjectContext + difficultyModifier, 
          apiSettings.openaiApiKey,
          apiSettings.model || 'gpt-4o-mini',
          apiSettings.customPrompts?.multipleChoice,
          language
        );
        
        const newQuestion: Question = {
          id: Date.now().toString(),
          question: questionData.question,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
          attempts: 0,
          feedback: questionData.explanation,
          type: 'multiple-choice',
          difficulty: difficultyModifier ? 'hard' : 'medium',
          reviewCount: 0,
          confidence: 3, // Changed back to 3
          retrievalStrength: 0.5
        };

        setCurrentQuestion(newQuestion);
      }
    } catch (error) {
      console.error('Error generating question:', error);
      const errorMessage = language === 'pt-BR' 
        ? 'Falha ao gerar questão. Verifique sua chave da API ou tente novamente.'
        : 'Failed to generate question. Please check your API key or try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !currentSession) return;
    
    if (currentQuestion.type === 'multiple-choice' && selectedAnswer === null) return;
    if (currentQuestion.type === 'dissertative' && !dissertativeAnswer.trim()) return;

    let updatedQuestion: Question;

    if (currentQuestion.type === 'multiple-choice') {
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      updatedQuestion = {
        ...currentQuestion,
        userAnswer: selectedAnswer,
        isCorrect,
        attempts: currentQuestion.attempts + 1,
        confidence: confidenceLevel,
        retrievalStrength: isCorrect ? Math.min(1, (currentQuestion.retrievalStrength || 0.5) + 0.2) : Math.max(0, (currentQuestion.retrievalStrength || 0.5) - 0.1)
      };
    } else {
      setEvaluating(true);
      try {
        const evaluation = await evaluateAnswer(
          currentQuestion.question,
          dissertativeAnswer,
          currentQuestion.correctAnswerText || '',
          apiSettings.openaiApiKey,
          apiSettings.model || 'gpt-4o-mini',
          apiSettings.customPrompts?.evaluation,
          language
        );

        // Enhanced scoring based on evaluation
        const evaluationLower = evaluation.toLowerCase();
        const positiveWords = language === 'pt-BR' 
          ? ['excelente', 'bom', 'correto', 'preciso', 'abrangente', 'bem', 'forte', 'claro', 'completo']
          : ['excellent', 'good', 'correct', 'accurate', 'comprehensive', 'well', 'strong', 'clear', 'thorough'];
        const negativeWords = language === 'pt-BR'
          ? ['incorreto', 'faltando', 'incompleto', 'errado', 'pobre', 'fraco', 'pouco claro', 'insuficiente']
          : ['incorrect', 'missing', 'incomplete', 'wrong', 'poor', 'weak', 'unclear', 'insufficient'];
        
        const positiveCount = positiveWords.filter(word => evaluationLower.includes(word)).length;
        const negativeCount = negativeWords.filter(word => evaluationLower.includes(word)).length;
        
        const score = Math.max(0, Math.min(1, (positiveCount - negativeCount + 2) / 4));
        const isCorrect = score >= 0.6;

        updatedQuestion = {
          ...currentQuestion,
          userAnswer: dissertativeAnswer,
          isCorrect,
          attempts: currentQuestion.attempts + 1,
          aiEvaluation: evaluation,
          confidence: confidenceLevel,
          retrievalStrength: isCorrect ? Math.min(1, (currentQuestion.retrievalStrength || 0.5) + 0.2) : Math.max(0, (currentQuestion.retrievalStrength || 0.5) - 0.1)
        };
      } catch (error) {
        console.error('Error evaluating answer:', error);
        const errorMessage = language === 'pt-BR'
          ? 'Erro ao avaliar resposta. Tente novamente.'
          : 'Error evaluating answer. Please try again.';
        updatedQuestion = {
          ...currentQuestion,
          userAnswer: dissertativeAnswer,
          isCorrect: false,
          attempts: currentQuestion.attempts + 1,
          aiEvaluation: errorMessage,
          confidence: confidenceLevel,
          retrievalStrength: Math.max(0, (currentQuestion.retrievalStrength || 0.5) - 0.1)
        };
      } finally {
        setEvaluating(false);
      }
    }

    // Calculate next review date for spaced repetition
    if (learningSettings.spacedRepetition) {
      updatedQuestion.nextReview = calculateNextReview(updatedQuestion, currentSession.spacedRepetition!);
      updatedQuestion.lastReviewed = new Date().toISOString();
    }

    setCurrentQuestion(updatedQuestion);
    setShowFeedback(true);

    // Show elaborative interrogation prompt
    if (learningSettings.elaborativeInterrogation && !updatedQuestion.isCorrect) {
      setShowElaborativePrompt(true);
    }

    // Show self-explanation prompt for correct answers
    if (learningSettings.selfExplanation && updatedQuestion.isCorrect) {
      setShowSelfExplanation(true);
    }

    // Update session
    const updatedQuestions = [...currentSession.questions];
    const existingIndex = updatedQuestions.findIndex(q => q.id === currentQuestion.id);
    
    if (existingIndex >= 0) {
      updatedQuestions[existingIndex] = updatedQuestion;
    } else {
      updatedQuestions.push(updatedQuestion);
    }

    const updatedSession = {
      ...currentSession,
      questions: updatedQuestions,
      totalQuestions: updatedQuestions.length,
      score: Math.round((updatedQuestions.filter(q => q.isCorrect).length / updatedQuestions.length) * 100)
    };

    setCurrentSession(updatedSession);

    // Save to localStorage
    setSessions(prev => {
      const existingIndex = prev.findIndex(s => s.id === updatedSession.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = updatedSession;
        return updated;
      } else {
        return [...prev, updatedSession];
      }
    });
  };

  const nextQuestion = () => {
    if (currentSession) {
      loadNextQuestion(currentSession);
    }
  };

  const endSession = () => {
    if (currentSession) {
      const finalSession = {
        ...currentSession,
        status: 'completed' as const
      };

      setSessions(prev => {
        const existingIndex = prev.findIndex(s => s.id === finalSession.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = finalSession;
          return updated;
        } else {
          return [...prev, finalSession];
        }
      });
    }
    
    navigate('/history');
  };

  if (!sessionStarted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t.startNewStudySession}</h1>
            <p className="text-gray-600">{t.configureSession}</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                {t.studySubject} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t.subjectPlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && startNewSession()}
              />
            </div>

            {/* Subject Modifiers */}
            {subjectModifiers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.subjectModifiers}
                </label>
                <div className="space-y-3">
                  {subjectModifiers.map((modifier, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={modifier}
                        onChange={(e) => updateModifier(index, e.target.value)}
                        placeholder={getRandomModifierPlaceholder(language)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      />
                      <button
                        onClick={() => removeModifier(index)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title={t.removeModifier}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add Modifier Button */}
            <button
              onClick={addModifier}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addModifier}</span>
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t.questionType}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setQuestionType('multiple-choice')}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    questionType === 'multiple-choice'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <List className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">{t.multipleChoice}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t.quickAssessment}</p>
                </button>

                <button
                  onClick={() => setQuestionType('dissertative')}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    questionType === 'dissertative'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">{t.dissertative}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t.deepAnalysis}</p>
                </button>

                <button
                  onClick={() => setQuestionType('mixed')}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    questionType === 'mixed'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Brain className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">{t.mixed}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t.interleavedPractice}</p>
                </button>
              </div>
            </div>

            {/* Learning Techniques Settings - Only show if not remembered */}
            {!learningPreference.rememberChoice && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-medium text-blue-900 mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="break-words">{t.learningTechniques}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {Object.entries(learningSettings).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setLearningSettings(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 flex-shrink-0"
                      />
                      <span className="text-sm text-blue-800 break-words">
                        {getLearningTechniqueLabel(key)}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 text-sm text-blue-700 space-y-1">
                  <p><strong>{t.spacedRepetition}:</strong> {t.spacedRepetitionDesc}</p>
                  <p><strong>{t.interleaving}:</strong> {t.interleavingDesc}</p>
                  <p><strong>{t.elaborativeInterrogation}:</strong> {t.elaborativeInterrogationDesc}</p>
                  <p><strong>{t.retrievalPractice}:</strong> {t.retrievalPracticeDesc}</p>
                </div>

                {/* Remember Choice Option */}
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={rememberChoice}
                      onChange={(e) => setRememberChoice(e.target.checked)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <span className="text-sm font-medium text-blue-900">
                        {t.rememberMyChoice}
                      </span>
                      <p className="text-xs text-blue-700 mt-1">
                        {t.rememberLearningTechniques}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Show current learning techniques if remembered */}
            {learningPreference.rememberChoice && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-medium text-green-900 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="break-words">{t.learningTechniques}</span>
                  </h3>
                  <button
                    onClick={() => navigate('/settings')}
                    className="text-green-700 hover:text-green-800 p-1 rounded-lg hover:bg-green-100 transition-colors"
                    title={language === 'pt-BR' ? 'Gerenciar nas Configurações' : 'Manage in Settings'}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(learningSettings).filter(([_, value]) => value).map(([key]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-green-800">
                        {getLearningTechniqueLabel(key)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-green-700 mt-3">
                  {language === 'pt-BR' 
                    ? 'Suas técnicas de aprendizado salvas serão usadas. Você pode alterá-las nas Configurações.'
                    : 'Your saved learning techniques will be used. You can change them in Settings.'
                  }
                </p>
              </div>
            )}

            {apiSettings.model && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>{t.readyToLearn}</strong> {t.using} {apiSettings.model} {language === 'pt-BR' ? 'com técnicas de aprendizado comprovadas' : 'with proven learning techniques'}
                </p>
              </div>
            )}

            <button
              onClick={startNewSession}
              disabled={!subject.trim() || !apiSettings.openaiApiKey}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Brain className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="break-words">{t.startEnhancedSession}</span>
            </button>

            {!apiSettings.openaiApiKey && (
              <p className="text-center text-sm text-red-600">
                {t.configureApiKeyFirst}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">{t.generatingQuestion}</p>
            {apiSettings.model && (
              <p className="text-sm text-gray-500 mt-2">{t.using} {apiSettings.model}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-8 text-center">
          <p className="text-gray-600">{language === 'pt-BR' ? 'Falha ao carregar questão. Tente novamente.' : 'Failed to load question. Please try again.'}</p>
          <button
            onClick={() => currentSession && loadNextQuestion(currentSession)}
            className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Session Header */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {currentSession?.subject}
            </h1>
            {currentSession?.subjectModifiers && currentSession.subjectModifiers.length > 0 && (
              <div className="mt-2 space-y-1">
                {currentSession.subjectModifiers.map((modifier, index) => (
                  <p key={index} className="text-sm text-gray-600 truncate">
                    {modifier}
                  </p>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 mt-2">
              <span>{t.question} {currentSession?.questions.length + 1}</span>
              <span className="flex items-center">
                {currentQuestion.type === 'multiple-choice' ? (
                  <List className="w-4 h-4 mr-1 flex-shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 mr-1 flex-shrink-0" />
                )}
                <span className="truncate">{currentQuestion.type === 'multiple-choice' ? t.multipleChoice : t.dissertative}</span>
              </span>
              {currentQuestion.difficulty && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {t[currentQuestion.difficulty as keyof typeof t] || currentQuestion.difficulty}
                </span>
              )}
            </div>
            {apiSettings.model && (
              <p className="text-xs text-gray-500 mt-1">{t.using} {apiSettings.model}</p>
            )}
          </div>
          <div className="text-left sm:text-right flex-shrink-0">
            <div className="text-sm text-gray-600">{t.currentScore}</div>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{currentSession?.score || 0}%</div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 sm:p-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-6 break-words">
            {currentQuestion.question}
          </h2>

          {currentQuestion.type === 'multiple-choice' && currentQuestion.options ? (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedAnswer === index
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                  } ${showFeedback && index === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : ''
                  } ${showFeedback && selectedAnswer === index && index !== currentQuestion.correctAnswer
                      ? 'border-red-500 bg-red-50'
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="answer"
                      value={index}
                      checked={selectedAnswer === index}
                      onChange={() => !showFeedback && setSelectedAnswer(index)}
                      disabled={showFeedback}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0 ${
                      selectedAnswer === index
                        ? 'border-orange-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswer === index && (
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                      )}
                    </div>
                    <span className="text-gray-900 break-words flex-1">{option}</span>
                    {showFeedback && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto flex-shrink-0" />
                    )}
                    {showFeedback && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-600 ml-auto flex-shrink-0" />
                    )}
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={dissertativeAnswer}
                onChange={(e) => setDissertativeAnswer(e.target.value)}
                placeholder={language === 'pt-BR' ? 'Escreva sua resposta detalhada aqui...' : 'Write your detailed answer here...'}
                rows={8}
                disabled={showFeedback}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none disabled:bg-gray-50"
              />
              <p className="text-sm text-gray-500">
                {language === 'pt-BR' 
                  ? 'Forneça uma resposta abrangente explicando seu raciocínio e pontos-chave.'
                  : 'Provide a comprehensive answer explaining your reasoning and key points.'
                }
              </p>
            </div>
          )}

          {/* Confidence Level */}
          {!showFeedback && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t.confidenceQuestion}
              </label>
              <div className="flex items-center justify-center space-x-2 sm:space-x-4">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setConfidenceLevel(level)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      confidenceLevel === level
                        ? 'border-orange-500 bg-orange-100 text-orange-700'
                        : 'border-gray-300 hover:border-orange-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{t.notConfident}</span>
                <span>{t.veryConfident}</span>
              </div>
            </div>
          )}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`p-4 rounded-lg mb-6 ${
            currentQuestion.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              {currentQuestion.isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
              )}
              <span className={`font-medium ${
                currentQuestion.isCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
                {currentQuestion.isCorrect ? t.excellent : t.keepLearning}
              </span>
            </div>
            
            {currentQuestion.type === 'multiple-choice' && currentQuestion.feedback && (
              <p className={`text-sm break-words ${
                currentQuestion.isCorrect ? 'text-green-700' : 'text-red-700'
              }`}>
                {currentQuestion.feedback}
              </p>
            )}

            {currentQuestion.type === 'dissertative' && (
              <div className="space-y-3">
                {currentQuestion.aiEvaluation && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">{t.aiEvaluation}</h4>
                    <p className="text-sm text-gray-600 break-words">{currentQuestion.aiEvaluation}</p>
                  </div>
                )}
                {currentQuestion.correctAnswerText && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">{t.modelAnswer}</h4>
                    <p className="text-sm text-gray-600 break-words">{currentQuestion.correctAnswerText}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Elaborative Interrogation */}
        {showElaborativePrompt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-start">
              <HelpCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
              <span className="break-words">{t.elaborativePrompt}</span>
            </h4>
            <textarea
              value={elaborativeResponse}
              onChange={(e) => setElaborativeResponse(e.target.value)}
              placeholder={t.explainReasoning}
              rows={3}
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        )}

        {/* Self-Explanation */}
        {showSelfExplanation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-green-800 mb-2 flex items-start">
              <Lightbulb className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
              <span className="break-words">{t.selfExplanationPrompt}</span>
            </h4>
            <textarea
              value={selfExplanation}
              onChange={(e) => setSelfExplanation(e.target.value)}
              placeholder={t.connectKnowledge}
              rows={3}
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <button
            onClick={endSession}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors order-2 sm:order-1"
          >
            {t.endSession}
          </button>

          <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
            {!showFeedback ? (
              <button
                onClick={submitAnswer}
                disabled={
                  (currentQuestion.type === 'multiple-choice' && selectedAnswer === null) ||
                  (currentQuestion.type === 'dissertative' && !dissertativeAnswer.trim()) ||
                  evaluating
                }
                className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {evaluating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t.evaluating}
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    {t.submitAnswer}
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                {!currentQuestion.isCorrect && currentQuestion.type === 'multiple-choice' && (
                  <button
                    onClick={() => {
                      setSelectedAnswer(null);
                      setShowFeedback(false);
                      setConfidenceLevel(3); // Reset to 3 (middle)
                    }}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t.tryAgain}
                  </button>
                )}
                <button
                  onClick={nextQuestion}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center"
                >
                  <span>{t.nextQuestion}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}