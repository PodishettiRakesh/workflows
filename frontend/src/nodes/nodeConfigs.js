// nodeConfigs.js
//
// One config object per node type. This is the only file you need to
// touch to add a new node — no new components, no new state management.
//
// Config schema:
// {
//   label:   string           — displayed in the node header
//   icon:    string           — emoji or short symbol shown before label
//   badge:   string           — optional pill tag (e.g. "AI", "Beta")
//   width:   number           — min-width in px
//   handles: {
//     inputs:  HandleDef[]
//     outputs: HandleDef[]
//   }
//   fields:  FieldDef[]
// }
//
// HandleDef: { id: string, label?: string, topPercent?: number }
//   - id:          appended to nodeId → "{nodeId}-{id}"
//   - label:       shown next to the handle dot
//   - topPercent:  explicit vertical position (0–100); auto-distributed if omitted
//
// FieldDef: { key, type, label, default, options, placeholder, extractVars, ... }
//   - key:         used as the state key; also passed to data prop
//   - type:        text | number | select | textarea | toggle | static
//   - default:     value OR function(nodeId) => value
//   - extractVars: (textarea only) scan for {{varName}} and create handles
//   - content:     (static only) the text to display

// ─── Original 4 nodes ─────────────────────────────────────────────────────────

export const inputNodeConfig = {
  label: 'Input',
  icon: '→',
  width: 220,
  handles: {
    inputs: [],
    outputs: [{ id: 'value', label: 'value' }],
  },
  fields: [
    {
      key: 'inputName',
      type: 'text',
      label: 'Name',
      default: (id) => id.replace('customInput-', 'input_'),
      placeholder: 'input_name',
    },
    {
      key: 'inputType',
      type: 'select',
      label: 'Type',
      default: 'Text',
      options: ['Text', 'File'],
    },
  ],
};

export const llmNodeConfig = {
  label: 'LLM',
  icon: '✦',
  badge: 'AI',
  width: 220,
  handles: {
    inputs: [
      { id: 'system', label: 'system', topPercent: 33 },
      { id: 'prompt', label: 'prompt', topPercent: 67 },
    ],
    outputs: [{ id: 'response', label: 'response' }],
  },
  fields: [
    {
      key: 'model',
      type: 'select',
      label: 'Model',
      default: 'gpt-4o',
      options: [
        { value: 'gpt-4o',       label: 'GPT-4o' },
        { value: 'gpt-4o-mini',  label: 'GPT-4o mini' },
        { value: 'claude-3-5',   label: 'Claude 3.5' },
        { value: 'gemini-1.5',   label: 'Gemini 1.5' },
      ],
    },
    {
      key: 'temperature',
      type: 'number',
      label: 'Temperature',
      default: 0.7,
      min: 0,
      max: 2,
      step: 0.1,
    },
  ],
};

export const outputNodeConfig = {
  label: 'Output',
  icon: '←',
  width: 220,
  handles: {
    inputs: [{ id: 'value', label: 'value' }],
    outputs: [],
  },
  fields: [
    {
      key: 'outputName',
      type: 'text',
      label: 'Name',
      default: (id) => id.replace('customOutput-', 'output_'),
      placeholder: 'output_name',
    },
    {
      key: 'outputType',
      type: 'select',
      label: 'Type',
      default: 'Text',
      options: ['Text', 'Image', 'File'],
    },
  ],
};

export const textNodeConfig = {
  label: 'Text',
  icon: 'T',
  width: 240,
  handles: {
    inputs: [],  // dynamic handles added by {{variable}} extraction
    outputs: [{ id: 'output', label: 'output' }],
  },
  fields: [
    {
      key: 'text',
      type: 'textarea',
      label: 'Text',
      default: '',
      placeholder: 'Enter text… use {{variable}} to create input handles',
      rows: 4,
      extractVars: true,  // triggers {{var}} → Handle logic in BaseNode
    },
  ],
};

// ─── 5 new nodes ──────────────────────────────────────────────────────────────
// Each is just a config object. No new component, no new state logic.

