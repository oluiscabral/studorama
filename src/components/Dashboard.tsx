import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, History, Settings, TrendingUp, Heart, Star, ExternalLink } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLanguage } from '../hooks/useLanguage';
import { StudySession } from '../types';
import { formatDate } from '../utils/i18n';
import Logo from './Logo';

export default function Dashboard() {
  const [sessions] = useLocalStorage<StudySession[]>('studorama-sessions', []);
  const [apiSettings] = useLocalStorage('studorama-api-settings', { 
    openaiApiKey: '',
    model: 'gpt-4o-mini'
  });
  const { t, language } = useLanguage();

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const averageScore = completedSessions > 0 
    ? sessions.filter(s => s.status === 'completed').reduce((acc, s) => acc + s.score, 0) / completedSessions 
    : 0;

  const recentSessions = sessions.slice(-3).reverse();

  const handlePatreonSupport = () => {
    window.open('https://patreon.com/studorama', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <Logo size="lg" className="mx-auto mb-3 sm:mb-4" />
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2 leading-tight px-2">
          {t.welcomeTitle}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 px-4 leading-relaxed">
          {t.welcomeSubtitle}
        </p>
        
        {/* No Account Required Badge */}
        <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 mx-2">
          <Star className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="text-center leading-tight">
            {language === 'pt-BR' 
              ? 'Sem Conta • 100% Gratuito • Privacidade Primeiro'
              : 'No Account Required • 100% Free • Privacy First'
            }
          </span>
        </div>
      </div>

      {/* API Key Warning */}
      {!apiSettings.openaiApiKey && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 sm:p-4 mx-2">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mt-2 flex-shrink-0"></div>
            <p className="text-orange-700 text-xs sm:text-sm lg:text-base leading-relaxed">
              <strong>{t.setupRequired}</strong> {t.configureApiKey}{' '}
              <Link to="/settings" className="underline hover:no-underline">
                {t.settings}
              </Link> {language === 'pt-BR' ? 'para começar a estudar' : 'to start studying'}.
            </p>
          </div>
        </div>
      )}

      {/* Model Info */}
      {apiSettings.openaiApiKey && apiSettings.model && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mx-2">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-blue-700 text-xs sm:text-sm lg:text-base leading-relaxed">
              <strong>{t.readyToStudy}</strong> {t.usingModel} {apiSettings.model}
            </p>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 sm:p-4 mx-2">
        <div className="flex items-start space-x-2 sm:space-x-3">
          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
          <p className="text-purple-700 text-xs sm:text-sm lg:text-base leading-relaxed">
            <strong>{language === 'pt-BR' ? 'Privacidade Garantida:' : 'Privacy Guaranteed:'}</strong> {' '}
            {language === 'pt-BR' 
              ? 'Seus dados ficam no seu navegador. Nenhuma conta necessária, nenhum rastreamento.'
              : 'Your data stays in your browser. No account needed, no tracking.'
            }
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 px-2">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{t.totalSessions}</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{totalSessions}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{t.completed}</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{completedSessions}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-orange-100 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{t.averageScore}</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{Math.round(averageScore)}%</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 px-2">
        <Link
          to="/study"
          className="group bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 leading-tight">{t.startNewSession}</h3>
              <p className="text-orange-100 text-sm sm:text-base leading-relaxed">{t.beginNewSession}</p>
            </div>
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-orange-200 group-hover:text-white transition-colors flex-shrink-0 self-start sm:self-center" />
          </div>
        </Link>

        <Link
          to="/history"
          className="group bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-orange-100 hover:shadow-md transition-all duration-200 hover:scale-105"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 leading-tight">{t.viewHistory}</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{t.reviewPastSessions}</p>
            </div>
            <History className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-orange-600 transition-colors flex-shrink-0 self-start sm:self-center" />
          </div>
        </Link>
      </div>

      {/* Support Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-purple-200 mx-2">
        <div className="text-center">
          <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2 sm:mb-3" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 leading-tight">
            {language === 'pt-BR' ? 'Apoie o Studorama' : 'Support Studorama'}
          </h3>
          <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base leading-relaxed px-2">
            {language === 'pt-BR' 
              ? 'Ajude-nos a manter esta plataforma gratuita e sem necessidade de conta para todos.'
              : 'Help us keep this platform free and accountless for everyone.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center">
            <button
              onClick={handlePatreonSupport}
              className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 text-sm sm:text-base shadow-lg hover:shadow-xl"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              <span className="leading-tight">
                {language === 'pt-BR' ? 'Patreon' : 'Patreon'}
              </span>
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 flex-shrink-0" />
            </button>
            <Link
              to="/pricing"
              className="inline-flex items-center bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              <span className="leading-tight">
                {language === 'pt-BR' ? 'Outras Opções' : 'Other Options'}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 mx-2">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t.recentSessions}</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentSessions.map((session) => (
              <div key={session.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">{session.subject}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {formatDate(session.createdAt, language)} • {session.questions.length} {t.questions}
                    </p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      session.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {session.status === 'completed' ? t.completed : t.inProgress}
                    </div>
                    {session.status === 'completed' && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{session.score}% {t.score}</p>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {session.status === 'completed' && (
                  <div className="mt-3 sm:mt-4">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-1">
                      <span>{t.correctAnswers}</span>
                      <span>{Math.round((session.questions.filter(q => q.isCorrect).length / session.questions.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(session.questions.filter(q => q.isCorrect).length / session.questions.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}