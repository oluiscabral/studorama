import React from 'react';
import { Calendar, Award, BookOpen, Eye, Play, Trash2 } from 'lucide-react';
import { StudySession } from '../types';

interface HistoryViewProps {
  sessions: StudySession[];
  onViewSession: (sessionId: string) => void;
  onContinueSession: (session: StudySession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function HistoryView({ sessions, onViewSession, onContinueSession, onDeleteSession }: HistoryViewProps) {
  const completedSessions = sessions.filter(s => s.isCompleted);
  const activeSessions = sessions.filter(s => !s.isCompleted);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getScorePercentage = (session: StudySession) => {
    return session.totalQuestions > 0 ? Math.round((session.score / session.totalQuestions) * 100) : 0;
  };

  const SessionCard = ({ session, isActive = false }: { session: StudySession; isActive?: boolean }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{session.subject}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar size={16} />
              <span>{formatDate(session.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen size={16} />
              <span>{session.questions.length} questions</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isActive && (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {getScorePercentage(session)}%
              </div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
          )}
        </div>
      </div>

      {!isActive && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                getScorePercentage(session) >= 80 ? 'bg-green-500' :
                getScorePercentage(session) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${getScorePercentage(session)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{session.score} correct</span>
            <span>{session.totalQuestions} total</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isActive 
            ? 'bg-blue-100 text-blue-800' 
            : session.isCompleted
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {isActive ? 'In Progress' : session.isCompleted ? 'Completed' : 'Paused'}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewSession(session.id)}
            className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Eye size={16} />
            <span className="text-sm">View</span>
          </button>
          
          {isActive && (
            <button
              onClick={() => onContinueSession(session)}
              className="flex items-center space-x-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Play size={16} />
              <span className="text-sm">Continue</span>
            </button>
          )}
          
          <button
            onClick={() => onDeleteSession(session.id)}
            className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Study History</h2>
        <p className="text-gray-600">Track your learning progress and continue where you left off</p>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h3 className="text-xl font-semibold text-gray-900">Active Sessions</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {activeSessions.length}
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeSessions.map((session) => (
              <SessionCard key={session.id} session={session} isActive={true} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Sessions */}
      {completedSessions.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h3 className="text-xl font-semibold text-gray-900">Completed Sessions</h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {completedSessions.length}
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sessions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="text-gray-400" size={48} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No study sessions yet</h3>
          <p className="text-gray-600 mb-6">Start your first study session to see your progress here</p>
          <button className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors">
            Start Learning
          </button>
        </div>
      )}

      {/* Stats Summary */}
      {sessions.length > 0 && (
        <div className="bg-gradient-to-r from-primary-500 to-orange-600 rounded-2xl p-8 text-white">
          <h3 className="text-xl font-semibold mb-6">Overall Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{sessions.length}</div>
              <div className="text-primary-100 text-sm">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {sessions.reduce((acc, s) => acc + s.questions.length, 0)}
              </div>
              <div className="text-primary-100 text-sm">Questions Answered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(
                  sessions.reduce((acc, s) => acc + (s.totalQuestions > 0 ? s.score / s.totalQuestions : 0), 0) /
                  Math.max(sessions.length, 1) * 100
                )}%
              </div>
              <div className="text-primary-100 text-sm">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Set(sessions.map(s => s.subject)).size}
              </div>
              <div className="text-primary-100 text-sm">Subjects Studied</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}