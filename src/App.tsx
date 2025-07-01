import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { StudyView } from './components/StudyView';
import { HistoryView } from './components/HistoryView';
import { SessionDetailsView } from './components/SessionDetailsView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AppState, StudySession } from './types';

const INITIAL_APP_STATE: AppState = {
  currentView: 'home',
  currentSession: null,
  sessionHistory: [],
  selectedSessionId: null,
  apiKey: ''
};

function App() {
  const [appState, setAppState] = useLocalStorage<AppState>('studorama-state', INITIAL_APP_STATE);

  const handleNavigate = (view: AppState['currentView']) => {
    setAppState(prev => ({
      ...prev,
      currentView: view,
      selectedSessionId: null
    }));
  };

  const handleStartSession = async (subject: string) => {
    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      subject,
      createdAt: new Date(),
      questions: [],
      score: 0,
      totalQuestions: 0,
      isCompleted: false
    };

    setAppState(prev => ({
      ...prev,
      currentView: 'study',
      currentSession: newSession,
      sessionHistory: [newSession, ...prev.sessionHistory]
    }));
  };

  const handleUpdateSession = (updatedSession: StudySession) => {
    setAppState(prev => ({
      ...prev,
      currentSession: updatedSession,
      sessionHistory: prev.sessionHistory.map(session =>
        session.id === updatedSession.id ? updatedSession : session
      )
    }));
  };

  const handleContinueSession = (session: StudySession) => {
    setAppState(prev => ({
      ...prev,
      currentView: 'study',
      currentSession: session
    }));
  };

  const handleEndSession = () => {
    if (appState.currentSession) {
      const completedSession = {
        ...appState.currentSession,
        completedAt: new Date(),
        isCompleted: true
      };

      setAppState(prev => ({
        ...prev,
        currentView: 'home',
        currentSession: null,
        sessionHistory: prev.sessionHistory.map(session =>
          session.id === completedSession.id ? completedSession : session
        )
      }));
    } else {
      setAppState(prev => ({
        ...prev,
        currentView: 'home',
        currentSession: null
      }));
    }
  };

  const handleViewSession = (sessionId: string) => {
    setAppState(prev => ({
      ...prev,
      currentView: 'session-details',
      selectedSessionId: sessionId
    }));
  };

  const handleDeleteSession = (sessionId: string) => {
    setAppState(prev => ({
      ...prev,
      sessionHistory: prev.sessionHistory.filter(session => session.id !== sessionId),
      currentSession: prev.currentSession?.id === sessionId ? null : prev.currentSession
    }));
  };

  const selectedSession = appState.selectedSessionId 
    ? appState.sessionHistory.find(s => s.id === appState.selectedSessionId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header appState={appState} onNavigate={handleNavigate} />
      
      <main className="pb-8">
        {appState.currentView === 'home' && (
          <HomeView
            appState={appState}
            onStartSession={handleStartSession}
            onContinueSession={handleContinueSession}
          />
        )}
        
        {appState.currentView === 'study' && appState.currentSession && (
          <StudyView
            session={appState.currentSession}
            onUpdateSession={handleUpdateSession}
            onEndSession={handleEndSession}
          />
        )}
        
        {appState.currentView === 'history' && (
          <HistoryView
            sessions={appState.sessionHistory}
            onViewSession={handleViewSession}
            onContinueSession={handleContinueSession}
            onDeleteSession={handleDeleteSession}
          />
        )}
        
        {appState.currentView === 'session-details' && selectedSession && (
          <SessionDetailsView
            session={selectedSession}
            onBack={() => handleNavigate('history')}
          />
        )}
      </main>
    </div>
  );
}

export default App;