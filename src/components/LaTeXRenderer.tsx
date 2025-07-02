import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface LaTeXRendererProps {
  content: string;
  className?: string;
}

export default function LaTeXRenderer({ content, className = '' }: LaTeXRendererProps) {
  // Function to parse and render LaTeX content
  const renderContent = (text: string) => {
    // Split by block math delimiters ($$...$$)
    const blockParts = text.split(/(\$\$[\s\S]*?\$\$)/);
    
    return blockParts.map((part, blockIndex) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math
        const math = part.slice(2, -2).trim();
        try {
          return (
            <div key={blockIndex} className="my-4 text-center">
              <BlockMath math={math} />
            </div>
          );
        } catch (error) {
          console.error('LaTeX block math error:', error);
          return (
            <div key={blockIndex} className="my-4 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              LaTeX Error: {part}
            </div>
          );
        }
      } else {
        // Split by inline math delimiters ($...$)
        const inlineParts = part.split(/(\$[^$]+?\$)/);
        
        return inlineParts.map((inlinePart, inlineIndex) => {
          if (inlinePart.startsWith('$') && inlinePart.endsWith('$') && inlinePart.length > 2) {
            // Inline math
            const math = inlinePart.slice(1, -1).trim();
            try {
              return <InlineMath key={`${blockIndex}-${inlineIndex}`} math={math} />;
            } catch (error) {
              console.error('LaTeX inline math error:', error);
              return (
                <span key={`${blockIndex}-${inlineIndex}`} className="bg-red-50 text-red-700 px-1 rounded text-sm">
                  LaTeX Error: {inlinePart}
                </span>
              );
            }
          } else {
            // Regular text
            return inlinePart;
          }
        });
      }
    });
  };

  return (
    <div className={className}>
      {renderContent(content)}
    </div>
  );
}