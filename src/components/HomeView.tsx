import React, { useState } from 'react';
import { Play, BookOpen, Zap } from 'lucide-react';
import { AppState, StudySession } from '../types';

interface HomeViewProps {
  appState: AppState;
  onStartSession: (subject: string) => void;
  onContinueSession: (session: StudySession) => void;
}

const POPULAR_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History',
  'Literature', 'Computer Science', 'Psychology', 'Economics', 'Philosophy'
];

export function HomeView({ appState, onStartSession, onContinueSession }: HomeViewProps) {
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartSession = async () => {
    if (!subject.trim()) return;
    
    setIsLoading(true);
    try {
      await onStartSession(subject.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const recentSessions = appState.sessionHistory
    .filter(s => !s.isCompleted)
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      <div className="text-center mb-12 animate-fade-in">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          AI-Powered Study Sessions
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose your subject and let our AI generate personalized questions to enhance your learning experience.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Start New Session */}
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-slide-up">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Play className="text-primary-600" size={24} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">Start New Session</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Study Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter your study subject..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleStartSession()}
              />
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-3">Popular subjects:</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SUBJECTS.slice(0, 6).map((popularSubject) => (
                  <button
                    key={popularSubject}
                    onClick={() => setSubject(popularSubject)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
                  >
                    {popularSubject}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleStartSession}
              disabled={!subject.trim() || isLoading}
              className="w-full bg-primary-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Starting Session...</span>
                </>
              ) : (
                <>
                  <Zap size={20} />
                  <span>Start Studying</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-slide-up">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="text-blue-600" size={24} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">Continue Learning</h3>
          </div>
          
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
                  onClick={() => onContinueSession(session)}
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{session.subject}</h4>
                    <p className="text-sm text-gray-600">
                      Progress: {session.questions.length} questions answered
                    </p>
                  </div>
                  <Play className="text-primary-500" size={20} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-600">No recent sessions to continue</p>
              <p className="text-sm text-gray-500 mt-1">Start a new session to begin learning</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      {appState.sessionHistory.length > 0 && (
        <div className="bg-gradient-to-r from-primary-500 to-orange-600 rounded-2xl p-8 text-white animate-fade-in">
          <h3 className="text-2xl font-semibold mb-6">Your Learning Journey</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{appState.sessionHistory.length}</div>
              <div className="text-primary-100">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {appState.sessionHistory.reduce((acc, s) => acc + s.questions.length, 0)}
              </div>
              <div className="text-primary-100">Questions Answered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {appState.sessionHistory.filter(s => s.isCompleted).length}
              </div>
              <div className="text-primary-100">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {Math.round(
                  appState.sessionHistory.reduce((acc, s) => acc + (s.totalQuestions > 0 ? s.score / s.totalQuestions : 0), 0) /
                  Math.max(appState.sessionHistory.length, 1) * 100
                )}%
              </div>
              <div className="text-primary-100">Avg Score</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}