import React from 'react';
import { User, CreditCard, Settings as SettingsIcon, LogOut } from 'lucide-react';

const AccountPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Account Settings</h1>
            <p className="text-blue-100 mt-2">Manage your account and preferences</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Section */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your Name"
                      />
                    </div>
                  </div>
                </div>

                {/* Subscription Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-green-100 p-3 rounded-full mr-4">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Subscription</h2>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-800">Current Plan</span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Free Plan
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      You're currently on the free plan with limited features.
                    </p>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions Sidebar */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  
                  <div className="space-y-3">
                    <button className="w-full flex items-center px-4 py-3 text-left bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <SettingsIcon className="w-5 h-5 text-gray-500 mr-3" />
                      <span className="text-gray-700">Preferences</span>
                    </button>
                    
                    <button className="w-full flex items-center px-4 py-3 text-left bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <CreditCard className="w-5 h-5 text-gray-500 mr-3" />
                      <span className="text-gray-700">Billing</span>
                    </button>
                    
                    <button className="w-full flex items-center px-4 py-3 text-left bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-red-600">
                      <LogOut className="w-5 h-5 mr-3" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Stats</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Study Sessions</span>
                      <span className="font-semibold text-gray-800">0</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Study Time</span>
                      <span className="font-semibold text-gray-800">0 hours</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-semibold text-gray-800">Today</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;