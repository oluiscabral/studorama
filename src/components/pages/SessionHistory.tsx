import { BookOpen, Calendar, Edit, Eye, Play, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { StudySession } from '../../types';
import SessionEditModal from '../SessionEditModal';
import { formatDate } from '../../core/services';

export default function SessionHistory() {
  const [sessions, setSessions] = useLocalStorage<StudySession[]>('studorama-sessions', []);
  const { t, language } = useLanguage();
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleEditSession = (session: StudySession) => {
    setEditingSession(session);
  };

  const handleSaveSession = (sessionId: string, updates: any) => {
    setSessions(prevSessions => 
      prevSessions.map(session => {
        if (session.id === sessionId) {
          const updatedSession = { ...session, ...updates };
          
          // Add history tracking for changes
          const now = new Date().toISOString();
          
          // Track subject changes
          if (updates.subject && updates.subject !== session.subject) {
            const subjectHistory = session.subjectHistory || [];
            subjectHistory.push({
              id: Date.now().toString(),
              previousSubject: session.subject,
              newSubject: updates.subject,
              changedAt: now,
              reason: 'Manual edit from history'
            });
            updatedSession.subjectHistory = subjectHistory;
          }
          
          // Track modifier changes
          if (updates.subjectModifiers && JSON.stringify(updates.subjectModifiers) !== JSON.stringify(session.subjectModifiers || [])) {
            const modifierHistory = session.modifierHistory || [];
            const oldModifiers = session.subjectModifiers || [];
            const newModifiers = updates.subjectModifiers;
            
            // Track added modifiers
            newModifiers.forEach((modifier: string) => {
              if (!oldModifiers.includes(modifier)) {
                modifierHistory.push({
                  id: Date.now().toString() + Math.random(),
                  action: 'added',
                  modifier,
                  changedAt: now
                });
              }
            });
            
            // Track removed modifiers
            oldModifiers.forEach((modifier: string) => {
              if (!newModifiers.includes(modifier)) {
                modifierHistory.push({
                  id: Date.now().toString() + Math.random(),
                  action: 'removed',
                  modifier,
                  changedAt: now
                });
              }
            });
            
            updatedSession.modifierHistory = modifierHistory;
          }
          
          // Track learning settings changes
          if (updates.learningSettings && JSON.stringify(updates.learningSettings) !== JSON.stringify(session.learningSettings)) {
            const learningSettingsHistory = session.learningSettingsHistory || [];
            learningSettingsHistory.push({
              id: Date.now().toString(),
              // @ts-ignore
              previousSettings: session.learningSettings || {},
              newSettings: updates.learningSettings,
              changedAt: now
            });
            updatedSession.learningSettingsHistory = learningSettingsHistory;
          }
          
          return updatedSession;
        }
        return session;
      })
    );
    setEditingSession(null);
  };

  if (sessions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">{t.noSessionsYet}</h2>
          <p className="text-gray-600 mb-6">{language === 'pt-BR' ? 'Inicie sua primeira sessão de estudo para ver seu progresso aqui.' : 'Start your first study session to see your progress here.'}</p>
          <Link
            to="/study"
            className="inline-flex items-center bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            {t.startFirstSession}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.studyHistory}</h1>
            <p className="text-gray-600">{t.reviewProgress}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/study"
              className="inline-flex items-center justify-center bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {t.newSession}
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-600">{t.totalSessions}</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{sessions.length}</div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-600">{t.completed}</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {sessions.filter(s => s.status === 'completed').length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-600">{t.averageScore}</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {sessions.filter(s => s.status === 'completed').length > 0
                ? Math.round(
                    sessions
                      .filter(s => s.status === 'completed')
                      .reduce((acc, s) => acc + s.score, 0) /
                    sessions.filter(s => s.status === 'completed').length
                  )
                : 0}%
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-600">{t.questionsAnswered}</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {sessions.reduce((acc, s) => acc + s.questions.length, 0)}
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{t.allSessions}</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {sortedSessions.map((session) => (
              <div key={session.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Session info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-base sm:text-lg leading-tight mb-1">
                          {session.subject}
                        </h3>
                        {session.subjectModifiers && session.subjectModifiers.length > 0 && (
                          <div className="space-y-1">
                            {session.subjectModifiers.map((modifier, index) => (
                              <p key={index} className="text-sm text-gray-600 truncate">{modifier}</p>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium self-start flex-shrink-0 ${
                        session.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {session.status === 'completed' ? t.completed : t.inProgress}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span>{formatDate(session.createdAt, language)}</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span>{session.questions.length} {t.questions}</span>
                      </div>
                      {session.status === 'completed' && (
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span>{session.score}% {t.score}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap">
                    {session.status === 'active' && (
                      <Link
                        to="/study"
                        state={{ sessionId: session.id }}
                        className="inline-flex items-center px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        <span>{t.continue}</span>
                      </Link>
                    )}
                    <button
                      onClick={() => handleEditSession(session)}
                      className="inline-flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      <span>{t.edit}</span>
                    </button>
                    <Link
                      to={`/session/${session.id}`}
                      className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{t.viewDetails}</span>
                    </Link>
                  </div>
                </div>

                {/* Progress Bar */}
                {session.status === 'completed' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
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
      </div>

      {/* Edit Session Modal */}
      {editingSession && (
        <SessionEditModal
          session={editingSession}
          isOpen={!!editingSession}
          onClose={() => setEditingSession(null)}
          onSave={(updates) => handleSaveSession(editingSession.id, updates)}
        />
      )}
    </>
  );
}