# Studorama 🎓

**Multi-Provider AI Study Platform with Research-Backed Learning Techniques**

Transform your learning experience with Studorama, an intelligent study platform that supports multiple AI providers and implements proven learning techniques to enhance your understanding of any subject.

🌐 **Live at: [www.studorama.vercel.app](https://www.studorama.vercel.app)**

![Studorama Banner](https://github.com/user-attachments/assets/9c74ca79-9f32-467d-a264-9641d405da02)

## ✨ Key Features

### 🤖 Multi-Provider AI Support
- **6 AI Providers**: OpenAI, Google Gemini, Anthropic Claude, DeepSeek, Ollama (local), Browser AI
- **15+ Models**: From GPT-4o to local Llama models - choose what works best for you
- **Flexible Configuration**: Switch between providers seamlessly with individual API key management
- **Cost Optimization**: Mix free local models with premium cloud models based on your needs

### 🌍 Full Internationalization
- **Multi-Language Support**: Complete English and Portuguese (Brazil) localization
- **Localized AI Content**: Provider descriptions, setup instructions, and model information in your language
- **Smart Language Switching**: Automatic prompt translation when changing languages
- **Cultural Adaptation**: Region-specific content and formatting

### 📚 Advanced Question Generation
- **Multiple Choice Questions**: Quick assessment with 4 options and detailed explanations
- **Dissertative Questions**: Open-ended questions for deep analysis and critical thinking
- **Mixed Mode**: Intelligent interleaving of question types for optimal learning
- **Adaptive Difficulty**: Questions adjust based on your performance and confidence levels

### 🧠 Research-Based Learning Techniques
**Based on "Make It Stick: The Science of Successful Learning"**

- **Spaced Repetition**: Automatic scheduling of review questions based on performance
- **Interleaving**: Mix different question types and topics for better retention
- **Elaborative Interrogation**: "Why" questions to deepen understanding
- **Retrieval Practice**: Active recall to strengthen memory pathways
- **Self-Explanation**: Connect new knowledge to existing understanding
- **Desirable Difficulties**: Appropriate challenges that enhance learning

### 📊 Comprehensive Analytics
- **Session Tracking**: Detailed progress monitoring with question-by-question breakdowns
- **Performance Metrics**: Accuracy rates, confidence tracking, and improvement trends
- **Study History**: Complete session archive with searchable and filterable results
- **Time Analytics**: Study duration and efficiency measurements

### 🎯 Personalized Learning Experience
- **Subject Flexibility**: Study any topic from programming to history to science
- **Custom Modifiers**: Add specific textbooks, authors, or focus areas
- **Adaptive AI Prompts**: Customize how AI generates and evaluates questions
- **Learning Preferences**: Remember your preferred techniques and question types

### 🔒 Privacy-First Design
- **Local Storage**: All data stays in your browser - complete privacy guaranteed
- **No Account Required**: Start studying immediately without registration
- **Secure API Integration**: Your API keys are stored locally and never shared
- **GDPR Compliant**: Privacy by design with no tracking or data collection

## 🚀 Supported AI Providers

### ☁️ Cloud Providers
| Provider | Models | Strengths | Cost |
|----------|--------|-----------|------|
| **OpenAI** | GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo | Industry leader, most capable | Medium-High |
| **Google Gemini** | Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini Pro | Large context windows, fast | Low-Medium |
| **Anthropic Claude** | Claude 3.5 Sonnet, Claude 3 Haiku, Claude 3 Opus | Safety-focused, excellent reasoning | Medium-High |
| **DeepSeek** | DeepSeek Chat, DeepSeek Coder | Cost-effective, strong performance | Low |

### 🏠 Local Providers
| Provider | Models | Benefits | Requirements |
|----------|--------|----------|--------------|
| **Ollama** | Llama 3.1 8B/70B, Mistral 7B, Code Llama 13B | Completely free, private | Local installation |
| **Browser AI** | Browser AI (experimental) | No setup required | Modern browser |

## 🌟 Getting Started

### 🎯 Quick Start (No Installation)
1. **Visit [www.studorama.vercel.app](https://www.studorama.vercel.app)**
2. **Choose your AI provider** and configure API key (or use free local options)
3. **Select your language** (English or Portuguese)
4. **Start studying** - enter any subject and begin learning!

### 🛠️ Development Setup
```bash
# Clone the repository
git clone https://github.com/oluiscabral/studorama.git
cd studorama

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎨 Modern User Experience

### 📱 Responsive Design
- **Mobile-First**: Optimized for smartphones and tablets
- **Progressive Web App**: Install on any device for native-like experience
- **Touch-Friendly**: Intuitive gestures and interactions
- **Offline Capable**: Continue studying without internet (with local models)

### 🎭 Beautiful Interface
- **Modern Design**: Clean, professional interface inspired by leading platforms
- **Smooth Animations**: Delightful micro-interactions and transitions
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Dark/Light Themes**: Multiple theme options for comfortable studying

## 🔧 Advanced Configuration

### 🤖 AI Provider Setup

#### OpenAI
```
1. Visit platform.openai.com
2. Create account and navigate to API Keys
3. Generate new secret key
4. Paste in Studorama settings
```

#### Google Gemini
```
1. Visit aistudio.google.com
2. Sign in with Google account
3. Create API key
4. Configure in Studorama
```

#### Ollama (Local)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start server
ollama serve

# Pull a model
ollama pull llama3.1:8b

# Configure base URL in Studorama (default: http://localhost:11434/v1)
```

### 🎛️ Customization Options
- **Custom AI Prompts**: Modify how questions are generated and evaluated
- **Learning Technique Presets**: Save your preferred learning methods
- **Subject Modifiers**: Add specific textbooks, authors, or focus areas
- **Confidence Tracking**: Monitor your certainty levels for better self-assessment

## 📈 Learning Science Foundation

Studorama implements evidence-based learning techniques from cognitive science research:

### 📖 Research Sources
- **"Make It Stick"** by Brown, Roediger, and McDaniel
- **Cognitive Load Theory** principles
- **Spaced Repetition** algorithms
- **Interleaving** methodologies
- **Metacognitive** strategy training

### 🧪 Proven Benefits
- **50-200% improvement** in long-term retention
- **Better knowledge transfer** to new situations
- **Enhanced metacognitive awareness**
- **Reduced forgetting curves**
- **Improved problem-solving skills**

## 🌐 Internationalization

### 🗣️ Supported Languages
- **English (US)** - Complete localization
- **Portuguese (Brazil)** - Complete localization
- **More languages coming soon**

### 🔄 Smart Language Features
- **Automatic prompt translation** when switching languages
- **Localized AI provider information** and setup instructions
- **Cultural adaptation** of content and examples
- **Seamless language switching** with preference memory

## 📊 Technical Architecture

### 🏗️ Technology Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: React hooks with local storage persistence
- **AI Integration**: Multi-provider abstraction layer
- **Internationalization**: Custom i18n system with dynamic loading

### 🔧 Key Features
- **Type-Safe**: Full TypeScript implementation
- **Modular Architecture**: Clean separation of concerns
- **Performance Optimized**: Code splitting and lazy loading
- **SEO Friendly**: Server-side rendering ready
- **PWA Ready**: Service worker and offline capabilities

## 🚀 Deployment & Versioning

### 🌐 Live Deployment
- **Production**: [www.studorama.vercel.app](https://www.studorama.vercel.app)
- **CDN**: Global content delivery for fast loading
- **SSL**: Secure HTTPS with modern encryption
- **Monitoring**: Real-time performance tracking

### 📦 Version Management
```bash
# Automated versioning system
npm run version:patch    # Bug fixes
npm run version:minor    # New features  
npm run version:major    # Breaking changes

# Automated deployment
npm run deploy          # Deploy with version bump
npm run deploy:minor    # Deploy with minor version
npm run deploy:major    # Deploy with major version
```

## 🤝 Contributing

We welcome contributions from the community! Here's how to get involved:

### 🛠️ Development Process
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### 📋 Contribution Guidelines
- Follow TypeScript best practices
- Maintain responsive design principles
- Write clear, descriptive commit messages
- Test across multiple browsers and devices
- Ensure accessibility compliance (WCAG 2.1 AA)
- Use the automated versioning system for releases

### 🎯 Areas for Contribution
- **New AI Providers**: Add support for additional AI services
- **Language Support**: Contribute translations for new languages
- **Learning Techniques**: Implement additional research-backed methods
- **UI/UX Improvements**: Enhance the user experience
- **Performance Optimization**: Improve loading times and responsiveness
- **Accessibility**: Make the platform more inclusive

## 🗺️ Roadmap

### 🔜 Coming Soon
- [ ] **Study Groups**: Collaborative learning sessions
- [ ] **Advanced Analytics**: Detailed learning insights and recommendations
- [ ] **Mobile Apps**: Native iOS and Android applications
- [ ] **More AI Providers**: Cohere, Hugging Face, and others
- [ ] **Voice Input**: Speech-to-text for answers
- [ ] **Export Features**: PDF and CSV export capabilities

### 🎯 Long-term Vision
- [ ] **LMS Integration**: Connect with popular learning management systems
- [ ] **AI Study Plans**: Personalized curriculum generation
- [ ] **Gamification**: Achievements, streaks, and progress rewards
- [ ] **Social Features**: Share progress and compete with friends
- [ ] **Advanced Spaced Repetition**: ML-powered review scheduling
- [ ] **Multi-modal Learning**: Image, audio, and video question support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### 🔬 Research Foundation
- **Peter C. Brown, Henry L. Roediger III, Mark A. McDaniel** - "Make It Stick" research
- **Cognitive Science Community** - Learning technique validation
- **Educational Psychology Research** - Evidence-based methodologies

### 🛠️ Technology Partners
- **OpenAI** - GPT model access and API
- **Google** - Gemini AI models
- **Anthropic** - Claude AI models
- **Meta** - Llama open-source models
- **React Team** - Excellent framework and documentation
- **Tailwind CSS** - Utility-first CSS framework

### 🎨 Design Resources
- **Pexels** - High-quality stock photography
- **Lucide** - Beautiful icon library
- **Unsplash** - Additional imagery resources

## 📞 Support & Community

### 🐛 Issues & Bug Reports
- **GitHub Issues**: [Report bugs and request features](https://github.com/oluiscabral/studorama/issues)
- **Discussions**: [Join community discussions](https://github.com/oluiscabral/studorama/discussions)

### 💬 Community
- **Discord**: Coming soon - Join our learning community
- **Twitter**: Coming soon - Join our learning community
- **Blog**: Coming soon - Join our learning community

### 📧 Direct Contact
- **LinkedIn**: [Connect with the founder](https://www.linkedin.com/in/oluiscabral)

## 🌟 Show Your Support

If Studorama helps you learn better, please consider:

- ⭐ **Star the repository** on GitHub
- 🐦 **Share on social media** with #Studorama
- 🤝 **Contribute** to the project
- 📝 **Write a review** or blog post about your experience
- 💝 **Sponsor the project** to help keep it free for everyone

## 📈 Project Stats

- 🎯 **6 AI Providers** supported
- 🌍 **2 Languages** fully localized
- 📚 **6 Learning Techniques** implemented
- 🔬 **Research-Based** methodology
- 🆓 **100% Free** and open source
- 🔒 **Privacy-First** design
- 📱 **Mobile-Optimized** experience

---

*Empowering learners worldwide with AI-driven education technology and evidence-based learning science.*

**🌐 Start learning today at [www.studorama.vercel.app](https://www.studorama.vercel.app)**
