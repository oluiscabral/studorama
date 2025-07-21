import { Award, Bell, BookOpen, Calendar, CheckSquare, ChevronRight, ExternalLink, Heart, History, Info, Star, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../core/services/i18n';
import { useLanguage, useLocalStorage, useTheme } from '../../hooks';
import { StudySession } from '../../types';
import Logo from '../ui/Logo';

export default function Dashboard() {
  const [sessions] = useLocalStorage<StudySession[]>('studorama-sessions', []);
  const [apiSettings] = useLocalStorage('studorama-api-settings', { 
    openaiApiKey: '',
    model: 'gpt-4o-mini'
  });
  const { t, language } = useLanguage();
  const { themeConfig } = useTheme();
  const [showWelcomeTip, setShowWelcomeTip] = useState(true);
  const [_, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [animateStats, setAnimateStats] = useState(false);

  const totalSessions = sessions.length;
  const activeSessions = sessions.filter((s) => s.status === 'active').length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const averageScore = completedSessions > 0 
    ? sessions.filter(s => s.status === 'completed').reduce((acc, s) => acc + s.score, 0) / completedSessions 
    : 0;

  const recentSessions = sessions.slice(-3).reverse();
  
  // Detect device type
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Animate stats when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setAnimateStats(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    
    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }
    
    return () => observer.disconnect();
  }, []);

  const handlePatreonSupport = () => {
    window.open('https://patreon.com/studorama', '_blank', 'noopener,noreferrer');
  };
  
  const dismissWelcomeTip = () => {
    setShowWelcomeTip(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
      {/* Header */}
      <header className="text-center mb-2 sm:mb-4">
        <div className="relative">
          <Logo size="lg" className={"mx-auto mb-3 sm:mb-4".concat(activeSessions > 0 ? " animate-pulse-slow" : "")} />
          {activeSessions > 0 && (
            <div 
              className="absolute top-0 right-1/2 transform translate-x-12 -translate-y-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ 
                backgroundColor: themeConfig.colors.primary,
                color: 'white',
                boxShadow: `0 2px 8px ${themeConfig.colors.primary}80`
              }}
            >
              {activeSessions}
            </div>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2 leading-tight px-2">
          {t.welcomeTitle}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 px-2 sm:px-4 leading-relaxed max-w-3xl mx-auto">
          {t.welcomeSubtitle}
        </p>
        
        {/* No Account Required Badge */}
        <div 
          className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 mx-2 shadow-sm"
          style={{
            backgroundColor: themeConfig.colors.success + '20',
            color: themeConfig.colors.success,
          }}
        >
          <Star className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 animate-pulse" aria-hidden="true" />
          <span className="text-center leading-tight whitespace-nowrap">
            {language === 'pt-BR' 
              ? 'Sem Conta • 100% Gratuito • Privacidade Primeiro'
              : 'No Account Required • 100% Free • Privacy First'
            }
          </span>
        </div>
      </header>

      {/* Status Messages */}
      <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto">
        {/* API Key Warning */}
        {/* {!apiSettings && (
          <div 
            className="rounded-xl sm:rounded-2xl p-4 sm:p-5 border shadow-sm animate-slide-up" 
            role="alert" 
            aria-live="polite"
            style={{
              backgroundColor: themeConfig.colors.warning + '10',
              borderColor: themeConfig.colors.warning + '30',
            }}
          >
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: themeConfig.colors.warning + '20' }}
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" style={{ color: themeConfig.colors.warning }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm sm:text-base mb-1" style={{ color: themeConfig.colors.warning }}>
                  {t.setupRequired}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: themeConfig.colors.warning }}>
                  {t.configureApiKey}{' '}
                  <Link 
                    to="/settings" 
                    className="font-medium underline hover:no-underline focus-ring rounded inline-flex items-center"
                    style={{ color: themeConfig.colors.warning }}
                  >
                  {t.settings}
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link> {language === 'pt-BR' ? 'para começar a estudar' : 'to start studying'}.
                </p>
              </div>
            </div>
          </div>
        )} */}

        {/* Model Info */}
        {/* {apiSettings.openaiApiKey && apiSettings.model && (
          <div 
            className="rounded-xl sm:rounded-2xl p-4 sm:p-5 border shadow-sm animate-slide-up" 
            role="status" 
            aria-live="polite"
            style={{
              backgroundColor: themeConfig.colors.success + '10',
              borderColor: themeConfig.colors.success + '30',
            }}
          >
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: themeConfig.colors.success + '20' }}
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeConfig.colors.success }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm sm:text-base mb-1" style={{ color: themeConfig.colors.success }}>
                  {t.readyToStudy}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: themeConfig.colors.success }}>
                  {t.usingModel} <span className="font-semibold">{apiSettings.model}</span>
                </p>
              </div>
            </div>
          </div>
        )} */}

        {/* Privacy Notice */}
        {showWelcomeTip && (
          <div 
            className="rounded-xl sm:rounded-2xl p-4 sm:p-5 border shadow-sm animate-slide-up" 
            style={{
              backgroundColor: themeConfig.colors.info + '10',
              borderColor: themeConfig.colors.info + '30',
            }}
          >
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: themeConfig.colors.info + '20' }}
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeConfig.colors.info }} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm sm:text-base mb-1" style={{ color: themeConfig.colors.info }}>
                    {language === 'pt-BR' ? 'Privacidade Garantida' : 'Privacy Guaranteed'}
                  </h3>
                  <button 
                    onClick={dismissWelcomeTip} 
                    className="p-1 rounded-full"
                    style={{ color: themeConfig.colors.info }}
                    aria-label={language === 'pt-BR' ? 'Fechar dica' : 'Dismiss tip'}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: themeConfig.colors.info }}>
                  {language === 'pt-BR' 
                    ? 'Seus dados ficam no seu navegador. Nenhuma conta necessária, nenhum rastreamento.'
                    : 'Your data stays in your browser. No account needed, no tracking.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <section id="stats-section" aria-labelledby="stats-heading" className="max-w-4xl mx-auto">
        <h2 id="stats-heading" className="sr-only">Study Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div 
            className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 border shadow-sm ${animateStats ? 'animate-slide-up' : ''}`}
            style={{
              backgroundColor: themeConfig.colors.surface,
              borderColor: themeConfig.colors.border,
              animationDelay: '0ms',
            }}
          >
            <div className="flex items-start space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: themeConfig.colors.primary + '20' }}
              >
                <BookOpen className="w-5 h-5" style={{ color: themeConfig.colors.primary }} />
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: themeConfig.colors.textSecondary }}>
                  {t.totalSessions}
                </p>
                <p className="text-xl sm:text-2xl font-bold" style={{ color: themeConfig.colors.text }}>
                  {activeSessions}
                </p>
              </div>
            </div>
          </div>

          <div 
            className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 border shadow-sm ${animateStats ? 'animate-slide-up' : ''}`}
            style={{
              backgroundColor: themeConfig.colors.surface,
              borderColor: themeConfig.colors.border,
              animationDelay: '100ms',
            }}
          >
            <div className="flex items-start space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: themeConfig.colors.success + '20' }}
              >
                <CheckSquare className="w-5 h-5" style={{ color: themeConfig.colors.success }} />
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: themeConfig.colors.textSecondary }}>
                  {t.completed}
                </p>
                <p className="text-xl sm:text-2xl font-bold" style={{ color: themeConfig.colors.text }}>
                  {completedSessions}
                </p>
              </div>
            </div>
          </div>

          <div 
            className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 border shadow-sm ${animateStats ? 'animate-slide-up' : ''}`}
            style={{
              backgroundColor: themeConfig.colors.surface,
              borderColor: themeConfig.colors.border,
              animationDelay: '200ms',
            }}
          >
            <div className="flex items-start space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: themeConfig.colors.warning + '20' }}
              >
                <Award className="w-5 h-5" style={{ color: themeConfig.colors.warning }} />
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: themeConfig.colors.textSecondary }}>
                  {t.averageScore}
                </p>
                <p className="text-xl sm:text-2xl font-bold" style={{ color: themeConfig.colors.text }}>
                  {Math.round(averageScore)}%
                </p>
              </div>
            </div>
          </div>
          
          <div 
            className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 border shadow-sm ${animateStats ? 'animate-slide-up' : ''}`}
            style={{
              backgroundColor: themeConfig.colors.surface,
              borderColor: themeConfig.colors.border,
              animationDelay: '300ms',
            }}
          >
            <div className="flex items-start space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: themeConfig.colors.info + '20' }}
              >
                <Calendar className="w-5 h-5" style={{ color: themeConfig.colors.info }} />
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: themeConfig.colors.textSecondary }}>
                  {language === 'pt-BR' ? 'Questões' : 'Questions'}
                </p>
                <p className="text-xl sm:text-2xl font-bold" style={{ color: themeConfig.colors.text }}>
                  {sessions.reduce((acc, s) => acc + s.questions.length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-labelledby="actions-heading" className="max-w-4xl mx-auto">
        <h2 id="actions-heading" className="sr-only">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
          <Link
            to="/study"
            className="group rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus-ring transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: themeConfig.gradients.primary,
              color: 'white',
              '--tw-ring-color': themeConfig.colors.primary,
            }}
          >
            <div className="flex items-start space-x-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 shadow-inner"
              >
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white/90 text-lg sm:text-xl font-bold mb-2 leading-tight">{t.startNewSession}</h3>
                <p className="text-white/90 text-sm sm:text-base leading-relaxed">{t.beginNewSession}</p>
                <div className="mt-4 flex items-center text-white/80 text-sm font-medium">
                  <span>{language === 'pt-BR' ? 'Começar agora' : 'Start now'}</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/history"
            className="group rounded-xl sm:rounded-2xl p-5 sm:p-6 border shadow-sm transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus-ring transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: themeConfig.colors.surface,
              borderColor: themeConfig.colors.border,
              '--tw-ring-color': themeConfig.colors.primary,
            }}
          >
            <div className="flex items-start space-x-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner"
                style={{ backgroundColor: themeConfig.colors.primary + '20' }}
              >
                <History className="w-6 h-6" style={{ color: themeConfig.colors.primary }} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold mb-2 leading-tight" style={{ color: themeConfig.colors.text }}>
                  {t.viewHistory}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
                  {t.reviewPastSessions}
                </p>
                <div 
                  className="mt-4 flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform"
                  style={{ color: themeConfig.colors.primary }}
                >
                  <span>{language === 'pt-BR' ? 'Ver histórico' : 'View history'}</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Support Section - Fixed with theme-aware colors */}
      <section aria-labelledby="support-heading" className="max-w-4xl mx-auto">
        <div 
          className="rounded-xl sm:rounded-2xl p-5 sm:p-6 border shadow-lg overflow-hidden relative"
          style={{
            background: themeConfig.gradients.card,
            borderColor: themeConfig.colors.primary + '30'
          }}
        >
          {/* Background pattern */}
          <div 
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ 
              backgroundImage: `radial-gradient(circle at 20% 30%, ${themeConfig.colors.primary} 0%, transparent 70%)` 
            }}
          ></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 shadow-lg"
                style={{ 
                  background: themeConfig.gradients.primary,
                  boxShadow: `0 8px 32px ${themeConfig.colors.primary}40`
                }}
              >
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse" />
              </div>
              
              <div className="flex-1">
                <h2 
                  id="support-heading" 
                  className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" 
                  style={{ color: themeConfig.colors.text }}
                >
                  {language === 'pt-BR' ? 'Apoie o Studorama' : 'Support Studorama'}
                </h2>
                
                <p 
                  className="mb-4 sm:mb-5 text-sm sm:text-base leading-relaxed max-w-2xl" 
                  style={{ color: themeConfig.colors.textSecondary }}
                >
                  {language === 'pt-BR' 
                    ? 'Ajude-nos a manter esta plataforma gratuita e sem necessidade de conta para todos. Seu apoio faz toda a diferença!'
                    : 'Help us keep this platform free and accountless for everyone. Your support makes all the difference!'
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handlePatreonSupport}
                    className="px-5 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                    style={{
                      background: themeConfig.gradients.primary,
                      color: '#ffffff'
                    }}
                  >
                    <Heart className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="font-semibold">Patreon</span>
                    <ExternalLink className="w-4 h-4 ml-2 flex-shrink-0" />
                  </button>
                  
                  <Link
                    to="/pricing"
                    className="px-5 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center"
                    style={{
                      background: themeConfig.colors.surface,
                      color: themeConfig.colors.text,
                      border: `1px solid ${themeConfig.colors.border}`
                    }}
                  >
                    <Heart className="w-5 h-5 mr-2 flex-shrink-0" style={{ color: themeConfig.colors.primary }} />
                    <span>{language === 'pt-BR' ? 'Outras Opções' : 'Other Options'}</span>
                    <ChevronRight className="w-4 h-4 ml-2 flex-shrink-0" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <section aria-labelledby="recent-heading" className="max-w-4xl mx-auto">
          <div 
            className="rounded-xl sm:rounded-2xl border shadow-sm overflow-hidden"
            style={{
              backgroundColor: themeConfig.colors.surface,
              borderColor: themeConfig.colors.border,
            }}
          >
            <div 
              className="p-4 sm:p-5 border-b flex items-center justify-between"
              style={{ borderColor: themeConfig.colors.border }}
            >
              <h2 
                id="recent-heading" 
                className="text-base sm:text-lg font-bold"
                style={{ color: themeConfig.colors.text }}
              >
                {t.recentSessions}
              </h2>
              
              <Link 
                to="/history"
                className="text-xs sm:text-sm font-medium flex items-center"
                style={{ color: themeConfig.colors.primary }}
              >
                <span>{language === 'pt-BR' ? 'Ver todos' : 'View all'}</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>
            
            <div className="divide-y" style={{ borderColor: themeConfig.colors.border }}>
              {recentSessions.map((session, index) => (
                <Link 
                  key={session.id} 
                  to={`/session/${session.id}`}
                  className="block p-4 sm:p-5 hover:bg-gray-50 transition-colors"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div 
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        session.status === 'completed' ? 'bg-green-100' : 'bg-orange-100'
                      }`}
                    >
                      {session.status === 'completed' ? (
                        <CheckSquare className="w-5 h-5 text-green-600" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="font-semibold truncate text-sm sm:text-base"
                            style={{ color: themeConfig.colors.text }}
                          >
                            {session.contexts.join(', ') }
                          </h3>
                          
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" style={{ color: themeConfig.colors.textMuted }} />
                              <span className="text-xs" style={{ color: themeConfig.colors.textMuted }}>
                                {formatDate(session.createdAt, language)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="w-3 h-3 mr-1" style={{ color: themeConfig.colors.textMuted }} />
                              <span className="text-xs" style={{ color: themeConfig.colors.textMuted }}>
                                {session.questions.length} {session.questions.length === 1 ? 
                                  (language === 'pt-BR' ? 'questão' : 'question') : 
                                  (language === 'pt-BR' ? 'questões' : 'questions')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`ml-3 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                            session.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {session.status === 'completed' ? t.completed : t.inProgress}
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {session.status === 'completed' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span style={{ color: themeConfig.colors.textSecondary }}>
                              {t.correctAnswers}
                            </span>
                            <span style={{ color: themeConfig.colors.textSecondary }}>
                              {Math.round((session.questions.filter(q => q.isCorrect).length / session.questions.length) * 100)}%
                            </span>
                          </div>
                          <div 
                            className="w-full rounded-full h-1.5 overflow-hidden"
                            style={{ backgroundColor: themeConfig.colors.border }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${(session.questions.filter(q => q.isCorrect).length / session.questions.length) * 100}%`,
                                background: themeConfig.gradients.primary,
                              }}
                              role="progressbar"
                              aria-valuenow={(session.questions.filter(q => q.isCorrect).length / session.questions.length) * 100}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {session.status === 'active' && (
                        <div 
                          className="mt-3 inline-flex items-center text-xs font-medium"
                          style={{ color: themeConfig.colors.primary }}
                        >
                          {language === 'pt-BR' ? 'Continuar sessão' : 'Continue session'}
                          <ChevronRight className="w-3 h-3 ml-0.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              
              {recentSessions.length === 0 && (
                <div 
                  className="p-8 text-center"
                  style={{ color: themeConfig.colors.textMuted }}
                >
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>{language === 'pt-BR' ? 'Nenhuma sessão recente' : 'No recent sessions'}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      
      {/* Get Started - For new users */}
      {totalSessions === 0 && (
        <section className="max-w-md mx-auto">
          <div 
            className="rounded-xl sm:rounded-2xl p-5 sm:p-6 border shadow-lg text-center"
            style={{
              backgroundColor: themeConfig.colors.primary + '10',
              borderColor: themeConfig.colors.primary + '30',
            }}
          >
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: themeConfig.colors.primary + '20' }}
            >
              <Zap className="w-8 h-8" style={{ color: themeConfig.colors.primary }} />
            </div>
            
            <h3 
              className="text-lg sm:text-xl font-bold mb-2"
              style={{ color: themeConfig.colors.text }}
            >
              {language === 'pt-BR' ? 'Comece sua jornada de aprendizado' : 'Start your learning journey'}
            </h3>
            
            <p 
              className="mb-6 text-sm sm:text-base"
              style={{ color: themeConfig.colors.textSecondary }}
            >
              {language === 'pt-BR' 
                ? 'Crie sua primeira sessão de estudo para começar a aprender com a ajuda da IA.'
                : 'Create your first study session to start learning with AI assistance.'
              }
            </p>
            
            <Link
              to="/study"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: themeConfig.gradients.primary,
                color: 'white',
              }}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {language === 'pt-BR' ? 'Iniciar Primeira Sessão' : 'Start First Session'}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
