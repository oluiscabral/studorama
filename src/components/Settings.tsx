import React, { useState } from 'react';
import { Key, Save, Eye, EyeOff, ExternalLink, Bot, MessageSquare, Github, Linkedin, Brain } from 'lucide-react';
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
  evaluation: `You are evaluating a student's answer to a dissertative question. Question: {question}. Student's answer: {userAnswer}. Model answer: {modelAnswer}. Provide constructive feedback focusing on accuracy, completeness, and understanding. Rate the answer and suggest improvements. Be encouraging but honest.`,
  elaborativePrompt: `Generate an elaborative interrogation question that asks "why" to help the student understand the deeper reasoning behind the concept in {subject}. Focus on helping them connect ideas and understand underlying principles.`,
  retrievalPrompt: `Create a retrieval practice question about {subject} that tests recall of important concepts. This should help strengthen memory through active recall. Return a JSON object with appropriate format for the question type.`
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
  const [activeTab, setActiveTab] = useState<'api' | 'prompts' | 'learning' | 'about'>('api');

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
        <p className="text-gray-600">Configure your Studorama preferences and learning techniques</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'api', label: 'API Configuration', icon: Key },
              { id: 'prompts', label: 'AI Prompts', icon: MessageSquare },
              { id: 'learning', label: 'Learning Techniques', icon: Brain },
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

              {/* Elaborative Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Elaborative Interrogation Prompt
                </label>
                <textarea
                  value={tempPrompts.elaborativePrompt}
                  onChange={(e) => setTempPrompts(prev => ({ ...prev, elaborativePrompt: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                  placeholder="Enter the prompt for generating elaborative questions..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{subject}'} as a placeholder for the study subject.
                </p>
              </div>

              {/* Retrieval Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retrieval Practice Prompt
                </label>
                <textarea
                  value={tempPrompts.retrievalPrompt}
                  onChange={(e) => setTempPrompts(prev => ({ ...prev, retrievalPrompt: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                  placeholder="Enter the prompt for generating retrieval practice questions..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{subject}'} as a placeholder for the study subject.
                </p>
              </div>
            </div>
          )}

          {/* Learning Techniques Tab */}
          {activeTab === 'learning' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Learning Techniques</h2>
                  <p className="text-sm text-gray-600">Based on "Make It Stick: The Science of Successful Learning"</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Spaced Repetition</h3>
                  <p className="text-sm text-blue-800 mb-4">
                    Review material at increasing intervals to strengthen long-term retention. Questions are automatically scheduled for review based on your performance.
                  </p>
                  <div className="text-xs text-blue-700">
                    <strong>How it works:</strong> Correctly answered questions are reviewed after longer intervals, while missed questions are reviewed sooner.
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">Interleaving</h3>
                  <p className="text-sm text-green-800 mb-4">
                    Mix different types of questions and topics rather than studying one type at a time. This improves discrimination and transfer of learning.
                  </p>
                  <div className="text-xs text-green-700">
                    <strong>How it works:</strong> When "Mixed" question type is selected, multiple choice and dissertative questions are randomly interleaved.
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">Elaborative Interrogation</h3>
                  <p className="text-sm text-purple-800 mb-4">
                    Ask "why" questions to understand the reasoning behind facts and concepts. This creates deeper understanding and better retention.
                  </p>
                  <div className="text-xs text-purple-700">
                    <strong>How it works:</strong> After incorrect answers, you'll be prompted to explain why the correct answer makes sense.
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">Self-Explanation</h3>
                  <p className="text-sm text-orange-800 mb-4">
                    Explain how new information relates to what you already know. This builds connections and improves understanding.
                  </p>
                  <div className="text-xs text-orange-700">
                    <strong>How it works:</strong> After correct answers, you'll be prompted to connect the concept to your existing knowledge.
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-6 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">Desirable Difficulties</h3>
                  <p className="text-sm text-yellow-800 mb-4">
                    Introduce appropriate challenges that require effort but are achievable. This strengthens learning and retention.
                  </p>
                  <div className="text-xs text-yellow-700">
                    <strong>How it works:</strong> Some questions are made more challenging to promote deeper thinking and stronger memory formation.
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-200">
                  <h3 className="text-lg font-semibold text-teal-900 mb-3">Retrieval Practice</h3>
                  <p className="text-sm text-teal-800 mb-4">
                    Test yourself frequently to strengthen memory pathways. The act of retrieving information makes it more memorable.
                  </p>
                  <div className="text-xs text-teal-700">
                    <strong>How it works:</strong> Questions test your ability to recall information, and confidence levels help track your certainty.
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Research-Based Benefits</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• <strong>Improved retention:</strong> These techniques can improve long-term retention by 50-200%</li>
                  <li>• <strong>Better transfer:</strong> Knowledge gained through these methods transfers better to new situations</li>
                  <li>• <strong>Deeper understanding:</strong> Focus on comprehension rather than just memorization</li>
                  <li>• <strong>Metacognitive awareness:</strong> Better understanding of what you know and don't know</li>
                </ul>
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
                  <p className="text-sm text-gray-600">AI-powered study sessions with proven learning techniques</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Created by oluiscabral</h3>
                <p className="text-gray-700 mb-4">
                  Studorama combines cutting-edge AI technology with research-backed learning techniques from "Make It Stick" 
                  to create the most effective study experience possible. Transform your learning with spaced repetition, 
                  interleaving, and other proven methods.
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
                  <h4 className="font-medium text-gray-900 mb-2">Core Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• AI-generated questions (multiple choice & dissertative)</li>
                    <li>• Mixed question types with interleaving</li>
                    <li>• Spaced repetition scheduling</li>
                    <li>• Elaborative interrogation prompts</li>
                    <li>• Self-explanation exercises</li>
                    <li>• Confidence tracking</li>
                    <li>• Session history & analytics</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Learning Science</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Based on "Make It Stick" research</li>
                    <li>• Retrieval practice implementation</li>
                    <li>• Desirable difficulties integration</li>
                    <li>• Generation effect utilization</li>
                    <li>• Metacognitive strategy training</li>
                    <li>• Evidence-based spacing algorithms</li>
                    <li>• Cognitive load optimization</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900 mb-2">Privacy & Security</h4>
                <p className="text-sm text-green-700">
                  Your API key and study data are stored locally in your browser and are never transmitted to our servers. 
                  Only you have access to your study sessions and progress. Your API key is used solely to communicate 
                  with OpenAI's services to generate study questions and evaluations.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Scientific Foundation</h4>
                <p className="text-sm text-blue-700">
                  Studorama implements learning techniques validated by cognitive science research, particularly from 
                  "Make It Stick: The Science of Successful Learning" by Peter C. Brown, Henry L. Roediger III, and Mark A. McDaniel. 
                  These methods have been proven to enhance long-term retention and transfer of knowledge.
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
            <span className="text-gray-700">Learning Techniques</span>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Enhanced Study Mode
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
