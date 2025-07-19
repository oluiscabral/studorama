import { AlertCircle, ArrowLeft, BookOpen, Calendar, CheckSquare, Edit, Eye, Filter, Info, Play, Search, SortAsc, SortDesc, Square, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../core/services';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useTheme } from '../../hooks/useTheme';
import { LearningSettings, StudySession } from '../../types';
import SessionEditModal from '../SessionEditModal';

export default function SessionHistory() {
  const [sessions, setSessions] = useLocalStorage<StudySession[]>('studorama-sessions', []);
  const { t, language } = useLanguage();
  const { themeConfig } = useTheme();
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'active'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(window.innerWidth >= 768 ? 'grid' : 'list');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showInfoTip, setShowInfoTip] = useState(true);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Sort and filter sessions
  const filteredSessions = useMemo(() => {
    return sessions
      .filter(session => {
        const matchesSearch = (session.contexts?.join(', ') || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || session.status === filterStatus;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [sessions, searchQuery, filterStatus, sortOrder]);

  const handleEditSession = (session: StudySession) => {
    setEditingSession(session);
  };

  const handleSaveSession = (sessionId: string, updates: any) => {
    setSessions(prevSessions => 
      prevSessions.map(session => {
        if (session.id === sessionId) {
          const updatedSession = { ...session, ...updates };
          
          // Add history tracking for changes
          const now = new Date().toISOString();
          
          // Track subject changes
          if (updates.contexts !== session.contexts) {
            const contextHistory = session.contextsHistory || [];
            contextHistory.push({
              id: Date.now().toString(),
              newContexts: updates.contexts,
              previousContexts: session.contexts,
              changedAt: now,
              reason: 'Manual edit from history'
            });
            updatedSession.contextsHistory = contextHistory;
          }
          
          // Track learning settings changes
          if (updates.learningSettings && JSON.stringify(updates.learningSettings) !== JSON.stringify(session.learningSettings)) {
            const learningSettingsHistory = session.learningSettingsHistory || [];
            learningSettingsHistory.push({
              id: Date.now().toString(),
              previousSettings: session.learningSettings as LearningSettings,
              newSettings: updates.learningSettings,
              changedAt: now
            });
            updatedSession.learningSettingsHistory = learningSettingsHistory;
          }
          
          return updatedSession;
        }
        return session;
      })
    );
    setEditingSession(null);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedSessions([]);
  };

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId) 
        : [...prev, sessionId]
    );
  };

  const selectAllSessions = () => {
    setSelectedSessions(filteredSessions.map(s => s.id));
  };

  const deselectAllSessions = () => {
    setSelectedSessions([]);
  };

  const deleteSelectedSessions = () => {
    setSessions(prev => prev.filter(session => !selectedSessions.includes(session.id)));
    setSelectedSessions([]);
    setIsSelectionMode(false);
    setShowDeleteConfirm(false);
  };

  // Detect screen size changes for responsive view mode
  useEffect(() => {
    const handleResize = () => {
      // Default to grid on larger screens, list on smaller screens
      if (window.innerWidth >= 768 && viewMode === 'list') {
        setViewMode('grid');
      } else if (window.innerWidth < 768 && viewMode === 'grid') {
        setViewMode('list');
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    focusSearchInput();
  };

  const handleSearchBlur = () => {
    // Small delay to allow for clicking search results
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const dismissInfoTip = () => {
    setShowInfoTip(false);
  };

  // Empty state
  if (sessions.length === 0) {
    return (
      <div className="min-h-screen safe-top safe-bottom flex flex-col" style={{ background: themeConfig.gradients.background }}>
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse"
              style={{ backgroundColor: themeConfig.colors.primary + '20' }}
            >
              <BookOpen className="w-8 h-8" style={{ color: themeConfig.colors.primary }} />
            </div>
            <h2 className="text-xl font-bold mb-3" style={{ color: themeConfig.colors.text }}>
              {t.noSessionsYet}
            </h2>
            <p className="text-base mb-8 leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
              {language === 'pt-BR' 
                ? 'Inicie sua primeira sessão de estudo para ver seu progresso aqui.' 
                : 'Start your first study session to see your progress here.'}
            </p>
            <Link
              to="/study"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-full font-medium shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{ 
                background: themeConfig.gradients.primary,
                color: '#ffffff'
              }}
            >
              <BookOpen className="w-5 h-5" />
              <span>{t.startFirstSession}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen safe-top safe-bottom flex flex-col" style={{ background: themeConfig.gradients.background }}>
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex-1">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 max-w-md mx-auto">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-lg animate-bounce-gentle"
            style={{
              background: themeConfig.gradients.primary,
              boxShadow: `0 8px 32px ${themeConfig.colors.primary}40`,
            }}
          >
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: themeConfig.colors.text }}>
            {t.studyHistory}
          </h1>
          <p className="text-base leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
            {t.reviewProgress}
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap gap-1 sm:gap-2">
            <button
              onClick={toggleSelectionMode}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: isSelectionMode ? themeConfig.colors.primary + "20" : "transparent",
                color: isSelectionMode ? themeConfig.colors.primary : themeConfig.colors.textSecondary,
              }}
              aria-label={isSelectionMode ? "Exit selection mode" : "Enter selection mode"}
            >
              {isSelectionMode ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
            </button>
            <button onClick={toggleSortOrder} className="p-2 rounded-lg transition-colors" style={{ color: themeConfig.colors.textSecondary }} aria-label={sortOrder === "desc" ? "Sort ascending" : "Sort descending"}>
              {sortOrder === "desc" ? <SortDesc className="w-5 h-5" /> : <SortAsc className="w-5 h-5" />}
            </button>
            <button onClick={focusSearchInput} className="p-2 rounded-lg transition-colors" style={{ color: themeConfig.colors.textSecondary }} aria-label="Search sessions">
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: isFilterExpanded ? themeConfig.colors.primary + "20" : "transparent",
                color: isFilterExpanded ? themeConfig.colors.primary : themeConfig.colors.textSecondary,
              }}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("list")}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: viewMode === "list" ? themeConfig.colors.primary + "20" : "transparent",
                color: viewMode === "list" ? themeConfig.colors.primary : themeConfig.colors.textSecondary,
              }}
              aria-label={viewMode === "list" ? "Current view: List" : "Switch to list view"}
              aria-pressed={viewMode === "list"}
            >
              <div className="w-5 h-5 flex flex-col justify-between">
                <div className="h-1 w-full rounded-full" style={{ backgroundColor: "currentColor" }}></div>
                <div className="h-1 w-full rounded-full" style={{ backgroundColor: "currentColor" }}></div>
                <div className="h-1 w-full rounded-full" style={{ backgroundColor: "currentColor" }}></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: viewMode === "grid" ? themeConfig.colors.primary + "20" : "transparent",
                color: viewMode === "grid" ? themeConfig.colors.primary : themeConfig.colors.textSecondary,
              }}
              aria-label={viewMode === "grid" ? "Current view: Grid" : "Switch to grid view"}
              aria-pressed={viewMode === "grid"}
            >
              <div className="w-5 h-5 grid grid-cols-2 gap-1">
                <div className="rounded-sm" style={{ backgroundColor: "currentColor" }}></div>
                <div className="rounded-sm" style={{ backgroundColor: "currentColor" }}></div>
                <div className="rounded-sm" style={{ backgroundColor: "currentColor" }}></div>
                <div className="rounded-sm" style={{ backgroundColor: "currentColor" }}></div>
              </div>
            </button>
          </div>

          <Link
            to="/study"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: themeConfig.colors.primary,
              color: "#ffffff",
            }}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.newSession}</span>
          </Link>
        </div>

        {/* Info Tip */}
        {showInfoTip && (
          <div
            className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border animate-fade-in"
            style={{
              backgroundColor: themeConfig.colors.info + "10",
              borderColor: themeConfig.colors.info + "30",
            }}
          >
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: themeConfig.colors.info }} />
              <div className="flex-1">
                <p className="text-sm leading-relaxed" style={{ color: themeConfig.colors.info }}>
                  {language === "pt-BR" ? "Dica: Toque em uma sessão para ver detalhes ou use os botões de ação para continuar, editar ou visualizar." : "Tip: Tap on a session to see details or use the action buttons to continue, edit, or view."}
                </p>
              </div>
              <button onClick={dismissInfoTip} className="p-1 rounded-full" style={{ color: themeConfig.colors.info }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-4 sm:mb-6 space-y-3 max-w-2xl mx-auto">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "pt-BR" ? "Buscar sessões..." : "Search sessions..."}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="w-full pr-4 py-3 rounded-full border-2 focus:border-2 outline-none transition-all duration-200"
              style={{
                paddingLeft: "3.5rem",
                color: themeConfig.colors.text,
                backgroundColor: themeConfig.colors.background,
                borderColor: searchQuery ? themeConfig.colors.primary : themeConfig.colors.border,
                boxShadow: searchQuery ? `0 0 0 4px ${themeConfig.colors.primary}20` : "none",
              }}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: themeConfig.colors.textMuted }} />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="flex justify-center items-center absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full" style={{ backgroundColor: themeConfig.colors.border }} aria-label="Clear search">
                <Trash2 className="w-3 h-3" style={{ color: themeConfig.colors.textMuted }} />
              </button>
            )}
          </div>

          {isFilterExpanded && (
            <div className="flex space-x-2 animate-slide-up">
              {["all", "completed", "active"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1`}
                  style={{
                    backgroundColor: filterStatus === status ? themeConfig.colors.primary : themeConfig.colors.surface,
                    color: filterStatus === status ? "#ffffff" : themeConfig.colors.textSecondary,
                  }}
                >
                  {status === "all" ? (language === "pt-BR" ? "Todos" : "All") : status === "completed" ? t.completed : t.inProgress}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selection Mode Controls */}
        {isSelectionMode && (
          <div
            className="mb-6 p-4 rounded-xl border"
            style={{
              backgroundColor: themeConfig.colors.surface,
              borderColor: themeConfig.colors.border,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                {selectedSessions.length} {language === "pt-BR" ? "selecionado" + (selectedSessions.length !== 1 ? "s" : "") : "selected"}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={selectAllSessions}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{
                    backgroundColor: themeConfig.colors.primary + "20",
                    color: themeConfig.colors.primary,
                  }}
                >
                  {language === "pt-BR" ? "Selecionar todos" : "Select all"}
                </button>
                <button
                  onClick={deselectAllSessions}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{
                    backgroundColor: themeConfig.colors.border,
                    color: themeConfig.colors.textSecondary,
                  }}
                >
                  {language === "pt-BR" ? "Limpar" : "Clear"}
                </button>
              </div>
            </div>
            <button
              onClick={() => selectedSessions.length > 0 && setShowDeleteConfirm(true)}
              disabled={selectedSessions.length === 0}
              className="w-full py-2 rounded-full font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: themeConfig.colors.error,
                color: "#ffffff",
              }}
            >
              <Trash2 className="w-4 h-4 inline-block mr-2" />
              {language === "pt-BR" ? "Excluir selecionados" : "Delete selected"}
            </button>
          </div>
        )}

        {/* Stats Overview */}
        <div
          className="mb-6 p-4 sm:p-6 rounded-xl border"
          style={{
            backgroundColor: themeConfig.colors.surface,
            borderColor: themeConfig.colors.border,
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: themeConfig.colors.textSecondary }}>
                {t.totalSessions}
              </p>
              <p className="text-2xl font-bold" style={{ color: themeConfig.colors.text }}>
                {sessions.length}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: themeConfig.colors.textSecondary }}>
                {t.completed}
              </p>
              <p className="text-2xl font-bold" style={{ color: themeConfig.colors.text }}>
                {sessions.filter((s) => s.status === "completed").length}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: themeConfig.colors.textSecondary }}>
                {t.averageScore}
              </p>
              <p className="text-2xl font-bold" style={{ color: themeConfig.colors.text }}>
                {sessions.filter((s) => s.status === "completed").length > 0 ? Math.round(sessions.filter((s) => s.status === "completed").reduce((acc, s) => acc + s.score, 0) / sessions.filter((s) => s.status === "completed").length) : 0}%
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: themeConfig.colors.textSecondary }}>
                {t.questionsAnswered}
              </p>
              <p className="text-2xl font-bold" style={{ color: themeConfig.colors.text }}>
                {sessions.reduce((acc, s) => acc + s.questions.length, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className={viewMode === "list" ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"}>
          {filteredSessions.length === 0 ? (
            <div
              className="p-6 rounded-xl border text-center"
              style={{
                backgroundColor: themeConfig.colors.surface,
                borderColor: themeConfig.colors.border,
              }}
            >
              <Search className="w-8 h-8 mx-auto mb-3 opacity-50 animate-pulse" style={{ color: themeConfig.colors.textMuted }} />
              <p className="text-base" style={{ color: themeConfig.colors.textSecondary }}>
                {language === "pt-BR" ? "Nenhuma sessão encontrada" : "No sessions found"}
              </p>
              <p className="text-sm mt-1" style={{ color: themeConfig.colors.textMuted }}>
                {language === "pt-BR" ? "Tente ajustar seus filtros ou termos de busca" : "Try adjusting your filters or search terms"}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`rounded-xl sm:rounded-2xl border transition-all duration-200 h-full flex flex-col ${isSelectionMode && selectedSessions.includes(session.id) ? "scale-[1.02] shadow-md" : ""}`}
                style={{
                  backgroundColor: themeConfig.colors.surface,
                  borderColor: isSelectionMode && selectedSessions.includes(session.id) ? themeConfig.colors.primary : themeConfig.colors.border,
                }}
              >
                <div className="p-4 sm:p-5" onClick={() => isSelectionMode && toggleSessionSelection(session.id)}>
                  <div className="flex items-start space-x-3">
                    {isSelectionMode && (
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                        style={{
                          backgroundColor: selectedSessions.includes(session.id) ? themeConfig.colors.primary : themeConfig.colors.background,
                          borderWidth: 2,
                          borderColor: selectedSessions.includes(session.id) ? themeConfig.colors.primary : themeConfig.colors.border,
                        }}
                      >
                        {selectedSessions.includes(session.id) && <CheckSquare className="w-4 h-4 text-white" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold truncate text-sm sm:text-base" style={{ color: themeConfig.colors.text }}>
                            {session.contexts.join(", ")}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" style={{ color: themeConfig.colors.textMuted }} />
                              <span className="text-xs" style={{ color: themeConfig.colors.textMuted }}>
                                {formatDate(session.createdAt, language)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="w-3 h-3 mr-1" style={{ color: themeConfig.colors.textMuted }} />
                              <span className="text-xs" style={{ color: themeConfig.colors.textMuted }}>
                                {session.questions.length} {session.questions.length === 1 ? (language === "pt-BR" ? "questão" : "question") : language === "pt-BR" ? "questões" : "questions"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${session.status === "completed" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>{session.status === "completed" ? t.completed : t.inProgress}</div>
                      </div>

                      {session.status === "completed" && (
                        <div className="mt-3 sm:mt-4">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span style={{ color: themeConfig.colors.textSecondary }}>{t.score}</span>
                            <span style={{ color: themeConfig.colors.textSecondary }}>{session.score}%</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: themeConfig.colors.border }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${session.score}%`,
                                background: themeConfig.gradients.primary,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {!isSelectionMode && (
                  <div className="flex border-t mt-auto" style={{ borderColor: themeConfig.colors.border }}>
                    {session.status === "active" && (
                      <>
                        <Link to="/study" state={{ sessionId: session.id }} className="flex-1 flex items-center justify-center py-3 space-x-1 transition-colors" style={{ color: themeConfig.colors.primary }}>
                          <Play className="w-4 h-4" />
                          <span className="text-sm font-medium">{t.continue}</span>
                        </Link>
                        <button onClick={() => handleEditSession(session)} className="flex-1 flex items-center justify-center py-3 space-x-1 transition-colors" style={{ color: themeConfig.colors.textSecondary }}>
                          <Edit className="w-4 h-4" />
                          <span className="text-sm font-medium">{t.edit}</span>
                        </button>
                      </>
                    )}
                    <Link to={`/session/${session.id}`} className="flex-1 flex items-center justify-center py-3 space-x-1 transition-colors" style={{ color: themeConfig.colors.textSecondary }}>
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">{t.viewDetails}</span>
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className="rounded-2xl shadow-xl border max-w-sm w-full animate-scale-in"
              style={{
                backgroundColor: themeConfig.colors.surface,
                borderColor: themeConfig.colors.border,
              }}
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: themeConfig.colors.error + "20" }}>
                    <AlertCircle className="w-5 h-5" style={{ color: themeConfig.colors.error }} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: themeConfig.colors.text }}>
                    {language === "pt-BR" ? "Confirmar exclusão" : "Confirm deletion"}
                  </h3>
                </div>
                <p className="mb-6" style={{ color: themeConfig.colors.textSecondary }}>
                  {language === "pt-BR" ? `Tem certeza que deseja excluir ${selectedSessions.length} ${selectedSessions.length === 1 ? "sessão" : "sessões"}? Esta ação não pode ser desfeita.` : `Are you sure you want to delete ${selectedSessions.length} ${selectedSessions.length === 1 ? "session" : "sessions"}? This action cannot be undone.`}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 rounded-full font-medium transition-transform active:scale-95"
                    style={{
                      backgroundColor: themeConfig.colors.surface,
                      color: themeConfig.colors.textSecondary,
                      border: `1px solid ${themeConfig.colors.border}`,
                    }}
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={deleteSelectedSessions}
                    className="flex-1 py-3 rounded-full font-medium transition-transform active:scale-95"
                    style={{
                      backgroundColor: themeConfig.colors.error,
                      color: "#ffffff",
                    }}
                  >
                    {t.delete}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Session Modal */}
        {editingSession && <SessionEditModal session={editingSession} isOpen={!!editingSession} onClose={() => setEditingSession(null)} onSave={(updates) => handleSaveSession(editingSession.id, updates)} />}
      </div>

      {/* Search Results Overlay */}
      {isSearchFocused && searchQuery && (
        <div className="fixed inset-x-0 top-[120px] bottom-0 z-40 p-4 animate-fade-in" onClick={() => setIsSearchFocused(false)}>
          <div
            className="max-w-md mx-auto rounded-2xl shadow-2xl border overflow-hidden"
            style={{
              backgroundColor: themeConfig.colors.surface,
              borderColor: themeConfig.colors.border,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: themeConfig.colors.border }}>
              <h3 className="font-semibold" style={{ color: themeConfig.colors.text }}>
                {language === "pt-BR" ? "Resultados da Busca" : "Search Results"}
              </h3>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredSessions.length > 0 ? (
                filteredSessions.slice(0, 5).map((session) => (
                  <Link key={session.id} to={`/session/${session.id}`} className="block p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <p className="font-medium truncate" style={{ color: themeConfig.colors.text }}>
                      {session.contexts.join(", ")}
                    </p>
                    <p className="text-xs" style={{ color: themeConfig.colors.textMuted }}>
                      {formatDate(session.createdAt, language)}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center" style={{ color: themeConfig.colors.textSecondary }}>
                  {language === "pt-BR" ? "Nenhum resultado encontrado" : "No results found"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Back to top button - appears when scrolling down */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        style={{
          backgroundColor: themeConfig.colors.primary,
          color: "#ffffff",
          opacity: 0.9,
          display: "none", // Initially hidden, would be shown with JS on scroll
        }}
      >
        <ArrowLeft className="w-5 h-5 transform rotate-90" />
      </button>
    </div>
  );
}
