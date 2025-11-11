import { useState, useEffect, useRef } from "react";
import PrimaryButton from "@/Components/PrimaryButton";
import RenderField from "@/Views/Flows/RenderField";
import SubmitStep from "./SubmitStep";

export default function FlowShow({ flow, flow_id }: { flow: any, flow_id: number }) {

    // NOTE: we must call hooks unconditionally. Previously there was an early return
    // here that returned when `flow` was empty which caused hooks to run conditionally
    // and led to internal React errors. Move the early-return rendering below the hooks
    // so the hooks run on every render.


    const [flowState, setFlowState] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [submissionId, setSubmissionId] = useState<string>("");
    // start with empty activeStep; we will set it when the normalized flow arrives
    const [activeStep, setActiveStep] = useState<string>("");
    const [currentStep, setCurrentStep] = useState<any>(null);

    const saveSucceededRef = useRef<boolean>(false);
    const pendingNextRef = useRef<string | null>(null);

    // helper to get a stable id string for a step regardless of server shape
    const getStepId = (s: any, idx?: number) => {
        if (!s) return String(idx ?? '');
        return String(s.id ?? s.step_id ?? s.field_id ?? idx ?? '');
    };

    // sessionStorage key to persist form values for this flow during this browser session
    const storageKey = `weaver:flow:${flow_id}:formValues`;

    // Load saved form values from localStorage once on mount.
    // If the user refreshed the page (navigation.type === 'reload'), clear the stored values so they don't persist across a manual refresh.
    useEffect(() => {
        try {
            let isReload = false;
            try {
                // Use any here to avoid TypeScript complaining about PerformanceEntry lacking `type`.
                const navEntries: any = (performance.getEntriesByType && performance.getEntriesByType('navigation')) || [];
                const nav: any = Array.isArray(navEntries) ? navEntries[0] : undefined;
                if (nav && typeof nav.type === 'string' && nav.type === 'reload') isReload = true;
                // fallback to older API: performance.navigation.type === 1 indicates reload
                if (!isReload && typeof (performance as any) !== 'undefined' && (performance as any).navigation && (performance as any).navigation.type === 1) isReload = true;
            } catch (e) {
                // ignore detection errors
            }

            if (isReload) {
                // clear stored values if this load is a full page refresh
                try { localStorage.removeItem(storageKey); } catch (e) { /* ignore */ }
                return;
            }

            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    setFormValues(parsed);
                }
            }
        } catch (e) {
            // ignore JSON errors
            console.error('Failed to load saved form values from localStorage', e);
        }
        // Intentionally run only on initial mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Persist formValues to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(formValues ?? {}));
        } catch (e) {
            console.error('Failed to save form values to localStorage', e);
        }
    }, [formValues, storageKey]);

    const requestSelectKey = (key: string | null) => {
        if (key) {
            setActiveStep(key);
        }
    }

    //const steps: any[] = flowState/* && typeof flowState === "object" ? Object.values(flowState) : []*/;
    // ensure stepNames is an array of step ids when flowState is an array
    const stepNames = Array.isArray(flowState) ? flowState.map((s: any, i: number) => getStepId(s, i)) : Object.keys(flowState || {});


    // keep currentStep in sync whenever activeStep or flowState changes
    useEffect(() => {
        if (!flowState) {
            setCurrentStep(null);
            return;
        }

        // If no activeStep is set, default to the first step's id (use stable id helper)
        if (!activeStep && Array.isArray(flowState) && flowState.length > 0) {
            const sid = getStepId(flowState[0], 0);
            setActiveStep(sid);
            setCurrentStep(flowState[0]);
            return;
        }

        const found = Array.isArray(flowState) ? flowState.find((s: any, i: number) => getStepId(s, i) === activeStep) : null;
        setCurrentStep(found ?? null);
    }, [activeStep, flowState]);

    // safe initial active step


    const onSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
    };



    const submitStep = SubmitStep({activeStep, setSubmitting, setActiveStep, flowState, stepNames, formValues, setFormValues, submissionId, setSubmissionId, flow_id, requestSelectKey, setFlowState,setCurrentStep, saveSucceededRef, pendingNextRef});

    // Keep local flowState in sync with the incoming prop `flow`.
    // Normalize various possible server shapes into an array of steps.
    useEffect(() => {
        const normalize = (src: any): any[] => {
            if (!src) return [];
            if (Array.isArray(src)) return src;
            if (src.steps && Array.isArray(src.steps)) return src.steps;
            if (src.data && Array.isArray(src.data)) return src.data;
            if (src.flow && Array.isArray(src.flow)) return src.flow;
            // Single-step shape: an object that itself looks like a step
            if (src.type || src.fields || src.html) return [src];
            // If it's an object keyed by ids, convert to array — be permissive and accept values
            if (typeof src === 'object') {
                const vals = Object.values(src);
                if (vals.length > 0 && vals.every((v: any) => v && (v.id !== undefined || v.field_id !== undefined || v.type || v.fields))) return vals;
            }
            return [];
        };

        const normalized = normalize(flow);
        // debug to help trace what's coming in — remove or guard behind env check if noisy
        // eslint-disable-next-line no-console
        console.debug('FlowShow: normalize incoming flow ->', { incoming: flow, normalizedCount: normalized.length });
        setFlowState(normalized);

        if (!normalized || normalized.length === 0) {
            // Clear selection when there's no flow
            if (activeStep !== "") setActiveStep("");
            setCurrentStep(null);
            return;
        }

        // Build list of step ids from the normalized flow
        const ids = normalized.map((s: any, i: number) => getStepId(s, i));

        // Keep the current activeStep if it's present in the new flow; otherwise pick the first.
        const shouldKeep = !!activeStep && ids.includes(activeStep);
        const newActive = shouldKeep ? activeStep : (ids[0] ?? "");

        if (newActive !== activeStep) setActiveStep(newActive);

        // Find the corresponding step object to set as currentStep
        const found = normalized.find((s: any, i: number) => getStepId(s, i) === newActive) ?? null;
        setCurrentStep(found);

        // Only re-run when the source `flow` prop changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flow]);

    // If there's no flow to display, render the empty message. This check is done after the hooks
    // have been declared so hooks are invoked consistently on every render.
    if (!flowState || (Array.isArray(flowState) && flowState.length === 0)) {
        if (flow) {
            // We received a `flow` prop but couldn't normalize it into steps. Show a small debug panel.
            return (
                <div className={"mb-5 p-4 border bg-yellow-50"}>
                    <h1>Flow present but contains no steps</h1>
                    <p>The incoming `flow` prop was provided but could not be parsed into steps by the component's normalization logic. Inspect the raw value below to help diagnose the server shape.</p>
                    <pre style={{whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto'}}>{JSON.stringify(flow, null, 2)}</pre>
                </div>
            );
        }

        return (
            <div className={"mb-5"}>
                <h1>Flow is empty</h1>
                <p>This flow has no steps defined.</p>
            </div>
        );
    }


    return (
        <div className={"mb-5"}>
            {/*Show a list of steps*/}
            <ul>
                {flowState.map((step: any, i: number) => {
                    const sid = getStepId(step, i);
                    return (
                    <li key={sid} className={"mb-2"}>
                        <button
                            className={`p-2 border rounded ${sid === activeStep ? "bg-blue-500 text-white" : "bg-white text-black"}`}
                            onClick={() => setActiveStep(sid)}
                        >
                            Step ID: {sid} (Type: {step.type})
                        </button>
                    </li>
                )})}
            </ul>

            <h1>Test Flow Show</h1>


            {currentStep ? (
                <div key={getStepId(currentStep)} className={"mb-5 p-4 border"}>
                    <h2>Step ID: {currentStep.id ?? currentStep.step_id ?? currentStep.field_id ?? 'unknown'}</h2>
                    <p>Type: {currentStep.type}</p>
                    {currentStep.type === 'RawHtml' ? (
                        <div dangerouslySetInnerHTML={{ __html: currentStep.html || '' }} />
                    ) : (<div>

                    {currentStep.fields &&
                        currentStep.fields
                            .filter((field: any) => field.active)
                            .map((field: any) => (
                                <div key={field.id} className={""}>
                                    {field.type === 'html' ? (
                                        <div dangerouslySetInnerHTML={{ __html: field.html || '' }} />
                                        ) :
                                    <RenderField field={field} formValues={formValues} setFormValues={setFormValues} />
                                    }
                                </div>
                            ))}
                        <PrimaryButton onClick={submitStep} disabled={submitting}>Submit</PrimaryButton>
                    </div>)}

                </div>
            ) : (
                <div>No active step selected.</div>
            )}
        </div>
    );
}
