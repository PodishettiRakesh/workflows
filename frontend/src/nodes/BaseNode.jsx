// BaseNode.jsx
//
// The single component that renders every node type.
// Driven entirely by a config object — never subclassed.
//
// Config shape:
// {
//   label:   string                        — node header title
//   width:   number                        — min width in px (default 220)
//   handles: {
//     inputs:  [{ id, label, topPercent }]  — left-side target handles
//     outputs: [{ id, label, topPercent }]  — right-side source handles
//   }
//   fields: [
//     { key, type, label, default, options, extractVars, placeholder }
//   ]
// }
//
// Field types:  text | select | textarea | number | toggle

import { useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { useNodeFields } from './useNodeFields';

// ─── Field renderers ──────────────────────────────────────────────────────────

function FieldText({ config, value, onChange }) {
  return (
    <div className="bf-field">
      {config.label && <label className="bf-label">{config.label}</label>}
      <input
        className="bf-input"
        type="text"
        value={value}
        placeholder={config.placeholder || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function FieldNumber({ config, value, onChange }) {
  return (
    <div className="bf-field">
      {config.label && <label className="bf-label">{config.label}</label>}
      <input
        className="bf-input bf-input--number"
        type="number"
        value={value}
        min={config.min}
        max={config.max}
        step={config.step || 1}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function FieldSelect({ config, value, onChange }) {
  return (
    <div className="bf-field">
      {config.label && <label className="bf-label">{config.label}</label>}
      <select
        className="bf-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {config.options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
    </div>
  );
}

function FieldToggle({ config, value, onChange }) {
  return (
    <div className="bf-field bf-field--row">
      {config.label && <label className="bf-label">{config.label}</label>}
      <button
        role="switch"
        aria-checked={!!value}
        className={`bf-toggle ${value ? 'bf-toggle--on' : ''}`}
        onClick={() => onChange(!value)}
      >
        <span className="bf-toggle-thumb" />
      </button>
    </div>
  );
}

function FieldTextarea({ config, value, onChange, nodeRef }) {
  const taRef = useRef(null);

  // Auto-resize the textarea and the node when content changes
  useEffect(() => {
    if (!taRef.current || !nodeRef?.current) return;
    const ta = taRef.current;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;

    // Let the node grow with the textarea naturally (min enforced by CSS)
    nodeRef.current.style.height = 'auto';
  }, [value, nodeRef]);

  return (
    <div className="bf-field">
      {config.label && <label className="bf-label">{config.label}</label>}
      <textarea
        ref={taRef}
        className="bf-textarea"
        value={value}
        placeholder={config.placeholder || ''}
        rows={config.rows || 3}
        onChange={(e) => onChange(e.target.value)}
      />
      {config.extractVars && (
        <span className="bf-hint">Use {'{{variable}}'} to create input handles</span>
      )}
    </div>
  );
}

function FieldStatic({ config }) {
  return (
    <div className="bf-field">
      <p className="bf-static">{config.content}</p>
    </div>
  );
}

// ─── Handle layout helpers ────────────────────────────────────────────────────

function distributePositions(handles) {
  // If topPercent is explicitly set on every handle, use it.
  // Otherwise, distribute evenly.
  if (handles.every((h) => h.topPercent !== undefined)) {
    return handles.map((h) => h.topPercent);
  }
  const n = handles.length;
  return handles.map((_, i) => ((i + 1) / (n + 1)) * 100);
}

// ─── BaseNode ─────────────────────────────────────────────────────────────────

export function BaseNode({ id, data, config }) {
  const nodeRef = useRef(null);
  const { fields, setField, varHandles } = useNodeFields(
    id,
    config.fields || [],
    data
  );

  const inputHandles  = config.handles?.inputs  || [];
  const outputHandles = config.handles?.outputs || [];

  // Merge explicit input handles with dynamic {{var}} handles from textarea
  const allInputHandles = [...inputHandles, ...varHandles];
  const inputPositions  = distributePositions(allInputHandles);
  const outputPositions = distributePositions(outputHandles);

  const minWidth = config.width || 220;

  return (
    <div
      ref={nodeRef}
      className="bf-node"
      style={{ minWidth, width: minWidth }}
    >
      {/* ── Header ── */}
      <div className="bf-header">
        <span className="bf-header-icon">{config.icon || '⬡'}</span>
        <span className="bf-header-label">{config.label}</span>
        {config.badge && (
          <span className="bf-badge">{config.badge}</span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="bf-body">
        {(config.fields || []).map((fieldConfig) => {
          const value = fields[fieldConfig.key];
          const onChange = (val) => setField(fieldConfig.key, val);

          switch (fieldConfig.type) {
            case 'text':
              return <FieldText key={fieldConfig.key} config={fieldConfig} value={value} onChange={onChange} />;
            case 'number':
              return <FieldNumber key={fieldConfig.key} config={fieldConfig} value={value} onChange={onChange} />;
            case 'select':
              return <FieldSelect key={fieldConfig.key} config={fieldConfig} value={value} onChange={onChange} />;
            case 'toggle':
              return <FieldToggle key={fieldConfig.key} config={fieldConfig} value={value} onChange={onChange} />;
            case 'textarea':
              return <FieldTextarea key={fieldConfig.key} config={fieldConfig} value={value} onChange={onChange} nodeRef={nodeRef} />;
            case 'static':
              return <FieldStatic key={fieldConfig.key} config={fieldConfig} />;
            default:
              return null;
          }
        })}
      </div>

      {/* ── Input handles (left) ── */}
      {allInputHandles.map((handle, i) => (
        <Handle
          key={handle.id}
          type="target"
          position={Position.Left}
          id={handle.id}
          style={{ top: `${inputPositions[i]}%` }}
        >
          {handle.label && (
            <span className="bf-handle-label bf-handle-label--left">
              {handle.label}
            </span>
          )}
        </Handle>
      ))}

      {/* ── Output handles (right) ── */}
      {outputHandles.map((handle, i) => (
        <Handle
          key={handle.id}
          type="source"
          position={Position.Right}
          id={handle.id}
          style={{ top: `${outputPositions[i]}%` }}
        >
          {handle.label && (
            <span className="bf-handle-label bf-handle-label--right">
              {handle.label}
            </span>
          )}
        </Handle>
      ))}
    </div>
  );
}
