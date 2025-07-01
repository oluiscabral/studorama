import React from 'react';
import { Home, History, Settings } from 'lucide-react';
import { Logo } from './Logo';
import { AppState } from '../types';

interface HeaderProps {
  appState: AppState;
  onNavigate: (view: AppState['currentView']) => void;
}

export function Header({ appState, onNavigate }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Logo size="sm" />
          <h1 className="text-2xl font-bold text-gray-900">Studorama</h1>
        </div>
        
        <nav className="flex items-center space-x-4">
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              appState.currentView === 'home'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Home size={20} />
            <span className="hidden sm:inline">Home</span>
          </button>
          
          <button
            onClick={() => onNavigate('history')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              appState.currentView === 'history'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <History size={20} />
            <span className="hidden sm:inline">History</span>
          </button>
        </nav>
      </div>
    </header>
  );
}