import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, History, Settings, TrendingUp } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { StudySession } from '../types';
import Logo from './Logo';

export default function Dashboard() {
  const [sessions] = useLocalStorage<StudySession[]>('studorama-sessions', []);
  const [apiSettings] = useLocalStorage('studorama-api-settings', { 
    openaiApiKey: '',
    model: 'gpt-4o-mini'
  });

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const averageScore = completedSessions > 0 
    ? sessions.filter(s => s.status === 'completed').reduce((acc, s) => acc + s.score, 0) / completedSessions 
    : 0;

  const recentSessions = sessions.slice(-3).reverse();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <Logo size="lg" className="mx-auto mb-4" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2">
          Welcome to Studorama
        </h1>
        <p className="text-gray-600 text-lg">
          AI-powered study sessions to enhance your learning
        </p>
      </div>

      {/* API Key Warning */}
      {!apiSettings.openaiApiKey && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <p className="text-orange-700">
              <strong>Setup Required:</strong> Please configure your OpenAI API key in{' '}
              <Link to="/settings" className="underline hover:no-underline">
                Settings
              </Link>{' '}
              to start studying.
            </p>
          </div>
        </div>
      )}

      {/* Model Info */}
      {apiSettings.openaiApiKey && apiSettings.model && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-blue-700">
              <strong>Ready to study!</strong> Using OpenAI model: {apiSettings.model}
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{totalSessions}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{completedSessions}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">{Math.round(averageScore)}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/study"
          className="group bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Start New Session</h3>
              <p className="text-orange-100">Begin a new AI-powered study session</p>
            </div>
            <BookOpen className="w-8 h-8 text-orange-200 group-hover:text-white transition-colors" />
          </div>
        </Link>

        <Link
          to="/history"
          className="group bg-white rounded-xl p-6 shadow-sm border border-orange-100 hover:shadow-md transition-all duration-200 hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">View History</h3>
              <p className="text-gray-600">Review your past study sessions</p>
            </div>
            <History className="w-8 h-8 text-gray-400 group-hover:text-orange-600 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-orange-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Recent Sessions</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentSessions.map((session) => (
              <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{session.subject}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(session.createdAt).toLocaleDateString()} • {session.questions.length} questions
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      session.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {session.status === 'completed' ? 'Completed' : 'In Progress'}
                    </div>
                    {session.status === 'completed' && (
                      <p className="text-sm text-gray-600 mt-1">{session.score}% score</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}