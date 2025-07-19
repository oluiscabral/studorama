import { ArrowRight, Award, BookOpen, Brain, CheckCircle, ChevronDown, ChevronUp, Lightbulb, Loader2, Maximize, MessageSquare, Minimize, Monitor, Play, Settings, Smartphone, Sparkles, Tablet, Target, XCircle, Zap } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { aiService } from "../../../core/services/ai";
import { getProviderConfig } from "../../../core/services/ai/providers/registry";
import { AIProvider } from "../../../core/types/ai.types";
import { useLanguage, useLocalStorage, useTheme } from "../../../hooks";
import { LearningSettings, Question, StudySession } from "../../../types";
import MarkdownRenderer from "../../MarkdownRenderer";

interface MultiProviderSettings {
  currentProvider: AIProvider;
  providers: Record<
    AIProvider,
    {
      apiKey: string;
      model: string;
      baseUrl?: string;
      customHeaders?: Record<string, string>;
    }
  >;
}

export default function StudyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const { themeConfig } = useTheme();

  // State management
  const [sessions, setSessions] = useLocalStorage<StudySession[]>("studorama-sessions", []);
  const [multiProviderSettings] = useLocalStorage<MultiProviderSettings>("studorama-multi-provider-settings", {
    currentProvider: "openai",
    providers: {
      openai: { apiKey: "", model: "gpt-4o-mini" },
      gemini: { apiKey: "", model: "gemini-1.5-flash" },
      anthropic: { apiKey: "", model: "claude-3-haiku-20240307" },
      deepseek: { apiKey: "", model: "deepseek-chat" },
      ollama: { apiKey: "", model: "llama3.1:8b", baseUrl: "http://localhost:11434/v1" },
      browser: { apiKey: "", model: "browser-ai" },
    },
  });

  // Session state
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState<string | number>("");
  const [confidence, setConfidence] = useState<number>(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [elaborativeQuestion, setElaborativeQuestion] = useState("");
  const [elaborativeAnswer, setElaborativeAnswer] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">("desktop");

  // Session setup state
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [contexts, setContexts] = useState<string[]>([]);
  const [newContext, setNewContext] = useState("");
  const [instructions, setInstructions] = useState<string[]>([]);
  const [newInstruction, setNewInstruction] = useState("");
  const [questionType, setQuestionType] = useState<"multipleChoice" | "dissertative" | "mixed">("multipleChoice");
  const [learningSettings, setLearningSettings] = useState<LearningSettings>({
    spacedRepetition: true,
    interleaving: true,
    elaborativeInterrogation: true,
    selfExplanation: true,
    desirableDifficulties: true,
    retrievalPractice: true,
    generationEffect: true,
  });

  // UI state
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showContextsPanel, setShowContextsPanel] = useState(true);
  const [showInstructionsPanel, setShowInstructionsPanel] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const questionContainerRef = React.useRef<HTMLDivElement>(null);

  // Get current provider settings
  const currentProviderSettings = multiProviderSettings.providers[multiProviderSettings.currentProvider];
  const currentProviderConfig = getProviderConfig(multiProviderSettings.currentProvider);

  // Check if provider is configured
  const isProviderConfigured = currentProviderConfig.requiresApiKey ? !!currentProviderSettings.apiKey : true;

  // Detect device type for responsive layout
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceType("mobile");
      } else if (width < 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle fullscreen mode for focused studying
  const toggleFullscreen = () => {
    if (questionContainerRef.current) {
      if (!isFullscreen) {
        if (questionContainerRef.current.requestFullscreen) {
          questionContainerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Load existing session if provided
  useEffect(() => {
    const sessionId = location.state?.sessionId;
    if (sessionId) {
      const existingSession = sessions.find((s) => s.id === sessionId);
      if (existingSession && existingSession.status === "active") {
        setCurrentSession(existingSession);
        setIsSetupMode(false);

        if (existingSession.currentQuestionIndex !== undefined && existingSession.questions[existingSession.currentQuestionIndex]) {
          setCurrentQuestion(existingSession.questions[existingSession.currentQuestionIndex]);
        } else {
          generateNextQuestion(existingSession);
        }
      }
    }
  }, [location.state, sessions]);

  const startNewSession = async () => {
    if (contexts.length === 0) {
      setError(language === "pt-BR" ? "Por favor, adicione pelo menos um contexto de estudo" : "Please add at least one study context");
      return;
    }

    if (!isProviderConfigured) {
      setError(language === "pt-BR" ? "Configure seu provedor de IA nas configurações primeiro" : "Please configure your AI provider in settings first");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const newSession: StudySession = {
        id: Date.now().toString(),
        contexts: [...contexts],
        instructions: instructions.length > 0 ? [...instructions] : undefined,
        createdAt: new Date().toISOString(),
        questions: [],
        status: "active",
        score: 0,
        totalQuestions: 0,
        questionType,
        learningSettings,
        currentQuestionIndex: 0,
      };

      setCurrentSession(newSession);
      setSessions((prev) => [...prev, newSession]);
      setIsSetupMode(false);

      await generateNextQuestion(newSession);
    } catch (error) {
      console.error("Error starting session:", error);
      setError(error instanceof Error ? error.message : "Failed to start session");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateNextQuestion = async (session: StudySession) => {
    if (!isProviderConfigured) {
      setError(language === "pt-BR" ? "Configure seu provedor de IA nas configurações primeiro" : "Please configure your AI provider in settings first");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      let questionTypeToGenerate: "multipleChoice" | "dissertative" = "multipleChoice";
      if (session.questionType === "mixed") {
        questionTypeToGenerate = Math.random() > 0.5 ? "multipleChoice" : "dissertative";
      } else if (session.questionType) {
        questionTypeToGenerate = session.questionType;
      }

      const generatedQuestion = await aiService.generateQuestion(
        {
          contexts: session.contexts,
          instructions: session.instructions,
          type: questionTypeToGenerate,
          language,
          difficulty: "medium",
        },
        {
          provider: multiProviderSettings.currentProvider,
          apiKey: currentProviderSettings.apiKey,
          model: currentProviderSettings.model,
          baseUrl: currentProviderSettings.baseUrl,
          customHeaders: currentProviderSettings.customHeaders,
        }
      );

      const question: Question = {
        id: Date.now().toString(),
        question: generatedQuestion.question,
        type: generatedQuestion.type,
        options: generatedQuestion.options,
        correctAnswer: generatedQuestion.correctAnswer,
        correctAnswerText: generatedQuestion.sampleAnswer,
        attempts: 0,
        difficulty: generatedQuestion.difficulty,
      };

      const updatedSession = {
        ...session,
        questions: [...session.questions, question],
        currentQuestionIndex: session.questions.length,
      };

      setCurrentSession(updatedSession);
      setCurrentQuestion(question);
      setSessions((prev) => prev.map((s) => (s.id === session.id ? updatedSession : s)));

      // Reset UI state
      setUserAnswer("");
      setSelectedOption(null);
      setConfidence(3);
      setShowFeedback(false);
      setElaborativeQuestion("");
      setElaborativeAnswer("");
      setIsAnswerSubmitted(false);
    } catch (error) {
      console.error("Error generating question:", error);
      setError(error instanceof Error ? error.message : "Failed to generate question");
    } finally {
      setIsGenerating(false);
    }
  };

  const addContext = () => {
    if (newContext.trim() && !contexts.includes(newContext.trim())) {
      setContexts([...contexts, newContext.trim()]);
      setNewContext("");
    }
  };

  const removeContext = (index: number) => {
    setContexts(contexts.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    if (newInstruction.trim() && !instructions.includes(newInstruction.trim())) {
      setInstructions([...instructions, newInstruction.trim()]);
      setNewInstruction("");
    }
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const submitAnswer = async () => {
    if (!currentSession || !currentQuestion || (!userAnswer && selectedOption === null)) return;

    try {
      setIsEvaluating(true);
      setIsAnswerSubmitted(true);
      setError(null);

      const finalAnswer = currentQuestion.type === "multipleChoice" ? selectedOption ?? userAnswer : undefined;
      let isCorrect = false;
      let feedback = "";

      if (currentQuestion.type === "multipleChoice") {
        isCorrect = finalAnswer === currentQuestion.correctAnswer;
        feedback = isCorrect ? (language === "pt-BR" ? "Correto!" : "Correct!") : language === "pt-BR" ? "Incorreto." : "Incorrect.";
      } else {
        const evaluation = await aiService.evaluateAnswer(
          {
            question: currentQuestion.question,
            userAnswer: finalAnswer?.toString() || "",
            correctAnswer: currentQuestion.correctAnswerText,
            type: "dissertative",
            language,
          },
          {
            provider: multiProviderSettings.currentProvider,
            apiKey: currentProviderSettings.apiKey,
            model: currentProviderSettings.model,
            baseUrl: currentProviderSettings.baseUrl,
            customHeaders: currentProviderSettings.customHeaders,
          }
        );

        isCorrect = evaluation.isCorrect;
        feedback = evaluation.feedback;
      }

      const updatedQuestion: Question = {
        ...currentQuestion,
        userAnswer: finalAnswer,
        isCorrect,
        feedback,
        attempts: currentQuestion.attempts + 1,
        confidence,
      };

      const updatedQuestions = [...currentSession.questions];
      updatedQuestions[currentSession.currentQuestionIndex!] = updatedQuestion;

      const correctAnswers = updatedQuestions.filter((q) => q.isCorrect).length;
      const score = updatedQuestions.length > 0 ? Math.round((correctAnswers / updatedQuestions.length) * 100) : 0;

      const updatedSession: StudySession = {
        ...currentSession,
        questions: updatedQuestions,
        score,
        totalQuestions: updatedQuestions.length,
      };

      setCurrentSession(updatedSession);
      setCurrentQuestion(updatedQuestion);
      setSessions((prev) => prev.map((s) => (s.id === currentSession.id ? updatedSession : s)));
      setShowFeedback(true);

      if (!isCorrect && learningSettings.elaborativeInterrogation) {
        try {
          const elaborativeQ = await aiService.generateElaborativeQuestion(currentSession.contexts, currentQuestion.question, language as any, {
            provider: multiProviderSettings.currentProvider,
            apiKey: currentProviderSettings.apiKey,
            model: currentProviderSettings.model,
            baseUrl: currentProviderSettings.baseUrl,
            customHeaders: currentProviderSettings.customHeaders,
          });
          setElaborativeQuestion(elaborativeQ);
        } catch (error) {
          console.error("Error generating elaborative question:", error);
        }
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);
      setError(error instanceof Error ? error.message : "Failed to evaluate answer");
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (!currentSession) return;
    generateNextQuestion(currentSession);
  };

  const endSession = () => {
    if (!currentSession) return;

    const finalSession: StudySession = {
      ...currentSession,
      status: "completed",
    };

    setSessions((prev) => prev.map((s) => (s.id === currentSession.id ? finalSession : s)));
    window.location.replace('/history');
    navigate("/history");
  };

  // Apple-inspired setup mode UI
  if (isSetupMode) {
    return (
      <div className="min-h-screen safe-top safe-bottom flex flex-col items-center justify-center" style={{ background: themeConfig.gradients.background }}>
        <div className="w-full max-w-md px-4 py-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
              style={{
                background: themeConfig.gradients.primary,
                boxShadow: `0 8px 32px ${themeConfig.colors.primary}40`,
              }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: themeConfig.colors.text }}>
              {t.startNewStudySession}
            </h1>
            <p className="text-base leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
              {t.configureSession}
            </p>
          </div>

          {/* Provider Status Card */}
          <div
            className="rounded-2xl p-4 mb-6 border"
            style={{
              backgroundColor: themeConfig.colors.surface,
              borderColor: themeConfig.colors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: themeConfig.colors.primary + "20" }}>
                  <Brain className="w-5 h-5" style={{ color: themeConfig.colors.primary }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: themeConfig.colors.text }}>
                    {currentProviderConfig.name}
                  </p>
                  <p className="text-xs" style={{ color: themeConfig.colors.textSecondary }}>
                    {currentProviderSettings.model}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isProviderConfigured ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{isProviderConfigured ? t.ready : t.requiresApiKey}</div>
            </div>
          </div>

          {/* Contexts Panel */}
          <div className="mb-6">
            <button
              onClick={() => setShowContextsPanel(!showContextsPanel)}
              className="w-full flex items-center justify-between p-4 rounded-2xl mb-4 transition-colors"
              style={{
                backgroundColor: themeConfig.colors.surface,
                color: themeConfig.colors.text,
              }}
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5" style={{ color: themeConfig.colors.textSecondary }} />
                <span className="font-medium">{language === "pt-BR" ? "Contextos de Estudo" : "Study Contexts"}</span>
                {contexts.length > 0 && (
                  <div
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: themeConfig.colors.primary + "20",
                      color: themeConfig.colors.primary,
                    }}
                  >
                    {contexts.length}
                  </div>
                )}
              </div>
              {showContextsPanel ? <ChevronUp className="w-5 h-5" style={{ color: themeConfig.colors.textSecondary }} /> : <ChevronDown className="w-5 h-5" style={{ color: themeConfig.colors.textSecondary }} />}
            </button>

            {showContextsPanel && (
              <div
                className="rounded-2xl p-4 mb-4 border animate-fade-in"
                style={{
                  backgroundColor: themeConfig.colors.surface,
                  borderColor: themeConfig.colors.border,
                }}
              >
                <p className="text-sm mb-3" style={{ color: themeConfig.colors.textSecondary }}>
                  {language === "pt-BR" ? "Adicione contextos específicos para sua sessão de estudo (ex: ENEM, Vestibular USP, Capítulo 3, etc.)" : "Add specific contexts for your study session (e.g., SAT, AP Biology, Chapter 3, etc.)"}
                </p>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newContext}
                      onChange={(e) => setNewContext(e.target.value)}
                      placeholder={language === "pt-BR" ? "ex: ENEM, Vestibular USP..." : "e.g., SAT, AP Calculus..."}
                      className="flex-1 min-w-0 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 outline-none transition-colors text-sm"
                      style={{
                        backgroundColor: themeConfig.colors.background,
                        borderColor: themeConfig.colors.border,
                        color: themeConfig.colors.text,
                        "--tw-ring-color": themeConfig.colors.primary,
                      }}
                      onKeyPress={(e) => e.key === "Enter" && addContext()}
                    />
                    <button
                      onClick={addContext}
                      disabled={!newContext.trim()}
                      className="px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                      style={{
                        backgroundColor: themeConfig.colors.primary,
                        color: "#ffffff",
                      }}
                    >
                      {language === "pt-BR" ? "Adicionar" : "Add"}
                    </button>
                  </div>

                  {contexts.length > 0 && (
                    <div className="space-y-2">
                      {contexts.map((context, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                          style={{
                            backgroundColor: themeConfig.colors.background,
                            borderColor: themeConfig.colors.border,
                          }}
                        >
                          <span className="text-sm" style={{ color: themeConfig.colors.text }}>
                            {context}
                          </span>
                          <button onClick={() => removeContext(index)} className="p-1 rounded-lg transition-colors" style={{ color: themeConfig.colors.error }} aria-label="Remove context">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Instructions Panel */}
          <div className="mb-6">
            <button
              onClick={() => setShowInstructionsPanel(!showInstructionsPanel)}
              className="w-full flex items-center justify-between p-4 rounded-2xl mb-4 transition-colors"
              style={{
                backgroundColor: themeConfig.colors.surface,
                color: themeConfig.colors.text,
              }}
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5" style={{ color: themeConfig.colors.textSecondary }} />
                <span className="font-medium">{language === "pt-BR" ? "Instruções Especiais" : "Special Instructions"}</span>
                {instructions.length > 0 && (
                  <div
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: themeConfig.colors.primary + "20",
                      color: themeConfig.colors.primary,
                    }}
                  >
                    {instructions.length}
                  </div>
                )}
              </div>
              {showInstructionsPanel ? <ChevronUp className="w-5 h-5" style={{ color: themeConfig.colors.textSecondary }} /> : <ChevronDown className="w-5 h-5" style={{ color: themeConfig.colors.textSecondary }} />}
            </button>

            {showInstructionsPanel && (
              <div
                className="rounded-2xl p-4 mb-4 border animate-fade-in"
                style={{
                  backgroundColor: themeConfig.colors.surface,
                  borderColor: themeConfig.colors.border,
                }}
              >
                <p className="text-sm mb-3" style={{ color: themeConfig.colors.textSecondary }}>
                  {language === "pt-BR" ? "Adicione instruções especiais para personalizar as questões (ex: Inclua código Python, Foque em aplicações práticas, etc.)" : "Add special instructions to customize the questions (e.g., Include Python code, Focus on practical applications, etc.)"}
                </p>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newInstruction}
                      onChange={(e) => setNewInstruction(e.target.value)}
                      placeholder={language === "pt-BR" ? "ex: Inclua exemplos práticos..." : "e.g., Include practical examples..."}
                      className="flex-1 min-w-0 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 outline-none transition-colors text-sm"
                      style={{
                        backgroundColor: themeConfig.colors.background,
                        borderColor: themeConfig.colors.border,
                        color: themeConfig.colors.text,
                        "--tw-ring-color": themeConfig.colors.primary,
                      }}
                      onKeyPress={(e) => e.key === "Enter" && addInstruction()}
                    />
                    <button
                      onClick={addInstruction}
                      disabled={!newInstruction.trim()}
                      className="px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                      style={{
                        backgroundColor: themeConfig.colors.primary,
                        color: "#ffffff",
                      }}
                    >
                      {language === "pt-BR" ? "Adicionar" : "Add"}
                    </button>
                  </div>

                  {instructions.length > 0 && (
                    <div className="space-y-2">
                      {instructions.map((instruction, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                          style={{
                            backgroundColor: themeConfig.colors.background,
                            borderColor: themeConfig.colors.border,
                          }}
                        >
                          <span className="text-sm" style={{ color: themeConfig.colors.text }}>
                            {instruction}
                          </span>
                          <button onClick={() => removeInstruction(index)} className="p-1 rounded-lg transition-colors" style={{ color: themeConfig.colors.error }} aria-label="Remove instruction">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Context/Instruction Summary */}
          {(contexts.length > 0 || instructions.length > 0) && (
            <div
              className="mb-6 p-4 rounded-2xl border"
              style={{
                backgroundColor: themeConfig.colors.info + "10",
                borderColor: themeConfig.colors.info + "30",
              }}
            >
              <div className="flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: themeConfig.colors.info }} />
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: themeConfig.colors.info }}>
                    {language === "pt-BR" ? "Resumo da Configuração" : "Configuration Summary"}
                  </p>
                  {contexts.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium mb-1" style={{ color: themeConfig.colors.info }}>
                        {language === "pt-BR" ? "Contextos:" : "Contexts:"}
                      </p>
                      <ul className="list-disc list-inside text-xs space-y-1" style={{ color: themeConfig.colors.info }}>
                        {contexts.map((context, index) => (
                          <li key={index}>{context}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {instructions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: themeConfig.colors.info }}>
                        {language === "pt-BR" ? "Instruções:" : "Instructions:"}
                      </p>
                      <ul className="list-disc list-inside text-xs space-y-1" style={{ color: themeConfig.colors.info }}>
                        {instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Question Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3" style={{ color: themeConfig.colors.text }}>
              {t.questionType}
            </label>
            <div className="space-y-3">
              {[
                {
                  value: "multipleChoice",
                  label: t.multipleChoice,
                  desc: t.quickAssessment,
                  icon: Target,
                  color: themeConfig.colors.info,
                },
                {
                  value: "dissertative",
                  label: t.dissertative,
                  desc: t.deepAnalysis,
                  icon: MessageSquare,
                  color: themeConfig.colors.warning,
                },
                {
                  value: "mixed",
                  label: t.mixed,
                  desc: t.interleavedPractice,
                  icon: Zap,
                  color: themeConfig.colors.primary,
                },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = questionType === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => setQuestionType(option.value as any)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 ${isSelected ? "shadow-lg" : "hover:shadow-md"}`}
                    style={{
                      backgroundColor: isSelected ? option.color + "10" : themeConfig.colors.surface,
                      borderColor: isSelected ? option.color : themeConfig.colors.border,
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: option.color + "20" }}>
                        <Icon className="w-5 h-5" style={{ color: option.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1" style={{ color: themeConfig.colors.text }}>
                          {option.label}
                        </div>
                        <div className="text-xs leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
                          {option.desc}
                        </div>
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: option.color }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="w-full flex items-center justify-between p-4 rounded-2xl mb-4 transition-colors"
            style={{
              backgroundColor: themeConfig.colors.surface,
              color: themeConfig.colors.text,
            }}
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5" style={{ color: themeConfig.colors.textSecondary }} />
              <span className="font-medium">{t.learningTechniques}</span>
            </div>
            {showAdvancedOptions ? <ChevronUp className="w-5 h-5" style={{ color: themeConfig.colors.textSecondary }} /> : <ChevronDown className="w-5 h-5" style={{ color: themeConfig.colors.textSecondary }} />}
          </button>

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <div
              className="rounded-2xl p-4 mb-6 border"
              style={{
                backgroundColor: themeConfig.colors.surface,
                borderColor: themeConfig.colors.border,
              }}
            >
              <div className="space-y-4">
                {[
                  { key: "spacedRepetition", label: t.spacedRepetition, desc: t.spacedRepetitionDesc },
                  { key: "interleaving", label: t.interleaving, desc: t.interleavingDesc },
                  { key: "elaborativeInterrogation", label: t.elaborativeInterrogation, desc: t.elaborativeInterrogationDesc },
                  { key: "retrievalPractice", label: t.retrievalPractice, desc: t.retrievalPracticeDesc },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start space-x-3 cursor-pointer">
                    <div className="relative mt-1">
                      <input
                        type="checkbox"
                        checked={learningSettings[key as keyof LearningSettings]}
                        onChange={(e) =>
                          setLearningSettings((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                        className="w-5 h-5 rounded-lg border-2 appearance-none transition-all duration-200"
                        style={{
                          backgroundColor: learningSettings[key as keyof LearningSettings] ? themeConfig.colors.primary : themeConfig.colors.background,
                          borderColor: learningSettings[key as keyof LearningSettings] ? themeConfig.colors.primary : themeConfig.colors.border,
                        }}
                      />
                      {learningSettings[key as keyof LearningSettings] && <CheckCircle className="absolute inset-0 w-5 h-5 text-white pointer-events-none" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm" style={{ color: themeConfig.colors.text }}>
                        {label}
                      </div>
                      <div className="text-xs mt-1 leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
                        {desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div
              className="p-4 rounded-2xl mb-6 border"
              style={{
                backgroundColor: themeConfig.colors.error + "10",
                borderColor: themeConfig.colors.error + "30",
              }}
            >
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: themeConfig.colors.error }} />
                <p className="text-sm leading-relaxed" style={{ color: themeConfig.colors.error }}>
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={startNewSession}
            disabled={isGenerating || contexts.length === 0 || !isProviderConfigured}
            className="w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl disabled:shadow-md"
            style={{
              background: themeConfig.gradients.primary,
              color: "#ffffff",
              transform: isGenerating ? "scale(0.98)" : "scale(1)",
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.generatingQuestion}</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>{t.startEnhancedSession}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Study session UI
  if (!currentSession || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center safe-top safe-bottom" style={{ background: themeConfig.gradients.background }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse" style={{ backgroundColor: themeConfig.colors.primary + "20" }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: themeConfig.colors.primary }} />
          </div>
          <p className="text-base" style={{ color: themeConfig.colors.textSecondary }}>
            {t.generatingQuestion}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen safe-top safe-bottom" style={{ background: themeConfig.gradients.background }}>
      <div className="w-full max-w-3xl mx-auto px-4 py-6">
        {/* Session Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate" style={{ color: themeConfig.colors.text }}>
              {currentSession.contexts.join(", ")}
            </h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-xs sm:text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                {t.question} {(currentSession.currentQuestionIndex || 0) + 1}
              </span>
              <div className="flex items-center space-x-1">
                <Award className="w-4 h-4" style={{ color: themeConfig.colors.warning }} />
                <span className="text-sm font-medium" style={{ color: themeConfig.colors.text }}>
                  {currentSession.score}%
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={endSession}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm"
            style={{
              backgroundColor: themeConfig.colors.error + "20",
              color: themeConfig.colors.error,
            }}
          >
            {t.endSession}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: themeConfig.colors.border }}>
            <div
              className="h-full transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${Math.min(((currentSession.currentQuestionIndex || 0) + 1) * 10, 100)}%`,
                background: themeConfig.gradients.primary,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div
          ref={questionContainerRef}
          className="rounded-3xl p-6 mb-6 shadow-lg border"
          style={{
            backgroundColor: themeConfig.colors.surface,
            borderColor: themeConfig.colors.border,
            ...(isFullscreen
              ? {
                  position: "fixed",
                  top: "0",
                  left: "0",
                  right: "0",
                  bottom: "0",
                  zIndex: 50,
                  borderRadius: "0",
                }
              : {}),
          }}
        >
          {/* Question Type Badge */}
          <div className="flex items-center space-x-2 mb-4">
            <div
              className="px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1"
              style={{
                backgroundColor: themeConfig.colors.primary + "20",
                color: themeConfig.colors.primary,
              }}
            >
              <Target className="w-3 h-3" />
              <span>{currentQuestion.type === "multipleChoice" ? t.multipleChoice : t.dissertative}</span>
            </div>

            {/* Fullscreen toggle button (tablet and desktop only) */}
            {deviceType !== "mobile" && (
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-full transition-colors"
                style={{
                  backgroundColor: themeConfig.colors.primary + "20",
                  color: themeConfig.colors.primary,
                }}
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Question Content */}
          <div className="mb-6">
            <div className="prose max-w-none">
              <MarkdownRenderer content={currentQuestion.question} />
            </div>
          </div>

          {/* Answer Input */}
          {!showFeedback && (
            <div className="space-y-6">
              {currentQuestion.type === "multipleChoice" ? (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isSubmitted = isAnswerSubmitted;
                    const isCorrect = index === currentQuestion.correctAnswer;

                    let buttonStyle = {
                      backgroundColor: themeConfig.colors.background,
                      borderColor: themeConfig.colors.border,
                      color: themeConfig.colors.text,
                    };

                    if (isSubmitted) {
                      if (isCorrect) {
                        buttonStyle = {
                          backgroundColor: themeConfig.colors.success + "20",
                          borderColor: themeConfig.colors.success,
                          color: themeConfig.colors.success,
                        };
                      } else if (isSelected && !isCorrect) {
                        buttonStyle = {
                          backgroundColor: themeConfig.colors.error + "20",
                          borderColor: themeConfig.colors.error,
                          color: themeConfig.colors.error,
                        };
                      }
                    } else if (isSelected) {
                      buttonStyle = {
                        backgroundColor: themeConfig.colors.primary + "10",
                        borderColor: themeConfig.colors.primary,
                        color: themeConfig.colors.primary,
                      };
                    }

                    return (
                      <button key={index} onClick={() => !isSubmitted && setSelectedOption(index)} disabled={isSubmitted} className={`w-full p-3 sm:p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed ${isSelected ? "transform scale-[1.01]" : ""}`} style={buttonStyle}>
                        <div className="flex items-start space-x-3">
                          <div
                            className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              borderColor: isSubmitted ? (isCorrect ? themeConfig.colors.success : isSelected ? themeConfig.colors.error : themeConfig.colors.border) : isSelected ? themeConfig.colors.primary : themeConfig.colors.border,
                              backgroundColor: isSelected || (isSubmitted && isCorrect) ? (isSubmitted && isCorrect ? themeConfig.colors.success : themeConfig.colors.primary) : "transparent",
                            }}
                          >
                            {(isSelected || (isSubmitted && isCorrect)) && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1 prose max-w-none">
                            <MarkdownRenderer content={option} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder={language === "pt-BR" ? "Digite sua resposta detalhada aqui..." : "Type your detailed answer here..."}
                    rows={deviceType === "mobile" ? 4 : 6}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-2xl focus:border-2 outline-none transition-all duration-200 resize-none text-sm sm:text-base"
                    style={{
                      backgroundColor: themeConfig.colors.background,
                      borderColor: userAnswer ? themeConfig.colors.primary : themeConfig.colors.border,
                      color: themeConfig.colors.text,
                      boxShadow: userAnswer ? `0 0 0 4px ${themeConfig.colors.primary}20` : "none",
                    }}
                  />
                </div>
              )}

              {/* Confidence Slider */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: themeConfig.colors.text }}>
                  {t.confidenceQuestion}
                </label>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <span className="text-xs sm:text-sm flex-shrink-0" style={{ color: themeConfig.colors.textSecondary }}>
                      {t.notConfident}
                    </span>
                    <div className="flex-1 relative">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={confidence}
                        onChange={(e) => setConfidence(parseInt(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${themeConfig.colors.primary} 0%, ${themeConfig.colors.primary} ${(confidence - 1) * 25}%, ${themeConfig.colors.border} ${(confidence - 1) * 25}%, ${themeConfig.colors.border} 100%)`,
                        }}
                      />
                      <div className="absolute top-0 left-0 right-0 flex justify-between px-0.5" style={{ pointerEvents: "none" }}>
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className="w-1 h-1 rounded-full"
                            style={{
                              backgroundColor: level <= confidence ? themeConfig.colors.primary : themeConfig.colors.border,
                              transform: "translateY(-50%)",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm flex-shrink-0" style={{ color: themeConfig.colors.textSecondary }}>
                      {t.veryConfident}
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className="w-3 h-3 rounded-full transition-all duration-200"
                          style={{
                            backgroundColor: level <= confidence ? themeConfig.colors.primary : themeConfig.colors.border,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={submitAnswer}
                disabled={isEvaluating || (!userAnswer && selectedOption === null)}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-2xl font-semibold text-sm sm:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl disabled:shadow-md"
                style={{
                  background: themeConfig.gradients.primary,
                  color: "#ffffff",
                  transform: isEvaluating ? "scale(0.98)" : "scale(1)",
                }}
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm sm:text-base">{t.evaluating}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm sm:text-base">{t.submitAnswer}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && currentQuestion.feedback && (
            <div className="space-y-6">
              <div
                className={`p-4 sm:p-6 rounded-2xl border-2 ${currentQuestion.isCorrect ? "shadow-lg" : "shadow-lg"}`}
                style={{
                  backgroundColor: currentQuestion.isCorrect ? themeConfig.colors.success + "10" : themeConfig.colors.error + "10",
                  borderColor: currentQuestion.isCorrect ? themeConfig.colors.success + "30" : themeConfig.colors.error + "30",
                }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  {currentQuestion.isCorrect ? (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: themeConfig.colors.success }}>
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: themeConfig.colors.error }}>
                      <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <span
                      className="font-bold text-base sm:text-lg"
                      style={{
                        color: currentQuestion.isCorrect ? themeConfig.colors.success : themeConfig.colors.error,
                      }}
                    >
                      {currentQuestion.isCorrect ? t.excellent : t.keepLearning}
                    </span>
                  </div>
                </div>
                <div
                  className="prose max-w-none"
                  style={{
                    color: currentQuestion.isCorrect ? themeConfig.colors.success : themeConfig.colors.error,
                  }}
                >
                  <MarkdownRenderer content={currentQuestion.feedback} />
                </div>
              </div>

              {/* Elaborative Question */}
              {elaborativeQuestion && !currentQuestion.isCorrect && (
                <div
                  className="p-4 sm:p-6 rounded-2xl border-2"
                  style={{
                    backgroundColor: themeConfig.colors.info + "10",
                    borderColor: themeConfig.colors.info + "30",
                  }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: themeConfig.colors.info + "20" }}>
                      <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: themeConfig.colors.info }} />
                    </div>
                    <span className="font-bold text-sm sm:text-base" style={{ color: themeConfig.colors.info }}>
                      {t.elaborativePrompt}
                    </span>
                  </div>
                  <div className="prose max-w-none mb-4" style={{ color: themeConfig.colors.info }}>
                    <MarkdownRenderer content={elaborativeQuestion} />
                  </div>
                  <textarea
                    value={elaborativeAnswer}
                    onChange={(e) => setElaborativeAnswer(e.target.value)}
                    placeholder={t.explainReasoning}
                    rows={deviceType === "mobile" ? 2 : 3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:border-2 outline-none transition-all duration-200 resize-none text-xs sm:text-sm"
                    style={{
                      backgroundColor: themeConfig.colors.background,
                      borderColor: elaborativeAnswer ? themeConfig.colors.info : themeConfig.colors.border,
                      color: themeConfig.colors.text,
                    }}
                  />
                </div>
              )}

              {/* Next Question Button */}
              <button
                onClick={nextQuestion}
                disabled={isGenerating}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-2xl font-semibold text-sm sm:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl disabled:shadow-md"
                style={{
                  background: themeConfig.gradients.primary,
                  color: "#ffffff",
                  transform: isGenerating ? "scale(0.98)" : "scale(1)",
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm sm:text-base">{t.generatingQuestion}</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    <span className="text-sm sm:text-base">{t.nextQuestion}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="p-3 sm:p-4 rounded-2xl border mb-6"
            style={{
              backgroundColor: themeConfig.colors.error + "10",
              borderColor: themeConfig.colors.error + "30",
            }}
          >
            <div className="flex items-start space-x-3">
              <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: themeConfig.colors.error }} />
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: themeConfig.colors.error }}>
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Device Type Indicator (for development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="fixed bottom-2 right-2 px-2 py-1 rounded-full text-xs bg-black/50 text-white">
            <div className="flex items-center space-x-1">
              {deviceType === "mobile" && <Smartphone className="w-3 h-3" />}
              {deviceType === "tablet" && <Tablet className="w-3 h-3" />}
              {deviceType === "desktop" && <Monitor className="w-3 h-3" />}
              <span>{deviceType}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
