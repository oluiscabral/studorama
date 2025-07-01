import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, RefreshCw, ArrowRight, BookOpen, FileText, List, Brain, Target, Clock, Lightbulb, HelpCircle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { StudySession, Question, LearningSettings } from '../types';
import { generateQuestion, generateDissertativeQuestion, evaluateAnswer, generateElaborativeQuestion, generateRetrievalQuestion } from '../utils/openai';
import { calculateNextReview, shouldReviewQuestion } from '../utils/spacedRepetition';

const DEFAULT_LEARNING_SETTINGS: LearningSettings = {
  spacedRepetition: true,
  interleaving: true,
  elaborativeInterrogation: true,
  selfExplanation: true,
  desirableDifficulties: true,
  retrievalPractice: true,
  generationEffect: true
};

export default function StudySessionComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sessions, setSessions] = useLocalStorage<StudySession[]>('studorama-sessions', []);
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
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'dissertative' | 'mixed'>('multiple-choice');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [learningSettings, setLearningSettings] = useState<LearningSettings>(DEFAULT_LEARNING_SETTINGS);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(3);
  const [showElaborativePrompt, setShowElaborativePrompt] = useState(false);
  const [elaborativeResponse, setElaborativeResponse] = useState('');
  const [showSelfExplanation, setShowSelfExplanation] = useState(false);
  const [selfExplanation, setSelfExplanation] = useState('');

  // Check if we're continuing an existing session
  useEffect(() => {
    const sessionId = location.state?.sessionId;
    if (sessionId) {
      const existingSession = sessions.find(s => s.id === sessionId);
      if (existingSession) {
        setCurrentSession(existingSession);
        setSubject(existingSession.subject);
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

  const startNewSession = async () => {
    if (!subject.trim()) return;
    if (!apiSettings.openaiApiKey) {
      alert('Please configure your OpenAI API key in Settings first.');
      return;
    }

    const newSession: StudySession = {
      id: Date.now().toString(),
      subject: subject.trim(),
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
      let questionData;
      
      if (nextType === 'dissertative') {
        questionData = await generateDissertativeQuestion(
          session.subject, 
          apiSettings.openaiApiKey,
          apiSettings.model || 'gpt-4o-mini',
          apiSettings.customPrompts?.dissertative
        );
        
        const newQuestion: Question = {
          id: Date.now().toString(),
          question: questionData.question,
          correctAnswerText: questionData.sampleAnswer,
          attempts: 0,
          type: 'dissertative',
          difficulty: 'medium',
          reviewCount: 0,
          confidence: 3,
          retrievalStrength: 0.5
        };

        setCurrentQuestion(newQuestion);
      } else {
        // Apply desirable difficulties - make some questions harder
        const difficultyModifier = learningSettings.desirableDifficulties && Math.random() < 0.3 
          ? ' Make this question more challenging and require deeper thinking.' 
          : '';

        questionData = await generateQuestion(
          session.subject + difficultyModifier, 
          apiSettings.openaiApiKey,
          apiSettings.model || 'gpt-4o-mini',
          apiSettings.customPrompts?.multipleChoice
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
          confidence: 3,
          retrievalStrength: 0.5
        };

        setCurrentQuestion(newQuestion);
      }
    } catch (error) {
      console.error('Error generating question:', error);
      alert('Failed to generate question. Please check your API key or try again.');
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
          apiSettings.customPrompts?.evaluation
        );

        // Enhanced scoring based on evaluation
        const evaluationLower = evaluation.toLowerCase();
        const positiveWords = ['excellent', 'good', 'correct', 'accurate', 'comprehensive', 'well', 'strong', 'clear', 'thorough'];
        const negativeWords = ['incorrect', 'missing', 'incomplete', 'wrong', 'poor', 'weak', 'unclear', 'insufficient'];
        
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
        updatedQuestion = {
          ...currentQuestion,
          userAnswer: dissertativeAnswer,
          isCorrect: false,
          attempts: currentQuestion.attempts + 1,
          aiEvaluation: 'Error evaluating answer. Please try again.',
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Start New Study Session</h1>
            <p className="text-gray-600">Configure your AI-powered study session with proven learning techniques</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Study Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., JavaScript, World History, Biology..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && startNewSession()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Question Type
              </label>
              <div className="grid grid-cols-3 gap-4">
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
                  <h3 className="font-medium text-gray-900">Multiple Choice</h3>
                  <p className="text-sm text-gray-600 mt-1">Quick assessment questions</p>
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
                  <h3 className="font-medium text-gray-900">Dissertative</h3>
                  <p className="text-sm text-gray-600 mt-1">Deep analysis questions</p>
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
                  <h3 className="font-medium text-gray-900">Mixed</h3>
                  <p className="text-sm text-gray-600 mt-1">Interleaved practice</p>
                </button>
              </div>
            </div>

            {/* Learning Techniques Settings */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Learning Techniques (Based on "Make It Stick")
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(learningSettings).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setLearningSettings(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-blue-800 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-4 text-sm text-blue-700">
                <p><strong>Spaced Repetition:</strong> Review questions at increasing intervals</p>
                <p><strong>Interleaving:</strong> Mix different question types for better retention</p>
                <p><strong>Elaborative Interrogation:</strong> Ask "why" questions for deeper understanding</p>
                <p><strong>Retrieval Practice:</strong> Test yourself to strengthen memory</p>
              </div>
            </div>

            {apiSettings.model && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>Ready to learn!</strong> Using {apiSettings.model} with proven learning techniques
                </p>
              </div>
            )}

            <button
              onClick={startNewSession}
              disabled={!subject.trim() || !apiSettings.openaiApiKey}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Brain className="w-5 h-5 mr-2" />
              Start Enhanced Study Session
            </button>

            {!apiSettings.openaiApiKey && (
              <p className="text-center text-sm text-red-600">
                Please configure your OpenAI API key in Settings first.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Generating your next question...</p>
            {apiSettings.model && (
              <p className="text-sm text-gray-500 mt-2">Using {apiSettings.model}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-8 text-center">
          <p className="text-gray-600">Failed to load question. Please try again.</p>
          <button
            onClick={() => currentSession && loadNextQuestion(currentSession)}
            className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Header */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{currentSession?.subject}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Question {currentSession?.questions.length + 1}</span>
              <span className="flex items-center">
                {currentQuestion.type === 'multiple-choice' ? (
                  <List className="w-4 h-4 mr-1" />
                ) : (
                  <FileText className="w-4 h-4 mr-1" />
                )}
                {currentQuestion.type === 'multiple-choice' ? 'Multiple Choice' : 'Dissertative'}
              </span>
              {currentQuestion.difficulty && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              )}
            </div>
            {apiSettings.model && (
              <p className="text-xs text-gray-500">Using {apiSettings.model}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Current Score</div>
            <div className="text-2xl font-bold text-orange-600">{currentSession?.score || 0}%</div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-8">
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-6">
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
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedAnswer === index
                        ? 'border-orange-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswer === index && (
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                      )}
                    </div>
                    <span className="text-gray-900">{option}</span>
                    {showFeedback && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                    {showFeedback && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-600 ml-auto" />
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
                placeholder="Write your detailed answer here..."
                rows={8}
                disabled={showFeedback}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none disabled:bg-gray-50"
              />
              <p className="text-sm text-gray-500">
                Provide a comprehensive answer explaining your reasoning and key points.
              </p>
            </div>
          )}

          {/* Confidence Level */}
          {!showFeedback && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How confident are you in your answer?
              </label>
              <div className="flex items-center space-x-4">
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
                <span>Not confident</span>
                <span>Very confident</span>
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
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
              )}
              <span className={`font-medium ${
                currentQuestion.isCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
                {currentQuestion.isCorrect ? 'Excellent!' : 'Keep Learning!'}
              </span>
            </div>
            
            {currentQuestion.type === 'multiple-choice' && currentQuestion.feedback && (
              <p className={`text-sm ${
                currentQuestion.isCorrect ? 'text-green-700' : 'text-red-700'
              }`}>
                {currentQuestion.feedback}
              </p>
            )}

            {currentQuestion.type === 'dissertative' && (
              <div className="space-y-3">
                {currentQuestion.aiEvaluation && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">AI Evaluation:</h4>
                    <p className="text-sm text-gray-600">{currentQuestion.aiEvaluation}</p>
                  </div>
                )}
                {currentQuestion.correctAnswerText && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Model Answer:</h4>
                    <p className="text-sm text-gray-600">{currentQuestion.correctAnswerText}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Elaborative Interrogation */}
        {showElaborativePrompt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
              <HelpCircle className="w-4 h-4 mr-1" />
              Elaborative Interrogation: Why do you think this is the correct answer?
            </h4>
            <textarea
              value={elaborativeResponse}
              onChange={(e) => setElaborativeResponse(e.target.value)}
              placeholder="Explain your reasoning and why this answer makes sense..."
              rows={3}
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        )}

        {/* Self-Explanation */}
        {showSelfExplanation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
              <Lightbulb className="w-4 h-4 mr-1" />
              Self-Explanation: How does this connect to what you already know?
            </h4>
            <textarea
              value={selfExplanation}
              onChange={(e) => setSelfExplanation(e.target.value)}
              placeholder="Connect this answer to your existing knowledge or other concepts..."
              rows={3}
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={endSession}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            End Session
          </button>

          <div className="space-x-3">
            {!showFeedback ? (
              <button
                onClick={submitAnswer}
                disabled={
                  (currentQuestion.type === 'multiple-choice' && selectedAnswer === null) ||
                  (currentQuestion.type === 'dissertative' && !dissertativeAnswer.trim()) ||
                  evaluating
                }
                className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {evaluating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Submit Answer
                  </>
                )}
              </button>
            ) : (
              <div className="space-x-3">
                {!currentQuestion.isCorrect && currentQuestion.type === 'multiple-choice' && (
                  <button
                    onClick={() => {
                      setSelectedAnswer(null);
                      setShowFeedback(false);
                      setConfidenceLevel(3);
                    }}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </button>
                )}
                <button
                  onClick={nextQuestion}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center"
                >
                  Next Question
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