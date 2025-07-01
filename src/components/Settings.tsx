import React, { useState } from 'react';
import { Key, Save, Eye, EyeOff, ExternalLink, Bot, MessageSquare, Github, Linkedin } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const OPENAI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (Recommended)', description: 'Latest and most capable model' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Faster and more cost-effective' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'High performance model' },
  { value: 'gpt-4', label: 'GPT-4', description: 'Previous generation flagship model' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and economical' },
];

const DEFAULT_PROMPTS = {
  multipleChoice: `You are a study assistant that creates multiple choice questions about {subject}. Create a challenging but fair question with 4 options. Return a JSON object with: question (string), options (array of 4 strings), correctAnswer (number 0-3), and explanation (string explaining why the correct answer is right).`,
  dissertative: `You are a study assistant that creates dissertative questions about {subject}. Create an open-ended question that requires thoughtful analysis and explanation. Return a JSON object with: question (string), sampleAnswer (string with a comprehensive model answer), and evaluationCriteria (array of strings describing what makes a good answer).`,
  evaluation: `You are evaluating a student's answer to a dissertative question. Question: {question}. Student's answer: {userAnswer}. Model answer: {modelAnswer}. Provide constructive feedback focusing on accuracy, completeness, and understanding. Rate the answer and suggest improvements. Be encouraging but honest.`
};

export default function Settings() {
  const [apiSettings, setApiSettings] = useLocalStorage('studorama-api-settings', {
    openaiApiKey: '',
    model: 'gpt-4o-mini',
    customPrompts: DEFAULT_PROMPTS
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiSettings.openaiApiKey);
  const [tempModel, setTempModel] = useState(apiSettings.model || 'gpt-4o-mini');
  const [tempPrompts, setTempPrompts] = useState(apiSettings.customPrompts || DEFAULT_PROMPTS);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'api' | 'prompts' | 'about'>('api');

  const handleSave = () => {
    setApiSettings({ 
      openaiApiKey: tempApiKey,
      model: tempModel,
      customPrompts: tempPrompts
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetPrompts = () => {
    setTempPrompts(DEFAULT_PROMPTS);
  };

  const isValid = tempApiKey.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure your Studorama preferences and API settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'api', label: 'API Configuration', icon: Key },
              { id: 'prompts', label: 'AI Prompts', icon: MessageSquare },
              { id: 'about', label: 'About', icon: Bot }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* API Configuration Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">OpenAI API Configuration</h2>
                  <p className="text-sm text-gray-600">Configure your OpenAI API key and model preferences</p>
                </div>
              </div>

              {/* API Key */}
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

              {/* Model Selection */}
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI Model
                </label>
                <select
                  id="model"
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors bg-white"
                >
                  {OPENAI_MODELS.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  {OPENAI_MODELS.find(m => m.value === tempModel)?.description}
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
            </div>
          )}

          {/* AI Prompts Tab */}
          {activeTab === 'prompts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">AI Prompts Customization</h2>
                    <p className="text-sm text-gray-600">Customize how the AI generates and evaluates questions</p>
                  </div>
                </div>
                <button
                  onClick={resetPrompts}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Reset to Defaults
                </button>
              </div>

              {/* Multiple Choice Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Multiple Choice Questions Prompt
                </label>
                <textarea
                  value={tempPrompts.multipleChoice}
                  onChange={(e) => setTempPrompts(prev => ({ ...prev, multipleChoice: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                  placeholder="Enter the prompt for generating multiple choice questions..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{subject}'} as a placeholder for the study subject.
                </p>
              </div>

              {/* Dissertative Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dissertative Questions Prompt
                </label>
                <textarea
                  value={tempPrompts.dissertative}
                  onChange={(e) => setTempPrompts(prev => ({ ...prev, dissertative: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                  placeholder="Enter the prompt for generating dissertative questions..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{subject}'} as a placeholder for the study subject.
                </p>
              </div>

              {/* Evaluation Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Evaluation Prompt
                </label>
                <textarea
                  value={tempPrompts.evaluation}
                  onChange={(e) => setTempPrompts(prev => ({ ...prev, evaluation: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                  placeholder="Enter the prompt for evaluating dissertative answers..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{question}'}, {'{userAnswer}'}, and {'{modelAnswer}'} as placeholders.
                </p>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">About Studorama</h2>
                  <p className="text-sm text-gray-600">AI-powered study sessions platform</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Created by oluiscabral</h3>
                <p className="text-gray-700 mb-4">
                  Studorama is an open-source AI-powered study platform designed to enhance your learning experience 
                  through personalized questions and intelligent feedback. Transform your study sessions with the power of AI.
                </p>
                <div className="flex items-center space-x-4">
                  <a
                    href="https://github.com/oluiscabral"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/oluiscabral"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Linkedin className="w-5 h-5 mr-2" />
                    LinkedIn
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• AI-generated questions</li>
                    <li>• Multiple choice & dissertative questions</li>
                    <li>• Session tracking & history</li>
                    <li>• Customizable AI prompts</li>
                    <li>• Progress analytics</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Technology</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• React & TypeScript</li>
                    <li>• Tailwind CSS</li>
                    <li>• OpenAI API integration</li>
                    <li>• Local storage</li>
                    <li>• Responsive design</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900 mb-2">Privacy & Security</h4>
                <p className="text-sm text-green-700">
                  Your API key and study data are stored locally in your browser and are never transmitted to our servers. 
                  Only you have access to your study sessions and progress. Your API key is used solely to communicate 
                  with OpenAI's services to generate study questions.
                </p>
              </div>
            </div>
          )}

          {/* Save Button */}
          {(activeTab === 'api' || activeTab === 'prompts') && (
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={!isValid && activeTab === 'api'}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                  (isValid || activeTab === 'prompts')
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
          )}
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Configuration Status</h2>
        </div>
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
            <span className="text-gray-700">Selected Model</span>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {OPENAI_MODELS.find(m => m.value === (apiSettings.model || 'gpt-4o-mini'))?.label || 'GPT-4o Mini'}
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
    </div>
  );
}