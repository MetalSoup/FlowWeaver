import React, { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";
import PrimaryButton from "@/Components/PrimaryButton";

export default function ShowFlow({flow_id, flow = {} }: any) {

    /*
    * flow looks like this:
    * {"form_scbk97k": { fields: [...] }, "rawhtml_ff4wz7m": { html: "..." } }
    */

    // Local fetched flow state. Start null; if a prop arrives we'll sync it below.
    const [useFlow, setUseFlow] = useState<any | null>(
        null
    );

    const hasFlowData = (f: any) => f && typeof f === 'object' && Object.keys(f).length > 0;

    // Keep track of which flow_id we've already fetched to avoid repeated requests
    const fetchedFlowIdRef = useRef<number | string | null>(null);
    const fetchingRef = useRef<boolean>(false);

    // If parent later supplies a non-empty flow prop, prefer it and keep local state synced
    useEffect(() => {
        try {
            if (hasFlowData(flow)) {
                // Avoid setting identical object to prevent extra re-renders
                const current = useFlow;
                // crude shallow comparison via keys length and JSON when small; avoids unnecessary setState
                const same = current && JSON.stringify(current) === JSON.stringify(flow);
                if (!same) setUseFlow(flow);
            }
        } catch (err) {
            // JSON.stringify may fail on cycles; in that case, just set
            if (hasFlowData(flow)) setUseFlow(flow);
        }
    }, [flow]);

    // Fetch flow from controller if we have a flow_id but no flow data yet.
    // Depend only on flow_id so we don't re-run when object identities change.
    useEffect(() => {
        const fetchFlow = async () => {
            if (!flow_id) return;
            if (hasFlowData(useFlow)) return; // already have it
            if (fetchedFlowIdRef.current === flow_id) return; // already fetched this id

            fetchedFlowIdRef.current = flow_id;
            if (fetchingRef.current) return;
            console.debug('ShowFlow: fetching compiled flow for id', flow_id);
            fetchingRef.current = true;
            try {
                setUseFlow(null);
                const url = route('get_flow', flow_id);
                const res = await fetch(url, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        // Make this an XHR request so the controller returns JSON (not an Inertia page)
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    },
                });
                if (!res.ok) {
                    console.warn('ShowFlow: fetch get_flow returned status', res.status);
                } else {
                    const json = await res.json();
                    // suppressed detailed debug log for fetched flow
                    // Try several common locations where the compiled flow may appear
                    const tryPaths = [
                        (p:any) => p?.flow,
                        (p:any) => p?.props?.flow,
                        (p:any) => p?.props?.page?.props?.flow,
                        (p:any) => p?.props?.initialProps?.flow,
                        (p:any) => p?.props?.props?.flow,
                    ];
                    let remote: any = null;
                    for (const getter of tryPaths) {
                        try {
                            const r = getter(json);
                            if (hasFlowData(r)) { remote = r; break; }
                        } catch (e) { /* ignore */ }
                    }
                    // Fallback: if json contains a top-level `flow` key
                    if (!remote && json?.flow) remote = json.flow;
                    // As a last resort, search the entire props object for any key named 'flow'
                    if (!remote && json?.props) {
                        const deepFind = (obj:any) => {
                            if (!obj || typeof obj !== 'object') return null;
                            if (obj.flow && hasFlowData(obj.flow)) return obj.flow;
                            for (const k of Object.keys(obj)) {
                                try {
                                    const val = obj[k];
                                    const found = deepFind(val);
                                    if (found) return found;
                                } catch (e) {}
                            }
                            return null;
                        };
                        remote = deepFind(json.props);
                    }
                    if (remote) {
                        // extracted compiled flow (logging suppressed)
                        setUseFlow(remote);
                        fetchedFlowIdRef.current = flow_id; // mark as fetched only on success
                    } else {
                        console.warn('ShowFlow: could not find compiled flow in fetch response', json);
                        // allow retry next time by not marking fetchedFlowId
                    }
                }
            } catch (err) {
                console.warn('ShowFlow: fetching flow failed', err);
            } finally {
                fetchingRef.current = false;
            }
        };
        fetchFlow();
    }, [flow_id]);

    // Use fetched flow if available, otherwise fall back to provided prop or empty object
    const effectiveFlow = hasFlowData(useFlow) ? useFlow : (hasFlowData(flow) ? flow : {});

    const keys = Object.keys(effectiveFlow || {});
    const keysKey = keys.join('|'); // stable dependency key for effects that care about flow steps

    // selectedKey: canonical selection (reflected in URL & nav buttons)
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    // displayedKey: actually rendered step (previously used for animating out/in) — now always in sync
    const [displayedKey, setDisplayedKey] = useState<string | null>(null);
    // Track initial load so we don't pushState on first set of selectedKey
    const initialLoadedRef = useRef(false);

    // Form state preserved across steps and persisted to localStorage per page
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const contentRef = useRef<HTMLDivElement | null>(null);

    // Debug panel enabled when URL contains ?debug_flow=1
    const showDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug_flow');

    // Local storage key per pathname so different flows/pages don't collide
    const storageKey = typeof window !== 'undefined' ? `flow_form_state_${encodeURIComponent(window.location.pathname)}` : null;
    const storageSubmissionKey = typeof window !== 'undefined' ? `flow_submission_${encodeURIComponent(window.location.pathname)}` : null;

    // Initialize selectedKey/displayedKey from URL param `step` if valid, otherwise pick first key
    useEffect(() => {
        if (selectedKey) return;
        const params = new URLSearchParams(window.location.search);
        const stepParam = params.get("step");
        const first = keys[0] ?? null;

        if (stepParam && keys.includes(stepParam)) {
            setSelectedKey(stepParam);
            setDisplayedKey(stepParam);
        } else {
            setSelectedKey(first);
            setDisplayedKey(first);
        }

        // Load saved form state if available
        try {
            if (storageKey && window.localStorage) {
                const raw = window.localStorage.getItem(storageKey);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object') {
                        setFormValues(parsed);
                    }
                }
            }
            if (storageSubmissionKey && window.localStorage) {
                const sid = window.localStorage.getItem(storageSubmissionKey);
                if (sid) setSubmissionId(sid);
            }
        } catch (err) {
            console.warn('Could not load saved flow form state', err);
        }
    }, [keysKey]);

    // Keep URL in sync when selectedKey changes
    useEffect(() => {
        if (!selectedKey) return;
        const params = new URLSearchParams(window.location.search);
        params.set("step", selectedKey);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        if (!initialLoadedRef.current) {
            window.history.replaceState({}, "", newUrl);
            initialLoadedRef.current = true;
        } else {
            try {
                window.history.pushState({}, "", newUrl);
            } catch (err) {
                window.history.replaceState({}, "", newUrl);
            }
        }
    }, [selectedKey]);

    // Listen to popstate so Back/Forward navigates between steps
    useEffect(() => {
        const onPop = () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const step = params.get('step');
                const first = keys[0] ?? null;
                const target = step && keys.includes(step) ? step : first;
                setSelectedKey(target);
                setDisplayedKey(target);
            } catch (err) {
                // ignore
            }
        };
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, [keysKey]);

    // Persist form state whenever it changes
    useEffect(() => {
        if (!storageKey) return;
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(formValues));
        } catch (err) {
            // ignore
        }
    }, [formValues]);

    // If flow changes and current selectedKey is invalid, pick the first key
    useEffect(() => {
        const first = keys[0] ?? null;
        if (selectedKey && !keys.includes(selectedKey)) {
            setSelectedKey(first);
            setDisplayedKey(first);
        }
    }, [keysKey]);

    // Keyboard navigation (left/right arrows)
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                goPrevious();
            } else if (e.key === "ArrowRight") {
                goNext();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [selectedKey, keysKey]);

    // When displayedKey changes, autofocus first input/select/textarea
    useEffect(() => {
        if (!displayedKey) return;
        window.requestAnimationFrame(() => {
            try {
                const el = contentRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input:not([type=hidden]), select, textarea');
                if (el) el.focus();
            } catch (err) {
                // ignore
            }
        });
    }, [displayedKey]);

    const updateField = (name: string, value: any) => {
        setFormValues((prev) => ({ ...(prev || {}), [name]: value }));
    };

    const [submissionIds, setSubmissionIds] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submissionId, setSubmissionId] = useState<string | null>(null);
    const saveSucceededRef = useRef(false);
    const pendingNextRef = useRef<string | null>(null);

    const submitStep = () => {
        if (!selectedKey) return;
        const node = (effectiveFlow || {})[selectedKey] ?? {};
        const currentStepKey = selectedKey;

        const payload: any = { step: currentStepKey, data: {} };
        if (node.fields && Array.isArray(node.fields)) {
            for (const f of node.fields) {
                const name = f.name ?? `field_${f.field_id}`;
                payload.data[name] = formValues[name] ?? null;
            }
            payload['flow_id'] = flow_id;
        } else if (node.html) {
            payload.html = node.html;
        }

        const currentIndex = keys.indexOf(currentStepKey as string);
        const isLast = currentIndex !== -1 && currentIndex >= keys.length - 1;
        const nextKey = keys[currentIndex + 1] ?? null;

        saveSucceededRef.current = false;
        pendingNextRef.current = null;
        setSubmitting(true);

        const handleSuccess = (page: any, returnedId: string | number, nextPage: string) => {
            setSubmissionIds(prev => ({ ...(prev || {}), [currentStepKey]: true }));
            const idFromFlash = page?.props?.flash?.submission_id ?? returnedId ?? null;

            // nextPage received (logging suppressed)


            if (idFromFlash) {
                const idStr = String(idFromFlash);
                setSubmissionId(idStr);
                try { if (storageSubmissionKey && window.localStorage) window.localStorage.setItem(storageSubmissionKey, idStr); } catch (err) {}
            }
            // Determine navigation target: prefer nextPage (from server) if provided and valid
            let targetNext: string | null = null;
            if (nextPage && typeof nextPage === 'string' && keys.includes(nextPage)) {
                targetNext = nextPage;
            } else if (!isLast) {
                targetNext = nextKey;
            }

            // If we are at the last step and no valid nextPage provided, clear draft and submission id
            if (isLast && !targetNext) {
                try { if (storageKey && window.localStorage) window.localStorage.removeItem(storageKey); } catch (err) {}
                try { if (storageSubmissionKey && window.localStorage) window.localStorage.removeItem(storageSubmissionKey); } catch (err) {}
                setFormValues({});
                setSubmissionIds({});
                setSubmissionId(null);
                return;
            }
            saveSucceededRef.current = true;
            pendingNextRef.current = targetNext;
        };

        if (submissionId) {
            const extractId = (s: any): string | null => {
                if (s === null || s === undefined) return null;
                if (typeof s === 'string' || typeof s === 'number') return String(s);
                if (typeof s === 'object') {
                    if (s.id && (typeof s.id === 'string' || typeof s.id === 'number')) return String(s.id);
                    if (s.submission_id && (typeof s.submission_id === 'string' || typeof s.submission_id === 'number')) return String(s.submission_id);
                    if (s.data && (typeof s.data === 'object')) {
                        if (s.data.id && (typeof s.data.id === 'string' || typeof s.data.id === 'number')) return String(s.data.id);
                        if (s.data.submission_id && (typeof s.data.submission_id === 'string' || typeof s.data.submission_id === 'number')) return String(s.data.submission_id);
                    }
                    for (const k of Object.keys(s)) {
                        const v = s[k];
                        if (v !== null && (typeof v === 'string' || typeof v === 'number')) {
                            if (['created_at','updated_at','step','data','html'].includes(k)) continue;
                            return String(v);
                        }
                    }
                    return null;
                }
                return null;
            };

            const sidParam = extractId(submissionId);
            if (!sidParam) {
                console.error('submitStep: could not determine submission id from', submissionId, '\nFalling back to POST to avoid sending /submissions/[object Object]');
                router.post(route('submissions.store'), payload, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: (page: any) => {
                        // submission page response (logging suppressed)
                         const submission_id = page.props.flash.submission_id ?? null;
                         const form = page.props.flash.data.form ?? null;
                         handleSuccess(page, submission_id, form);
                    },
                    onError: (errors: any) => {
                        console.error('Submission create error (fallback)', errors);
                        alert('Failed to save submission.');
                    },
                    onFinish: () => {
                        setSubmitting(false);
                        if (saveSucceededRef.current && pendingNextRef.current) {
                            try { requestSelectKey(pendingNextRef.current); } catch (e) {}
                        }
                        saveSucceededRef.current = false;
                        pendingNextRef.current = null;
                    },
                });
                return;
            }

            router.put(route('submissions.update', sidParam), payload, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page: any) => {
                    const submission_id = page.props.flash.submission_id ?? null;
                    const form = page.props.flash.data.form ?? null;
                    handleSuccess(page, submission_id, form);
                },
                onError: (errors: any) => {
                    console.error('Submission update error', errors);
                    alert('Failed to save submission.');
                },
                onFinish: () => {
                    setSubmitting(false);
                    if (saveSucceededRef.current && pendingNextRef.current) {
                        try { requestSelectKey(pendingNextRef.current); } catch (e) {}
                    }
                    saveSucceededRef.current = false;
                    pendingNextRef.current = null;
                },
            });
            return;
        }

        router.post(route('submissions.store'), payload, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page: any) => {
                const submission_id = page?.props?.flash?.submission_id ?? null;
                const form = page?.props?.flash?.data?.form ?? null;
                handleSuccess(page, submission_id, form);
            },
            onError: (errors: any) => {
                console.error('Submission create error', errors);
                alert('Failed to save submission.');
            },
            onFinish: () => {
                setSubmitting(false);
                if (saveSucceededRef.current && pendingNextRef.current) {
                    try { requestSelectKey(pendingNextRef.current); } catch (e) {}
                }
                saveSucceededRef.current = false;
                pendingNextRef.current = null;
            },
        });
    };

    const clearDraft = () => {
        if (submitting) return;
        try {
            if (!window.confirm('Clear all fields and submission ID? This cannot be undone.')) return;
        } catch (err) {
            return;
        }

        try { if (storageKey && window.localStorage) window.localStorage.removeItem(storageKey); } catch (err) {}
        try { if (storageSubmissionKey && window.localStorage) window.localStorage.removeItem(storageSubmissionKey); } catch (err) {}

        setFormValues({});
        setSubmissionIds({});
        setSubmissionId(null);
    };

    const requestSelectKey = (key: string | null) => {
        if (!key || key === selectedKey) return;
        setSelectedKey(key);
        setDisplayedKey(key);
    };

    const goNext = () => {
        if (submitting) return;
        if (!selectedKey) return;
        const idx = keys.indexOf(selectedKey);
        if (idx === -1) return;
        const next = keys[idx + 1] ?? null;
        if (next) requestSelectKey(next);
    };
    const goPrevious = () => {
        if (submitting) return;
        if (!selectedKey) return;
        const idx = keys.indexOf(selectedKey);
        if (idx === -1) return;
        const prev = keys[idx - 1] ?? null;
        if (prev) requestSelectKey(prev);
    };

    const normalizeOptions = (opts: any) => {
        if (!opts) return [];
        if (!Array.isArray(opts)) return [];
        return opts.map((o: any) => {
            if (typeof o === "string") return { value: o, label: o };
            if (o && typeof o === "object") return { value: o.value ?? o.id ?? o.label ?? "", label: o.label ?? o.value ?? o.id ?? "" };
            return { value: String(o), label: String(o) };
        });
    };

    const renderField = (field: any) => {
        const inputType = field.type === "default" ? "text" : field.type;
        const options = normalizeOptions(field.options);
        const name = field.name ?? `field_${field.field_id}`;

        switch (inputType) {
            case "textarea":
                return (
                    <div key={field.field_id} className="mb-2">
                        <label htmlFor={name} className="block mb-1">{field.label}</label>
                        <textarea id={name} name={name} className="w-full border rounded p-2" value={formValues[name] ?? ''} onChange={(e) => updateField(name, e.target.value)} />
                    </div>
                );
            case "select":
                return (
                    <div key={field.field_id} className="mb-2">
                        <label htmlFor={name} className="block mb-1">{field.label}</label>
                        <select id={name} name={name} className="w-full border rounded p-2" value={formValues[name] ?? ''} onChange={(e) => updateField(name, e.target.value)}>
                            <option value="">-- select --</option>
                            {options.map((opt: any) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                );
            case "radio":
                return (
                    <div key={field.field_id} className="mb-2">
                        <div className="block mb-1 font-medium">{field.label}</div>
                        <div className="flex flex-col">
                            {(options.length > 0 ? options : [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]).map((opt: any, idx: number) => (
                                <label key={opt.value + idx} className="inline-flex items-center space-x-2">
                                    <input type="radio" name={name} value={opt.value} checked={formValues[name] === opt.value} onChange={(e) => updateField(name, e.target.value)} />
                                    <span>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            case "checkbox":
                return (
                    <div key={field.field_id} className="mb-2">
                        <label className="inline-flex items-center space-x-2">
                            <input type="checkbox" id={name} name={name} checked={!!formValues[name]} onChange={(e) => updateField(name, e.target.checked)} />
                            <span>{field.label}</span>
                        </label>
                    </div>
                );
            default:
                const htmlType = ["text", "email", "tel", "number", "password", "date"].includes(inputType) ? inputType : "text";
                return (
                    <div key={field.field_id} className="mb-2">
                        <label htmlFor={name} className="block mb-1">{field.label}</label>
                        <input id={name} name={name} type={htmlType} className="w-full border rounded p-2" autoComplete="on" value={formValues[name] ?? ''} onChange={(e) => updateField(name, e.target.value)} />
                    </div>
                );
        }
    };

    return (
        <>
            {showDebug ? (
                  <div className="fixed top-4 right-4 z-50 p-2 bg-black bg-opacity-75 text-white text-xs rounded max-w-sm">
                      <div className="font-semibold">flow debug</div>
                      <div><strong>selectedKey:</strong> {String(selectedKey)}</div>
                      <div><strong>displayedKey:</strong> {String(displayedKey)}</div>
                      <div><strong>submitting:</strong> {String(submitting)}</div>
                      <div><strong>submissionId:</strong> {String(submissionId)}</div>
                      <div style={{whiteSpace: 'pre-wrap', marginTop: '6px'}}><strong>keys:</strong> {JSON.stringify(keys)}</div>
                      <div style={{whiteSpace: 'pre-wrap', marginTop: '6px'}}><strong>submissionIds:</strong> {JSON.stringify(submissionIds)}</div>
                  </div>
             ) : null}

             <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <SecondaryButton onClick={goPrevious} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300" disabled={!selectedKey || keys.indexOf(selectedKey) <= 0 || submitting}>
                            Prev
                        </SecondaryButton>
                        <SecondaryButton onClick={goNext} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300" disabled={!selectedKey || keys.indexOf(selectedKey) === -1 || keys.indexOf(selectedKey) >= keys.length - 1 || submitting}>
                            Next
                        </SecondaryButton>
                        <DangerButton onClick={clearDraft} className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white" disabled={submitting} title="Clear draft and submission id">
                            Clear
                        </DangerButton>
                    </div>

                    <div className="flex gap-2 flex-1">
                        {keys.map((key, idx) => {
                            return (
                                <PrimaryButton
                                    key={key}
                                    onClick={() => requestSelectKey(key)}
                                    active={selectedKey === key}
                                    aria-pressed={selectedKey === key}
                                    aria-label={`Step ${idx + 1}: (${key})`}
                                    title={key}
                                    disabled={submitting}
                                >
                                    <span className="font-semibold">{`Step ${idx + 1}`}</span>

                                    {submissionIds && submissionIds[key] ? (
                                        <span className="ml-auto text-xs bg-green-600 text-white px-1 py-0.5 rounded">Saved</span>
                                    ) : null}
                                </PrimaryButton>
                            );
                        })}
                    </div>
                </div>

                {displayedKey && effectiveFlow[displayedKey] ? (
                    <div
                        key={displayedKey}
                        ref={contentRef}
                        className={`mb-4 relative`}
                        aria-busy={submitting}
                    >
                        {submitting ? (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                            </div>
                        ) : null}
                         <h3 className="font-bold mb-2">{displayedKey}</h3>
                         <div>
                             {effectiveFlow[displayedKey].fields ? (
                                 <div>
                                     {effectiveFlow[displayedKey].fields.map((field: any) => renderField(field))}
                                     <button onClick={submitStep} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300" disabled={submitting}> Submit</button>
                                 </div>

                             ) : (
                                 <div dangerouslySetInnerHTML={{ __html: effectiveFlow[displayedKey].html }}></div>
                             )}
                         </div>
                     </div>
                 ) : (
                     <div>No step selected.</div>
                 )}
             </div>
        </>
    );
}