// 1. HTTP Request — fetch data from an external endpoint
export const httpRequestNodeConfig = {
  label: 'HTTP Request',
  icon: '⇄',
  width: 240,
  handles: {
    inputs:  [{ id: 'body',    label: 'body' }],
    outputs: [{ id: 'response', label: 'response' },
              { id: 'status',   label: 'status' }],
  },
  fields: [
    {
      key: 'method',
      type: 'select',
      label: 'Method',
      default: 'GET',
      options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    {
      key: 'url',
      type: 'text',
      label: 'URL',
      default: '',
      placeholder: 'https://api.example.com/data',
    },
    {
      key: 'headers',
      type: 'textarea',
      label: 'Headers (JSON)',
      default: '{}',
      rows: 2,
    },
  ],
};

// 2. Code — run a snippet of code on the input
export const codeNodeConfig = {
  label: 'Code',
  icon: '</>',
  badge: 'JS',
  width: 260,
  handles: {
    inputs:  [{ id: 'input', label: 'input' }],
    outputs: [{ id: 'output', label: 'output' },
              { id: 'error',  label: 'error'  }],
  },
  fields: [
    {
      key: 'language',
      type: 'select',
      label: 'Language',
      default: 'javascript',
      options: [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python',     label: 'Python'     },
        { value: 'bash',       label: 'Bash'       },
      ],
    },
    {
      key: 'code',
      type: 'textarea',
      label: 'Code',
      default: '// input is available as `input`\nreturn input;',
      rows: 5,
      placeholder: '// write your transform here',
    },
  ],
};

// 3. Conditional — branch the pipeline on a boolean condition
export const conditionalNodeConfig = {
  label: 'Conditional',
  icon: '⑂',
  width: 230,
  handles: {
    inputs:  [{ id: 'value',     label: 'value'     }],
    outputs: [{ id: 'true',      label: 'true',  topPercent: 35 },
              { id: 'false',     label: 'false', topPercent: 65 }],
  },
  fields: [
    {
      key: 'condition',
      type: 'select',
      label: 'Condition',
      default: 'equals',
      options: [
        { value: 'equals',      label: 'equals'         },
        { value: 'not_equals',  label: 'not equals'     },
        { value: 'contains',    label: 'contains'       },
        { value: 'greater_than',label: 'greater than'   },
        { value: 'less_than',   label: 'less than'      },
        { value: 'is_empty',    label: 'is empty'       },
      ],
    },
    {
      key: 'compareValue',
      type: 'text',
      label: 'Compare to',
      default: '',
      placeholder: 'value to compare against',
    },
  ],
};

// 4. Note — a sticky note for documenting the pipeline (no handles)
export const noteNodeConfig = {
  label: 'Note',
  icon: '✎',
  width: 200,
  handles: {
    inputs:  [],
    outputs: [],
  },
  fields: [
    {
      key: 'note',
      type: 'textarea',
      label: '',
      default: '',
      placeholder: 'Add a note for your pipeline…',
      rows: 4,
    },
  ],
};

// 5. Data Transform — apply a named transform to structured data
export const dataTransformNodeConfig = {
  label: 'Transform',
  icon: '⇌',
  width: 230,
  handles: {
    inputs:  [{ id: 'data',   label: 'data'   }],
    outputs: [{ id: 'result', label: 'result' }],
  },
  fields: [
    {
      key: 'operation',
      type: 'select',
      label: 'Operation',
      default: 'json_parse',
      options: [
        { value: 'json_parse',    label: 'JSON → object'  },
        { value: 'json_stringify',label: 'Object → JSON'  },
        { value: 'base64_encode', label: 'Base64 encode'  },
        { value: 'base64_decode', label: 'Base64 decode'  },
        { value: 'url_encode',    label: 'URL encode'     },
        { value: 'trim',          label: 'Trim whitespace'},
        { value: 'uppercase',     label: 'Uppercase'      },
        { value: 'lowercase',     label: 'Lowercase'      },
      ],
    },
    {
      key: 'strict',
      type: 'toggle',
      label: 'Strict mode',
      default: false,
    },
  ],
};
