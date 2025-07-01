import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, TrendingUp, Play, Eye } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { StudySession } from '../types';

export default function SessionHistory() {
  const [sessions] = useLocalStorage<StudySession[]>('studorama-sessions', []);

  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (sessions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">No Study Sessions Yet</h2>
          <p className="text-gray-600 mb-6">Start your first study session to see your progress here.</p>
          <Link
            to="/study"
            className="inline-flex items-center bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Start First Session
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study History</h1>
          <p className="text-gray-600">Review your past study sessions and progress</p>
        </div>
        <Link
          to="/study"
          className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center"
        >
          <BookOpen className="w-5 h-5 mr-2" />
          New Session
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-600">Total Sessions</div>
          <div className="text-2xl font-bold text-gray-900">{sessions.length}</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-gray-900">
            {sessions.filter(s => s.status === 'completed').length}
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-600">Average Score</div>
          <div className="text-2xl font-bold text-gray-900">
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
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-600">Questions Answered</div>
          <div className="text-2xl font-bold text-gray-900">
            {sessions.reduce((acc, s) => acc + s.questions.length, 0)}
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">All Sessions</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {sortedSessions.map((session) => (
            <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">{session.subject}</h3>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      session.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {session.status === 'completed' ? 'Completed' : 'In Progress'}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(session.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {session.questions.length} questions
                    </div>
                    {session.status === 'completed' && (
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {session.score}% score
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {session.status === 'active' && (
                    <Link
                      to="/study"
                      state={{ sessionId: session.id }}
                      className="inline-flex items-center px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Continue
                    </Link>
                  )}
                  <Link
                    to={`/session/${session.id}`}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Link>
                </div>
              </div>

              {/* Progress Bar */}
              {session.status === 'completed' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Correct Answers</span>
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
  );
}