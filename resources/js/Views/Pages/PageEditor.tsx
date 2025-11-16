import React, { useEffect, useRef, useState } from 'react';
// Removed unused MUI Snackbar/Alert imports from PageEditor since toasts will use the global app snackbar in DashboardLayout.

// Craft.js
import { Editor as CraftEditor, Frame, Element, useEditor } from '@craftjs/core';

// Local editor building blocks (already present in the repo)
import { Viewport, RenderNode } from './Components/Editor';
import { Column, Container } from './Components/Selectors';
import { Button } from './Components/Selectors/Button/Button';
import { Custom1, OnlyButtons } from './Components/Selectors/Custom1/Custom';
import { Custom2, Custom2VideoDrop } from './Components/Selectors/Custom2/Custom2';
import { Custom3 } from './Components/Selectors/Custom3/Custom3';
import { Video } from './Components/Selectors/Video/Video';
import { Flow } from './Components/Selectors/Flow/Flow';
import { Text } from './Components/Selectors/Text/Text';
// Icons for viewport toggles
import { EyeIcon, PencilSimpleIcon, DeviceMobileIcon, DeviceTabletIcon, DesktopIcon, ArrowCounterClockwiseIcon, ArrowClockwiseIcon } from '@phosphor-icons/react';
import { showAppToast } from '@/utils/toast';
import {Head, router, useForm} from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";



// Module-scoped debug helpers so they can be exported and won't trigger unused warnings
export const debugEcho = async (payload: any) => {
    try {
        const resp = await fetch('/test_post', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const json = await resp.json();
        console.debug('debugEcho response ->', json);
        return json;
    } catch (e) {
        console.error('debugEcho failed', e);
        throw e;
    }
};

export const sendFormViaFetch = async (url: string, payload: any, method: 'post' | 'put' = 'post') => {
    const tokenMeta = typeof document !== 'undefined' ? document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null : null;
    const headers: Record<string,string> = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (tokenMeta?.content) headers['X-CSRF-TOKEN'] = tokenMeta.content;

    const form = new URLSearchParams();
    const payloadWithMethod = method === 'put' ? { ...payload, _method: 'put' } : payload;
    Object.keys(payloadWithMethod).forEach(k => {
        const v = (payloadWithMethod as any)[k];
        form.append(k, typeof v === 'string' ? v : JSON.stringify(v));
    });

    // Normalize URL to dashboard prefix when Ziggy may resolve to non-prefixed routes
    const normalizeUrl = (u: string) => {
        try {
            const parsed = new URL(u, typeof window !== 'undefined' ? window.location.origin : '');
            let path = parsed.pathname;
            if (path.startsWith('/pages') && !path.startsWith('/dashboard/pages')) {
                path = '/dashboard' + path;
                parsed.pathname = path;
                return parsed.toString();
            }
            return parsed.toString();
        } catch (e) {
            if (u.startsWith('/pages') && !u.startsWith('/dashboard/pages')) {
                return '/dashboard' + u;
            }
            return u;
        }
    };

    const finalUrl = normalizeUrl(url);
    console.debug('sendFormViaFetch: finalUrl ->', finalUrl);

    const resp = await fetch(finalUrl, {
        method: 'POST',
        credentials: 'same-origin',
        headers,
        body: form.toString(),
    });

    if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        return Promise.reject(new Error(`Fetch failed: ${resp.status} ${resp.statusText} - ${text.slice(0,500)}`));
    }

    return await resp.text();
};

// Make helpers available on window for console debugging (ignore in non-browser envs)
try { (window as any).__debugEcho = debugEcho; } catch (e) { /* ignore */ }
try { (window as any).__sendFormViaFetch = sendFormViaFetch; } catch (e) { /* ignore */ }

