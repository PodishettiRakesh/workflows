// index.js  (nodes/)
//
// createNode(config) — factory that returns a React component bound to
// a specific config.  Every named node export below is just this factory
// called once with its config.
//
// To add a new node:
//   1. Add a config object in nodeConfigs.js
//   2. Add one line here:  export const MyNode = createNode(myNodeConfig);
//   3. Register it in nodeTypes (wherever you wire up ReactFlow)
//
// That's it.  No new component file, no new hook, no new styles.

import { BaseNode } from './BaseNode';
import {
  inputNodeConfig,
  llmNodeConfig,
  outputNodeConfig,
  textNodeConfig,
  httpRequestNodeConfig,
  codeNodeConfig,
  conditionalNodeConfig,
  noteNodeConfig,
  dataTransformNodeConfig,
} from './nodeConfigs';

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createNode(config) {
  // Return a named function so React DevTools shows a useful display name
  const NodeComponent = function NodeComponent(props) {
    return <BaseNode {...props} config={config} />;
  };
  NodeComponent.displayName = `Node(${config.label})`;
  return NodeComponent;
}

// ─── Named exports ────────────────────────────────────────────────────────────

export const InputNode      = createNode(inputNodeConfig);
export const LLMNode        = createNode(llmNodeConfig);
export const OutputNode     = createNode(outputNodeConfig);
export const TextNode       = createNode(textNodeConfig);

// New nodes — each is the same pattern, each costs one line
export const HttpRequestNode  = createNode(httpRequestNodeConfig);
export const CodeNode         = createNode(codeNodeConfig);
export const ConditionalNode  = createNode(conditionalNodeConfig);
export const NoteNode         = createNode(noteNodeConfig);
export const DataTransformNode = createNode(dataTransformNodeConfig);

// ─── ReactFlow nodeTypes map ──────────────────────────────────────────────────
// Import this object wherever you configure ReactFlow.
// Add entries here whenever you add a new node above.

export const nodeTypes = {
  customInput:     InputNode,
  llm:       LLMNode,
  customOutput:    OutputNode,
  text:      TextNode,
  customHttp:      HttpRequestNode,
  customCode:      CodeNode,
  customConditional: ConditionalNode,
  customNote:      NoteNode,
  customTransform: DataTransformNode,
};
