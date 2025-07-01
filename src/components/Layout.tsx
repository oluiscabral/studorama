import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, History, Settings, BookOpen, Menu, X, Heart } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { t, language } = useLanguage();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Logo size="sm" />
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                Studorama
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-orange-100 text-orange-700 shadow-sm'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
              
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              
              {supportItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-orange-100 text-orange-700 shadow-sm'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Free Badge & Mobile menu button */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <Heart className="w-4 h-4" />
                <span>{language === 'pt-BR' ? '100% Gratuito' : '100% Free'}</span>
              </div>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-orange-100 py-4">
              <div className="space-y-1 mb-4">
                {navItems.map(({ path, icon: Icon, label }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActive(path)
                        ? 'bg-orange-100 text-orange-700 shadow-sm'
                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="px-3 py-2 mb-2">
                  <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
                    <Heart className="w-4 h-4" />
                    <span>{language === 'pt-BR' ? '100% Gratuito Para Sempre' : '100% Free Forever'}</span>
                  </div>
                </div>
                {supportItems.map(({ path, icon: Icon, label }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActive(path)
                        ? 'bg-orange-100 text-orange-700 shadow-sm'
                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}