import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * LaTeXRenderer component: Parses and renders arbitrary LaTeX syntax
 * Recognizes:
 *  - Block math: $$...$$, \[...\]
 *  - Inline math: $...$, \(...\)
 *  - Escaped delimiters and nested content
 */
export default function LaTeXRenderer({ content, className = '' }) {
  const TOKEN_REGEX = /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$(?!\$)[^$\n]+?\$|\\\([^\n]+?\\\)/g;

  const renderContent = (text) => {
    if (!text) return null;

    const elements = [];
    let lastIndex = 0;
    let matchIndex = 0;

    const addText = (str) => {
      // Preserve line breaks in plain text
      str.split('\n').forEach((segment, i, arr) => {
        elements.push(
          <React.Fragment key={`text-${matchIndex}-${elements.length}`}>
            {segment}
            {i < arr.length - 1 && <br />}
          </React.Fragment>
        );
      });
    };

    // Iterate through all matches of math tokens
    let m;
    while ((m = TOKEN_REGEX.exec(text))) {
      const token = m[0];
      const idx = m.index;

      // Add preceding text
      if (lastIndex < idx) {
        addText(text.slice(lastIndex, idx));
      }

      // Determine type and strip delimiters
      let math = '';
      let Component = InlineMath;
      if (token.startsWith('$$') && token.endsWith('$$')) {
        math = token.slice(2, -2).trim();
        Component = BlockMath;
      } else if (token.startsWith('\\[') && token.endsWith('\\]')) {
        math = token.slice(2, -2).trim();
        Component = BlockMath;
      } else if (token.startsWith('$') && token.endsWith('$')) {
        math = token.slice(1, -1).trim();
        Component = InlineMath;
      } else if (token.startsWith('\\(') && token.endsWith('\\)')) {
        math = token.slice(2, -2).trim();
        Component = InlineMath;
      }

      // Render the math or an error block
      if (math) {
        try {
          elements.push(
            Component === BlockMath ? (
              <div key={`math-block-${matchIndex}`} className="my-4 text-center">
                <BlockMath math={math} />
              </div>
            ) : (
              <InlineMath key={`math-inline-${matchIndex}`} math={math} />
            )
          );
        } catch (err) {
          console.error('KaTeX render error:', err);
          elements.push(
            <span key={`math-error-${matchIndex}`} className="bg-red-50 text-red-700 px-1 rounded text-sm">
              LaTeX Error: {token}
            </span>
          );
        }
      } else {
        // Fallback if somehow no math extracted
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
