import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Enhanced LaTeX Renderer component: Parses and renders arbitrary LaTeX syntax
 * Recognizes:
 *  - Block math: $$...$$, \[...\]
 *  - Inline math: $...$, \(...\)
 *  - Escaped delimiters and nested content
 *  - Automatic spacing around inline math
 */
export default function LaTeXRenderer({ content, className = '' }) {
  // More comprehensive regex that catches all LaTeX patterns
  const TOKEN_REGEX = /\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$(?!\$)[^$\n]*?\$|\\\([^)]*?\\\)|\\[a-zA-Z]+(?:\{[^}]*\})*|\\[a-zA-Z]+\s*\([^)]*\)|[a-zA-Z]*\([^)]*\)\s*=\s*[^,\s]+/g;

  const renderContent = (text) => {
    if (!text) return null;

    const elements = [];
    let lastIndex = 0;
    let matchIndex = 0;

    const addText = (str) => {
      if (!str) return;
      // Preserve line breaks in plain text
      str.split('\n').forEach((segment, i, arr) => {
        if (segment) {
          elements.push(
            <React.Fragment key={`text-${matchIndex}-${elements.length}`}>
              {segment}
            </React.Fragment>
          );
        }
        if (i < arr.length - 1) {
          elements.push(<br key={`br-${matchIndex}-${elements.length}`} />);
        }
      });
    };

    const addSpacedText = (str, addSpaceBefore = false, addSpaceAfter = false) => {
      if (!str) return;
      
      let finalStr = str;
      if (addSpaceBefore && elements.length > 0) {
        finalStr = ' ' + finalStr;
      }
      if (addSpaceAfter) {
        finalStr = finalStr + ' ';
      }
      
      addText(finalStr);
    };

    // Enhanced pattern matching for LaTeX expressions
    let m;
    while ((m = TOKEN_REGEX.exec(text))) {
      const token = m[0];
      const idx = m.index;

      // Add preceding text
      if (lastIndex < idx) {
        const precedingText = text.slice(lastIndex, idx);
        addText(precedingText);
      }

      // Determine if this is a math expression and what type
      let math = '';
      let Component = InlineMath;
      let isValidMath = false;

      // Block math patterns
      if (token.startsWith('$$') && token.endsWith('$$') && token.length > 4) {
        math = token.slice(2, -2).trim();
        Component = BlockMath;
        isValidMath = true;
      } else if (token.startsWith('\\[') && token.endsWith('\\]')) {
        math = token.slice(2, -2).trim();
        Component = BlockMath;
        isValidMath = true;
      }
      // Inline math patterns
      else if (token.startsWith('$') && token.endsWith('$') && token.length > 2 && !token.startsWith('$$')) {
        math = token.slice(1, -1).trim();
        Component = InlineMath;
        isValidMath = true;
      } else if (token.startsWith('\\(') && token.endsWith('\\)')) {
        math = token.slice(2, -2).trim();
        Component = InlineMath;
        isValidMath = true;
      }
      // LaTeX commands and functions
      else if (token.match(/^\\[a-zA-Z]+/)) {
        math = token;
        Component = InlineMath;
        isValidMath = true;
      }
      // Mathematical expressions like f(x) = x^2
      else if (token.match(/^[a-zA-Z]*\([^)]*\)\s*=\s*[^,\s]+/)) {
        math = token;
        Component = InlineMath;
        isValidMath = true;
      }

      if (isValidMath && math) {
        try {
          // Clean up the math expression
          let cleanMath = math
            .replace(/&nbsp;/g, ' ')
            .replace(/\u00A0/g, ' ')
            .trim();

          // Fix common LaTeX issues
          cleanMath = cleanMath
            .replace(/\\frac\s*\{([^}]*)\}\s*\{([^}]*)\}/g, '\\frac{$1}{$2}')
            .replace(/\\lim\s*_\s*\{([^}]*)\}/g, '\\lim_{$1}')
            .replace(/\\int\s*_\s*\{([^}]*)\}\s*\^\s*\{([^}]*)\}/g, '\\int_{$1}^{$2}')
            .replace(/\s+/g, ' ');

          // Check if we need spacing around inline math
          const needsSpaceBefore = Component === InlineMath && 
            lastIndex < idx && 
            text.charAt(idx - 1).match(/[a-zA-Z0-9]/);
          
          const needsSpaceAfter = Component === InlineMath && 
            idx + token.length < text.length && 
            text.charAt(idx + token.length).match(/[a-zA-Z0-9]/);

          if (Component === BlockMath) {
            elements.push(
              <div key={`math-block-${matchIndex}`} className="my-4 text-center">
                <BlockMath math={cleanMath} />
              </div>
            );
          } else {
            // Add space before if needed
            if (needsSpaceBefore) {
              elements.push(
                <React.Fragment key={`space-before-${matchIndex}`}> </React.Fragment>
              );
            }
            
            elements.push(
              <InlineMath key={`math-inline-${matchIndex}`} math={cleanMath} />
            );
            
            // Add space after if needed
            if (needsSpaceAfter) {
              elements.push(
                <React.Fragment key={`space-after-${matchIndex}`}> </React.Fragment>
              );
            }
          }
        } catch (err) {
          console.error('KaTeX render error:', err, 'for expression:', math);
          // Enhanced error display
          elements.push(
            <span key={`math-error-${matchIndex}`} className="inline-block bg-red-50 text-red-700 px-2 py-1 rounded text-sm border border-red-200">
              <span className="font-mono text-xs">LaTeX Error:</span> {token}
            </span>
          );
        }
      } else {
        // Not a math expression, treat as regular text
        addText(token);
      }

      lastIndex = idx + token.length;
      matchIndex++;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      addText(text.slice(lastIndex));
    }

    return elements;
  };

  return <div className={className}>{renderContent(content)}</div>;
}