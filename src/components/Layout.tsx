import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, History, Settings, BookOpen, Menu, X, Heart } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import Logo from './Logo';
import ThemeSelector from './ThemeSelector';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { t, language } = useLanguage();
  const { themeConfig } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { path: '/', icon: Home, label: t.dashboard },
    { path: '/study', icon: BookOpen, label: t.study },
    { path: '/history', icon: History, label: t.history },
    { path: '/settings', icon: Settings, label: t.settings },
  ];

  const supportItems = [
    { path: '/pricing', icon: Heart, label: language === 'pt-BR' ? 'Apoie-nos' : 'Support Us' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Close mobile menu when route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div 
      className="min-h-screen"
      style={{ background: themeConfig.gradients.background }}
    >
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="skip-link"
        onFocus={(e) => e.currentTarget.classList.add('not-sr-only')}
        onBlur={(e) => e.currentTarget.classList.remove('not-sr-only')}
      >
        Skip to main content
      </a>

      <nav 
        className="sticky top-0 z-50 safe-top"
        style={{ 
          backgroundColor: themeConfig.colors.surface + 'CC',
          backdropFilter: themeConfig.effects.blur,
          borderBottom: `1px solid ${themeConfig.colors.border}`,
        }}
        role="navigation" 
        aria-label="Main navigation"
      >
        <div className="container-responsive">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and brand */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity focus-ring rounded-lg p-1"
              aria-label="Studorama home"
            >
              <Logo size="sm" />
              <span 
                className="text-lg sm:text-xl font-bold bg-clip-text text-transparent"
                style={{ backgroundImage: themeConfig.gradients.primary }}
              >
                Studorama
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`nav-link ${
                    isActive(path) ? 'nav-link-active' : 'nav-link-inactive'
                  }`}
                  aria-current={isActive(path) ? 'page' : undefined}
                  style={isActive(path) ? {
                    backgroundColor: themeConfig.colors.primary + '20',
                    color: themeConfig.colors.primary,
                  } : {
                    color: themeConfig.colors.textSecondary,
                  }}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
              
              <div 
                className="w-px h-6 mx-2" 
                style={{ backgroundColor: themeConfig.colors.border }}
                aria-hidden="true"
              />
              
              {supportItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`nav-link ${
                    isActive(path) ? 'nav-link-active' : 'nav-link-inactive'
                  }`}
                  aria-current={isActive(path) ? 'page' : undefined}
                  style={isActive(path) ? {
                    backgroundColor: themeConfig.colors.primary + '20',
                    color: themeConfig.colors.primary,
                  } : {
                    color: themeConfig.colors.textSecondary,
                  }}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Theme Selector & Free Badge & Mobile menu button */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Theme Selector - Desktop */}
              <div className="hidden md:block">
                <ThemeSelector showLabel={false} />
              </div>
              
              <div 
                className="hidden md:flex items-center space-x-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                style={{
                  backgroundColor: themeConfig.colors.success + '20',
                  color: themeConfig.colors.success,
                }}
              >
                <Heart className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                <span>{language === 'pt-BR' ? '100% Gratuito' : '100% Free'}</span>
              </div>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg transition-colors focus-ring touch-target"
                style={{
                  color: themeConfig.colors.textSecondary,
                }}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div 
            id="mobile-menu"
            className={`lg:hidden transition-all duration-300 ease-in-out ${
              mobileMenuOpen 
                ? 'max-h-screen opacity-100 py-3 sm:py-4' 
                : 'max-h-0 opacity-0 overflow-hidden'
            }`}
            style={{
              borderTop: mobileMenuOpen ? `1px solid ${themeConfig.colors.border}` : 'none',
            }}
            aria-hidden={!mobileMenuOpen}
          >
            <div className="space-y-1 mb-3 sm:mb-4">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className="nav-link text-base"
                  aria-current={isActive(path) ? 'page' : undefined}
                  style={isActive(path) ? {
                    backgroundColor: themeConfig.colors.primary + '20',
                    color: themeConfig.colors.primary,
                  } : {
                    color: themeConfig.colors.textSecondary,
                  }}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
            
            <div 
              className="border-t pt-3 sm:pt-4"
              style={{ borderColor: themeConfig.colors.border }}
            >
              {/* Theme Selector - Mobile */}
              <div className="px-3 py-2 mb-2">
                <ThemeSelector />
              </div>
              
              <div className="px-3 py-2 mb-2">
                <div 
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: themeConfig.colors.success + '20',
                    color: themeConfig.colors.success,
                  }}
                >
                  <Heart className="w-4 h-4" aria-hidden="true" />
                  <span>{language === 'pt-BR' ? '100% Gratuito Para Sempre' : '100% Free Forever'}</span>
                </div>
              </div>
              {supportItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className="nav-link text-base"
                  aria-current={isActive(path) ? 'page' : undefined}
                  style={isActive(path) ? {
                    backgroundColor: themeConfig.colors.primary + '20',
                    color: themeConfig.colors.primary,
                  } : {
                    color: themeConfig.colors.textSecondary,
                  }}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main 
        id="main-content" 
        className="container-responsive py-4 sm:py-6 lg:py-8 safe-bottom"
        role="main"
      >
        {children}
      </main>
    </div>
  );
}