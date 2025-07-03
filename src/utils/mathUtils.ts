import { processMathematicalExpressions } from '../components/MarkdownRenderer';

/**
 * Utility function to process mathematical expressions in any text content
 */
export function formatMathematicalText(text: string): string {
  if (!text) return text;
  
  return processMathematicalExpressions(text);
}

/**
 * Check if text contains mathematical expressions
 */
export function containsMath(text: string): boolean {
  const mathPatterns = [
    /\\frac\{/,
    /\\lim_/,
    /\\int_/,
    /\\sum_/,
    /\\sqrt\{/,
    /\^[\d{]/,
    /_[\d{]/,
    /\\[a-zA-Z]+/,
    /[∫∑∏∂∇√∞π]/,
    /[αβγδεθλμσφω]/,
    /[≤≥≠≈≡±∓×÷]/
  ];
  
  return mathPatterns.some(pattern => pattern.test(text));
}

/**
 * Process an array of strings (like multiple choice options) for mathematical expressions
 */
export function formatMathematicalOptions(options: string[]): string[] {
  return options.map(option => formatMathematicalText(option));
}