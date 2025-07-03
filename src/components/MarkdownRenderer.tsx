import 'highlight.js/styles/github.css';
import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark, materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeHighlight from 'rehype-highlight';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  darkMode?: boolean;
}

/**
 * Enhanced mathematical expression processor for human readability
 */
export function processMathematicalExpressions(text: string): string {
  // Enhanced LaTeX to human-readable conversion
  let processed = text;

  // Handle fractions with improved readability
  processed = processed.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (_match, numerator, denominator) => {
    // Clean up the numerator and denominator
    const cleanNum = processMathematicalExpressions(numerator.replace(/\\/g, '').trim());
    const cleanDen = processMathematicalExpressions(denominator.replace(/\\/g, '').trim());
    
    return `(${cleanNum})/(${cleanDen})`;
  });

  // Handle limits with better formatting
  processed = processed.replace(/\\lim_\{([^}]+)\}/g, (_match, subscript) => {
    const cleanSub = subscript.replace(/\\/g, '').replace(/to/g, '→').trim();
    return `lim (${cleanSub})`;
  });

  // Handle integrals
  processed = processed.replace(/\\int_\{([^}]+)\}\^\{([^}]+)\}/g, (_match, lower, upper) => {
    return `∫ from ${lower} to ${upper}`;
  });

  // Handle summations
  processed = processed.replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, (_match, lower, upper) => {
    return `Σ (${lower} to ${upper})`;
  });

  // Handle square roots
  processed = processed.replace(/\\sqrt\{([^}]+)\}/g, (_match, content) => {
    return `√(${content})`;
  });

  // Handle powers/exponents with better formatting
  processed = processed.replace(/\^(\d+)/g, (_match, exp) => {
    const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
    if (exp.length === 1 && parseInt(exp) < 10) {
      return superscripts[parseInt(exp)];
    }
    return `^${exp}`;
  });

  // Handle complex exponents
  processed = processed.replace(/\^\{([^}]+)\}/g, (_match, exp) => {
    return `^(${exp})`;
  });

  // Handle subscripts
  processed = processed.replace(/_\{([^}]+)\}/g, (_match, sub) => {
    return `₍${sub}₎`;
  });

  // Handle simple subscripts
  processed = processed.replace(/_(\d+)/g, (_match, sub) => {
    const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    if (sub.length === 1 && parseInt(sub) < 10) {
      return subscripts[parseInt(sub)];
    }
    return `₍${sub}₎`;
  });

  // Mathematical symbols conversion
  const symbolMap: Record<string, string> = {
    '\\to': '→',
    '\\rightarrow': '→',
    '\\leftarrow': '←',
    '\\infty': '∞',
    '\\pi': 'π',
    '\\theta': 'θ',
    '\\alpha': 'α',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\delta': 'δ',
    '\\epsilon': 'ε',
    '\\lambda': 'λ',
    '\\mu': 'μ',
    '\\sigma': 'σ',
    '\\phi': 'φ',
    '\\omega': 'ω',
    '\\pm': '±',
    '\\mp': '∓',
    '\\times': '×',
    '\\div': '÷',
    '\\leq': '≤',
    '\\geq': '≥',
    '\\neq': '≠',
    '\\approx': '≈',
    '\\equiv': '≡',
    '\\partial': '∂',
    '\\nabla': '∇',
    '\\cdot': '·',
    '\\bullet': '•',
    '\\cap': '∩',
    '\\cup': '∪',
    '\\subset': '⊂',
    '\\supset': '⊃',
    '\\in': '∈',
    '\\notin': '∉',
    '\\forall': '∀',
    '\\exists': '∃',
    '\\emptyset': '∅'
  };

  // Apply symbol conversions
  Object.entries(symbolMap).forEach(([latex, symbol]) => {
    processed = processed.replace(new RegExp(latex.replace(/\\/g, '\\\\'), 'g'), symbol);
  });

  // Clean up remaining LaTeX artifacts
  processed = processed.replace(/\\\\/g, ' ');
  processed = processed.replace(/\\([a-zA-Z]+)/g, '$1');
  processed = processed.replace(/\{([^}]+)\}/g, '$1');

  // Improve spacing around mathematical operators
  processed = processed.replace(/([+\-=<>≤≥≠≈≡])/g, ' $1 ');
  processed = processed.replace(/\s+/g, ' ');

  return processed.trim();
}

