// useNodeFields.js
//
// Manages all field state for a node and derives dynamic handles
// from {{variable}} patterns found in textarea values.
//
// Returns:
//   fields     — { [key]: value } current state of all fields
//   setField   — (key, value) => void  setter
//   varHandles — array of { id, label } for each unique {{var}} found

import { useState, useMemo } from 'react';

const VAR_PATTERN = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;

function extractVars(text) {
  const vars = [];
  const seen = new Set();
  let match;
  // Reset lastIndex since the regex is module-level and shared
  VAR_PATTERN.lastIndex = 0;
  while ((match = VAR_PATTERN.exec(text)) !== null) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      vars.push(name);
    }
  }
  return vars;
}

export function useNodeFields(nodeId, fieldConfigs, data) {
  // Build initial state from config defaults, falling back to saved data
  const initialState = Object.fromEntries(
    fieldConfigs.map((f) => {
      const saved = data?.[f.key];
      const defaultVal =
        typeof f.default === 'function'
          ? f.default(nodeId)
          : f.default ?? '';
      return [f.key, saved !== undefined ? saved : defaultVal];
    })
  );

  const [fields, setFields] = useState(initialState);

  const setField = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  // Derive dynamic handles from any textarea field with extractVars: true
  const varHandles = useMemo(() => {
    const handles = [];
    fieldConfigs.forEach((f) => {
      if (f.type === 'textarea' && f.extractVars) {
        const vars = extractVars(fields[f.key] || '');
        vars.forEach((v) => handles.push({ id: `${nodeId}-${v}`, label: v }));
      }
    });
    return handles;
  }, [nodeId, fieldConfigs, fields]);

  return { fields, setField, varHandles };
}
