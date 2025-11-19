import { useState, useEffect, useRef } from "react";
import PrimaryButton from "@/Components/PrimaryButton";
import RenderField from "@/Views/Flows/RenderField";
import SubmitStep from "./SubmitStep";
import Tooltip from "@/Components/Tooltip";

export default function FlowShow({ flow, flow_id, pageOverrides, onSelectField, isEditorEnabled, selectedFieldId }: { flow: any, flow_id: number, pageOverrides?: any, onSelectField?: any, isEditorEnabled?: boolean, selectedFieldId?: any }) {

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
        // removed noisy debug log
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
            // We received a `flow` prop but couldn't normalize it into steps. Show a user-friendly message.
            return (
                <div className={"mb-5 p-4 border rounded bg-yellow-50"}>
                    <h2 className="text-lg font-semibold text-yellow-800">This interactive flow is currently unavailable</h2>
                    <p className="mt-2 text-sm text-gray-700">We're sorry — this flow exists but couldn't be displayed. It may have been temporarily removed, unpublished, or is in an unsupported format.</p>
                    <p className="mt-2 text-sm text-gray-600">If you believe this is an error, please contact support or try reloading the page.</p>
                    <div className="mt-3">
                        <button
                            type="button"
                            onClick={() => { try { window.location.reload(); } catch (e) { /* ignore */ } }}
                            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded"
                        >
                            Reload page
                        </button>
                    </div>
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
        <>
            {/*Show a list of steps*/}
            <ul className={"flow_top_menu"}>
                <li>Steps:</li>
                {flowState.map((step: any, i: number) => {
                    const sid = getStepId(step, i);
                    return (
                    <li key={sid}>
                        <Tooltip content={`Step ID: ${sid} (Type: ${step.type})`}>
                            <button
                                className={`${sid === activeStep ? "active_step" : ""}`}
                                onClick={() => setActiveStep(sid)}

                            >
                                {i + 1}
                            </button>
                        </Tooltip>

                    </li>
                )})}
            </ul>


            {currentStep ? (
                <div key={getStepId(currentStep)} className={`flow_step_container ${currentStep.id ?? 'unknown_step'} type_${currentStep.type || 'unknown_type'}`}>
                    {currentStep.type === 'RawHtml' ? (
                        <div dangerouslySetInnerHTML={{ __html: currentStep.html || '' }} />
                    ) : (<div>

                    {currentStep.fields &&
                        currentStep.fields
                            .filter((field: any) => field.active)
                            .map((field: any) => (
                                <div key={field.id} className={""}>
                                    <RenderField
                                        field={field}
                                        formValues={formValues}
                                        setFormValues={setFormValues}
                                        pageOverrides={pageOverrides}
                                        onSelectField={onSelectField}
                                        isEditorEnabled={isEditorEnabled}
                                        selectedFieldId={selectedFieldId}
                                    />
                                </div>
                            ))}

                        <PrimaryButton onClick={submitStep} disabled={submitting}>Submit</PrimaryButton>
                    </div>)}

                </div>
            ) : (
                <div>No active step selected.</div>
            )}
        </>
    );
}
