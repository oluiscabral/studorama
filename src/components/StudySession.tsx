import { ArrowLeft, BookOpen, Brain, CheckCircle, Clock, Edit, Loader2, Pause, Play, Plus, Target, Timer, X, XCircle, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTheme } from '../hooks/useTheme';
import { APISettings, LearningSettings, LearningTechniquesPreference, Question, QuestionTimer, SessionTimer, StudySession, TimerPreferences, TimerSettings } from '../types';
import { evaluateAnswer, generateDissertativeQuestion, generateElaborativeQuestion, generateQuestion } from '../utils/openai';
import MarkdownRenderer from './MarkdownRenderer';
import SessionEditModal from './SessionEditModal';
import TimerSettingsModal from './TimerSettingsModal';
import IconButton from './ui/IconButton';
import { isEqual } from 'lodash';
import { getRandomModifierPlaceholder } from '../core/services';

const DEFAULT_LEARNING_SETTINGS: LearningSettings = {
  spacedRepetition: true,
  interleaving: true,
  elaborativeInterrogation: true,
  selfExplanation: true,
  desirableDifficulties: true,
  retrievalPractice: true,
  generationEffect: true
};

const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  sessionTimerEnabled: false,
  sessionTimerDuration: 30,
  questionTimerEnabled: false,
  questionTimerDuration: 60,
  accumulateQuestionTime: false,
  showTimerWarnings: true,
  autoSubmitOnTimeout: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

