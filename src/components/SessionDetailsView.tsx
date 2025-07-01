import React from 'react';
import { ArrowLeft, CheckCircle, XCircle, Calendar, Award, BookOpen } from 'lucide-react';
import { StudySession } from '../types';

interface SessionDetailsViewProps {
  session: StudySession;
  onBack: () => void;
}

export function SessionDetailsView({ session, onBack }: SessionDetailsViewProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getScorePercentage = () => {
    return session.totalQuestions > 0 ? Math.round((session.score / session.totalQuestions) * 100) : 0;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{session.subject}</h1>
          <p className="text-gray-600">Session Details</p>
        </div>
      </div>

      {/* Session Info Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-primary-600" size={32} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Started</h3>
            <p className="text-gray-600">{formatDate(session.createdAt)}</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-green-600" size={32} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Score</h3>
            <p className="text-2xl font-bold text-green-600">{getScorePercentage()}%</p>
            <p className="text-sm text-gray-500">{session.score} of {session.totalQuestions} correct</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-blue-600" size={32} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Progress</h3>
            <p className="text-2xl font-bold text-blue-600">{session.questions.length}</p>
            <p className="text-sm text-gray-500">Questions answered</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">{getScorePercentage()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all ${
                getScorePercentage() >= 80 ? 'bg-green-500' :
                getScorePercentage() >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${getScorePercentage()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions Review */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Questions Review</h2>
        
        {session.questions.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-600">No questions answered yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {session.questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${
                    question.isCorrect ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {question.isCorrect ? (
                      <CheckCircle className="text-green-600" size={24} />
                    ) : (
                      <XCircle className="text-red-600" size={24} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Question {index + 1}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        question.isCorrect 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {question.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    
                    <p className="text-gray-800 mb-4">{question.question}</p>
                    
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border ${
                            optionIndex === question.correctAnswer
                              ? 'border-green-500 bg-green-50 text-green-800'
                              : optionIndex === question.userAnswer && !question.isCorrect
                              ? 'border-red-500 bg-red-50 text-red-800'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              optionIndex === question.correctAnswer
                                ? 'border-green-500 bg-green-500'
                                : optionIndex === question.userAnswer && !question.isCorrect
                                ? 'border-red-500 bg-red-500'
                                : 'border-gray-300'
                            }`}>
                              {optionIndex === question.correctAnswer && (
                                <CheckCircle className="text-white" size={12} />
                              )}
                              {optionIndex === question.userAnswer && !question.isCorrect && (
                                <XCircle className="text-white" size={12} />
                              )}
                            </div>
                            <span>{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {question.explanation && (
                      <div className={`p-4 rounded-lg ${
                        question.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        <p className={`text-sm ${
                          question.isCorrect ? 'text-green-700' : 'text-red-700'
                        }`}>
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}