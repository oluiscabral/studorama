export interface TimerSettings {
  sessionTimerEnabled: boolean;
  sessionTimerDuration?: number; // in minutes
  questionTimerEnabled: boolean;
  questionTimerDuration?: number; // in seconds
  accumulateQuestionTime: boolean;
  showTimerWarnings: boolean;
  autoSubmitOnTimeout: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export interface SessionTimer {
  startTime: string;
  endTime?: string;
  pausedTime?: number; // accumulated paused time in ms
  isPaused: boolean;
  totalElapsed?: number; // in ms
}

export interface QuestionTimer {
  questionId: string;
  startTime: string;
  endTime?: string;
  pausedTime?: number;
  timeSpent: number; // in ms
  accumulatedTime?: number; // from previous questions if accumulating
  timedOut: boolean;
}

// Timer preferences stored globally with auto-save
export interface TimerPreferences {
  rememberChoice: boolean;
  defaultSessionTimerEnabled: boolean;
  defaultSessionTimer: number; // in minutes
  defaultQuestionTimerEnabled: boolean;
  defaultQuestionTimer: number; // in seconds
  defaultAccumulateTime: boolean;
  defaultShowWarnings: boolean;
  defaultAutoSubmit: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}