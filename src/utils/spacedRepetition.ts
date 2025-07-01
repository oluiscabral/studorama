import { Question, SpacedRepetitionData } from '../types';

export function calculateNextReview(question: Question, spacedRepetitionData: SpacedRepetitionData): string {
  const now = new Date();
  let interval = 1; // Default to 1 day
  
  if (question.isCorrect) {
    // Successful recall - increase interval
    if (question.reviewCount === 0) {
      interval = 1; // First review after 1 day
    } else if (question.reviewCount === 1) {
      interval = 3; // Second review after 3 days
    } else {
      // Use spaced repetition algorithm
      const previousInterval = spacedRepetitionData.reviewIntervals[Math.min(question.reviewCount - 1, spacedRepetitionData.reviewIntervals.length - 1)];
      interval = Math.round(previousInterval * spacedRepetitionData.easeFactor);
    }
    
    // Adjust ease factor based on confidence
    if (question.confidence && question.confidence >= 4) {
      spacedRepetitionData.easeFactor = Math.min(2.5, spacedRepetitionData.easeFactor + 0.1);
    }
  } else {
    // Failed recall - reset to beginning
    interval = 1;
    spacedRepetitionData.easeFactor = Math.max(1.3, spacedRepetitionData.easeFactor - 0.2);
  }
  
  const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
  return nextReview.toISOString();
}

export function shouldReviewQuestion(question: Question): boolean {
  if (!question.nextReview) return false;
  
  const now = new Date();
  const reviewDate = new Date(question.nextReview);
  
  return now >= reviewDate;
}

export function getReviewQuestions(questions: Question[]): Question[] {
  return questions.filter(shouldReviewQuestion);
}

export function calculateRetentionStrength(question: Question): number {
  if (!question.lastReviewed) return 0;
  
  const daysSinceReview = (Date.now() - new Date(question.lastReviewed).getTime()) / (1000 * 60 * 60 * 24);
  const baseStrength = question.retrievalStrength || 0.5;
  
  // Forgetting curve - strength decreases over time
  const forgettingRate = 0.1; // Adjust based on difficulty
  const currentStrength = baseStrength * Math.exp(-forgettingRate * daysSinceReview);
  
  return Math.max(0, Math.min(1, currentStrength));
}