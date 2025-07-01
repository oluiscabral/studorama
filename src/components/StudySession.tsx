import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, RefreshCw, ArrowRight, BookOpen } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { StudySession, Question } from '../types';
import { generateQuestion, evaluateAnswer } from '../utils/openai';

export default function StudySessionComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sessions, setSessions] = useLocalStorage<StudySession[]>('studorama-sessions', []);
  const [apiSettings] = useLocalStorage('studorama-api-settings', { 
    openaiApiKey: '',
    model: 'gpt-4o-mini'
  });
  
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);

  // Check if we're continuing an existing session
  useEffect(() => {
    const sessionId = location.state?.sessionId;
    if (sessionId) {
      const existingSession = sessions.find(s => s.id === sessionId);
      if (existingSession) {
        setCurrentSession(existingSession);
        setSubject(existingSession.subject);
        setSessionStarted(true);
        loadNextQuestion(existingSession);
      }
    }
  }, [location.state, sessions]);

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
      totalQuestions: 0
    };

    setCurrentSession(newSession);
    setSessionStarted(true);
    loadNextQuestion(newSession);
  };

  const loadNextQuestion = async (session: StudySession) => {
    setLoading(true);
    setSelectedAnswer(null);
    setShowFeedback(false);

    try {
      const questionData = await generateQuestion(
        session.subject, 
        apiSettings.openaiApiKey,
        apiSettings.model || 'gpt-4o-mini'
      );
      
      const newQuestion: Question = {
        id: Date.now().toString(),
        question: questionData.question,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        attempts: 0,
        feedback: questionData.explanation
      };

      setCurrentQuestion(newQuestion);
    } catch (error) {
      console.error('Error generating question:', error);
      alert('Failed to generate question. Please check your API key or try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (selectedAnswer === null || !currentQuestion || !currentSession) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const updatedQuestion = {
      ...currentQuestion,
      userAnswer: selectedAnswer,
      isCorrect,
      attempts: currentQuestion.attempts + 1
    };

    setCurrentQuestion(updatedQuestion);
    setShowFeedback(true);

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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Start New Study Session</h1>
            <p className="text-gray-600">Enter a subject to begin your AI-powered study session</p>
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

            {apiSettings.model && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Using model:</strong> {apiSettings.model}
                </p>
              </div>
            )}

            <button
              onClick={startNewSession}
              disabled={!subject.trim() || !apiSettings.openaiApiKey}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Study Session
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
            <p className="text-gray-600">Question {currentSession?.questions.length + 1}</p>
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
                {currentQuestion.isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            {currentQuestion.feedback && (
              <p className={`text-sm ${
                currentQuestion.isCorrect ? 'text-green-700' : 'text-red-700'
              }`}>
                {currentQuestion.feedback}
              </p>
            )}
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
                disabled={selectedAnswer === null}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <div className="space-x-3">
                {!currentQuestion.isCorrect && (
                  <button
                    onClick={() => {
                      setSelectedAnswer(null);
                      setShowFeedback(false);
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