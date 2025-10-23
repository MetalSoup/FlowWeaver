import React, { useState, useEffect, useRef, useMemo } from 'react';
// Debug flag: enable by setting window.__CRAFT_DEBUG__ = true in the browser console
const DEBUG = typeof window !== 'undefined' && !!(window as any).__CRAFT_DEBUG__;
// debug helpers that also append to window.__CRAFT_LOGS__ for collection
const debugLog = (...args: any[]) => {
  if (!DEBUG) return;
  try { console.debug(...args); } catch (e) { /* ignore */ }
  try {
    if (typeof window !== 'undefined') {
      const w = window as any;
      w.__CRAFT_LOGS__ = w.__CRAFT_LOGS__ || [];
      w.__CRAFT_LOGS__.push({ ts: Date.now(), args, source: 'EditorV2' });
    }
  } catch (e) { /* ignore */ }
};
const debugWarn = (...args: any[]) => {
  if (!DEBUG) return;
  try { console.warn(...args); } catch (e) { /* ignore */ }
  try {
    if (typeof window !== 'undefined') {
      const w = window as any;
      w.__CRAFT_LOGS__ = w.__CRAFT_LOGS__ || [];
      w.__CRAFT_LOGS__.push({ ts: Date.now(), args, level: 'warn', source: 'EditorV2' });
    }
  } catch (e) { /* ignore */ }
};
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { Toolbox } from '@/Components/Craft/Toolbox';
import { SettingsPanel } from '@/Components/Craft/SettingsPanel';
import { CraftText, CraftContainer, CraftPreviewContext } from '@/Nodes/CraftNodes';

// Minimal styles for the editor
const editorStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  height: '80vh',
  position: 'relative', // added so floating menus can be positioned absolutely inside
};

const canvasStyle: React.CSSProperties = {
  flex: 1,
  padding: '1rem',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  background: '#fff',
  overflow: 'auto',
};