export default function PageEditor({ auth, page = null, forms: _forms = {}, flows: _flows = [] }: { auth: any; page?: any; forms?: any; flows?: any }) {
    const isEditing = !!page;

    // Derive an initial page id from common API shapes so we populate the form state correctly
    const initialPageId = page?.data?.id ?? page?.id ?? null;
    const initialPageContent = page?.data?.content ?? page?.content ?? '';
    const initialPageName = page?.data?.name ?? page?.name ?? '';
    // New: custom CSS initial value (try a few common shapes)
    const initialPageCustomCss = page?.data?.custom_css ?? page?.custom_css ?? page?.data?.customCss ?? page?.customCss ?? '';



    const { data, setData, processing, errors } = useForm({
        name: initialPageName ?? '',
        content: initialPageContent ?? '',
        id: initialPageId,
        // include custom_css in the form so Inertia will send it with requests
        custom_css: initialPageCustomCss ?? '',
    });

    // Keep form state in sync when the server sends updated page props (e.g. after save)
    useEffect(() => {
        try {
            const serverPage = page?.data ?? page ?? null;
            if (!serverPage) return;
            // Map options.custom_css (if present) into the form's custom_css
            const serverCustomCss = (serverPage.options && serverPage.options.custom_css) ?? serverPage.custom_css ?? '';
            setData('id', serverPage.id ?? data.id);
            setData('name', serverPage.name ?? data.name);
            // prefer server content when provided
            setData('content', typeof serverPage.content === 'string' ? serverPage.content : (serverPage.content ? JSON.stringify(serverPage.content) : data.content));
            setData('custom_css', serverCustomCss ?? data.custom_css ?? '');
        } catch (e) {
            // ignore sync errors
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // Viewport preview size (mobile/tablet/desktop)
    const [viewportSize, setViewportSize] = useState<'mobile'|'tablet'|'desktop'>(() => {
        try {
            const stored = typeof window !== 'undefined' ? window.localStorage.getItem('editor:viewportSize') : null;
            if (stored === 'mobile' || stored === 'tablet' || stored === 'desktop') return stored;
        } catch (e) {
            // ignore
        }
        return 'desktop';
    });

    // Editor control state (undo/redo/preview) kept in local state and synced with craft query via polling
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    // start in Preview (original behavior) and keep in sync with craft's internal state
    const [editorEnabledState, setEditorEnabledState] = useState<boolean>(true);

    useEffect(() => {
        let mounted = true;
        const tick = () => {
            try {
                const q = editorApiRef.current?.query;
                if (!q) return;
                const mayBeUndo = typeof q.history?.canUndo === 'function' ? q.history.canUndo() : false;
                const mayBeRedo = typeof q.history?.canRedo === 'function' ? q.history.canRedo() : false;

                let enabledVal = editorEnabledState;
                try {
                    if (typeof q.getOptions === 'function') {
                        const opts = q.getOptions();
                        if (opts && typeof opts.enabled === 'boolean') enabledVal = opts.enabled;
                    } else if (typeof q.getState === 'function') {
                        const state = q.getState();
                        if (state && state.options && typeof state.options.enabled === 'boolean') enabledVal = state.options.enabled;
                    }
                } catch (e) {
                    // ignore
                }

                if (!mounted) return;
                setCanUndo(mayBeUndo);
                setCanRedo(mayBeRedo);
                setEditorEnabledState(enabledVal);
            } catch (e) {
                // ignore polling errors
            }
        };

        // Start polling every 250ms to keep UI in sync with craft's internal state
        const handle = setInterval(tick, 250);
        // run once immediately
        tick();
        return () => {
            mounted = false;
            clearInterval(handle);
        };
    }, []);

    // Persist viewport size to localStorage when it changes
    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && viewportSize) {
                window.localStorage.setItem('editor:viewportSize', viewportSize);
            }
        } catch (e) {
            // ignore storage errors
        }
    }, [viewportSize]);

    // Inject custom CSS into document.head so it is applied after other styles and can override them.
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const id = 'page-editor-custom-css';
        let styleEl = document.getElementById(id) as HTMLStyleElement | null;
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = id;
            // ensure it's appended at the end of head so it takes precedence
            document.head.appendChild(styleEl);
        }

        const raw = data.custom_css || '';
        try {
            styleEl.textContent = raw.replace(/([^{]+)\{([^}]+)}/g, (m, selector, body) => {
                const decls = body.split(';').map(d => d.trim()).filter(Boolean);
                const newDecls = decls.map(d => {
                    if (!d.includes(':') || d.startsWith('/*') || /!important\s*$/.test(d)) return d + ';';
                    return d + ' !important;';
                }).join(' ');
                return `${selector}{${newDecls}}`;
            });
        } catch (e) {
            styleEl.textContent = raw;
        }

        return () => {
            // remove on unmount to avoid leaking styles
            try { styleEl?.remove(); } catch (e) { /* ignore */ }
        };
    }, [data.custom_css]);

    // Warn on mount if we're editing but couldn't find an id — helps debugging server prop shapes
    useEffect(() => {
        if (isEditing && !initialPageId) {
            console.warn('Editor: editing mode but no page id found on `page` prop. This usually means the server did not include `id` at top-level.');
            console.debug('Editor: `page` prop shape ->', page);
            console.debug('Editor: current form data.id ->', (data as any)?.id);
        }
    }, [isEditing, initialPageId]);

    // A ref that will be populated by EditorInitializer with the craftjs API (actions + query)
    const editorApiRef = useRef<any>(null);

    // Use the exported showAppToast utility
    const showToast = (msg: string) => {
        try { showAppToast(msg); } catch (e) { /* ignore */ }
    };

    // Helper to detect if stored content is serialized craft JSON
    const isSerialized = (() => {
        const content = initialPageContent;
        if (!content) return false;
        try {
            const parsed = typeof content === 'string' ? JSON.parse(content) : content;

            // Common craft serialized shapes:
            // - { nodes: { ... }, rootNode: 'ROOT' }
            // - { state: { nodes: { ... } } }
            // - node-map style: { ROOT: {...}, <id>: {...} }
            const looksLikeNodeMap = Boolean(
                typeof parsed === 'object' &&
                Object.keys(parsed).length > 0 &&
                // if any top-level value looks like a node (has `type` / `isCanvas` / `props` / `nodes`)
                Object.values(parsed).some(v => v && typeof v === 'object' && ('type' in v || 'isCanvas' in v || 'props' in v || 'nodes' in v))
            );

            return typeof parsed === 'object' && (
                !!(parsed as any).nodes ||
                !!(parsed as any).state ||
                !!(parsed as any).root ||
                !!(parsed as any).rootNode ||
                looksLikeNodeMap
            );
        } catch (e) {
            return false;
        }
    })();

    // Helper to robustly extract a page id from a variety of shapes commonly returned by APIs
    const getPageId = () => {
        // Prefer explicit server-provided page prop id
        if ((page as any)?.id) return (page as any).id;
        // Inertia/Laravel resources sometimes nest the model under a `data` or `model` key
        if ((page as any)?.data?.id) return (page as any).data.id;
        if ((page as any)?.model?.id) return (page as any).model.id;
        // The local form state may contain the id if it was populated previously
        if ((data as any)?.id) return (data as any).id;
        // Nothing found
        return null;
    };

    // Save: serialize craft state (if available) into content and submit to server
    const save = async () => {
        let page_id = getPageId() ?? '';
        let newContent: any;
        let page_name = data.name ?? '';

        // Try to serialize current editor state if the editor API is available.
        try {
            const q = editorApiRef.current?.query;
            if (q && typeof q.serialize === 'function') {
                newContent = q.serialize();
            } else {
                // Fallback to current form content (may be legacy HTML or previously stored JSON)
                newContent = data.content;
            }
        } catch (e) {
            console.error('save: serialize failed', e);
            newContent = data.content;
        }


        if (!page_id) {
            // If there are page settings written by the settings panel, include them in the create payload
            try {
                const globalSettings = (window as any).__PAGE_SETTINGS || {};
                const settingsKey = 'unsaved';
                const pageSettings = globalSettings[settingsKey] || {};
                // Build payload but avoid sending an empty `name` which could overwrite existing name with a default
                const payload: any = { content: newContent };
                const settingsName = pageSettings.name && String(pageSettings.name).trim() ? String(pageSettings.name).trim() : null;
                const formName = page_name && String(page_name).trim() ? String(page_name).trim() : null;
                if (settingsName) payload.name = settingsName;
                else if (formName) payload.name = formName;
                if (pageSettings.slug && String(pageSettings.slug).trim()) payload.slug = String(pageSettings.slug).trim();
                // If there are option keys, merge them into payload.options (no existing options on create)
                if (pageSettings.options) payload.options = pageSettings.options;
                // Include custom_css from the editor form into options so it persists in the options JSON column
                if (!payload.options) payload.options = {};
                if (data.custom_css) payload.options.custom_css = data.custom_css;

                router.post(route('pages.store'), payload, {
                    onSuccess: (page) => {
                        console.log('Successfully stored page id');
                        try { delete (window as any).__PAGE_SETTINGS?.[settingsKey]; } catch(e){}
                        try {
                            const returned = (page as any)?.props?.page ?? (page as any)?.props?.page?.data ?? null;
                            if (returned) {
                                // sync form state with returned values
                                setData('id', returned.id ?? data.id);
                                setData('name', returned.name ?? data.name);
                                setData('content', typeof returned.content === 'string' ? returned.content : JSON.stringify(returned.content ?? {}));
                                setData('custom_css', returned.custom_css ?? data.custom_css ?? '');
                                // Ensure the URL reflects the editor for the created page (stay in editor)
                                try {
                                    if (returned.id) {
                                        // Navigate to the editor URL for the newly created page and replace history so back-button goes where user expects
                                        router.get(route('pages.edit', returned.id), {}, { replace: true });
                                    }
                                } catch (e) {
                                    // ignore routing errors
                                }
                                // show toast on success
                                try { showToast('Saved'); } catch (e) {}
                            }
                            // Server returned Inertia payload; rely on that to update props instead of forcing a reload.
                        } catch (e) {
                            // ignore
                        }
                    }
                });
            } catch (e) {
                // Fallback to the simpler payload if reading window fails
                router.post(route('pages.store'), {name: page_name, content: newContent}, {
                    onSuccess: () => { console.log('Successfully stored page id'); try { showToast('Saved'); } catch(e){} }
                });
            }
         } else {
            // Include settings from the settings panel (if present) in the update payload
            try {
                const globalSettings = (window as any).__PAGE_SETTINGS || {};
                const settingsKey = page_id || 'unsaved';
                const pageSettings = globalSettings[settingsKey] || {};
                // Build payload but avoid sending an empty `name` which could overwrite existing name with a default
                const payload: any = { content: newContent };
                const settingsName = pageSettings.name && String(pageSettings.name).trim() ? String(pageSettings.name).trim() : null;
                const formName = page_name && String(page_name).trim() ? String(page_name).trim() : null;
                if (settingsName) payload.name = settingsName;
                else if (formName) payload.name = formName;
                if (pageSettings.slug && String(pageSettings.slug).trim()) payload.slug = String(pageSettings.slug).trim();
                 // Merge existing options with the settings panel options so partial updates don't clobber other keys
                 const existingOptions = (page && (page.options ?? page.data?.options)) || {};
                 if (pageSettings.options) {
                     payload.options = { ...(existingOptions || {}), ...(pageSettings.options || {}) };
                 }
                 // Ensure editor-level custom_css is preserved into options (editor form holds the authoritative custom_css)
                 if (!payload.options) payload.options = { ...(existingOptions || {}) };
                 if (data.custom_css) payload.options.custom_css = data.custom_css;

                // Debug: show payload in console to help diagnose name issues
                try { console.debug('PageEditor.save - update payload ->', payload); } catch (e) {}

                router.put(route('pages.update', page_id), payload, {
                    onSuccess: (page) => {
                        console.log('Successfully stored page id');
                        try { delete (window as any).__PAGE_SETTINGS?.[settingsKey]; } catch(e){}
                        try {
                            const returned = (page as any)?.props?.page ?? (page as any)?.props?.page?.data ?? null;
                            if (returned) {
                                setData('id', returned.id ?? data.id);
                                setData('name', returned.name ?? data.name);
                                setData('content', typeof returned.content === 'string' ? returned.content : JSON.stringify(returned.content ?? {}));
                                setData('custom_css', returned.custom_css ?? data.custom_css ?? '');
                            }
                            // show toast on successful update
                            try { showToast('Saved'); } catch (e) {}
                         } catch (e) {
                             // ignore
                         }
                     }
                 });
            } catch (e) {
                router.put(route('pages.update', page_id), {name: page_name, content: newContent}, {
                    onSuccess: () => { console.log('Successfully stored page id'); try { showToast('Saved'); } catch(e){} }
                });
            }
         }



         console.log(page_id);
         console.log(newContent);
     }

    // Expose debug helpers on window so they are available from the console and not flagged as unused
    try { (window as any).__debugEcho = debugEcho; } catch (e) { /* ignore in non-browser environments */ }


    // EditorInitializer runs inside Craft Editor context so it can access useEditor
    const EditorInitializer: React.FC<{ pageContent?: any }> = ({ pageContent }) => {
        // useEditor must be called inside the Craft editor context (this component is rendered inside <CraftEditor>)
        const { actions, query } = useEditor(() => ({}));

        // expose API
        useEffect(() => {
            editorApiRef.current = { actions, query };
            return () => {
                editorApiRef.current = null;
            };
        }, [actions, query]);

        // Helper to normalize various serialized shapes into the { nodes, rootNode } shape craft expects
        const normalizeSerialized = (obj: any) => {
            if (!obj || typeof obj !== 'object') return obj;

            // If already in the expected shape
            if ((obj as any).nodes && ((obj as any).rootNode || (obj as any).root)) return { nodes: (obj as any).nodes, rootNode: (obj as any).rootNode ?? (obj as any).root };

            // If it's wrapped under `state`
            if ((obj as any).state && typeof (obj as any).state === 'object') {
                return normalizeSerialized((obj as any).state);
            }

            // Node-map style: top-level keys are node ids (e.g. 'ROOT', 'abc123')
            const keys = Object.keys(obj);
            const looksLikeNodeMap = keys.length > 0 && keys.some(k => {
                const v = (obj as any)[k];
                return v && typeof v === 'object' && ('type' in v || 'props' in v || 'isCanvas' in v || 'nodes' in v);
            });
            if (looksLikeNodeMap) {
                // guess the root node (prefer explicit 'ROOT' then first isCanvas)
                let rootKey = 'ROOT';
                if (!keys.includes(rootKey)) {
                    const isCanvasKey = keys.find(k => (obj as any)[k] && (obj as any)[k].isCanvas);
                    rootKey = (isCanvasKey as string) ?? keys[0];
                }

                // Normalize node type objects that hold { resolvedName: 'X' } into string 'X'
                const normalizedNodes: Record<string, any> = {};
                keys.forEach(k => {
                    const node = (obj as any)[k];
                    if (node && typeof node === 'object') {
                        const copy = { ...node };
                        if (copy.type && typeof copy.type === 'object' && 'resolvedName' in copy.type) {
                            copy.type = (copy.type as any).resolvedName;
                        }
                        normalizedNodes[k] = copy;
                    } else {
                        normalizedNodes[k] = node;
                    }
                });

                return { nodes: normalizedNodes, rootNode: rootKey };
            }

            // Unknown shape — return as-is
            return obj;
        };

        // If editing and we have serialized craft JSON, deserialize it
        useEffect(() => {
            if (!pageContent) return;

            let parsed: any = pageContent;
            try {
                parsed = typeof pageContent === 'string' ? JSON.parse(pageContent) : pageContent;
            } catch (e) {
                // not JSON — nothing to do; the initial Frame will render legacy HTML as a Text node
                return;
            }

            // Debug info about the parsed payload to help trace load problems
            try {
                // eslint-disable-next-line no-console
                console.debug('EditorInitializer: parsed content shape', {
                    isString: typeof pageContent === 'string',
                    hasNodes: !!(parsed && (parsed as any).nodes),
                    hasState: !!(parsed && (parsed as any).state),
                    hasRoot: !!(parsed && ((parsed as any).root || (parsed as any).rootNode)),
                });
            } catch (e) {
                // ignore logging failures
            }

            // actions.deserialize may not be mounted immediately; retry until available (up to ~5s)
            let attempts = 0;
            const maxAttempts = 100; // 100 * 50ms = 5s
            const intervalMs = 50;
            const timer = setInterval(() => {
                attempts++;
                const deserializer = (actions as any)?.deserialize;
                if (deserializer && typeof deserializer === 'function') {
                    try {
                        // Normalize various shapes (state wrapper, nodes map, node-map) into the shape craft expects
                        const toDeserialize = normalizeSerialized(parsed);
                        // eslint-disable-next-line no-console
                        console.debug('EditorInitializer: calling actions.deserialize with normalized shape', { toDeserialize });
                        deserializer(toDeserialize);

                        // eslint-disable-next-line no-console
                        console.debug('EditorInitializer: deserialize completed');

                        // Keep the Inertia form in sync with loaded content (stringify if object)
                        try {
                            setData('content', typeof pageContent === 'string' ? pageContent : JSON.stringify(parsed));
                        } catch (e) {
                            // ignore setData failures — better to still let the editor load
                        }
                    } catch (e) {
                        // swallow deserialize errors but log for debugging
                        // eslint-disable-next-line no-console
                        console.error('EditorInitializer.deserialize failed', e);
                    }
                    clearInterval(timer);
                } else if (attempts >= maxAttempts) {
                    clearInterval(timer);
                }
            }, intervalMs);

            return () => clearInterval(timer);
        }, [pageContent, actions]);

        return null;
    };

    // Build a simple header with Save/Cancel
    const header = (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-lg font-semibold">{isEditing ? `Edit Page: ${page?.name ?? ''}` : 'Create Page'}</h1>
                {errors && (errors.name || errors.content) ? (
                    <div className="mt-2 text-sm text-red-600">
                        {errors.name && <div>{errors.name}</div>}
                        {errors.content && <div>{errors.content}</div>}
                    </div>
                ) : null}
            </div>
            <div className="flex items-center space-x-3">
                {/* Undo / Redo controls moved to top bar */}
                <div className="inline-flex items-center rounded bg-transparent p-1">
                    <button
                        type="button"
                        onClick={() => {
                            try { editorApiRef.current?.actions?.history?.undo(); } catch (e) { /* ignore */ }
                        }}
                        disabled={!canUndo}
                        className={"p-2 rounded " + (!canUndo ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100')}
                        title="Undo"
                        aria-label="Undo"
                    >
                        <ArrowCounterClockwiseIcon className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            try { editorApiRef.current?.actions?.history?.redo(); } catch (e) { /* ignore */ }
                        }}
                        disabled={!canRedo}
                        className={"p-2 rounded " + (!canRedo ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100')}
                        title="Redo"
                        aria-label="Redo"
                    >
                        <ArrowClockwiseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Preview toggle moved to top bar */}
                <div>
                    <button
                        type="button"
                        onClick={() => {
                            try {
                                // optimistic toggle
                                const newVal = !editorEnabledState;
                                setEditorEnabledState(newVal);
                                editorApiRef.current?.actions?.setOptions((options: any) => (options.enabled = newVal));
                            } catch (e) {
                                // ignore
                            }
                        }}
                        className={"inline-flex items-center px-3 py-2 rounded " + (editorEnabledState ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700')}
                        title={editorEnabledState ? 'Switch to Edit' : 'Switch to Preview'}
                        aria-pressed={editorEnabledState}
                        aria-label="Toggle preview"
                    >
                        {editorEnabledState ? <EyeIcon className="w-5 h-5" /> : <PencilSimpleIcon className="w-5 h-5" />}
                        <span className="ml-2 text-sm">{editorEnabledState ? 'Preview' : 'Edit'}</span>
                    </button>
                </div>
                 {/* Viewport size toggles (icons + tooltips) */}
                 <div className="inline-flex items-center rounded bg-gray-100 p-1" role="tablist" aria-label="Viewport size">
                    <button
                        type="button"
                        onClick={() => setViewportSize('mobile')}
                        className={"p-2 rounded " + (viewportSize === 'mobile' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:bg-white/50')}
                        aria-pressed={viewportSize === 'mobile'}
                        title="Mobile (375px)"
                        aria-label="Mobile preview"
                    >
                        <DeviceMobileIcon className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewportSize('tablet')}
                        className={"p-2 rounded " + (viewportSize === 'tablet' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:bg-white/50')}
                        aria-pressed={viewportSize === 'tablet'}
                        title="Tablet (768px)"
                        aria-label="Tablet preview"
                    >
                        <DeviceTabletIcon className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewportSize('desktop')}
                        className={"p-2 rounded " + (viewportSize === 'desktop' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:bg-white/50')}
                        aria-pressed={viewportSize === 'desktop'}
                        title="Desktop (full width)"
                        aria-label="Desktop preview"
                    >
                        <DesktopIcon className="w-5 h-5" />
                    </button>
                </div>
                 <button onClick={save} disabled={processing} className="bg-blue-600 text-white px-4 py-2 rounded">
                     {processing ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Page'}
                 </button>
                 <a href={route('pages.index')} className="text-sm text-gray-600">Cancel</a>
             </div>
         </div>
     );

    // Resolver for craft components
    const resolver = {
        Container,
        Text,
        FlexColumn: Column,
        Custom1,
        Custom2,
        Custom2VideoDrop,
        Custom3,
        Custom3BtnDrop: (Custom3 as any).BtnDrop || (Custom3 as any),
        OnlyButtons,
        Button,
        Video,
        Flow,
    } as any;

    // Initial children: if we don't have serialized content, render a basic canvas containing the existing HTML (legacy)
     const initialChildren = (() => {
         if (isSerialized) {
             // When serialized we'll rely on actions.deserialize in initializer — so render an empty Frame
             return (
                 <Frame data ={initialPageContent}>

                 </Frame>
             );
         }

         // Not serialized: show a simple initial canvas containing the legacy HTML (or a placeholder)
         const initialText = typeof page?.content === 'string' ? page.content : '<h2>New page</h2>';

         return (
             <Frame json={initialPageContent}>
                 <Element canvas is={Container} custom={{ displayName: 'Root' }}>
                     <Text text={initialText} />
                 </Element>
             </Frame>
         );
     })();

    return (
        <DashboardLayout user={auth.user} header={header}>
             <Head title={isEditing ? `Edit: ${page?.name || 'Page'}` : 'Create Page'} />
             <div className="h-full">
                 {/* Custom CSS is injected into document.head by a useEffect so it reliably appears after other styles and is applied with !important. */}

                 <CraftEditor resolver={resolver} onRender={RenderNode}>
                     {/* initializer must be rendered inside the editor so useEditor works */}
                     <EditorInitializer pageContent={page?.content} />

                     <Viewport viewportSize={viewportSize}>
                         {initialChildren}
                     </Viewport>
                 </CraftEditor>

                {/* Hidden form field so Inertia has the latest content if user navigates away using other flows */}
                {/* Add a name so html-form based tools (and some integrations) will pick this up if needed */}
                <input type="hidden" name="content" value={data.content} />

                {/* Snackbar for success messages */}
                {/* Removed Snackbar and Alert imports and their usage since toasts will use the global app snackbar in DashboardLayout. */}

             </div>
        </DashboardLayout>
     );
 }
