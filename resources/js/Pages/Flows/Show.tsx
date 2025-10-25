import React, { useEffect, useRef, useState } from "react";

export default function ({ flow }: any) {


    /*
    * flow looks like this:
    "{form_scbk97k": {
        "fields": [
            {
                "field_id": 2,
                "label": "First Name",
                "name": "first_name",
                "type": "default",
                "active": true
            },
            {
                "field_id": 3,
                "label": "Last Name",
                "name": "last_name",
                "type": "default",
                "active": true
            },
            {
                "field_id": 4,
                "label": "Email",
                "name": "email",
                "type": "default",
                "active": true
            },
            {
                "field_id": 5,
                "label": "Phone",
                "name": "phone",
                "type": "default",
                "active": true
            },
            {
                "field_id": 1,
                "label": "Do you like dogs",
                "name": "likes_dogs",
                "type": "radio",
                "active": true
            }
        ]
    },
    "form_90i2pdn": {
        "fields": [
            {
                "field_id": 7,
                "label": "Street",
                "name": "street",
                "type": "radio",
                "active": true
            },
            {
                "field_id": 8,
                "label": "City",
                "name": "city",
                "type": "radio",
                "active": true
            },
            {
                "field_id": 9,
                "label": "State",
                "name": "state",
                "type": "radio",
                "active": true
            },
            {
                "field_id": 10,
                "label": "Zip",
                "name": "zip",
                "type": "radio",
                "active": true
            }
        ]
    },
    "form_htdxrhv": {
        "fields": [
            {
                "field_id": 13,
                "label": "Title",
                "name": "title",
                "type": "radio",
                "active": true
            },
            {
                "field_id": 12,
                "label": "Company",
                "name": "company",
                "type": "radio",
                "active": true
            },
            {
                "field_id": 14,
                "label": "Website",
                "name": "website",
                "type": "radio",
                "active": true
            },
            {
                "field_id": 15,
                "label": "Date of Birth",
                "name": "dob",
                "type": "radio",
                "active": true
            }
        ]
    },
    "rawhtml_ff4wz7m": {
        "html": "<div><h2>Thank you</h2></div>"
    }
}*/



    // Console for debugging flows
    console.log(flow);

    const keys = Object.keys(flow || {});

    // selectedKey: canonical selection (reflected in URL & nav buttons)
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    // displayedKey: actually rendered step (used for animating out/in)
    const [displayedKey, setDisplayedKey] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const nextKeyRef = useRef<string | null>(null);
    const timeoutRef = useRef<number | null>(null);
    // Track initial load so we don't pushState on first set of selectedKey
    const initialLoadedRef = useRef(false);

    // Form state preserved across steps and persisted to localStorage per page
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const contentRef = useRef<HTMLDivElement | null>(null);

    // Animation duration should match the CSS transition classes (ms)
    const ANIM_DURATION = 220;

    // Local storage key per pathname so different flows/pages don't collide
    const storageKey = typeof window !== 'undefined' ? `flow_form_state_${encodeURIComponent(window.location.pathname)}` : null;

    // Initialize selectedKey/displayedKey from URL param `step` if valid, otherwise pick first key
    useEffect(() => {
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
        } catch (err) {
            // ignore localStorage errors
            console.warn('Could not load saved flow form state', err);
        }

        // Do not mark initial load here — leave it false so the selectedKey effect
        // will perform a single replaceState on the first selectedKey change.
    }, [/* run when component mounts or when flow keys change */ flow]);

    // Keep URL in sync when selectedKey changes. Use pushState (creates history entries) except for initial load.
    useEffect(() => {
        if (!selectedKey) return;
        const params = new URLSearchParams(window.location.search);
        params.set("step", selectedKey);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        if (!initialLoadedRef.current) {
            // If initialLoadedRef is false we are still on the first render load; replace the state instead of pushing
            window.history.replaceState({}, "", newUrl);
            initialLoadedRef.current = true;
        } else {
            // For user-initiated changes push a new history entry so Back/Forward navigate steps
            try {
                window.history.pushState({}, "", newUrl);
            } catch (err) {
                // Fallback to replaceState if pushState fails
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
                // Cancel any running animation and timeouts
                setIsAnimating(false);
                if (timeoutRef.current) {
                    window.clearTimeout(timeoutRef.current as number);
                    timeoutRef.current = null;
                }
                // Update both selectedKey and displayedKey immediately to reflect history navigation
                setSelectedKey(target);
                setDisplayedKey(target);
            } catch (err) {
                // ignore
            }
        };
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, [flow]);

    // Persist form state whenever it changes
    useEffect(() => {
        if (!storageKey) return;
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(formValues));
        } catch (err) {
            // ignore storage errors
        }
    }, [formValues]);

    // If flow changes and current selectedKey is invalid, pick the first key
    useEffect(() => {
        const first = keys[0] ?? null;
        if (selectedKey && !keys.includes(selectedKey)) {
            setSelectedKey(first);
            setDisplayedKey(first);
        }
    }, [flow]);

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
    }, [selectedKey, flow]);

    // When displayedKey changes and animation finished, autofocus first input/select/textarea
    useEffect(() => {
        if (isAnimating) return;
        if (!displayedKey) return;
        // small delay to ensure DOM updated
        window.requestAnimationFrame(() => {
            try {
                const el = contentRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input:not([type=hidden]), select, textarea');
                if (el) el.focus();
            } catch (err) {
                // ignore
            }
        });
    }, [displayedKey, isAnimating]);

    // Cleanup any pending timeouts on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current as number);
            }
        };
    }, []);

    const updateField = (name: string, value: any) => {
        setFormValues((prev) => ({ ...(prev || {}), [name]: value }));
    };

    const requestSelectKey = (key: string | null) => {
        if (!key || key === selectedKey) return;
        // Trigger animate out of currently displayedKey, then switch displayedKey
        nextKeyRef.current = key;
        setIsAnimating(true);
        // After animation duration, swap displayedKey and stop animating
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current as number);
        timeoutRef.current = window.setTimeout(() => {
            setDisplayedKey(nextKeyRef.current);
            setIsAnimating(false);
            nextKeyRef.current = null;
        }, ANIM_DURATION);
        // Immediately update selectedKey (URL and active button) so deep links reflect intention
        setSelectedKey(key);
    };

    const goNext = () => {
        if (!selectedKey) return;
        const idx = keys.indexOf(selectedKey);
        if (idx === -1) return;
        const next = keys[idx + 1] ?? null;
        if (next) requestSelectKey(next);
    };
    const goPrevious = () => {
        if (!selectedKey) return;
        const idx = keys.indexOf(selectedKey);
        if (idx === -1) return;
        const prev = keys[idx - 1] ?? null;
        if (prev) requestSelectKey(prev);
    };

    // Helper to normalize options: accept [{label, value}] or ["val1","val2"]
    const normalizeOptions = (opts: any) => {
        if (!opts) return [];
        if (!Array.isArray(opts)) return [];
        return opts.map((o: any) => {
            if (typeof o === "string") return { value: o, label: o };
            if (o && typeof o === "object") return { value: o.value ?? o.id ?? o.label ?? "", label: o.label ?? o.value ?? o.id ?? "" };
            return { value: String(o), label: String(o) };
        });
    };

    // Derive a short human-friendly label for a step
    const prettifyKey = (k: string) => {
        if (!k) return '';
        return k.replace(/^(form_|rawhtml_|flow_|step_)/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/^(.)/, (m) => m.toUpperCase());
    };

    const getShortLabel = (key: string) => {
        try {
            const node = (flow || {})[key] ?? {};
            let label = node.title || node.label || (node.fields && node.fields[0] && node.fields[0].label) || prettifyKey(key);
            if (typeof label !== 'string') label = String(label ?? '');
            const MAX = 28; // max visible chars for the short label
            if (label.length > MAX) return label.slice(0, MAX - 3) + '...';
            return label;
        } catch (err) {
            return prettifyKey(key);
        }
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
                // Render radio group; options expected
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
                // fallback to input (text, email, tel, number, etc.)
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

            <div className="p-4">
                {/* Navigation: step buttons + prev/next controls */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <button onClick={goPrevious} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300" disabled={!selectedKey || keys.indexOf(selectedKey) <= 0}>
                            Prev
                        </button>
                        <button onClick={goNext} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300" disabled={!selectedKey || keys.indexOf(selectedKey) === -1 || keys.indexOf(selectedKey) >= keys.length - 1}>
                            Next
                        </button>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 flex-1">
                        {keys.map((key, idx) => {
                            const short = getShortLabel(key);
                            return (
                                <button
                                    key={key}
                                    onClick={() => requestSelectKey(key)}
                                    className={`px-2 py-1 rounded text-left truncate flex items-center gap-2 min-w-0 ${selectedKey === key ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'}`}
                                    aria-pressed={selectedKey === key}
                                    aria-label={`Step ${idx + 1}: ${short} (${key})`}
                                    title={key}
                                >
                                    <span className="font-semibold">{`Step ${idx + 1}`}</span>
                                    <span className="text-sm opacity-90 truncate">{short}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Render only the displayed step with simple fade/translate animation */}
                {displayedKey && flow[displayedKey] ? (
                    <div
                        key={displayedKey}
                        ref={contentRef}
                        className={`mb-4 transition-all transform duration-200 ease-in-out ${isAnimating ? '-translate-y-2 opacity-0' : 'translate-y-0 opacity-100'}`}
                    >
                        <h3 className="font-bold mb-2">{displayedKey}</h3>
                        <div>
                            {flow[displayedKey].fields ? (
                                <div>
                                    {flow[displayedKey].fields.map((field: any) => renderField(field))}
                                    <button onClick={goNext} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"> Submit</button>
                                </div>

                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: flow[displayedKey].html }}></div>
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
