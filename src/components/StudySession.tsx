import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, TrendingUp, Loader2, CheckCircle, XCircle, Brain, Lightbulb, Target, Zap } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLanguage } from '../hooks/useLanguage';
import { StudySession, Question, LearningSettings, APISettings, LearningTechniquesPreference } from '../types';
import { generateQuestion, generateDissertativeQuestion, evaluateAnswer, generateElaborativeQuestion, generateRetrievalQuestion } from '../utils/openai';
import { getRandomModifierPlaceholder } from '../utils/i18n';
import MarkdownRenderer from './MarkdownRenderer';

const DEFAULT_LEARNING_SETTINGS: LearningSettings = {
  spacedRepetition: true,
  interleaving: true,
  elaborativeInterrogation: true,
  selfExplanation: true,
  desirableDifficulties: true,
  retrievalPractice: true,
  generationEffect: true
};

export default function StudySessionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  
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

  // Session configuration state
  const [subject, setSubject] = useState('');
  const [subjectModifiers, setSubjectModifiers] = useState<string[]>([]);
  const [newModifier, setNewModifier] = useState('');
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'dissertative' | 'mixed'>('multiple-choice');
  const [learningSettings, setLearningSettings] = useState<LearningSettings>(learningPreference.defaultSettings);
  const [rememberChoice, setRememberChoice] = useState(learningPreference.rememberChoice);

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

  // Preloading state
  const [preloadedQuestions, setPreloadedQuestions] = useState<Question[]>([]);
  const [isPreloading, setIsPreloading] = useState(false);

  // Check if we're continuing an existing session
  useEffect(() => {
    if (sessionIdFromState) {
      const existingSession = sessions.find(s => s.id === sessionIdFromState);
      if (existingSession && existingSession.status === 'active') {
        setCurrentSession(existingSession);
        setSessionStarted(true);
        
        // Set the current question based on the session's current question index
        const questionIndex = existingSession.currentQuestionIndex || 0;
        if (existingSession.questions[questionIndex]) {
          setCurrentQuestion(existingSession.questions[questionIndex]);
        } else {
          // Generate next question if we're at the end
          generateNextQuestion(existingSession);
        }
      }
    }
  }, [sessionIdFromState, sessions]);

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
      currentQuestionIndex: 0
    };

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
        // For dissertative questions, use AI evaluation
        const fullSubject = [currentSession.subject, ...(currentSession.subjectModifiers || [])].join(' - ');
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
      
      // Update question with answer and feedback
      const updatedQuestion: Question = {
        ...currentQuestion,
        userAnswer,
        isCorrect,
        feedback,
        aiEvaluation,
        attempts: currentQuestion.attempts + 1,
        confidence
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
    
    const finalSession: StudySession = {
      ...currentSession,
      status: 'completed'
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

  if (!sessionStarted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.startNewStudySession}</h1>
            <p className="text-gray-600">{t.configureSession}</p>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-6">
            {/* Subject Input */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                {t.studySubject}
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t.subjectPlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              />
            </div>

            {/* Subject Modifiers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.subjectModifiers}
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newModifier}
                    onChange={(e) => setNewModifier(e.target.value)}
                    placeholder={getRandomModifierPlaceholder(language)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && addModifier()}
                  />
                  <button
                    onClick={addModifier}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    {t.addModifier}
                  </button>
                </div>
                {subjectModifiers.length > 0 && (
                  <div className="space-y-2">
                    {subjectModifiers.map((modifier, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-sm text-gray-700">{modifier}</span>
                        <button
                          onClick={() => removeModifier(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          {t.removeModifier}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t.questionType}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setQuestionType('multiple-choice')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    questionType === 'multiple-choice'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{t.multipleChoice}</h3>
                    <p className="text-sm text-gray-600">{t.quickAssessment}</p>
                  </div>
                </button>

                <button
                  onClick={() => setQuestionType('dissertative')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    questionType === 'dissertative'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{t.dissertative}</h3>
                    <p className="text-sm text-gray-600">{t.deepAnalysis}</p>
                  </div>
                </button>

                <button
                  onClick={() => setQuestionType('mixed')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    questionType === 'mixed'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{t.mixed}</h3>
                    <p className="text-sm text-gray-600">{t.interleavedPractice}</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Learning Techniques */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Brain className="w-5 h-5 text-orange-600" />
                <label className="text-sm font-medium text-gray-700">
                  {t.learningTechniques}
                </label>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {t.makeItStickBased}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={learningSettings.spacedRepetition}
                    onChange={() => updateLearningSettings('spacedRepetition')}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{t.spacedRepetition}</div>
                    <div className="text-sm text-gray-600">{t.spacedRepetitionDesc}</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={learningSettings.interleaving}
                    onChange={() => updateLearningSettings('interleaving')}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{t.interleaving}</div>
                    <div className="text-sm text-gray-600">{t.interleavingDesc}</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={learningSettings.elaborativeInterrogation}
                    onChange={() => updateLearningSettings('elaborativeInterrogation')}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{t.elaborativeInterrogation}</div>
                    <div className="text-sm text-gray-600">{t.elaborativeInterrogationDesc}</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={learningSettings.retrievalPractice}
                    onChange={() => updateLearningSettings('retrievalPractice')}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{t.retrievalPractice}</div>
                    <div className="text-sm text-gray-600">{t.retrievalPracticeDesc}</div>
                  </div>
                </label>
              </div>

              {/* Remember Choice */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberChoice}
                    onChange={(e) => setRememberChoice(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-blue-900">{t.rememberMyChoice}</div>
                    <div className="text-sm text-blue-700">{t.rememberLearningTechniques}</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4">
              {apiSettings.openaiApiKey ? (
                <button
                  onClick={startSession}
                  disabled={!subject.trim()}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Target className="w-5 h-5" />
                  <span>{t.startEnhancedSession}</span>
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">{t.configureApiKeyFirst}</p>
                  <button
                    onClick={() => navigate('/settings')}
                    className="bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    {t.settings}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/history')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{currentSession?.subject}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{t.using} {apiSettings.model}</span>
              <span>•</span>
              <span>{t.currentScore}: {currentSession?.score || 0}%</span>
              {apiSettings.preloadQuestions && apiSettings.preloadQuestions > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-purple-600" />
                    <span className="text-purple-600">
                      {language === 'pt-BR' ? 'Carregamento Inteligente' : 'Smart Loading'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={endSession}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          {t.endSession}
        </button>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-gray-600">{t.generatingQuestion}</p>
          </div>
        ) : currentQuestion ? (
          <div className="space-y-6">
            {/* Question */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t.question} {(currentSession?.questions.length || 0)}
                </h2>
                <div className="flex items-center space-x-2">
                  {currentQuestion.difficulty && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {currentQuestion.difficulty === 'easy' ? t.easy :
                       currentQuestion.difficulty === 'medium' ? t.medium : t.hard}
                    </span>
                  )}
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {currentQuestion.type === 'multiple-choice' ? t.multipleChoice : t.dissertative}
                  </span>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <MarkdownRenderer content={currentQuestion.question} />
              </div>
            </div>

            {/* Answer Input */}
            {!showFeedback && (
              <div className="space-y-4">
                {currentQuestion.type === 'multiple-choice' && currentQuestion.options ? (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => setUserAnswer(index)}
                        className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 min-h-[60px] flex items-center justify-center ${
                          userAnswer === index
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
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
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                    />
                  </div>
                )}

                {/* Confidence Scale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t.confidenceQuestion}
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t.notConfident}</span>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          onClick={() => setConfidence(level)}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            confidence === level
                              ? 'border-orange-500 bg-orange-500 text-white'
                              : 'border-gray-300 text-gray-600 hover:border-orange-300'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{t.veryConfident}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={submitAnswer}
                  disabled={isEvaluating || (currentQuestion.type === 'multiple-choice' ? userAnswer === '' : !userAnswer.toString().trim())}
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
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

            {/* Feedback */}
            {showFeedback && currentQuestion && (
              <div className="space-y-4">
                {/* Result */}
                <div className={`p-4 rounded-lg border-2 ${
                  currentQuestion.isCorrect 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-red-500 bg-red-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    {currentQuestion.isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                    <div>
                      <h3 className={`font-semibold ${
                        currentQuestion.isCorrect ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {currentQuestion.isCorrect ? t.excellent : t.keepLearning}
                      </h3>
                      {currentQuestion.feedback && (
                        <div className={`mt-2 ${
                          currentQuestion.isCorrect ? 'text-green-800' : 'text-red-800'
                        }`}>
                          <MarkdownRenderer content={currentQuestion.feedback} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Evaluation for dissertative questions */}
                {currentQuestion.aiEvaluation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">{t.aiEvaluation}</h4>
                    <div className="text-blue-800">
                      <MarkdownRenderer content={currentQuestion.aiEvaluation} />
                    </div>
                  </div>
                )}

                {/* Model Answer for dissertative questions */}
                {currentQuestion.type === 'dissertative' && currentQuestion.correctAnswerText && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">{t.modelAnswer}</h4>
                    <div className="text-green-800">
                      <MarkdownRenderer content={currentQuestion.correctAnswerText} />
                    </div>
                  </div>
                )}

                {/* Elaborative Interrogation */}
                {showElaborative && elaborativeQuestion && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">{t.elaborativePrompt}</h4>
                    <div className="text-yellow-800 mb-3">
                      <MarkdownRenderer content={elaborativeQuestion} />
                    </div>
                    <textarea
                      value={elaborativeAnswer}
                      onChange={(e) => setElaborativeAnswer(e.target.value)}
                      placeholder={t.explainReasoning}
                      rows={3}
                      className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors resize-none"
                    />
                  </div>
                )}

                {/* Self-Explanation */}
                {showSelfExplanation && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">{t.selfExplanationPrompt}</h4>
                    <textarea
                      value={selfExplanationAnswer}
                      onChange={(e) => setSelfExplanationAnswer(e.target.value)}
                      placeholder={t.connectKnowledge}
                      rows={3}
                      className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors resize-none"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {!currentQuestion.isCorrect && (
                    <button
                      onClick={tryAgain}
                      className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>{t.tryAgain}</span>
                    </button>
                  )}
                  <button
                    onClick={nextQuestion}
                    className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>{t.nextQuestion}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t.readyToLearn}</p>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      {currentSession && currentSession.questions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>{t.currentScore}</span>
            <span>{currentSession.score}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentSession.score}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <span>{currentSession.questions.filter(q => q.isCorrect).length} {t.correctAnswers}</span>
            <span>{currentSession.questions.length} {t.questions}</span>
          </div>
        </div>
      )}
    </div>
  );
}