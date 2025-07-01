import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, Home, Lightbulb } from 'lucide-react';
import { StudySession, Question } from '../types';

interface StudyViewProps {
  session: StudySession;
  onUpdateSession: (session: StudySession) => void;
  onEndSession: () => void;
}

export function StudyView({ session, onUpdateSession, onEndSession }: StudyViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(session.questions.length);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentQuestion = session.questions[currentQuestionIndex];
  const isAnswered = currentQuestion?.userAnswer !== undefined;

  useEffect(() => {
    if (!currentQuestion && currentQuestionIndex === session.questions.length) {
      generateNextQuestion();
    }
  }, [currentQuestion, currentQuestionIndex]);

  const generateNextQuestion = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to ChatGPT
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newQuestion: Question = {
        id: `q-${Date.now()}`,
        question: `Sample ${session.subject} question #${session.questions.length + 1}: What is an important concept in ${session.subject}?`,
        options: [
          'This is the correct answer',
          'This is an incorrect option',
          'Another incorrect option',
          'One more incorrect option'
        ],
        correctAnswer: 0,
      };

      const updatedSession = {
        ...session,
        questions: [...session.questions, newQuestion],
        totalQuestions: session.totalQuestions + 1
      };

      onUpdateSession(updatedSession);
    } catch (error) {
      console.error('Error generating question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !currentQuestion) return;

    setIsLoading(true);
    try {
      // Simulate API call for answer evaluation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      const explanation = isCorrect 
        ? 'Excellent! You got it right.' 
        : `Not quite. The correct answer is "${currentQuestion.options[currentQuestion.correctAnswer]}". Here's why: This is a sample explanation for the correct answer.`;

      const updatedQuestion = {
        ...currentQuestion,
        userAnswer: selectedAnswer,
        isCorrect,
        explanation
      };

      const updatedQuestions = [...session.questions];
      updatedQuestions[currentQuestionIndex] = updatedQuestion;

      const updatedSession = {
        ...session,
        questions: updatedQuestions,
        score: session.score + (isCorrect ? 1 : 0)
      };

      onUpdateSession(updatedSession);
      setShowResult(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleTryAgain = () => {
    const updatedQuestion = {
      ...currentQuestion!,
      userAnswer: undefined,
      isCorrect: undefined,
      explanation: undefined
    };

    const updatedQuestions = [...session.questions];
    updatedQuestions[currentQuestionIndex] = updatedQuestion;

    const updatedSession = {
      ...session,
      questions: updatedQuestions,
      score: Math.max(0, session.score - (currentQuestion?.isCorrect === false ? 0 : 1))
    };

    onUpdateSession(updatedSession);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  if (isLoading && !currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Your Question</h3>
          <p className="text-gray-600">Our AI is creating a personalized question for {session.subject}...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">No questions available</h3>
          <button
            onClick={onEndSession}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      {/* Progress Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{session.subject}</h2>
            <p className="text-gray-600">Question {currentQuestionIndex + 1}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{session.score}/{session.totalQuestions}</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentQuestionIndex + 1) / Math.max(session.totalQuestions, currentQuestionIndex + 1) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-slide-up">
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.question}
          </h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isAnswered
                    ? index === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : index === currentQuestion.userAnswer && !currentQuestion.isCorrect
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                    : selectedAnswer === index
                    ? 'border-primary-500 bg-primary-50 text-primary-800'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isAnswered
                      ? index === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-500'
                        : index === currentQuestion.userAnswer && !currentQuestion.isCorrect
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-300'
                      : selectedAnswer === index
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  }`}>
                    {isAnswered && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="text-white" size={16} />
                    )}
                    {isAnswered && index === currentQuestion.userAnswer && !currentQuestion.isCorrect && (
                      <XCircle className="text-white" size={16} />
                    )}
                    {!isAnswered && selectedAnswer === index && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Answer Results */}
        {showResult && currentQuestion.explanation && (
          <div className={`mb-6 p-4 rounded-xl ${
            currentQuestion.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start space-x-3">
              <div className={`p-1 rounded-full ${
                currentQuestion.isCorrect ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {currentQuestion.isCorrect ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-red-600" size={20} />
                )}
              </div>
              <div>
                <h4 className={`font-semibold mb-2 ${
                  currentQuestion.isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {currentQuestion.isCorrect ? 'Correct!' : 'Incorrect'}
                </h4>
                <p className={`${
                  currentQuestion.isCorrect ? 'text-green-700' : 'text-red-700'
                }`}>
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <button
            onClick={onEndSession}
            className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Home size={20} />
            <span>End Session</span>
          </button>
          
          <div className="flex gap-3">
            {showResult && !currentQuestion.isCorrect && (
              <button
                onClick={handleTryAgain}
                className="flex items-center justify-center space-x-2 px-6 py-3 border border-orange-300 text-orange-700 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
              >
                <RotateCcw size={20} />
                <span>Try Again</span>
              </button>
            )}
            
            {!showResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || isLoading}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Submit Answer</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
              >
                <Lightbulb size={20} />
                <span>Next Question</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}