/**
 * Check if content contains mathematical expressions
 */
function containsMathematicalContent(text: string): boolean {
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
 * Enterprise-grade Markdown renderer with enhanced mathematical expression support
 */
export default function MarkdownRenderer({
  content,
  className = '',
  darkMode = false,
}: MarkdownRendererProps) {
  // Process mathematical expressions in the content before rendering
  const processedContent = useMemo(() => {
    let processed = content.trim();
    
    // If the content contains mathematical expressions, process them
    if (containsMathematicalContent(processed)) {
      processed = processMathematicalExpressions(processed);
    }
    
    return processed;
  }, [content]);

  if (!content) return null;
  return (
    <div className={`markdown-renderer ${className}`}>      
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const codeText = String(children).replace(/\n$/, '');
            const match = /language-(\w+)/.exec(className || '');
            const lang = match?.[1] ?? '';

            // Check if this is a mathematical expression
            if (containsMathematicalContent(codeText)) {
              const processedMath = processMathematicalExpressions(codeText);
              
              if (inline) {
                return (
                  <span 
                    className="inline-block px-2 py-1 bg-blue-50 text-blue-900 rounded font-serif text-base font-medium border border-blue-200"
                    {...props}
                  >
                    {processedMath}
                  </span>
                );
              } else {
                  // @ts-ignore
                  return <div 
                    className="my-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center"
                    {...props}
                  >
                    <div className="text-xl font-serif font-bold text-blue-900 leading-relaxed">
                      {processedMath}
                    </div>
                  </div>
              }
            }

            // Regular inline code
            if (inline) {
              return (
                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm text-gray-800 dark:text-gray-200" {...props}>
                  {codeText}
                </code>
              );
            }

            // Block code with syntax highlighting
            return (
              <div className="relative my-4">
                <SyntaxHighlighter
                  language={lang}
                  ref={props.ref as any}
                  style={darkMode ? materialDark : materialLight as any}
                  showLineNumbers
                  PreTag="div"
                  className="rounded-lg"
                  {...props}
                >
                  {codeText}
                </SyntaxHighlighter>
                <button
                  onClick={() => navigator.clipboard.writeText(codeText)}
                  className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded shadow-sm text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  title="Copy code"
                >
                  Copy
                </button>
              </div>
            );
          },
          
          // Enhanced paragraph handling for mathematical content
          p({ children }) {
            const textContent = String(children);
            
            if (containsMathematicalContent(textContent)) {
              const processedContent = processMathematicalExpressions(textContent);
              
              return (
                <div className="my-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-lg font-serif font-semibold text-blue-900 leading-relaxed text-center">
                    {processedContent}
                  </div>
                </div>
              );
            }
            
            return <p className="mb-4 leading-relaxed">{children}</p>;
          },
          
          a({ href, children }) {
            return (
              <a
                href={href}
                className="text-blue-600 hover:text-blue-800 underline transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          
          // Enhanced list styling
          ul({ children }) {
            return <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>;
          },
          
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>;
          },
          
          // Enhanced blockquote styling
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-blue-900 rounded-r-lg">
                {children}
              </blockquote>
            );
          },
          
          // Enhanced heading styles
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>;
          },
          
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 text-gray-900">{children}</h2>;
          },
          
          h3({ children }) {
            return <h3 className="text-lg font-bold mb-2 text-gray-900">{children}</h3>;
          },
          
          // Enhanced table styling
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
                  {children}
                </table>
              </div>
            );
          },
          
          th({ children }) {
            return (
              <th className="px-4 py-2 bg-gray-100 border-b border-gray-300 text-left font-semibold text-gray-900">
                {children}
              </th>
            );
          },
          
          td({ children }) {
            return (
              <td className="px-4 py-2 border-b border-gray-200 text-gray-800">
                {children}
              </td>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}