export default function StudySessionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const { themeConfig } = useTheme();
  
  // Get session ID from location state if continuing a session
  const sessionIdFromState = location.state?.sessionId;
  
  const [sessions, setSessions] = useLocalStorage<StudySession[]>('studorama-sessions', []);
  const [apiSettings] = useLocalStorage<APISettings>('studorama-api-settings', { 
    openaiApiKey: '',
    model: 'gpt-4o-mini',
    customPrompts: {
      multipleChoice: '',
      dissertative: '',
      evaluation: '',
      elaborativePrompt: '',
      retrievalPrompt: ''
    },
    preloadQuestions: 3
  });
  const [learningPreference] = useLocalStorage<LearningTechniquesPreference>('studorama-learning-preference', {
    rememberChoice: false,
    defaultSettings: DEFAULT_LEARNING_SETTINGS
  });
  const [timerPreferences] = useLocalStorage<TimerPreferences>('studorama-timer-preferences', {
    rememberChoice: false,
    defaultSessionTimerEnabled: false,
    defaultSessionTimer: 30,
    defaultQuestionTimerEnabled: false,
    defaultQuestionTimer: 60,
    defaultAccumulateTime: false,
    defaultShowWarnings: true,
    defaultAutoSubmit: false,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  // Session configuration state
  const [subject, setSubject] = useState('');
  const [subjectModifiers, setSubjectModifiers] = useState<string[]>([]);
  const [newModifier, setNewModifier] = useState('');
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'dissertative' | 'mixed'>('multiple-choice');
  const [learningSettings, setLearningSettings] = useState<LearningSettings>(learningPreference.defaultSettings);
  const [rememberChoice, setRememberChoice] = useState(learningPreference.rememberChoice);
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(
    timerPreferences.rememberChoice ? {
      sessionTimerEnabled: timerPreferences.defaultSessionTimerEnabled,
      sessionTimerDuration: timerPreferences.defaultSessionTimer,
      questionTimerEnabled: timerPreferences.defaultQuestionTimerEnabled,
      questionTimerDuration: timerPreferences.defaultQuestionTimer,
      accumulateQuestionTime: timerPreferences.defaultAccumulateTime,
      showTimerWarnings: timerPreferences.defaultShowWarnings,
      autoSubmitOnTimeout: timerPreferences.defaultAutoSubmit,
      soundEnabled: timerPreferences.soundEnabled,
      vibrationEnabled: timerPreferences.vibrationEnabled,
    } : DEFAULT_TIMER_SETTINGS
  );

  // Session state
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState<string | number>('');
  const [confidence, setConfidence] = useState<number>(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [elaborativeQuestion, setElaborativeQuestion] = useState<string>('');
  const [elaborativeAnswer, setElaborativeAnswer] = useState<string>('');
  const [showElaborative, setShowElaborative] = useState(false);
  const [selfExplanationAnswer, setSelfExplanationAnswer] = useState<string>('');
  const [showSelfExplanation, setShowSelfExplanation] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);

  // Timer state
  const [sessionTimer, setSessionTimer] = useState<SessionTimer | null>(null);
  const [currentQuestionTimer, setCurrentQuestionTimer] = useState<QuestionTimer | null>(null);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number | null>(null);
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number | null>(null);
  const [isSessionPaused, setIsSessionPaused] = useState(false);

  // Preloading state
  const [preloadedQuestions, setPreloadedQuestions] = useState<Question[]>([]);
  const [isPreloading, setIsPreloading] = useState(false);

  // Check if we're continuing an existing session
  useEffect(() => {
    if (sessionIdFromState) {
      const existingSession = sessions.find((s) => s.id === sessionIdFromState);
      if (existingSession && existingSession.status === "active") {
        if (existingSession.id === currentSession?.id) return;

        const hasSameState = isEqual(currentSession?.sessionState, existingSession.sessionState) && isEqual(currentSession?.questions, existingSession.questions) && isEqual(currentSession?.timerSettings, existingSession.timerSettings) && isEqual(currentSession?.sessionTimer, existingSession.sessionTimer);
        if (hasSameState) return;

        setCurrentSession(existingSession);
        setSessionStarted(true);
        
        // Restore session state if available
        if (existingSession.sessionState) {
          const state = existingSession.sessionState;
          setUserAnswer(state.currentUserAnswer || '');
          setConfidence(state.currentConfidence || 3);
          setShowFeedback(state.showFeedback || false);
          setShowElaborative(state.showElaborative || false);
          setShowSelfExplanation(state.showSelfExplanation || false);
          setElaborativeQuestion(state.elaborativeQuestion || '');
          setElaborativeAnswer(state.elaborativeAnswer || '');
          setSelfExplanationAnswer(state.selfExplanationAnswer || '');
          setIsEvaluating(state.isEvaluating || false);
        }
        
        // Set the current question based on the session's current question index
        const questionIndex = existingSession.currentQuestionIndex || 0;
        if (existingSession.questions[questionIndex]) {
          setCurrentQuestion(existingSession.questions[questionIndex]);
        } else {
          // Generate next question if we're at the end
          generateNextQuestion(existingSession);
        }

        // Restore timer settings and state
        if (existingSession.timerSettings) {
          setTimerSettings(existingSession.timerSettings);
        }
        if (existingSession.sessionTimer) {
          setSessionTimer(existingSession.sessionTimer);
          setIsSessionPaused(existingSession.sessionTimer.isPaused);
        }
      }
    }
  }, [sessionIdFromState, sessions]);

  // Timer effects
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (sessionTimer && !isSessionPaused && sessionTimer.startTime && !sessionTimer.endTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const startTime = new Date(sessionTimer.startTime).getTime();
        const elapsed = now - startTime - (sessionTimer.pausedTime || 0);
        const duration = (timerSettings.sessionTimerDuration || 30) * 60 * 1000;
        const timeLeft = Math.max(0, duration - elapsed);
        
        setSessionTimeLeft(timeLeft);
        
        if (timeLeft === 0) {
          // Session time expired
          endSession();
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionTimer, isSessionPaused, timerSettings.sessionTimerDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentQuestionTimer && !isSessionPaused && currentQuestionTimer.startTime && !currentQuestionTimer.endTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const startTime = new Date(currentQuestionTimer.startTime).getTime();
        const elapsed = now - startTime - (currentQuestionTimer.pausedTime || 0);
        const duration = (timerSettings.questionTimerDuration || 60) * 1000;
        const timeLeft = Math.max(0, duration - elapsed);
        
        setQuestionTimeLeft(timeLeft);
        
        if (timeLeft === 0 && !currentQuestionTimer.timedOut) {
          // Question time expired
          setCurrentQuestionTimer(prev => prev ? { ...prev, timedOut: true } : null);
          
          if (timerSettings.autoSubmitOnTimeout) {
            submitAnswer();
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentQuestionTimer, isSessionPaused, timerSettings.questionTimerDuration, timerSettings.autoSubmitOnTimeout]);

  // Auto-save session state
  useEffect(() => {
    if (currentSession && sessionStarted) {
      const sessionState = {
        currentUserAnswer: userAnswer,
        currentConfidence: confidence,
        showFeedback,
        showElaborative,
        showSelfExplanation,
        elaborativeQuestion,
        elaborativeAnswer,
        selfExplanationAnswer,
        isEvaluating,
        lastSavedAt: new Date().toISOString(),
      };

      const updatedSession = {
        ...currentSession,
        sessionState,
        sessionTimer,
        timerSettings,
      };
      // @ts-ignore
      setSessions((prev) => prev.map((s) => (s.id === currentSession.id ? updatedSession : s)));
    }
  }, [currentSession, sessionStarted, userAnswer, confidence, showFeedback, showElaborative, showSelfExplanation, elaborativeQuestion, elaborativeAnswer, selfExplanationAnswer, isEvaluating, sessionTimer, timerSettings, setSessions]);

  // Preload questions in the background
  const preloadQuestions = useCallback(async (session: StudySession, count: number = 3) => {
    if (!apiSettings.openaiApiKey || count <= 0 || isPreloading) return;
    
    setIsPreloading(true);
    const newPreloadedQuestions: Question[] = [];
    
    try {
      for (let i = 0; i < count; i++) {
        const questionData = await generateQuestionForSession(session);
        if (questionData) {
          const question: Question = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            question: questionData.question,
            type: questionData.type || (session.questionType === 'mixed' 
              ? (Math.random() > 0.5 ? 'multiple-choice' : 'dissertative')
              : session.questionType || 'multiple-choice'),
            options: questionData.options,
            correctAnswer: questionData.correctAnswer,
            correctAnswerText: questionData.sampleAnswer || questionData.explanation,
            attempts: 0,
            isPreloaded: true
          };
          newPreloadedQuestions.push(question);
        }
      }
      
      setPreloadedQuestions(prev => [...prev, ...newPreloadedQuestions]);
    } catch (error) {
      console.error('Error preloading questions:', error);
    } finally {
      setIsPreloading(false);
    }
  }, [apiSettings.openaiApiKey, isPreloading]);

  const generateQuestionForSession = async (session: StudySession) => {
    const fullSubject = [session.subject, ...(session.subjectModifiers || [])].join(' - ');
    const questionTypeToGenerate = session.questionType === 'mixed' 
      ? (Math.random() > 0.5 ? 'multiple-choice' : 'dissertative')
      : session.questionType || 'multiple-choice';

    if (questionTypeToGenerate === 'multiple-choice') {
      return await generateQuestion(
        fullSubject,
        apiSettings.openaiApiKey,
        apiSettings.model,
        apiSettings.customPrompts.multipleChoice,
        language
      );
    } else {
      return await generateDissertativeQuestion(
        fullSubject,
        apiSettings.openaiApiKey,
        apiSettings.model,
        apiSettings.customPrompts.dissertative,
        language
      );
    }
  };

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

  const startSession = async () => {
    if (!subject.trim()) return;
    if (!apiSettings.openaiApiKey) {
      alert(t.configureApiKeyFirst);
      navigate('/settings');
      return;
    }

    // Update learning preference if remember choice is enabled
    if (rememberChoice) {
      // This would typically update the stored preference
    }

    const newSession: StudySession = {
      id: Date.now().toString(),
      subject: subject.trim(),
      subjectModifiers: subjectModifiers.length > 0 ? subjectModifiers : undefined,
      createdAt: new Date().toISOString(),
      questions: [],
      status: 'active',
      score: 0,
      totalQuestions: 0,
      questionType,
      learningSettings,
      currentQuestionIndex: 0,
      timerSettings
    };

    // Initialize session timer if enabled
    if (timerSettings.sessionTimerEnabled) {
      const sessionTimerData: SessionTimer = {
        startTime: new Date().toISOString(),
        isPaused: false,
        pausedTime: 0
      };
      newSession.sessionTimer = sessionTimerData;
      setSessionTimer(sessionTimerData);
    }

    setCurrentSession(newSession);
    setSessionStarted(true);
    
    // Save session immediately
    setSessions(prev => [...prev, newSession]);
    
    // Generate first question and start preloading
    await generateNextQuestion(newSession);
    
    // Start preloading questions in background
    if (apiSettings.preloadQuestions && apiSettings.preloadQuestions > 0) {
      preloadQuestions(newSession, apiSettings.preloadQuestions);
    }
  };

  const generateNextQuestion = async (session: StudySession) => {
    setIsLoading(true);
    setShowFeedback(false);
    setShowElaborative(false);
    setShowSelfExplanation(false);
    setUserAnswer('');
    setConfidence(3);
    setElaborativeAnswer('');
    setSelfExplanationAnswer('');

    try {
      let question: Question;
      
      // Use preloaded question if available
      if (preloadedQuestions.length > 0) {
        const preloadedQuestion = preloadedQuestions[0];
        setPreloadedQuestions(prev => prev.slice(1));
        
        question = {
          ...preloadedQuestion,
          isPreloaded: false // Mark as no longer preloaded since it's now active
        };
        
        // Preload another question to maintain the buffer
        if (apiSettings.preloadQuestions && apiSettings.preloadQuestions > 0) {
          preloadQuestions(session, 1);
        }
      } else {
        // Generate question normally if no preloaded questions available
        const questionData = await generateQuestionForSession(session);
        
        question = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          question: questionData.question,
          type: questionData.type || (session.questionType === 'mixed' 
            ? (Math.random() > 0.5 ? 'multiple-choice' : 'dissertative')
            : session.questionType || 'multiple-choice'),
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
          correctAnswerText: questionData.sampleAnswer || questionData.explanation,
          attempts: 0
        };
      }

      // Initialize question timer if enabled
      if (timerSettings.questionTimerEnabled) {
        const questionTimerData: QuestionTimer = {
          questionId: question.id,
          startTime: new Date().toISOString(),
          timeSpent: 0,
          timedOut: false,
          pausedTime: 0
        };
        setCurrentQuestionTimer(questionTimerData);
        question.startedAt = questionTimerData.startTime;
      }

      setCurrentQuestion(question);
      
      // Update session with new question
      const updatedSession = {
        ...session,
        questions: [...session.questions, question],
        currentQuestionIndex: session.questions.length
      };
      
      setCurrentSession(updatedSession);
      setSessions(prev => prev.map(s => s.id === session.id ? updatedSession : s));
      
    } catch (error: any) {
      console.error('Error generating question:', error);
      alert(`Error generating question: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !currentSession) return;
    
    setIsEvaluating(true);
    
    try {
      let isCorrect = false;
      let feedback = '';
      let aiEvaluation = '';
      
      if (currentQuestion.type === 'multiple-choice') {
        isCorrect = userAnswer === currentQuestion.correctAnswer;
        feedback = isCorrect ? t.excellent : currentQuestion.correctAnswerText || '';
      } else {
        // const fullSubject = [currentSession.subject, ...(currentSession.subjectModifiers || [])].join(' - ');
        // For dissertative questions, use AI evaluation
        aiEvaluation = await evaluateAnswer(
          currentQuestion.question,
          userAnswer.toString(),
          currentQuestion.correctAnswerText || '',
          apiSettings.openaiApiKey,
          apiSettings.model,
          apiSettings.customPrompts.evaluation,
          language
        );
        
        // Simple heuristic for correctness based on AI evaluation
        isCorrect = aiEvaluation.toLowerCase().includes('correct') || 
                   aiEvaluation.toLowerCase().includes('good') ||
                   aiEvaluation.toLowerCase().includes('well') ||
                   aiEvaluation.toLowerCase().includes('excellent');
      }

      // Complete question timer if enabled
      if (currentQuestionTimer) {
        // const endTime = new Date().toISOString();
        // const startTime = new Date(currentQuestionTimer.startTime).getTime();
        // const endTimeMs = new Date(endTime).getTime();
        // const timeSpent = endTimeMs - startTime - (currentQuestionTimer.pausedTime || 0);
        
        // const completedTimer = {
        //   ...currentQuestionTimer,
        //   endTime,
        //   timeSpent
        // };
        
        setCurrentQuestionTimer(null);
        setQuestionTimeLeft(null);
      }
      
      // Update question with answer and feedback
      const updatedQuestion: Question = {
        ...currentQuestion,
        userAnswer,
        isCorrect,
        feedback,
        aiEvaluation,
        attempts: currentQuestion.attempts + 1,
        confidence,
        completedAt: new Date().toISOString()
      };
      
      // Update session
      const updatedQuestions = currentSession.questions.map(q => 
        q.id === currentQuestion.id ? updatedQuestion : q
      );
      
      const correctAnswers = updatedQuestions.filter(q => q.isCorrect).length;
      const totalQuestions = updatedQuestions.length;
      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      
      const updatedSession: StudySession = {
        ...currentSession,
        questions: updatedQuestions,
        score,
        totalQuestions
      };
      
      setCurrentQuestion(updatedQuestion);
      setCurrentSession(updatedSession);
      setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
      setShowFeedback(true);
      
      // Show elaborative interrogation for incorrect answers
      if (!isCorrect && learningSettings.elaborativeInterrogation) {
        try {
          const elaborativeQ = await generateElaborativeQuestion(
            currentSession.subject,
            currentQuestion.question,
            apiSettings.openaiApiKey,
            apiSettings.model,
            language
          );
          setElaborativeQuestion(elaborativeQ);
          setShowElaborative(true);
        } catch (error) {
          console.error('Error generating elaborative question:', error);
        }
      }
      
      // Show self-explanation for correct answers
      if (isCorrect && learningSettings.selfExplanation) {
        setShowSelfExplanation(true);
      }
      
    } catch (error: any) {
      console.error('Error evaluating answer:', error);
      alert(`Error evaluating answer: ${error.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (!currentSession) return;
    generateNextQuestion(currentSession);
  };

  const endSession = () => {
    if (!currentSession) return;
    
    // Complete session timer if running
    if (sessionTimer && !sessionTimer.endTime) {
      const endTime = new Date().toISOString();
      const updatedTimer = {
        ...sessionTimer,
        endTime
      };
      setSessionTimer(updatedTimer);
    }
    
    const finalSession: StudySession = {
      ...currentSession,
      status: 'completed',
      // @ts-ignore
      sessionTimer
    };
    
    setSessions(prev => prev.map(s => s.id === currentSession.id ? finalSession : s));
    navigate('/history');
  };

  const tryAgain = () => {
    setUserAnswer('');
    setConfidence(3);
    setShowFeedback(false);
    setShowElaborative(false);
    setShowSelfExplanation(false);
    setElaborativeAnswer('');
    setSelfExplanationAnswer('');
  };

  const pauseSession = () => {
    if (!sessionTimer) return;
    
    setIsSessionPaused(true);
    
    const updatedTimer = {
      ...sessionTimer,
      isPaused: true
    };
    
    setSessionTimer(updatedTimer);
  };

  const resumeSession = () => {
    if (!sessionTimer) return;
    
    const now = Date.now();
    const pauseStartTime = sessionTimer.isPaused ? Date.now() : 0;
    
    setIsSessionPaused(false);
    
    const updatedTimer = {
      ...sessionTimer,
      isPaused: false,
      pausedTime: (sessionTimer.pausedTime || 0) + (pauseStartTime ? now - pauseStartTime : 0)
    };
    
    setSessionTimer(updatedTimer);
  };

  const handleSessionEdit = (updates: any) => {
    if (!currentSession) return;
    
    const updatedSession = {
      ...currentSession,
      ...updates
    };
    
    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
  };

  const handleTimerSettingsUpdate = (newSettings: TimerSettings) => {
    setTimerSettings(newSettings);
    
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        timerSettings: newSettings
      };
      
      setCurrentSession(updatedSession);
      setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
    }
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const hasTimerConfiguration = timerSettings.sessionTimerEnabled || timerSettings.questionTimerEnabled;

  if (!sessionStarted) {
    return (
      <div className="min-h-screen" style={{ background: themeConfig.gradients.background }}>
        <div className="container mx-auto px-2 sm:px-3 py-3 sm:py-4 max-w-4xl">
          {/* Header - Mobile Optimized */}
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <IconButton
              icon={ArrowLeft}
              onClick={() => navigate('/')}
              variant="ghost"
              size="md"
              aria-label="Go back to dashboard"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold leading-tight truncate" style={{ color: themeConfig.colors.text }}>
                {t.startNewStudySession}
              </h1>
              <p className="text-xs sm:text-sm mt-0.5 truncate" style={{ color: themeConfig.colors.textSecondary }}>
                {t.configureSession}
              </p>
            </div>
          </div>

          {/* Configuration Form - Mobile First Design */}
          <div 
            className="rounded-xl shadow-sm border p-3 sm:p-4 lg:p-6"
            style={{
              backgroundColor: themeConfig.colors.surface,
              borderColor: themeConfig.colors.border
            }}
          >
            <div className="space-y-4 sm:space-y-6">
              {/* Subject Input - Enhanced Mobile UX */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: themeConfig.colors.text }}>
                  {t.studySubject}
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t.subjectPlaceholder}
                  className="w-full px-3 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 outline-none transition-colors text-base"
                  style={{
                    backgroundColor: themeConfig.colors.background,
                    borderColor: themeConfig.colors.border,
                    color: themeConfig.colors.text,
                    '--tw-ring-color': themeConfig.colors.primary,
                  }}
                />
              </div>

              {/* Subject Modifiers - Completely Redesigned for Mobile */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.colors.text }}>
                  {t.subjectModifiers}
                </label>
                
                {/* Add Modifier Input - Mobile Optimized */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newModifier}
                      onChange={(e) => setNewModifier(e.target.value)}
                      placeholder={getRandomModifierPlaceholder(language)}
                      className="flex-1 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-offset-2 outline-none transition-colors text-sm sm:text-base"
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
                      className="w-full sm:w-auto px-4 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base touch-target"
                      style={{
                        backgroundColor: themeConfig.colors.primary,
                        color: '#ffffff'
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.addModifier}</span>
                    </button>
                  </div>
                  
                  {/* Modifiers List - Mobile Optimized */}
                  {subjectModifiers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium" style={{ color: themeConfig.colors.textMuted }}>
                        {language === 'pt-BR' ? 'Modificadores adicionados:' : 'Added modifiers:'}
                      </p>
                      <div className="space-y-2">
                        {subjectModifiers.map((modifier, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-3 rounded-lg border"
                            style={{
                              backgroundColor: themeConfig.colors.background,
                              borderColor: themeConfig.colors.border
                            }}
                          >
                            <span className="text-sm flex-1 mr-2 break-words" style={{ color: themeConfig.colors.text }}>
                              {modifier}
                            </span>
                            <IconButton
                              icon={X}
                              onClick={() => removeModifier(index)}
                              variant="danger"
                              size="sm"
                              aria-label={`Remove ${modifier}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Question Type - Mobile Optimized Grid */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: themeConfig.colors.text }}>
                  {t.questionType}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { type: 'multiple-choice', title: t.multipleChoice, desc: t.quickAssessment },
                    { type: 'dissertative', title: t.dissertative, desc: t.deepAnalysis },
                    { type: 'mixed', title: t.mixed, desc: t.interleavedPractice }
                  ].map(({ type, title, desc }) => (
                    <button
                      key={type}
                      onClick={() => setQuestionType(type as any)}
                      className={`p-4 border-2 rounded-lg transition-all text-left touch-target ${
                        questionType === type ? 'shadow-sm' : ''
                      }`}
                      style={{
                        borderColor: questionType === type ? themeConfig.colors.primary : themeConfig.colors.border,
                        backgroundColor: questionType === type ? themeConfig.colors.primary + '10' : themeConfig.colors.surface,
                      }}
                    >
                      <h3 className="font-medium mb-1 text-sm sm:text-base" style={{ color: themeConfig.colors.text }}>
                        {title}
                      </h3>
                      <p className="text-xs sm:text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                        {desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer Settings */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Timer className="w-5 h-5" style={{ color: themeConfig.colors.primary }} />
                    <label className="text-sm font-medium" style={{ color: themeConfig.colors.text }}>
                      {language === 'pt-BR' ? 'Configurações de Timer' : 'Timer Settings'}
                    </label>
                  </div>
                  <button
                    onClick={() => setShowTimerModal(true)}
                    className="text-xs px-3 py-1 rounded-lg transition-colors"
                    style={{
                      backgroundColor: themeConfig.colors.primary + '20',
                      color: themeConfig.colors.primary
                    }}
                  >
                    {language === 'pt-BR' ? 'Configurar' : 'Configure'}
                  </button>
                </div>
                
                <div 
                  className="border rounded-lg p-3"
                  style={{
                    backgroundColor: themeConfig.colors.background,
                    borderColor: themeConfig.colors.border
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" style={{ color: themeConfig.colors.info }} />
                      <span style={{ color: themeConfig.colors.text }}>
                        {language === 'pt-BR' ? 'Sessão:' : 'Session:'} {' '}
                        {timerSettings.sessionTimerEnabled 
                          ? `${timerSettings.sessionTimerDuration}m`
                          : (language === 'pt-BR' ? 'Desabilitado' : 'Disabled')
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Timer className="w-4 h-4" style={{ color: themeConfig.colors.warning }} />
                      <span style={{ color: themeConfig.colors.text }}>
                        {language === 'pt-BR' ? 'Questão:' : 'Question:'} {' '}
                        {timerSettings.questionTimerEnabled 
                          ? `${timerSettings.questionTimerDuration}s`
                          : (language === 'pt-BR' ? 'Desabilitado' : 'Disabled')
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Techniques - Simplified for Mobile */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Brain className="w-5 h-5" style={{ color: themeConfig.colors.primary }} />
                  <label className="text-sm font-medium" style={{ color: themeConfig.colors.text }}>
                    {t.learningTechniques}
                  </label>
                  <span 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: themeConfig.colors.success + '20',
                      color: themeConfig.colors.success
                    }}
                  >
                    {t.makeItStickBased}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'spacedRepetition', label: t.spacedRepetition, desc: t.spacedRepetitionDesc },
                    { key: 'interleaving', label: t.interleaving, desc: t.interleavingDesc },
                    { key: 'elaborativeInterrogation', label: t.elaborativeInterrogation, desc: t.elaborativeInterrogationDesc },
                    { key: 'retrievalPractice', label: t.retrievalPractice, desc: t.retrievalPracticeDesc }
                  ].map(({ key, label, desc }) => (
                    <label 
                      key={key}
                      className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors touch-target"
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
                        <div className="font-medium text-sm" style={{ color: themeConfig.colors.text }}>
                          {label}
                        </div>
                        <div className="text-xs mt-1 leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
                          {desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Remember Choice - Mobile Optimized */}
                <div 
                  className="mt-4 p-3 border rounded-lg"
                  style={{
                    backgroundColor: themeConfig.colors.info + '10',
                    borderColor: themeConfig.colors.info + '30'
                  }}
                >
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberChoice}
                      onChange={(e) => setRememberChoice(e.target.checked)}
                      className="w-4 h-4 rounded focus:ring-2 mt-0.5 flex-shrink-0"
                      style={{
                        accentColor: themeConfig.colors.info,
                        '--tw-ring-color': themeConfig.colors.info,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm" style={{ color: themeConfig.colors.info }}>
                        {t.rememberMyChoice}
                      </div>
                      <div className="text-xs mt-1 leading-relaxed" style={{ color: themeConfig.colors.info }}>
                        {t.rememberLearningTechniques}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Start Button - Mobile Optimized */}
              <div className="pt-2">
                {apiSettings.openaiApiKey ? (
                  <button
                    onClick={startSession}
                    disabled={!subject.trim()}
                    className="w-full py-3 sm:py-4 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 text-base touch-target"
                    style={{
                      background: themeConfig.gradients.primary,
                      color: '#ffffff'
                    }}
                  >
                    <Target className="w-5 h-5" />
                    <span>{t.startEnhancedSession}</span>
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="mb-4 text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                      {t.configureApiKeyFirst}
                    </p>
                    <button
                      onClick={() => navigate('/settings')}
                      className="px-6 py-3 rounded-lg font-medium transition-colors text-white"
                      style={{ backgroundColor: themeConfig.colors.textSecondary }}
                    >
                      {t.settings}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timer Settings Modal */}
        <TimerSettingsModal
          timerSettings={timerSettings}
          isOpen={showTimerModal}
          onClose={() => setShowTimerModal(false)}
          onSave={handleTimerSettingsUpdate}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: themeConfig.gradients.background }}>
      <div className="container mx-auto px-2 sm:px-3 py-3 sm:py-4 max-w-4xl">
        {/* Header - Completely Redesigned for Small Devices */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-1 sm:gap-2">
          {/* Left Section - Back Button + Subject Info */}
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1">
            <IconButton
              icon={ArrowLeft}
              onClick={() => navigate('/history')}
              variant="ghost"
              size="sm"
              aria-label="Go back to history"
            />
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <h1 className="text-sm sm:text-base font-bold truncate" style={{ color: themeConfig.colors.text }}>
                  {currentSession?.subject}
                </h1>
                <IconButton
                  icon={Edit}
                  onClick={() => setShowEditModal(true)}
                  variant="ghost"
                  size="xs"
                  aria-label="Edit session"
                />
              </div>
              
              {/* Compact Info Row */}
              <div className="flex items-center space-x-1 text-xs" style={{ color: themeConfig.colors.textSecondary }}>
                <span>{t.using} {apiSettings.model}</span>
                <span>•</span>
                <span>{currentSession?.score || 0}%</span>
                {apiSettings.preloadQuestions && apiSettings.preloadQuestions > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-0.5">
                      <Zap className="w-3 h-3" style={{ color: themeConfig.colors.accent }} />
                      <span style={{ color: themeConfig.colors.accent }}>Smart</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            {/* Timer Displays - Only show if timers are configured */}
            {hasTimerConfiguration && (
              <div className="hidden sm:flex items-center space-x-1 text-xs" style={{ color: themeConfig.colors.textSecondary }}>
                {sessionTimeLeft !== null && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(sessionTimeLeft)}</span>
                  </div>
                )}
                {questionTimeLeft !== null && (
                  <div className="flex items-center space-x-1">
                    <Timer className="w-3 h-3" />
                    <span>{formatTime(questionTimeLeft)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Pause/Resume Button - Only show if timers are configured */}
            {hasTimerConfiguration && (
              <IconButton
                icon={isSessionPaused ? Play : Pause}
                onClick={isSessionPaused ? resumeSession : pauseSession}
                variant="ghost"
                size="sm"
                aria-label={isSessionPaused ? t.resumeSession : t.pauseSession}
              />
            )}

            {/* End Session Button */}
            <button
              onClick={endSession}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors touch-target"
              style={{ 
                color: themeConfig.colors.textSecondary,
                backgroundColor: themeConfig.colors.surface + '80'
              }}
            >
              {t.endSession}
            </button>
          </div>
        </div>

        {/* Mobile Timer Display - Only show if timers are configured */}
        {hasTimerConfiguration && (
          <div className="sm:hidden mb-3 flex items-center justify-center space-x-4 text-xs" style={{ color: themeConfig.colors.textSecondary }}>
            {sessionTimeLeft !== null && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(sessionTimeLeft)}</span>
              </div>
            )}
            {questionTimeLeft !== null && (
              <div className="flex items-center space-x-1">
                <Timer className="w-3 h-3" />
                <span>{formatTime(questionTimeLeft)}</span>
              </div>
            )}
          </div>
        )}

        {/* Question Card - Mobile Optimized */}
        <div 
          className="rounded-xl shadow-sm border p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6"
          style={{
            backgroundColor: themeConfig.colors.surface,
            borderColor: themeConfig.colors.border
          }}
        >
          {isLoading ? (
            <div className="text-center py-8 sm:py-12">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-3 sm:mb-4" style={{ color: themeConfig.colors.primary }} />
              <p className="text-sm sm:text-base" style={{ color: themeConfig.colors.textSecondary }}>{t.generatingQuestion}</p>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Question Header - Mobile Optimized */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
                  <h2 className="text-base sm:text-lg font-semibold" style={{ color: themeConfig.colors.text }}>
                    {t.question} {(currentSession?.questions.length || 0)}
                  </h2>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    {currentQuestion.difficulty && (
                      <span 
                        className={`text-xs px-2 py-1 rounded-full font-medium`}
                        style={{
                          backgroundColor: currentQuestion.difficulty === 'easy' ? themeConfig.colors.success + '20' :
                                         currentQuestion.difficulty === 'medium' ? themeConfig.colors.warning + '20' :
                                         themeConfig.colors.error + '20',
                          color: currentQuestion.difficulty === 'easy' ? themeConfig.colors.success :
                                currentQuestion.difficulty === 'medium' ? themeConfig.colors.warning :
                                themeConfig.colors.error
                        }}
                      >
                        {currentQuestion.difficulty === 'easy' ? t.easy :
                         currentQuestion.difficulty === 'medium' ? t.medium : t.hard}
                      </span>
                    )}
                    <span 
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: themeConfig.colors.info + '20',
                        color: themeConfig.colors.info
                      }}
                    >
                      {currentQuestion.type === 'multiple-choice' ? t.multipleChoice : t.dissertative}
                    </span>
                  </div>
                </div>
                
                <div className="prose max-w-none">
                  <MarkdownRenderer content={currentQuestion.question} />
                </div>
              </div>

              {/* Answer Input - Mobile Optimized */}
              {!showFeedback && (
                <div className="space-y-4">
                  {currentQuestion.type === 'multiple-choice' && currentQuestion.options ? (
                    <div className="space-y-2 sm:space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => setUserAnswer(index)}
                          className={`w-full p-3 sm:p-4 text-left border-2 rounded-lg transition-all duration-200 min-h-[48px] sm:min-h-[60px] flex items-center justify-center touch-target ${
                            userAnswer === index ? 'shadow-sm' : ''
                          }`}
                          style={{
                            borderColor: userAnswer === index ? themeConfig.colors.primary : themeConfig.colors.border,
                            backgroundColor: userAnswer === index ? themeConfig.colors.primary + '10' : themeConfig.colors.background,
                          }}
                        >
                          <div className="w-full text-center">
                            <MarkdownRenderer content={option} />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder={language === 'pt-BR' ? 'Digite sua resposta aqui...' : 'Type your answer here...'}
                        rows={4}
                        className="w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 outline-none transition-colors resize-none text-sm sm:text-base"
                        style={{
                          backgroundColor: themeConfig.colors.background,
                          borderColor: themeConfig.colors.border,
                          color: themeConfig.colors.text,
                          '--tw-ring-color': themeConfig.colors.primary,
                        }}
                      />
                    </div>
                  )}

                  {/* Confidence Scale - Mobile Optimized */}
                  <div>
                    <label className="block text-sm font-medium mb-2 sm:mb-3" style={{ color: themeConfig.colors.text }}>
                      {t.confidenceQuestion}
                    </label>
                    
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span style={{ color: themeConfig.colors.textSecondary }}>
                          {t.notConfident}
                        </span>
                        <span style={{ color: themeConfig.colors.textSecondary }}>
                          {t.veryConfident}
                        </span>
                      </div>
                      
                      <div className="flex justify-center">
                        <div className="flex space-x-1 sm:space-x-2">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={() => setConfidence(level)}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all touch-target text-sm sm:text-base font-medium ${
                                confidence === level ? 'text-white' : ''
                              }`}
                              style={{
                                borderColor: confidence === level ? themeConfig.colors.primary : themeConfig.colors.border,
                                backgroundColor: confidence === level ? themeConfig.colors.primary : 'transparent',
                                color: confidence === level ? '#ffffff' : themeConfig.colors.textSecondary,
                                minWidth: '32px',
                                minHeight: '32px'
                              }}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button - Mobile Optimized */}
                  <button
                    onClick={submitAnswer}
                    disabled={isEvaluating || (currentQuestion.type === 'multiple-choice' ? userAnswer === '' : !userAnswer.toString().trim())}
                    className="w-full py-3 sm:py-4 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-base touch-target"
                    style={{
                      backgroundColor: themeConfig.colors.primary,
                      color: '#ffffff'
                    }}
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{t.evaluating}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>{t.submitAnswer}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Feedback - Mobile Optimized */}
              {showFeedback && currentQuestion && (
                <div className="space-y-4">
                  {/* Result */}
                  <div 
                    className={`p-4 rounded-lg border-2`}
                    style={{
                      borderColor: currentQuestion.isCorrect ? themeConfig.colors.success : themeConfig.colors.error,
                      backgroundColor: currentQuestion.isCorrect ? themeConfig.colors.success + '10' : themeConfig.colors.error + '10',
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {currentQuestion.isCorrect ? (
                        <CheckCircle className="w-6 h-6" style={{ color: themeConfig.colors.success }} />
                      ) : (
                        <XCircle className="w-6 h-6" style={{ color: themeConfig.colors.error }} />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 
                          className={`font-semibold`}
                          style={{
                            color: currentQuestion.isCorrect ? themeConfig.colors.success : themeConfig.colors.error
                          }}
                        >
                          {currentQuestion.isCorrect ? t.excellent : t.keepLearning}
                        </h3>
                        {currentQuestion.feedback && (
                          <div 
                            className={`mt-2`}
                            style={{
                              color: currentQuestion.isCorrect ? themeConfig.colors.success : themeConfig.colors.error
                            }}
                          >
                            <MarkdownRenderer content={currentQuestion.feedback} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Evaluation for dissertative questions */}
                  {currentQuestion.aiEvaluation && (
                    <div 
                      className="border rounded-lg p-4"
                      style={{
                        backgroundColor: themeConfig.colors.info + '10',
                        borderColor: themeConfig.colors.info + '30'
                      }}
                    >
                      <h4 className="font-medium mb-2" style={{ color: themeConfig.colors.info }}>
                        {t.aiEvaluation}
                      </h4>
                      <div style={{ color: themeConfig.colors.info }}>
                        <MarkdownRenderer content={currentQuestion.aiEvaluation} />
                      </div>
                    </div>
                  )}

                  {/* Model Answer for dissertative questions */}
                  {currentQuestion.type === 'dissertative' && currentQuestion.correctAnswerText && (
                    <div 
                      className="border rounded-lg p-4"
                      style={{
                        backgroundColor: themeConfig.colors.success + '10',
                        borderColor: themeConfig.colors.success + '30'
                      }}
                    >
                      <h4 className="font-medium mb-2" style={{ color: themeConfig.colors.success }}>
                        {t.modelAnswer}
                      </h4>
                      <div style={{ color: themeConfig.colors.success }}>
                        <MarkdownRenderer content={currentQuestion.correctAnswerText} />
                      </div>
                    </div>
                  )}

                  {/* Elaborative Interrogation */}
                  {showElaborative && elaborativeQuestion && (
                    <div 
                      className="border rounded-lg p-4"
                      style={{
                        backgroundColor: themeConfig.colors.warning + '10',
                        borderColor: themeConfig.colors.warning + '30'
                      }}
                    >
                      <h4 className="font-medium mb-2" style={{ color: themeConfig.colors.warning }}>
                        {t.elaborativePrompt}
                      </h4>
                      <div className="mb-3" style={{ color: themeConfig.colors.warning }}>
                        <MarkdownRenderer content={elaborativeQuestion} />
                      </div>
                      <textarea
                        value={elaborativeAnswer}
                        onChange={(e) => setElaborativeAnswer(e.target.value)}
                        placeholder={t.explainReasoning}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 outline-none transition-colors resize-none text-sm"
                        style={{
                          backgroundColor: themeConfig.colors.background,
                          borderColor: themeConfig.colors.warning + '50',
                          color: themeConfig.colors.text,
                          '--tw-ring-color': themeConfig.colors.warning,
                        }}
                      />
                    </div>
                  )}

                  {/* Self-Explanation */}
                  {showSelfExplanation && (
                    <div 
                      className="border rounded-lg p-4"
                      style={{
                        backgroundColor: themeConfig.colors.accent + '10',
                        borderColor: themeConfig.colors.accent + '30'
                      }}
                    >
                      <h4 className="font-medium mb-2" style={{ color: themeConfig.colors.accent }}>
                        {t.selfExplanationPrompt}
                      </h4>
                      <textarea
                        value={selfExplanationAnswer}
                        onChange={(e) => setSelfExplanationAnswer(e.target.value)}
                        placeholder={t.connectKnowledge}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 outline-none transition-colors resize-none text-sm"
                        style={{
                          backgroundColor: themeConfig.colors.background,
                          borderColor: themeConfig.colors.accent + '50',
                          color: themeConfig.colors.text,
                          '--tw-ring-color': themeConfig.colors.accent,
                        }}
                      />
                    </div>
                  )}

                  {/* Action Buttons - Mobile Optimized */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {!currentQuestion.isCorrect && (
                      <button
                        onClick={tryAgain}
                        className="flex-1 py-2.5 sm:py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base touch-target"
                        style={{
                          backgroundColor: themeConfig.colors.textSecondary,
                          color: '#ffffff'
                        }}
                      >
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>{t.tryAgain}</span>
                      </button>
                    )}
                    <button
                      onClick={nextQuestion}
                      className="flex-1 py-2.5 sm:py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base touch-target"
                      style={{
                        backgroundColor: themeConfig.colors.primary,
                        color: '#ffffff'
                      }}
                    >
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>{t.nextQuestion}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4" style={{ color: themeConfig.colors.textMuted }} />
              <p className="text-sm sm:text-base" style={{ color: themeConfig.colors.textSecondary }}>{t.readyToLearn}</p>
            </div>
          )}
        </div>

        {/* Progress Indicator - Mobile Optimized */}
        {currentSession && currentSession.questions.length > 0 && (
          <div 
            className="rounded-lg shadow-sm border p-3 sm:p-4"
            style={{
              backgroundColor: themeConfig.colors.surface,
              borderColor: themeConfig.colors.border
            }}
          >
            <div className="flex items-center justify-between text-xs sm:text-sm mb-2" style={{ color: themeConfig.colors.textSecondary }}>
              <span>{t.currentScore}</span>
              <span>{currentSession.score}%</span>
            </div>
            <div 
              className="w-full rounded-full h-2"
              style={{ backgroundColor: themeConfig.colors.border }}
            >
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${currentSession.score}%`,
                  background: themeConfig.gradients.primary
                }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs mt-2" style={{ color: themeConfig.colors.textMuted }}>
              <span>{currentSession.questions.filter(q => q.isCorrect).length} {t.correctAnswers}</span>
              <span>{currentSession.questions.length} {t.questions}</span>
            </div>
          </div>
        )}
      </div>

      {/* Session Edit Modal */}
      <SessionEditModal
        session={currentSession!}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSessionEdit}
      />

      {/* Timer Settings Modal */}
      <TimerSettingsModal
        timerSettings={timerSettings}
        isOpen={showTimerModal}
        onClose={() => setShowTimerModal(false)}
        onSave={handleTimerSettingsUpdate}
      />
    </div>
  );
}