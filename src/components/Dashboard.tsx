import { Link } from 'react-router-dom';
import { BookOpen, History, TrendingUp, Heart, Star, ExternalLink } from 'lucide-react';
import { useLanguage, useLocalStorage, useTheme } from '../hooks';
import { StudySession } from '../types';
import { formatDate } from '../core/services';
import Logo from './Logo';

export default function Dashboard() {
  const [sessions] = useLocalStorage<StudySession[]>('studorama-sessions', []);
  const [apiSettings] = useLocalStorage('studorama-api-settings', { 
    openaiApiKey: '',
    model: 'gpt-4o-mini'
  });
  const { t, language } = useLanguage();
  const { themeConfig } = useTheme();

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
    <div className="space-y-responsive">
      {/* Header */}
      <header className="text-center">
        <Logo size="lg" className="mx-auto mb-3 sm:mb-4" />
        <h1 className="text-2xl-responsive font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2 leading-tight px-2">
          {t.welcomeTitle}
        </h1>
        <p className="text-gray-600 text-sm-responsive mb-3 sm:mb-4 px-2 sm:px-4 leading-relaxed max-w-3xl mx-auto">
          {t.welcomeSubtitle}
        </p>
        
        {/* No Account Required Badge */}
        <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 mx-2">
          <Star className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
          <span className="text-center leading-tight">
            {language === 'pt-BR' 
              ? 'Sem Conta • 100% Gratuito • Privacidade Primeiro'
              : 'No Account Required • 100% Free • Privacy First'
            }
          </span>
        </div>
      </header>

      {/* Status Messages */}
      <div className="space-y-3 sm:space-y-4">
        {/* API Key Warning */}
        {!apiSettings.openaiApiKey && (
          <div className="card bg-orange-50 border-orange-200" role="alert" aria-live="polite">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mt-2 flex-shrink-0" aria-hidden="true"></div>
              <p className="text-orange-700 text-xs-responsive leading-relaxed">
                <strong>{t.setupRequired}</strong> {t.configureApiKey}{' '}
                <Link to="/settings" className="underline hover:no-underline focus-ring rounded">
                  {t.settings}
                </Link> {language === 'pt-BR' ? 'para começar a estudar' : 'to start studying'}.
              </p>
            </div>
          </div>
        )}

        {/* Model Info */}
        {apiSettings.openaiApiKey && apiSettings.model && (
          <div className="card bg-blue-50 border-blue-200" role="status" aria-live="polite">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" aria-hidden="true"></div>
              <p className="text-blue-700 text-xs-responsive leading-relaxed">
                <strong>{t.readyToStudy}</strong> {t.usingModel} {apiSettings.model}
              </p>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" aria-hidden="true"></div>
            <p className="text-purple-700 text-xs-responsive leading-relaxed">
              <strong>{language === 'pt-BR' ? 'Privacidade Garantida:' : 'Privacy Guaranteed:'}</strong> {' '}
              {language === 'pt-BR' 
                ? 'Seus dados ficam no seu navegador. Nenhuma conta necessária, nenhum rastreamento.'
                : 'Your data stays in your browser. No account needed, no tracking.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Study Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{t.totalSessions}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{totalSessions}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{t.completed}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{completedSessions}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="card sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{t.averageScore}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{Math.round(averageScore)}%</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="sr-only">Quick Actions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <Link
            to="/study"
            className="group card-hover bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg focus-ring"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 leading-tight">{t.startNewSession}</h3>
                <p className="text-orange-100 text-sm sm:text-base leading-relaxed">{t.beginNewSession}</p>
              </div>
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-orange-200 group-hover:text-white transition-colors flex-shrink-0 self-start sm:self-center" aria-hidden="true" />
            </div>
          </Link>

          <Link
            to="/history"
            className="group card-hover focus-ring"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 leading-tight">{t.viewHistory}</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{t.reviewPastSessions}</p>
              </div>
              <History className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-orange-600 transition-colors flex-shrink-0 self-start sm:self-center" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </section>

      {/* Support Section - Fixed with theme-aware colors */}
      <section 
        aria-labelledby="support-heading" 
        className="card border"
        style={{
          background: themeConfig.gradients.card,
          borderColor: themeConfig.colors.primary + '30'
        }}
      >
        <div className="text-center">
          <h2 id="support-heading" className="flex items-center justify-center space-x-2 text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: themeConfig.colors.text }}>
            <Heart className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: themeConfig.colors.primary }} aria-hidden="true" />
            <span>{language === 'pt-BR' ? 'Apoie o Studorama' : 'Support Studorama'}</span>
          </h2>
          <p className="mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base leading-relaxed px-2 max-w-2xl mx-auto" style={{ color: themeConfig.colors.textSecondary }}>
            {language === 'pt-BR' 
              ? 'Ajude-nos a manter esta plataforma gratuita e sem necessidade de conta para todos.'
              : 'Help us keep this platform free and accountless for everyone.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center">
            <button
              onClick={handlePatreonSupport}
              className="btn-primary inline-flex items-center shadow-lg hover:shadow-xl"
              style={{
                background: themeConfig.gradients.primary,
                color: '#ffffff'
              }}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" aria-hidden="true" />
              <span className="leading-tight">
                {language === 'pt-BR' ? 'Patreon' : 'Patreon'}
              </span>
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 flex-shrink-0" aria-hidden="true" />
            </button>
            <Link
              to="/pricing"
              className="btn-secondary inline-flex items-center text-white border"
              style={{
                background: themeConfig.gradients.secondary,
                borderColor: themeConfig.colors.primary,
                color: '#ffffff'
              }}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" aria-hidden="true" />
              <span className="leading-tight">
                {language === 'pt-BR' ? 'Outras Opções' : 'Other Options'}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <section aria-labelledby="recent-heading" className="card">
          <div className="border-b border-gray-100 pb-4 sm:pb-6 mb-4 sm:mb-6">
            <h2 id="recent-heading" className="text-lg sm:text-xl font-semibold text-gray-900">{t.recentSessions}</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentSessions.map((session) => (
              <div key={session.id} className="py-4 sm:py-6 hover:bg-gray-50 transition-colors rounded-lg -mx-2 sm:-mx-4 px-2 sm:px-4">
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
                        role="progressbar"
                        aria-valuenow={(session.questions.filter(q => q.isCorrect).length / session.questions.length) * 100}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${Math.round((session.questions.filter(q => q.isCorrect).length / session.questions.length) * 100)}% correct answers`}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}