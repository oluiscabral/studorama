import React, { useState } from 'react';
import { Key, Save, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Settings() {
  const [apiSettings, setApiSettings] = useLocalStorage('studorama-api-settings', {
    openaiApiKey: '',
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiSettings.openaiApiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiSettings({ openaiApiKey: tempApiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isValid = tempApiKey.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure your Studorama preferences and API settings</p>
      </div>

      {/* API Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Key className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">OpenAI API Configuration</h2>
            <p className="text-sm text-gray-600">Configure your OpenAI API key to enable AI-powered questions</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                id="api-key"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your API key is stored locally in your browser and never shared with anyone.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">How to get your OpenAI API Key:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:no-underline inline-flex items-center">
                OpenAI Platform <ExternalLink className="w-3 h-3 ml-1" />
              </a></li>
              <li>2. Sign in or create an account</li>
              <li>3. Click "Create new secret key"</li>
              <li>4. Copy and paste the key here</li>
            </ol>
          </div>

          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
              isValid
                ? saved
                  ? 'bg-green-600 text-white'
                  : 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-5 h-5 mr-2" />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">OpenAI API Key</span>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              apiSettings.openaiApiKey
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {apiSettings.openaiApiKey ? 'Configured' : 'Not Configured'}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Study Sessions</span>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              apiSettings.openaiApiKey
                ? 'bg-green-100 text-green-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {apiSettings.openaiApiKey ? 'Ready' : 'Requires API Key'}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Privacy & Security</h3>
        <p className="text-sm text-gray-600">
          Your API key and study data are stored locally in your browser and are never transmitted to our servers. 
          Only you have access to your study sessions and progress. Your API key is used solely to communicate 
          with OpenAI's services to generate study questions.
        </p>
      </div>
    </div>
  );
}