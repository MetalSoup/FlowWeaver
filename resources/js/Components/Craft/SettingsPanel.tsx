import React, { useEffect, useState, useRef } from 'react';
import { useEditor } from '@craftjs/core';

export const SettingsPanel: React.FC = () => {
  const { query, store, actions } = useEditor() as any;
  // Debug flag: enable by setting window.__CRAFT_DEBUG__ = true in the browser console
  const DEBUG = typeof window !== 'undefined' && !!(window as any).__CRAFT_DEBUG__;
  // collect logs in window.__CRAFT_LOGS__ for easier retrieval
  const debugLog = (...args: any[]) => {
    if (!DEBUG) return;
    try {
      // Console log for immediate inspection
      // eslint-disable-next-line no-console
      console.debug(...args);
    } catch (e) { /* ignore */ }
    try {
      if (typeof window !== 'undefined') {
        const w = window as any;
        w.__CRAFT_LOGS__ = w.__CRAFT_LOGS__ || [];
        w.__CRAFT_LOGS__.push({ ts: Date.now(), args, source: 'SettingsPanel' });
      }
    } catch (e) { /* ignore */ }
  };
  const debugWarn = (...args: any[]) => {
    if (!DEBUG) return;
    try {
      // eslint-disable-next-line no-console
      console.warn(...args);
    } catch (e) { /* ignore */ }
    try {
      if (typeof window !== 'undefined') {
        const w = window as any;
        w.__CRAFT_LOGS__ = w.__CRAFT_LOGS__ || [];
        w.__CRAFT_LOGS__.push({ ts: Date.now(), args, level: 'warn', source: 'SettingsPanel' });
      }
    } catch (e) { /* ignore */ }
  };
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [nodeProps, setNodeProps] = useState<Record<string, any> | null>(null);
  const [nodeId, setNodeId] = useState<string | null>(null);
  const [nodeName, setNodeName] = useState<string | null>(null);

  // keep transient text for editing JSON/object props so partial edits don't throw
  const [editingText, setEditingText] = useState<Record<string, string>>({});

  // helper to key sessionStorage per node
  const storageKey = (id: string | null) => (id ? `craft:settings:editing:${id}` : null);

  // Treat these as style-like keys that should be stored on props.style to avoid
  // forwarding unknown attributes to DOM elements (which triggers React warnings).
  const STYLE_KEYS = new Set([
    'borderWidth', 'borderStyle', 'borderColor', 'backgroundColor', 'color', 'boxShadow', 'borderRadius',
    'padding', 'margin', 'fontSize', 'lineHeight', 'letterSpacing', 'wordSpacing'
  ]);

  useEffect(() => {
    debugLog('[SettingsPanel] mounted');

    // One-time migration: some saved nodes may have style-like keys (borderWidth, backgroundColor, color, etc.)
    // stored at the top-level of props which can be forwarded to DOM elements and trigger React warnings.
    // Run a sweep on mount to migrate any top-level STYLE_KEYS into props.style for all nodes.
    try {
      if (store && typeof store.getState === 'function' && query && actions) {
        const state = store.getState();
        const nodes = state && state.nodes ? Object.keys(state.nodes) : [];
        nodes.forEach((id: string) => {
          try {
            const node = query.node(id).get();
            if (!node || !node.data) return;
            const propsCopy = node.data.props ? { ...node.data.props } : {};
            const styleObj = propsCopy.style && typeof propsCopy.style === 'object' ? { ...propsCopy.style } : {};
            const toMigrate: Record<string, any> = {};
            STYLE_KEYS.forEach((k) => {
              if (propsCopy[k] !== undefined && styleObj[k] === undefined) {
                toMigrate[k] = propsCopy[k];
              }
            });
            if (Object.keys(toMigrate).length > 0) {
              actions.setProp(id, (props: any) => {
                props.style = { ...(props.style || {}), ...toMigrate };
                Object.keys(toMigrate).forEach((k) => {
                  if (Object.prototype.hasOwnProperty.call(props, k)) delete props[k];
                });
              });
              debugLog('[SettingsPanel] migrated top-level style props into props.style for node', id, toMigrate);
            }
          } catch (e) {
            debugWarn('[SettingsPanel] failed to migrate node during global sweep', id, e);
          }
        });
      }
    } catch (e) {
      debugWarn('[SettingsPanel] global migration sweep failed', e);
    }

    return () => {
      debugLog('[SettingsPanel] unmounted');
    };
  }, []);

  useEffect(() => {
    // Subscribe to selected nodes in the editor store so panel updates on selection change
    if (!store || !store.subscribe) return;

    const unsub = store.subscribe((s: any) => ({ selected: s.events.selected }), ({ selected }: any) => {
      // `selected` may be a Set of ids; coerce into a string[] safely
      const arr = selected ? Array.from(selected as Set<any>).map((v) => String(v)) : ([] as string[]);
      debugLog('[SettingsPanel] store.subscribe -> selected event', arr);
      setSelectedIds(arr);
    });

    // Initialize selection
    const initial = query.getEvent('selected') && typeof query.getEvent('selected').all === 'function'
      ? (query.getEvent('selected').all() as any[]).map((v) => String(v))
      : ([] as string[]);
    debugLog('[SettingsPanel] initial selected', initial);
    setSelectedIds(initial || []);

    return () => {
      if (unsub) unsub();
    };
  }, [store, query]);

  // when selectedIds changes, update displayed props
  useEffect(() => {
    if (!selectedIds || selectedIds.length === 0) {
      setNodeProps(null);
      setNodeId(null);
      setEditingText({});
      debugLog('[SettingsPanel] selection cleared');
      return;
    }

    const id = selectedIds[0];
    setNodeId(id);
    debugLog('[SettingsPanel] selection changed -> nodeId', id);
    try {
      const node = query.node(id).get();
      // display name (friendly) for the selected component
      setNodeName(node?.data?.displayName || node?.data?.name || id);
      // clone simple props to state
      // start with a shallow copy of props
      const propsCopy = node?.data?.props ? { ...node.data.props } : {};
      // If the node stores style-related values inside props.style, expose them at the
      // top-level in the UI so the editor fields continue to work. This avoids creating
      // duplicate values but keeps the authoritative storage inside props.style.
      const styleObj = propsCopy.style && typeof propsCopy.style === 'object' ? { ...propsCopy.style } : {};

      // If the node has style keys at the top-level (legacy), migrate them into props.style
      const toMigrate: Record<string, any> = {};
      STYLE_KEYS.forEach((k) => {
        if ((propsCopy[k] === undefined || propsCopy[k] === null) && styleObj[k] !== undefined) {
          // show style values on the UI
          propsCopy[k] = styleObj[k];
        } else if (propsCopy[k] !== undefined && styleObj[k] === undefined) {
          // top-level style-like prop exists but not stored in props.style -> migrate it
          toMigrate[k] = propsCopy[k];
        }
      });

      // If we found any top-level style keys, move them into props.style on the node so React
      // does not complain about unknown DOM attributes during render.
      if (Object.keys(toMigrate).length > 0) {
        try {
          actions.setProp(id, (props: any) => {
            props.style = { ...(props.style || {}), ...toMigrate };
            Object.keys(toMigrate).forEach((k) => {
              if (Object.prototype.hasOwnProperty.call(props, k)) delete props[k];
            });
          });
          debugLog('[SettingsPanel] migrated top-level style props into props.style for node', id, toMigrate);
        } catch (e) {
          debugWarn('[SettingsPanel] failed to migrate top-level style props', e);
        }
      }

      debugLog('[SettingsPanel] loaded node', id, { displayName: node?.data?.displayName, props: propsCopy });
      setNodeProps(propsCopy);

      // initialize editingText for object props and restore any saved session edits
      const initialText: Record<string, string> = {};
      Object.entries(propsCopy).forEach(([k, v]) => {
        if (v && typeof v === 'object') initialText[k] = JSON.stringify(v);
      });

      const key = storageKey(id);
      if (key && typeof window !== 'undefined' && window.sessionStorage) {
        try {
          const saved = window.sessionStorage.getItem(key);
          if (saved) {
            const parsed = JSON.parse(saved);
            // merge saved edits with initialText (saved edits take precedence)
            Object.assign(initialText, parsed || {});
            debugLog('[SettingsPanel] restored editingText from sessionStorage', key, parsed);
          }
        } catch (e) {
          // ignore parsing errors
          debugWarn('[SettingsPanel] failed to parse saved editingText', e);
        }
      }

      setEditingText(initialText);
    } catch (e) {
      setNodeProps(null);
      setNodeId(null);
      setEditingText({});
      debugWarn('[SettingsPanel] failed to load node', id, e);
    }
  }, [selectedIds, query]);

  // persist editingText to sessionStorage for the selected node so switching tabs/unmounting won't lose it
  useEffect(() => {
    const key = storageKey(nodeId);
    if (!key || typeof window === 'undefined' || !window.sessionStorage) return;
    try {
      debugLog('[SettingsPanel] persist editingText', key, editingText);
      window.sessionStorage.setItem(key, JSON.stringify(editingText || {}));
    } catch (e) {
      // ignore storage errors
      debugWarn('[SettingsPanel] failed to persist editingText', e);
    }
  }, [editingText, nodeId]);

  // When the selected node changes, reset any open color picker UI so pickers don't remain open
  // Container now uses simple <input type="color"> controls, no popover state to reset on selection change.
  useEffect(() => {
    // noop for backwards-compatibility
  }, [nodeId]);

  // root ref for the settings panel so we can detect outside clicks and close pickers
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Close color pickers when clicking outside the panel
  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      try {
        const el = rootRef.current;
        if (!el) return;
        const target = ev.target as Node | null;
        if (!target) return;
        if (!el.contains(target)) {
          // clicked outside -> close any UI state (editing buffers handled elsewhere)
        }
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, []);

  const updateProp = (key: string, value: any) => {
    debugLog('[SettingsPanel] updateProp', { key, value, nodeId });
    if (!nodeId) return;
    // update UI state immediately
    setNodeProps((prev) => (prev ? { ...prev, [key]: value } : { [key]: value }));
    // use Craft actions to update the node prop
    try {
      if (STYLE_KEYS.has(key)) {
        // write style-like values into props.style to avoid unknown DOM attributes
        actions.setProp(nodeId, (props: any) => {
          props.style = { ...(props.style || {}) };
          props.style[key] = value;
          // remove top-level duplicate so we don't accidentally forward it to DOM elements
          if (Object.prototype.hasOwnProperty.call(props, key)) delete props[key];
        });
      } else {
        actions.setProp(nodeId, (props: any) => {
          props[key] = value;
        });
      }
      // if we've successfully updated the prop and there's a saved editingText entry for this prop, clear it
      try {
        const sk = storageKey(nodeId);
        if (sk && typeof window !== 'undefined' && window.sessionStorage) {
          const saved = JSON.parse(window.sessionStorage.getItem(sk) || '{}');
          if (saved && Object.prototype.hasOwnProperty.call(saved, key)) {
            delete saved[key];
            window.sessionStorage.setItem(sk, JSON.stringify(saved));
            debugLog('[SettingsPanel] cleared saved editingText entry for', key);
          }
        }
      } catch (e) {
        // ignore
        debugWarn('[SettingsPanel] error clearing saved editingText', e);
      }
    } catch (e) {
      // don't let craft action errors blow up the panel
      // keep UI state in sync though
      debugWarn('[SettingsPanel] actions.setProp failed', e);
    }
  };

  // --- Text style helpers and defaults ---
  const TEXT_DEFAULTS: Record<string, any> = {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#000000',
    textAlign: 'left',
    lineHeight: undefined,
    as: 'p',
    fontFamily: undefined,
    fontStyle: 'normal',
    letterSpacing: undefined,
    wordSpacing: undefined,
    textTransform: undefined,
    textDecoration: undefined,
    whiteSpace: undefined,
  };

  // parse value like 16, '16px', '1.2rem' into {num, unit}
  const parseUnit = (v: any) : { num: string; unit: string } => {
    if (v === undefined || v === null || v === '') return { num: '', unit: 'px' };
    if (typeof v === 'number') return { num: String(v), unit: 'px' };
    const s = String(v).trim();
    const m = s.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
    if (m) return { num: m[1], unit: (m[2] || 'px') };
    return { num: s, unit: 'px' };
  };

  const formatUnit = (num: string | number | null, unit: string) => {
    if (num === null || num === '' || num === undefined) return null;
    // if numeric string, combine
    return `${num}${unit}`;
  };

  // Parse a CSS box shorthand (e.g. '10px 8px' or '10px 8px 6px 4px') into numeric parts and a unit.
  const parseBox = (v: any) => {
    // defaults
    const out = { top: '', right: '', bottom: '', left: '', unit: 'px' } as any;
    if (v === undefined || v === null || v === '') return out;
    // if number -> treat as px for all sides
    if (typeof v === 'number') { out.top = out.right = out.bottom = out.left = String(v); out.unit = 'px'; return out; }
    const s = String(v).trim();
    // split tokens
    const parts = s.split(/\s+/).filter(Boolean);
    const parsed = parts.map((p) => {
      const m = String(p).trim().match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
      if (m) return { num: m[1], unit: (m[2] || 'px') };
      return { num: '', unit: 'px' };
    });
    if (parsed.length === 1) {
      out.top = out.right = out.bottom = out.left = parsed[0].num;
      out.unit = parsed[0].unit;
    } else if (parsed.length === 2) {
      out.top = out.bottom = parsed[0].num;
      out.right = out.left = parsed[1].num;
      out.unit = parsed[0].unit || parsed[1].unit || 'px';
    } else if (parsed.length === 3) {
      out.top = parsed[0].num;
      out.right = out.left = parsed[1].num;
      out.bottom = parsed[2].num;
      out.unit = parsed[0].unit || parsed[1].unit || parsed[2].unit || 'px';
    } else if (parsed.length >= 4) {
      out.top = parsed[0].num;
      out.right = parsed[1].num;
      out.bottom = parsed[2].num;
      out.left = parsed[3].num;
      out.unit = parsed[0].unit || parsed[1].unit || parsed[2].unit || parsed[3].unit || 'px';
    }
    return out;
  };

  const joinBox = (t: string, r: string, b: string, l: string, unit: string) => {
    const parts = [t, r, b, l].map((n) => (n === '' || n === null ? '0' : n));
    // compress to CSS shorthand where possible
    if (parts[0] === parts[1] && parts[0] === parts[2] && parts[0] === parts[3]) return `${parts[0]}${unit}`;
    if (parts[0] === parts[2] && parts[1] === parts[3]) return `${parts[0]}${unit} ${parts[1]}${unit}`;
    if (parts[1] === parts[3]) return `${parts[0]}${unit} ${parts[1]}${unit} ${parts[2]}${unit}`;
    return `${parts[0]}${unit} ${parts[1]}${unit} ${parts[2]}${unit} ${parts[3]}${unit}`;
  };

  const FONT_FAMILIES = [
    'System UI', 'Arial', 'Helvetica', "Helvetica Neue", 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'serif', 'sans-serif', 'monospace', 'Custom'
  ];

  const resetTextStyles = () => {
    try {
      Object.keys(TEXT_DEFAULTS).forEach((k) => {
        updateProp(k, TEXT_DEFAULTS[k]);
      });
    } catch (e) {
      debugWarn('[SettingsPanel] resetTextStyles failed', e);
    }
  };

  if (!nodeProps) {
    return (
      <div className="p-4 bg-white border rounded" data-craft-settings>
        <h3 className="font-semibold mb-2">Canvas</h3>
        <div className="text-sm text-gray-500">Select a component to edit its settings.</div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="p-4 bg-white border rounded" data-craft-settings>
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold mb-2">Component Settings</h3>
        <div className="text-xs text-gray-500">{nodeName} {nodeId ? `(${nodeId})` : ''}</div>
      </div>

      <div className="space-y-3">
        {Object.keys(nodeProps).length === 0 && (
          <div className="text-sm text-gray-500">No editable props for this component.</div>
        )}

        {/* Render generic props but skip text-style keys which we render separately for Text nodes */}
        {(() => {
          const textStyleKeys = ['fontSize', 'fontWeight', 'color', 'textAlign', 'lineHeight', 'as', 'fontFamily', 'fontStyle', 'letterSpacing', 'wordSpacing', 'textTransform', 'textDecoration', 'whiteSpace'];
          return Object.entries(nodeProps).filter(([k]) => !textStyleKeys.includes(k)).map(([key, val]) => {
           const type = typeof val;

           if (type === 'boolean') {
             return (
               <div key={key} className="flex items-center justify-between">
                 <label className="text-sm">{key}</label>
                 <input
                   type="checkbox"
                   checked={!!val}
                   onChange={(e) => updateProp(key, e.target.checked)}
                   aria-label={`toggle-${key}`}
                 />
               </div>
             );
           }

           if (type === 'number') {
             return (
               <div key={key} className="flex flex-col">
                 <label className="text-sm mb-1">{key}</label>
                 <input
                   type="number"
                   value={String(val)}
                   onChange={(e) => updateProp(key, Number(e.target.value))}
                   className="p-1 border rounded"
                 />
               </div>
             );
           }

           // default to text input for strings and other types (JSON editing for objects)
           if (val && typeof val === 'object') {
             const textValue = editingText[key] ?? JSON.stringify(val);
             return (
               <div key={key} className="flex flex-col">
                 <label className="text-sm mb-1">{key}</label>
                 <input
                   type="text"
                   value={textValue}
                   onChange={(e) => {
                     const raw = e.target.value;
                     // always update the local editing buffer so the user can type invalid json safely
                     setEditingText((prev) => ({ ...prev, [key]: raw }));
                     try {
                       const parsed = JSON.parse(raw);
                       updateProp(key, parsed);
                     } catch (err) {
                       // Don't update the craft node until the JSON is valid. Do not throw.
                     }
                   }}
                   className="p-1 border rounded"
                 />
               </div>
             );
           }

           return (
             <div key={key} className="flex flex-col">
               <label className="text-sm mb-1">{key}</label>
               <input
                 type="text"
                 value={typeof val === 'object' ? JSON.stringify(val) : String(val)}
                 onChange={(e) => {
                   const newVal = typeof val === 'object' ? (() => {
                     try { return JSON.parse(e.target.value || '{}'); } catch { return val; }
                   })() : e.target.value;
                   updateProp(key, newVal);
                 }}
                 className="p-1 border rounded"
               />
             </div>
           );
         });

        })()}

        {/* Text-specific options shown under the default text prop editor */}
        {nodeName === 'Text' && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Text options</h4>
              <div>
                <button className="btn btn-xs btn-ghost mr-2" onClick={resetTextStyles} type="button">Reset text styles</button>
              </div>
            </div>
            <div className="space-y-2 mt-2">
              <div className="flex flex-col">
                <label className="text-sm mb-1">Font size (px)</label>
                <div className="flex gap-2">
                  {/* number input */}
                  <input
                    type="number"
                    value={parseUnit(nodeProps.fontSize).num}
                    onChange={(e) => {
                      const unit = parseUnit(nodeProps.fontSize).unit || 'px';
                      const num = e.target.value;
                      updateProp('fontSize', num === '' ? null : formatUnit(num, unit));
                    }}
                    className="p-1 border rounded w-28"
                  />
                  {/* unit select */}
                  <select
                    value={parseUnit(nodeProps.fontSize).unit}
                    onChange={(e) => {
                      const unit = e.target.value || 'px';
                      const num = parseUnit(nodeProps.fontSize).num;
                      updateProp('fontSize', num === '' ? null : formatUnit(num, unit));
                    }}
                    className="p-1 border rounded w-16 shrink-0"
                  >
                    <option value="px">px</option>
                    <option value="rem">rem</option>
                    <option value="em">em</option>
                    <option value="%">%</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1">Font weight</label>
                <select
                  value={nodeProps.fontWeight ?? 'normal'}
                  onChange={(e) => updateProp('fontWeight', e.target.value)}
                  className="p-1 border rounded"
                >
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="400">normal</option>
                  <option value="500">500</option>
                  <option value="600">600</option>
                  <option value="700">bold</option>
                  <option value="800">800</option>
                  <option value="900">900</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1">Color</label>
                <input
                  type="color"
                  value={nodeProps.color ?? '#000000'}
                  onChange={(e) => updateProp('color', e.target.value)}
                  className="w-12 h-8 p-1 border rounded"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1">Alignment</label>
                <select
                  value={nodeProps.textAlign ?? 'left'}
                  onChange={(e) => updateProp('textAlign', e.target.value)}
                  className="p-1 border rounded"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1">Line height</label>
                <input
                  type="number"
                  step="0.1"
                  value={nodeProps.lineHeight ?? ''}
                  onChange={(e) => updateProp('lineHeight', e.target.value === '' ? null : Number(e.target.value))}
                  className="p-1 border rounded w-28"
                />
                <select
                  value={parseUnit(nodeProps.lineHeight).unit}
                  onChange={(e) => {
                    const unit = e.target.value || 'px';
                    const num = parseUnit(nodeProps.lineHeight).num;
                    updateProp('lineHeight', num === '' ? null : formatUnit(num, unit));
                  }}
                  className="p-1 border rounded w-16 shrink-0"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                  <option value="em">em</option>
                  <option value="%">%</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1">Text type</label>
                <select
                  value={nodeProps.as ?? 'p'}
                  onChange={(e) => updateProp('as', e.target.value)}
                  className="p-1 border rounded"
                >
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                  <option value="h4">H4</option>
                  <option value="h5">H5</option>
                  <option value="h6">H6</option>
                  <option value="p">P</option>
                  <option value="span">Span</option>
                  <option value="none">None (span)</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1">Font family</label>
                <div className="flex flex-col">
                  <select
                    value={FONT_FAMILIES.includes(nodeProps.fontFamily) ? nodeProps.fontFamily : 'Custom'}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === 'Custom') {
                        updateProp('fontFamily', nodeProps.fontFamily ?? '');
                      } else {
                        updateProp('fontFamily', v === 'Custom' ? null : v);
                      }
                    }}
                    className="p-1 border rounded"
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  {(!FONT_FAMILIES.includes(nodeProps.fontFamily) || (FONT_FAMILIES.includes(nodeProps.fontFamily) && nodeProps.fontFamily === 'Custom')) && (
                    <input
                      type="text"
                      value={nodeProps.fontFamily && !FONT_FAMILIES.includes(nodeProps.fontFamily) ? nodeProps.fontFamily : ''}
                      onChange={(e) => updateProp('fontFamily', e.target.value || null)}
                      placeholder="Custom font family (e.g. 'Inter', system-ui)"
                      className="p-1 border rounded mt-2"
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1">Font style</label>
                <select
                  value={nodeProps.fontStyle ?? 'normal'}
                  onChange={(e) => updateProp('fontStyle', e.target.value)}
                  className="p-1 border rounded"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                  <option value="oblique">Oblique</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1">Letter spacing (px)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={parseUnit(nodeProps.letterSpacing).num}
                    onChange={(e) => {
                      const unit = parseUnit(nodeProps.letterSpacing).unit || 'px';
                      const num = e.target.value;
                      updateProp('letterSpacing', num === '' ? null : formatUnit(num, unit));
                    }}
                    className="p-1 border rounded w-28"
                  />
                  <select
                    value={parseUnit(nodeProps.letterSpacing).unit}
                    onChange={(e) => {
                      const unit = e.target.value || 'px';
                      const num = parseUnit(nodeProps.letterSpacing).num;
                      updateProp('letterSpacing', num === '' ? null : formatUnit(num, unit));
                    }}
                    className="p-1 border rounded w-16 shrink-0"
                  >
                    <option value="px">px</option>
                    <option value="em">em</option>
                    <option value="rem">rem</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1">Word spacing (px)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={parseUnit(nodeProps.wordSpacing).num}
                    onChange={(e) => {
                      const unit = parseUnit(nodeProps.wordSpacing).unit || 'px';
                      const num = e.target.value;
                      updateProp('wordSpacing', num === '' ? null : formatUnit(num, unit));
                    }}
                    className="p-1 border rounded w-28"
                  />
                  <select
                    value={parseUnit(nodeProps.wordSpacing).unit}
                    onChange={(e) => {
                      const unit = e.target.value || 'px';
                      const num = parseUnit(nodeProps.wordSpacing).num;
                      updateProp('wordSpacing', num === '' ? null : formatUnit(num, unit));
                    }}
                    className="p-1 border rounded w-16 shrink-0"
                  >
                    <option value="px">px</option>
                    <option value="rem">rem</option>
                    <option value="em">em</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1">Text transform</label>
                <select
                  value={nodeProps.textTransform ?? 'none'}
                  onChange={(e) => updateProp('textTransform', e.target.value)}
                  className="p-1 border rounded"
                >
                  <option value="none">None</option>
                  <option value="uppercase">UPPERCASE</option>
                  <option value="lowercase">lowercase</option>
                  <option value="capitalize">Capitalize</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1">Text decoration</label>
                <select
                  value={nodeProps.textDecoration ?? 'none'}
                  onChange={(e) => updateProp('textDecoration', e.target.value)}
                  className="p-1 border rounded"
                >
                  <option value="none">None</option>
                  <option value="underline">Underline</option>
                  <option value="line-through">Line-through</option>
                  <option value="overline">Overline</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1">White space</label>
                <select
                  value={nodeProps.whiteSpace ?? 'normal'}
                  onChange={(e) => updateProp('whiteSpace', e.target.value)}
                  className="p-1 border rounded"
                >
                  <option value="normal">Normal</option>
                  <option value="nowrap">No wrap</option>
                  <option value="pre">Pre</option>
                  <option value="pre-line">Pre-line</option>
                  <option value="pre-wrap">Pre-wrap</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Container-specific settings: padding, margin, border, radius, boxShadow, colors */}
        {nodeName === 'Container' && (
          <div className="pt-2 border-t">
            <h4 className="font-semibold">Container options</h4>
            <div className="space-y-2 mt-2">
              {/* Per-side padding */}
              <div>
                <label className="text-sm mb-1">Padding (per-side)</label>
                <div className="grid grid-cols-2 gap-2">
                  {(() => {
                    const p = parseBox(nodeProps.padding);
                    return (
                      <>
                        <div className="flex items-center gap-2">
                          <label className="text-xs w-10">Top</label>
                          <input type="number" value={p.top} onChange={(e) => updateProp('padding', joinBox(e.target.value, p.right, p.bottom, p.left, p.unit))} className="p-1 border rounded w-20" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs w-10">Right</label>
                          <input type="number" value={p.right} onChange={(e) => updateProp('padding', joinBox(p.top, e.target.value, p.bottom, p.left, p.unit))} className="p-1 border rounded w-20" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs w-10">Bottom</label>
                          <input type="number" value={p.bottom} onChange={(e) => updateProp('padding', joinBox(p.top, p.right, e.target.value, p.left, p.unit))} className="p-1 border rounded w-20" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs w-10">Left</label>
                          <input type="number" value={p.left} onChange={(e) => updateProp('padding', joinBox(p.top, p.right, p.bottom, e.target.value, p.unit))} className="p-1 border rounded w-20" />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <label className="text-xs w-10">Unit</label>
                          <select value={p.unit} onChange={(e) => updateProp('padding', joinBox(p.top, p.right, p.bottom, p.left, e.target.value))} className="p-1 border rounded w-20">
                             <option value="px">px</option>
                             <option value="rem">rem</option>
                             <option value="em">em</option>
                             <option value="%">%</option>
                           </select>
                         </div>
                       </>
                     );
                   })()}
                 </div>
               </div>

               {/* Per-side margin */}
               <div>
                 <label className="text-sm mb-1">Margin (per-side)</label>
                 <div className="grid grid-cols-2 gap-2">
                   {(() => {
                     const m = parseBox(nodeProps.margin);
                     return (
                       <>
                        <div className="flex items-center gap-2">
                          <label className="text-xs w-10">Top</label>
                          <input type="number" value={m.top} onChange={(e) => updateProp('margin', joinBox(e.target.value, m.right, m.bottom, m.left, m.unit))} className="p-1 border rounded w-20" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs w-10">Right</label>
                          <input type="number" value={m.right} onChange={(e) => updateProp('margin', joinBox(m.top, e.target.value, m.bottom, m.left, m.unit))} className="p-1 border rounded w-20" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs w-10">Bottom</label>
                          <input type="number" value={m.bottom} onChange={(e) => updateProp('margin', joinBox(m.top, m.right, e.target.value, m.left, m.unit))} className="p-1 border rounded w-20" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs w-10">Left</label>
                          <input type="number" value={m.left} onChange={(e) => updateProp('margin', joinBox(m.top, m.right, m.bottom, e.target.value, m.unit))} className="p-1 border rounded w-20" />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <label className="text-xs w-10">Unit</label>
                          <select value={m.unit} onChange={(e) => updateProp('margin', joinBox(m.top, m.right, m.bottom, m.left, e.target.value))} className="p-1 border rounded w-20">
                             <option value="px">px</option>
                             <option value="rem">rem</option>
                             <option value="em">em</option>
                             <option value="%">%</option>
                           </select>
                         </div>
                       </>
                     );
                   })()}
                 </div>
               </div>

               <div className="flex gap-2 items-end">
                 <div className="flex flex-col">
                   <label className="text-sm mb-1">Border width (px)</label>
                   <input
                     type="number"
                     value={nodeProps.borderWidth ?? ''}
                     onChange={(e) => updateProp('borderWidth', e.target.value === '' ? null : Number(e.target.value))}
                     className="p-1 border rounded w-20"
                   />
                 </div>

                 <div className="flex flex-col">
                   <label className="text-sm mb-1">Border style</label>
                   <select
                     value={nodeProps.borderStyle ?? 'solid'}
                     onChange={(e) => updateProp('borderStyle', e.target.value)}
                     className="p-1 border rounded"
                   >
                     <option value="none">none</option>
                     <option value="solid">solid</option>
                     <option value="dashed">dashed</option>
                     <option value="dotted">dotted</option>
                     <option value="double">double</option>
                   </select>
                 </div>

                <div className="flex flex-col">
                  <label className="text-sm mb-1">Border color</label>
                  <input
                    type="color"
                    value={(nodeProps.borderColor ?? '#e5e7eb')}
                    onChange={(e) => updateProp('borderColor', e.target.value)}
                    className="w-12 h-8 p-1 border rounded"
                    aria-label={`border-color-${String(nodeId)}`}
                    title="Border color"
                  />
                </div>
               </div>

               <div className="flex gap-2 items-end">
                 <div className="flex flex-col">
                   <label className="text-sm mb-1">Border radius</label>
                   <div className="flex gap-2">
                    <input
                      type="number"
                      value={parseUnit(nodeProps.borderRadius).num}
                      onChange={(e) => {
                        const unit = parseUnit(nodeProps.borderRadius).unit || 'px';
                        const num = e.target.value;
                        updateProp('borderRadius', num === '' ? null : formatUnit(num, unit));
                      }}
                      className="p-1 border rounded w-20"
                    />
                     <select
                       value={parseUnit(nodeProps.borderRadius).unit}
                       onChange={(e) => {
                         const unit = e.target.value || 'px';
                         const num = parseUnit(nodeProps.borderRadius).num;
                         updateProp('borderRadius', num === '' ? null : formatUnit(num, unit));
                       }}
                       className="p-1 border rounded w-16 shrink-0"
                     >
                       <option value="px">px</option>
                       <option value="rem">rem</option>
                       <option value="%">%</option>
                     </select>
                   </div>
                 </div>

                 <div className="flex flex-col">
                   <label className="text-sm mb-1">Box shadow</label>
                   <input
                     type="text"
                     placeholder="e.g. 0 4px 6px rgba(0,0,0,0.1)"
                     value={nodeProps.boxShadow ?? ''}
                     onChange={(e) => updateProp('boxShadow', e.target.value)}
                     className="p-1 border rounded w-full"
                   />
                 </div>
               </div>

               <div className="flex gap-4">
                <div className="flex flex-col">
                  <label className="text-sm mb-1">Background color</label>
                  <input
                    type="color"
                    value={(nodeProps.backgroundColor ?? '#ffffff')}
                    onChange={(e) => updateProp('backgroundColor', e.target.value)}
                    className="w-12 h-8 p-1 border rounded"
                    aria-label={`background-color-${String(nodeId)}`}
                    title="Background color"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm mb-1">Text color</label>
                  <input
                    type="color"
                    value={(nodeProps.color ?? '#000000')}
                    onChange={(e) => updateProp('color', e.target.value)}
                    className="w-12 h-8 p-1 border rounded"
                    aria-label={`text-color-${String(nodeId)}`}
                    title="Text color"
                  />
                </div>
               </div>
             </div>
           </div>
         )}

         {/* Deselect button removed — clicking on the canvas background now clears selection */}
       </div>
     </div>
   );
 }
