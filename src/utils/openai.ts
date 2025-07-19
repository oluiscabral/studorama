import JSON5 from 'json5';

/**
 * Robustly extract JSON or JSON5 content from arbitrary strings
 */
export function extractJSON(raw: string): string {
  let text = raw;

  // Remove BOM
  text = text.replace(/^\uFEFF/, '');

  // If there's a JSON code fence, extract that content first
  const fenceMatch = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1];
  }
  // Otherwise, remove other fences and markers but keep content
  else {
    // Strip generic code fences (``` … ```)
    text = text.replace(/```[\s\S]*?```/g, match => {
      // preserve inner content if it looks like JSON
      const inner = match.replace(/```/g, '');
      if (/^[\s]*[{\[]/.test(inner)) {
        return inner;
      }
      return '';
    });
  }

  // Remove any leading/trailing non-json text before first brace
  const first = text.search(/[\[{]/);
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    text = text.substring(first, last + 1);
  }

  // Only remove specific control characters
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
             .replace(/`/g, '');

  // Remove trailing commas
  text = text.replace(/,\s*([}\]])/g, '$1');

  return text.trim();
}

export function parseJSON(raw: string): any {
  const jsonString = extractJSON(raw);
  
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    try {
      return JSON5.parse(jsonString);
    } catch (e2) {
      // Try to fix common truncation issues
      let fixedJson = jsonString;
      
      try {
        // If the JSON ends with an incomplete string, try to close it
        if (fixedJson.match(/[^"\\]"[^"]*$/)) {
          fixedJson = fixedJson.replace(/([^"\\]"[^"]*)$/, '$1"');
        }
        
        // If there's an incomplete array, try to close it
        if (fixedJson.match(/\[[^\]]*$/)) {
          fixedJson = fixedJson + ']';
        }
        
        // If there's an incomplete object, try to close it
        const openBraces = (fixedJson.match(/\{/g) || []).length;
        const closeBraces = (fixedJson.match(/\}/g) || []).length;
        const missingBraces = openBraces - closeBraces;
        
        if (missingBraces > 0) {
          fixedJson = fixedJson + '}'.repeat(missingBraces);
        }
        
        // Try parsing the fixed JSON
        return JSON.parse(fixedJson);
      } catch (e3) {
        try {
          return JSON5.parse(fixedJson);
        } catch (e4) {
          console.error('Failed to parse JSON string:', jsonString);
          // @ts-ignore
          console.error('Original error:', e.message);
          // @ts-ignore
          console.error('JSON5 error:', e2.message);
          // @ts-ignore
          console.error('Recovery attempt error:', e4.message);
          throw new Error(`Parsing error: Response appears to be truncated. Please try again with a shorter question or check your OpenAI API limits.`);
        }
      }
    }
  }
}
