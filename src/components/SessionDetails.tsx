import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, BookOpen, TrendingUp, CheckCircle, XCircle, Clock, Target } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLanguage } from '../hooks/useLanguage';
import { StudySession } from '../types';
import { formatDate } from '../utils/i18n';
import MarkdownRenderer from './MarkdownRenderer';

export default function SessionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [sessions] = useLocalStorage<StudySession[]>('studorama-sessions', []);
  
  const session = sessions.find(s => s.id === id);

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">{t.sessionNotFound}</h2>
          <p className="text-gray-600 mb-6">{t.sessionNotFoundDesc}</p>
          <Link
            to="/history"
            className="inline-flex items-center bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t.backToHistory}
          </Link>
        </div>
      </div>
    );
  }

  const correctAnswers = session.questions.filter(q => q.isCorrect).length;
  const totalQuestions = session.questions.length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/history')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{session.subject}</h1>
            {session.subjectModifiers && session.subjectModifiers.length > 0 && (
              <div className="mt-1 space-y-1">
                {session.subjectModifiers.map((modifier, index) => (
                  <p key={index} className="text-sm text-gray-600 truncate">{modifier}</p>
                ))}
              </div>
            )}
            <p className="text-gray-600">{t.sessionDetails}</p>
          </div>
        </div>
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
          session.status === 'completed' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-orange-100 text-orange-800'
        }`}>
          {session.status === 'completed' ? t.completed : t.inProgress}
        </div>
      </div>

      {/* Session Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-600">{t.date}</p>
              <p className="text-lg font-semibold text-gray-900 truncate">
                {formatDate(session.createdAt, language)}
              </p>
            </div>
            <Calendar className="w-6 sm:w-8 h-6 sm:h-8 text-orange-600 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.questions}</p>
              <p className="text-lg font-semibold text-gray-900">{totalQuestions}</p>
            </div>
            <BookOpen className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.accuracy}</p>
              <p className="text-lg font-semibold text-gray-900">{accuracy}%</p>
            </div>
            <Target className="w-6 sm:w-8 h-6 sm:h-8 text-green-600 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.score}</p>
              <p className="text-lg font-semibold text-gray-900">{session.score}%</p>
            </div>
            <TrendingUp className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{t.questionsAndAnswers}</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {session.questions.map((question, index) => (
            <div key={question.id} className="p-4 sm:p-6">
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
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <div className="text-lg font-medium text-gray-900 break-words flex-1">
                      <MarkdownRenderer content={question.question} />
                    </div>
                    {question.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
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
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="text-gray-900 break-words flex-1">
                              <MarkdownRenderer content={option} />
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {optionIndex === question.correctAnswer && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  {t.correct}
                                </span>
                              )}
                              {optionIndex === question.userAnswer && optionIndex !== question.correctAnswer && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                  {t.yourAnswer}
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
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{t.yourAnswer}:</h4>
                        <div className="text-gray-900 break-words">
                          <MarkdownRenderer content={question.userAnswer || (language === 'pt-BR' ? 'Nenhuma resposta fornecida' : 'No answer provided')} />
                        </div>
                      </div>
                      {question.correctAnswerText && (
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-green-700 mb-2">{t.modelAnswer}:</h4>
                          <div className="text-green-900 break-words">
                            <MarkdownRenderer content={question.correctAnswerText} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {question.feedback && (
                    <div className={`p-4 rounded-lg mb-4 ${
                      question.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <h4 className={`text-sm font-medium mb-2 ${
                        question.isCorrect ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {t.feedback}
                      </h4>
                      <div className={`text-sm break-words ${
                        question.isCorrect ? 'text-green-700' : 'text-red-700'
                      }`}>
                        <MarkdownRenderer content={question.feedback} />
                      </div>
                    </div>
                  )}

                  {question.aiEvaluation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-medium text-blue-700 mb-2">{t.aiEvaluation}</h4>
                      <div className="text-sm text-blue-700 break-words">
                        <MarkdownRenderer content={question.aiEvaluation} />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                      {question.attempts} {question.attempts !== 1 ? t.attempts : t.attempt}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1 flex-shrink-0" />
                      {question.type === 'multiple-choice' ? t.multipleChoice : t.dissertative}
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
            {t.continueSession}
          </Link>
        </div>
      )}
    </div>
  );
}