export default function EditorV2() {
  const { props } = usePage<any>();
  const page = props.page?.data ?? null;
  // `forms` may come from PHP as an associative object (e.g. {"3": [...]}) or as an array.
  // Normalize to an array for safe `.map` usage and to handle several serialization shapes.
  const rawForms = props.forms ?? [];
  const forms = (() => {
    if (Array.isArray(rawForms)) return rawForms;
    if (!rawForms || typeof rawForms !== 'object') return [];

    // rawForms is an object with values that might be arrays, objects, or collections.
    const vals = Object.values(rawForms);
    const out: any[] = [];

    vals.forEach((v: any) => {
      if (Array.isArray(v)) {
        out.push(...v);
      } else if (v && typeof v === 'object') {
        // If object has numeric keys (like {0:...,1:...}) treat as array-like
        const keys = Object.keys(v);
        const allNumeric = keys.length > 0 && keys.every((k) => /^\d+$/.test(k));
        if (allNumeric) out.push(...Object.values(v));
        else out.push(v);
      }
    });

    return out;
  })();
  // Debug: inspect normalized forms in browser console if needed.
  if (typeof window !== 'undefined' && (window as any).Cypress === undefined) {
    // debug logging removed
  }
  const flows = props.flows ?? [];

  // initial editor content (loaded from server). We don't keep an editable inspector JSON in state.
  const initialContent = page?.content ?? '';
  // transient saved confirmation
  const [saved, setSaved] = useState(false);
  // which left tab is active: toolbox or settings
  const [leftTab, setLeftTab] = useState<'toolbox' | 'settings'>('toolbox');
  // preview mode: when true hide editing tools and show page as end-user
  const [preview, setPreview] = useState(false);
  const editorRef = useRef<any>(null);

  // When the user clicks on the canvas area (not any craft node child) we should clear the selection.
  // Use a pointerdown capture handler so we see the event before child handlers may stopPropagation
  // and walk up the DOM from the event target to the canvas root checking for craft node attributes.
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    const root = e.currentTarget as HTMLElement | null;
    const target = e.target as HTMLElement | null;
    if (!root || !target) return;
    if (!editorRef.current) return;

    if (DEBUG) {
      try {
        debugLog('[EditorV2] handleCanvasPointerDown root=', root, 'target=', target);
      } catch (err) { /* ignore */ }
    }

    // Walk up from target towards root (exclusive). If we find any element that looks like
    // a craft node (data-craft-node, data-craft-canvas, etc.), treat the event as a node click
    // and do not clear selection. Otherwise treat as a background click and deselect.
    let el: HTMLElement | null = target;
    let clickedNode = false;
    while (el && el !== root) {
      try {
        if (el.hasAttribute && (el.hasAttribute('data-craft-node') || el.hasAttribute('data-craft-canvas') || el.hasAttribute('data-craft-root'))) {
          clickedNode = true;
          break;
        }
      } catch (err) {
        // ignore DOM access errors
      }
      el = el.parentElement;
    }

    if (clickedNode) {
      if (DEBUG) {
        try { debugLog('[EditorV2] pointerdown detected on a child craft node -> skipping deselect'); } catch (e) { /* ignore */ }
      }
      return; // clicked a child node - don't deselect
    }

    debugLog('[EditorV2] canvas background pointerdown -> attempting to deselect');
    try {
      const ref = editorRef.current;
      if (ref && ref.actions) {
        const hasSelect = typeof ref.actions.selectNode === 'function';
        const hasSetEvent = typeof ref.actions.setNodeEvent === 'function';
        debugLog('[EditorV2] deselect helpers availability', { hasSelect, hasSetEvent });

        // Try clearing via setNodeEvent first (more direct), then call selectNode(null) as a fallback.
        if (hasSetEvent) {
          try {
            ref.actions.setNodeEvent('selected', new Set());
          } catch (e) {
            debugWarn('[EditorV2] setNodeEvent(selected) failed', e);
          }
          try { ref.actions.setNodeEvent('hovered', null); } catch (e) { /* ignore */ }
          try { ref.actions.setNodeEvent('dragged', null); } catch (e) { /* ignore */ }
        }

        if (hasSelect) {
          try {
            ref.actions.selectNode(null);
          } catch (e) {
            debugWarn('[EditorV2] selectNode(null) threw', e);
          }
        }

        // If DEBUG, attempt to log selected event state via query.getEvent
        if (DEBUG && ref.query && typeof ref.query.getEvent === 'function') {
          try {
            const ev = ref.query.getEvent('selected');
            const all = ev && typeof ev.all === 'function' ? ev.all() : null;
            debugLog('[EditorV2] post-deselect selected event all()', all);
          } catch (e) {
            debugWarn('[EditorV2] failed to read selected event after deselect', e);
          }
        }
      }
    } catch (err) {
      debugWarn('[EditorV2] error while deselecting on canvas pointerdown', err);
    }
  };

  // Preserve selection when switching tabs: capture current selected ids and restore after tab change.
  const handleLeftTabClick = (tab: 'toolbox' | 'settings') => {
    try {
      const ref = editorRef.current;
      let selectedIds: string[] | null = null;
      if (ref && ref.query && typeof ref.query.getEvent === 'function') {
        const ev = ref.query.getEvent('selected');
        if (ev && typeof ev.all === 'function') {
          selectedIds = (ev.all() || []).map((v: any) => String(v));
        }
      }

      // set the tab immediately so UI updates
      setLeftTab(tab);

      // restore selection on next tick to avoid transient clearing by mounts/unmounts
      if (selectedIds && selectedIds.length && ref && ref.actions) {
        // use requestAnimationFrame to avoid potential sync unmount side-effects
        requestAnimationFrame(() => {
          try {
            if (selectedIds.length === 1 && typeof ref.actions.selectNode === 'function') {
              // prefer the higher-level API for single selection
              ref.actions.selectNode(selectedIds[0]);
            } else if (typeof ref.actions.setNodeEvent === 'function') {
              ref.actions.setNodeEvent('selected', new Set(selectedIds));
            }
          } catch (e) {
            /* ignore restore errors */
          }
        });
      }
    } catch (e) {
      // fallback: just set the tab
      setLeftTab(tab);
    }
  };

  useEffect(() => {
    if (!DEBUG) return;
    debugLog('[EditorV2] mounted, initial leftTab=', leftTab, 'preview=', preview);
    return () => debugLog('[EditorV2] unmounted');
  }, []);

  useEffect(() => {
    if (!DEBUG) return;
    debugLog('[EditorV2] leftTab changed ->', leftTab);
  }, [leftTab]);

  useEffect(() => {
    if (!DEBUG) return;
    debugLog('[EditorV2] preview changed ->', preview);
  }, [preview]);

  // (No periodic polling) Toolbar buttons will call history.undo/redo if available.

  // keyboard shortcuts for undo/redo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (!meta) return;
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        // if shift pressed -> redo on many platforms
        if (e.shiftKey) {
          if (editorRef.current && editorRef.current.actions && editorRef.current.actions.history && typeof editorRef.current.actions.history.redo === 'function') {
            editorRef.current.actions.history.redo();
          }
        } else {
          if (editorRef.current && editorRef.current.actions && editorRef.current.actions.history && typeof editorRef.current.actions.history.undo === 'function') {
            editorRef.current.actions.history.undo();
          }
        }
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        if (editorRef.current && editorRef.current.actions && editorRef.current.actions.history && typeof editorRef.current.actions.history.redo === 'function') {
          editorRef.current.actions.history.redo();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Define resolver as a const so we can inspect its keys when debugging deserialization errors.
  // Memoize resolver so it keeps a stable identity across renders.
  // A new resolver object on every render can cause the Craft Editor to reinitialize
  // and lose unsaved changes when toggling UI (e.g. switching tabs).
  const resolver = useMemo(() => ({
    Text: CraftText,
    CraftText: CraftText,
    Container: CraftContainer,
    CraftContainer: CraftContainer,
  }), []) as any;

  const EditorBridge: React.FC<{ initialJson?: string }> = ({ initialJson }) => {
    const { actions, query, store } = useEditor() as any;

    // autosave key per page (fallback to 'anon' if no page id)
    const autosaveKey = `craft:autosave:${page && page.id ? String(page.id) : 'anon'}`;

    useEffect(() => {
      // expose actions/query for external use
      editorRef.current = { actions, query };

      // Debug-only: wrap some actions to detect unexpected calls that may reset/replace nodes.
      // We keep references to originals and restore on cleanup to avoid persistent side-effects.
      let origDeserialize: any = null;
      let origReplaceNodes: any = null;
      let origReset: any = null;
      try {
        if (DEBUG && actions) {
          origDeserialize = actions.deserialize;
          origReplaceNodes = actions.replaceNodes;
          origReset = actions.reset;

          const makeWrapped = (name: string, fn: any) => {
            return function wrapped(...args: any[]) {
              try {
                debugLog(`[EditorV2][MONITOR] actions.${name} called`, { args });
                // include a stack trace to help locate the caller
                const st = new Error().stack;
                debugLog(`[EditorV2][MONITOR] stack for actions.${name}:`, st);
              } catch (e) { /* ignore */ }

              // Protective guard: if the editor already contains nodes, block destructive operations
              // so that a remount or UI toggle doesn't overwrite live changes.
              try {
                // query.serialize() returns a promise; call it and decide.
                (async () => {
                  try {
                    const current = query ? await query.serialize() : null;
                    const nodeCount = current && current.nodes ? Object.keys(current.nodes).length : 0;
                    if (nodeCount > 0) {
                      debugWarn(`[EditorV2][MONITOR] blocking actions.${name} because editor has ${nodeCount} node(s)`);
                      return; // skip calling original function
                    }
                    // safe to call original action
                    try { return fn && fn.apply(actions, args); } catch (e) { /* call and ignore errors */ }
                  } catch (e) {
                    // if serialize failed, fall back to calling the original action (best-effort)
                    try { return fn && fn.apply(actions, args); } catch (err) { /* ignore */ }
                  }
                })();
              } catch (e) {
                // if async wrapper fails, call original as fallback
                try { return fn && fn.apply(actions, args); } catch (err) { /* ignore */ }
              }
            };
          };

          if (origDeserialize) actions.deserialize = makeWrapped('deserialize', origDeserialize);
          if (origReplaceNodes) actions.replaceNodes = makeWrapped('replaceNodes', origReplaceNodes);
          if (origReset) actions.reset = makeWrapped('reset', origReset);
        }
      } catch (e) { /* ignore instrumentation errors */ }

      // deserialize initial JSON into the editor when available
      (async () => {
        // expose actions/query for external use (again in case of async timing)
        editorRef.current = { actions, query };

        // First, attempt to restore from autosave (sessionStorage) if available.
        let restoredFromAutosave = false;
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            const saved = window.sessionStorage.getItem(autosaveKey);
            if (saved) {
              try {
                const parsedSaved = JSON.parse(saved);
                // only deserialize saved content if editor appears empty
                let existing;
                try { existing = await query.serialize(); } catch (e) { existing = null; }
                const existingNodeCount = existing && typeof existing === 'object' && existing.nodes ? Object.keys(existing.nodes).length : 0;
                if (existingNodeCount === 0 && actions && actions.deserialize) {
                  debugLog('[EditorV2] restoring editor from autosave key', autosaveKey);
                  actions.deserialize(parsedSaved);
                  restoredFromAutosave = true;
                } else {
                  debugLog('[EditorV2] not restoring autosave: editor already has nodes', existingNodeCount);
                }
              } catch (e) {
                debugWarn('[EditorV2] failed to parse autosave session content', e);
              }
            }
          }
        } catch (e) {
          debugWarn('[EditorV2] error reading autosave from sessionStorage', e);
        }

        // If we didn't restore from autosave and there is initialJson, attempt to deserialize it (but only into an empty editor)
        if (!restoredFromAutosave && initialJson) {
          try {
            const parsed = JSON.parse(initialJson);
            if (parsed && actions && actions.deserialize) {
              try {
                let existing;
                try { existing = await query.serialize(); } catch (e) { existing = null; }
                const existingNodeCount = existing && typeof existing === 'object' && existing.nodes ? Object.keys(existing.nodes).length : 0;
                if (existingNodeCount === 0) {
                  debugLog('[EditorV2] no existing nodes -> calling actions.deserialize from initialJson');
                  actions.deserialize(parsed);
                } else {
                  debugLog('[EditorV2] skipping deserialize from initialJson: editor already has nodes', existingNodeCount);
                }
              } catch (deserializeErr: any) {
                debugWarn('[EditorV2] actions.deserialize failed', deserializeErr);
              }
            }
          } catch (e) {
            debugWarn('[EditorV2] failed to parse initialContent for deserialization', e);
          }
        }
      })();

      // Setup autosave subscription: persist the editor JSON to sessionStorage on node changes (debounced)
      let saveTimer: any = null;
      let unsub: any = null;
      try {
        if (store && store.subscribe) {
          unsub = store.subscribe((s: any) => ({ nodes: s.nodes }), async () => {
            try {
              if (saveTimer) clearTimeout(saveTimer);
              saveTimer = setTimeout(async () => {
                try {
                  if (typeof window !== 'undefined' && window.sessionStorage) {
                    const serialized = await query.serialize();
                    window.sessionStorage.setItem(autosaveKey, JSON.stringify(serialized));
                    debugLog('[EditorV2] autosaved editor to sessionStorage', autosaveKey);
                  }
                } catch (e) {
                  debugWarn('[EditorV2] autosave failed', e);
                }
              }, 250);
            } catch (e) { /* ignore per-change handler errors */ }
          });
        }
      } catch (e) {
        debugWarn('[EditorV2] failed to setup autosave subscription', e);
      }

      return () => {
        // restore monkeypatched methods
        try {
          if (DEBUG && actions) {
            if (origDeserialize) actions.deserialize = origDeserialize;
            if (origReplaceNodes) actions.replaceNodes = origReplaceNodes;
            if (origReset) actions.reset = origReset;
          }
        } catch (e) { /* ignore */ }
        try { if (saveTimer) clearTimeout(saveTimer); } catch (e) { /* ignore */ }
        try { if (unsub) unsub(); } catch (e) { /* ignore */ }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
  };

  // Debug watcher to help diagnose remounts or store clears. Active only when DEBUG is true.
  const DebugWatcher: React.FC = () => {
    const { store } = useEditor() as any;

    useEffect(() => {
      if (!DEBUG || !store || !store.subscribe) return;
      debugLog('[EditorV2:DebugWatcher] mounted');

      // helper to get node count safely
      const getNodeCount = (s: any) => (s && s.nodes ? Object.keys(s.nodes).length : 0);

      let lastCount = null as number | null;

      const unsub = store.subscribe((s: any) => ({ nodes: s.nodes }), ({ nodes }: any) => {
        const count = getNodeCount(nodes);
        if (lastCount !== count) {
          debugLog('[EditorV2:DebugWatcher] nodes changed -> count', count, 'keys', nodes ? Object.keys(nodes) : null);
          lastCount = count;
        }
      });

      return () => {
        try { if (unsub) unsub(); } catch (e) { /* ignore */ }
        debugLog('[EditorV2:DebugWatcher] unmounted');
      };
    }, [store]);

    return null;
  };

  // --- New: Floating menu shown above a single selected node ---
  const SelectedNodeMenu: React.FC<{ preview?: boolean }> = ({ preview: isPreview }) => {
    const { query, actions } = useEditor() as any;
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

    useEffect(() => {
      if (isPreview) return; // don't track selection in preview mode

      let rafId: number | null = null;
      let unsubEvent: any = null;
      const ev = query && typeof query.getEvent === 'function' ? query.getEvent('selected') : null;

      const updateFromEvent = () => {
        try {
          if (!query || typeof query.getEvent !== 'function') {
            setSelectedId(null);
            setPos(null);
            return;
          }

          const all = ev && typeof ev.all === 'function' ? ev.all() : [];
          const id = all && all.length ? String(all[0]) : null;
          setSelectedId(id);

          if (!id) {
            setPos(null);
            return;
          }

          // find DOM element for the selected node
          let el: HTMLElement | null;
          try {
            el = document.querySelector(`[data-craft-node="${id}"]`) as HTMLElement | null;
          } catch (e) { el = null; }
          if (!el) el = document.querySelector(`[data-node-id="${id}"]`) as HTMLElement | null;

          if (el) {
            const rect = el.getBoundingClientRect();
            const left = rect.left + rect.width / 2;
            const top = rect.top - 36;
            setPos((prev) => {
              if (!prev || prev.left !== left || prev.top !== top) return { left, top };
              return prev;
            });
          } else {
            setPos(null);
          }
        } catch (e) {
          if (DEBUG) debugWarn('[EditorV2:SelectedNodeMenu] updateFromEvent failed', e);
        }
      };

      // If the event API supports subscribe/on, use it to get immediate updates
      try {
        if (ev && typeof ev.subscribe === 'function') {
          unsubEvent = ev.subscribe(() => {
            updateFromEvent();
          });
        } else if (ev && typeof (ev as any).on === 'function') {
          // older event API patterns
          (ev as any).on(updateFromEvent);
          unsubEvent = () => { try { (ev as any).off && (ev as any).off(updateFromEvent); } catch (e) {} };
        }
      } catch (e) {
        unsubEvent = null;
      }

      // Always call once to initialize state
      updateFromEvent();

      // Keep the menu positioning responsive to scroll/resize
      const onWindowChange = () => updateFromEvent();
      window.addEventListener('scroll', onWindowChange, true);
      window.addEventListener('resize', onWindowChange);

      // Fallback: if event API isn't available, poll with RAF
      if (!unsubEvent) {
        const poll = () => {
          updateFromEvent();
          rafId = window.requestAnimationFrame ? window.requestAnimationFrame(poll) : (window.setTimeout as any)(poll, 100);
        };
        poll();
      }

      return () => {
        try {
          if (rafId != null) {
            window.cancelAnimationFrame?.(rafId as number);
          }
        } catch (e) { /* ignore */ }
        try { if (unsubEvent) unsubEvent(); } catch (e) { /* ignore */ }
        try { window.removeEventListener('scroll', onWindowChange, true); } catch (e) { /* ignore */ }
        try { window.removeEventListener('resize', onWindowChange); } catch (e) { /* ignore */ }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPreview]);

    const doDelete = async () => {
      if (!selectedId) return;
      try {
        if (actions) {
          if (typeof actions.delete === 'function') {
            actions.delete(selectedId);
            return;
          }
          if (typeof actions.deleteNodes === 'function') {
            actions.deleteNodes([selectedId]);
            return;
          }
          if (typeof actions.remove === 'function') {
            actions.remove(selectedId);
            return;
          }
          if (typeof actions.deleteNode === 'function') {
            actions.deleteNode(selectedId);
            return;
          }
        }
      } catch (e) {
        debugWarn('[EditorV2] SelectedNodeMenu delete action failed', e);
      }

      // As a last-resort fallback, try to clear selection so accidental interactions stop
      try {
        const ref = editorRef.current;
        if (ref && ref.actions && typeof ref.actions.setNodeEvent === 'function') {
          ref.actions.setNodeEvent('selected', new Set());
        }
      } catch (e) { /* ignore */ }
    };

    if (!selectedId || !pos || isPreview) return null;

    return (
      <div
        style={{
          position: 'fixed',
          left: pos.left,
          top: pos.top,
          transform: 'translate(-50%, -100%)',
          zIndex: 9999,
          pointerEvents: 'auto',
        }}
      >
        <div className="bg-white border rounded shadow p-1 flex items-center gap-1" style={{ fontSize: 12 }}>
          {/* Simple trash icon (inline SVG) */}
          <button
            type="button"
            onClick={doDelete}
            className="p-1 hover:bg-red-50 rounded text-red-600"
            title="Delete component"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6L17.67 19.36A2 2 0 0 1 15.69 21H8.31a2 2 0 0 1-1.98-1.64L5 6"></path>
              <path d="M10 11v6"></path>
              <path d="M14 11v6"></path>
            </svg>
          </button>
        </div>
      </div>
    );
  };

  async function handleSave() {
    // Prefer serializing the live editor state. Fall back to the server-provided initial content.
    let content = initialContent;

    try {
      if (editorRef.current && editorRef.current.query && typeof editorRef.current.query.serialize === 'function') {
        const serialized = await editorRef.current.query.serialize();
        content = JSON.stringify(serialized);
      }
    } catch (e) {
      // ignore and fall back to initialContent
      // Save: serialize failed (logging removed)
    }

    const payload = { content };

    const onSuccess = () => {
      setSaved(true);
      // hide confirmation after a short time
      setTimeout(() => setSaved(false), 2500);
    };

    if (page && page.id) {
      Inertia.put(`/pages/${page.id}`, payload, { onSuccess });
    } else {
      Inertia.post('/pages', payload, { onSuccess });
    }
  }

  // Manual deselect action (exposed as a toolbar button) - uses the same logic as the canvas handler
  const handleDeselect = () => {
    try {
      const ref = editorRef.current;
      if (!ref || !ref.actions) return;
      const hasSetEvent = typeof ref.actions.setNodeEvent === 'function';
      const hasSelect = typeof ref.actions.selectNode === 'function';
      debugLog('[EditorV2] manual deselect invoked', { hasSetEvent, hasSelect });
      if (hasSetEvent) {
        try { ref.actions.setNodeEvent('selected', new Set()); } catch (e) { /* ignore */ }
        try { ref.actions.setNodeEvent('hovered', null); } catch (e) { /* ignore */ }
        try { ref.actions.setNodeEvent('dragged', null); } catch (e) { /* ignore */ }
      }
      if (hasSelect) {
        try { ref.actions.selectNode(null); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      debugWarn('[EditorV2] manual deselect failed', e);
    }
  };

  // New: Clear the current page (remove all nodes). Confirms with the user, then attempts several
  // available Craft actions (reset/replaceNodes/deserialize) and clears the autosave key.
  const handleClearPage = () => {
    try {
      if (typeof window !== 'undefined') {
        if (!window.confirm('Clear the page? This will remove all components from the editor.')) return;
      }

      const ref = editorRef.current;
      if (ref && ref.actions) {
        try {
          if (typeof ref.actions.reset === 'function') {
            ref.actions.reset();
          } else if (typeof ref.actions.replaceNodes === 'function') {
            // replaceNodes often expects a nodes object; try an empty replacement
            try { ref.actions.replaceNodes({}); } catch (e) { /* ignore */ }
          } else if (typeof ref.actions.deserialize === 'function') {
            try { ref.actions.deserialize({ nodes: {} }); } catch (e) { /* ignore */ }
          }
        } catch (e) {
          debugWarn('[EditorV2] error while invoking clear actions', e);
        }
      }

      // Remove autosave entry for this page so it doesn't immediately rehydrate
      try {
        const autosaveKey = `craft:autosave:${page && page.id ? String(page.id) : 'anon'}`;
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.removeItem(autosaveKey);
          debugLog('[EditorV2] removed autosave key after clear', autosaveKey);
        }
      } catch (e) { /* ignore */ }

    } catch (e) {
      debugWarn('[EditorV2] handleClearPage failed', e);
    }
  };

  // import functionality was provided by the inspector textarea; we no longer expose that UI

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Page Editor (Craft.js)</h1>
        <div className="flex gap-2">
          {/* Preview toggle: hides editing tools and shows the page like an end user would see it */}
          <button
            className={`btn btn-sm ${preview ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setPreview((p) => !p)}
            type="button"
          >
            {preview ? 'Exit Preview' : 'Preview'}
          </button>

          {/* When in preview mode, hide the editing toolbar buttons */}
          {!preview && (
            <>
              <button
                className="btn btn-sm"
                onClick={() => {
                  try {
                    if (
                      editorRef.current &&
                      editorRef.current.actions &&
                      editorRef.current.actions.history &&
                      typeof editorRef.current.actions.history.undo === 'function'
                    ) {
                      editorRef.current.actions.history.undo();
                    }
                  } catch (e) {}
                }}
                type="button"
              >
                Undo
              </button>

              <button
                className="btn btn-sm"
                onClick={() => {
                  try {
                    if (
                      editorRef.current &&
                      editorRef.current.actions &&
                      editorRef.current.actions.history &&
                      typeof editorRef.current.actions.history.redo === 'function'
                    ) {
                      editorRef.current.actions.history.redo();
                    }
                  } catch (e) {}
                }}
                type="button"
              >
                Redo
              </button>

              <div className="flex gap-2 items-center">
                <button className="btn btn-primary btn-sm" onClick={handleSave} type="button">
                  Save
                </button>
                <button className="btn btn-sm" onClick={handleDeselect} type="button">Deselect</button>

                {saved && (
                  <div className="text-sm text-green-600 font-medium ml-2">Saved</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Resolver: include both the displayName keys (Text/Container) and the
          original variable names (CraftText/CraftContainer) so older serialized
          trees that refer to either form will resolve. */}
      <Editor resolver={resolver}>
        <div style={editorStyle}>
          {DEBUG && <DebugWatcher />}

          {/* Left panel: toolbox/settings. Hidden in preview mode */}
          <div style={{ width: 240, display: preview ? 'none' : undefined }} data-craft-left-panel>
            <div className="bg-white border rounded overflow-hidden">
              <div className="flex">
                <button
                  className={`flex-1 p-2 text-sm ${leftTab === 'toolbox' ? 'bg-gray-100 font-medium' : 'bg-white'}`}
                  onClick={() => { handleLeftTabClick('toolbox'); debugLog('[EditorV2] tab button clicked -> toolbox'); }}
                  type="button"
                >
                  Toolbox
                </button>
                <button
                  className={`flex-1 p-2 text-sm ${leftTab === 'settings' ? 'bg-gray-100 font-medium' : 'bg-white'}`}
                  onClick={() => { handleLeftTabClick('settings'); debugLog('[EditorV2] tab button clicked -> settings'); }}
                  type="button"
                >
                  Settings
                </button>
              </div>
              <div style={{ height: 'calc(80vh - 2.5rem)', overflow: 'auto' }}>
                {/* Keep both panels mounted to avoid unmounting side-effects. Hide the inactive one. */}
                <div
                  className="p-2"
                  style={{ display: leftTab === 'toolbox' ? undefined : 'none' }}
                  aria-hidden={leftTab !== 'toolbox'}
                >
                  <Toolbox />
                </div>

                <div
                  className="p-2"
                  style={{ display: leftTab === 'settings' ? undefined : 'none' }}
                  aria-hidden={leftTab !== 'settings'}
                >
                  <SettingsPanel />
                </div>
              </div>
            </div>
          </div>

          {/* Canvas: when previewing remove editor chrome and disable pointer interactions */}
          <div
            style={
              preview
                ? { ...canvasStyle, border: 'none', background: 'transparent', overflow: 'visible' }
                : canvasStyle
            }
            onPointerDownCapture={handleCanvasPointerDown}
            onMouseDownCapture={(e) => handleCanvasPointerDown(e as any)}
          >
            {/* Provide preview context to nodes, but do NOT render the Provider inside Frame children
                because Craft.js will attempt to parse any non-resolver React components as nodes. */}
            <CraftPreviewContext.Provider value={preview}>
              <Frame>
                {/* mark the top-level canvas element so clicks on its background clear selection */}
                <Element is={CraftContainer} canvas data-craft-root>
                  <CraftText text="Drag components here" />
                </Element>
              </Frame>
            </CraftPreviewContext.Provider>
          </div>

          {/* Floating menu above selected node (hidden in preview) */}
          {!preview && <SelectedNodeMenu preview={preview} />}

          {/* Right panel (forms/flows) - hidden in preview mode */}
          {!preview && (
            <div style={{ width: 320 }}>
              <div className="mt-4 p-4 bg-white border rounded">
                <h3 className="font-semibold mb-2">Available Forms</h3>
                <ul>
                  {Array.isArray(forms) && forms.length > 0 ? (
                    forms.map((f: any) => <li key={f.id}>{f.name}</li>)
                  ) : (
                    <li className="text-sm text-gray-500">No forms available</li>
                  )}
                </ul>

                <h3 className="font-semibold mt-4 mb-2">Flows</h3>
                <ul>
                  {flows.map((fl: any) => (
                    <li key={fl.id}>{fl.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <EditorBridge initialJson={initialContent} />
      </Editor>
    </div>
  );
}
