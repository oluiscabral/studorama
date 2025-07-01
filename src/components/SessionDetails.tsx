import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, BookOpen, TrendingUp, CheckCircle, XCircle, Clock, Target } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { StudySession } from '../types';

export default function SessionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sessions] = useLocalStorage<StudySession[]>('studorama-sessions', []);
  
  const session = sessions.find(s => s.id === id);

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-6">The study session you're looking for doesn't exist.</p>
          <Link
            to="/history"
            className="inline-flex items-center bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  const correctAnswers = session.questions.filter(q => q.isCorrect).length;
  const totalQuestions = session.questions.length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-bold text-gray-900">{session.subject}</h1>
            <p className="text-gray-600">Study Session Details</p>
          </div>
        </div>
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
          session.status === 'completed' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-orange-100 text-orange-800'
        }`}>
          {session.status === 'completed' ? 'Completed' : 'In Progress'}
        </div>
      </div>

      {/* Session Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Questions</p>
              <p className="text-lg font-semibold text-gray-900">{totalQuestions}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accuracy</p>
              <p className="text-lg font-semibold text-gray-900">{accuracy}%</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Score</p>
              <p className="text-lg font-semibold text-gray-900">{session.score}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Questions & Answers</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {session.questions.map((question, index) => (
            <div key={question.id} className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    question.isCorrect 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-3">
                    <h3 className="text-lg font-medium text-gray-900">{question.question}</h3>
                    {question.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>

                  {question.type === 'multiple-choice' && question.options ? (
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border ${
                            optionIndex === question.correctAnswer
                              ? 'border-green-500 bg-green-50'
                              : optionIndex === question.userAnswer
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900">{option}</span>
                            <div className="flex items-center space-x-2">
                              {optionIndex === question.correctAnswer && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Correct
                                </span>
                              )}
                              {optionIndex === question.userAnswer && optionIndex !== question.correctAnswer && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                  Your Answer
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Your Answer:</h4>
                        <p className="text-gray-900">{question.userAnswer || 'No answer provided'}</p>
                      </div>
                      {question.correctAnswerText && (
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-green-700 mb-2">Model Answer:</h4>
                          <p className="text-green-900">{question.correctAnswerText}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {question.feedback && (
                    <div className={`p-4 rounded-lg ${
                      question.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <h4 className={`text-sm font-medium mb-2 ${
                        question.isCorrect ? 'text-green-700' : 'text-red-700'
                      }`}>
                        Feedback:
                      </h4>
                      <p className={`text-sm ${
                        question.isCorrect ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {question.feedback}
                      </p>
                    </div>
                  )}

                  {question.aiEvaluation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <h4 className="text-sm font-medium text-blue-700 mb-2">AI Evaluation:</h4>
                      <p className="text-sm text-blue-700">{question.aiEvaluation}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {question.attempts} attempt{question.attempts !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {question.type === 'multiple-choice' ? 'Multiple Choice' : 'Dissertative'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Continue Session Button */}
      {session.status === 'active' && (
        <div className="text-center">
          <Link
            to="/study"
            state={{ sessionId: session.id }}
            className="inline-flex items-center bg-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Continue Session
          </Link>
        </div>
      )}
    </div>
  );
}