import { useState, useEffect, useRef } from "react";
import PrimaryButton from "@/Components/PrimaryButton";
import RenderField from "@/Views/Flows/RenderField";
import SubmitStep from "./SubmitStep";

export default function TestFlowShow({ auth, flow, flow_id }: { auth: any; flow: any, flow_id: number }) {
    const [flowState, setFlowState] = useState(flow);
    const [submitting, setSubmitting] = useState(false);
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [submissionId, setSubmissionId] = useState<string>("");
    const [activeStep, setActiveStep] = useState<string>(() => flowState?.[0]?.id ?? "");
    const [currentStep, setCurrentStep] = useState<any>(() => {
        if (!flowState) return null;
        // try to initialise currentStep from the activeStep if possible
        const found = Array.isArray(flowState) ? flowState.find((s: any) => s.id === (flowState?.[0]?.id ?? "")) : null;
        return found ?? null;
    });

    const saveSucceededRef = useRef<boolean>(false);
    const pendingNextRef = useRef<string | null>(null);

    // sessionStorage key to persist form values for this flow during this browser session
    const storageKey = `kiudai:flow:${flow_id}:formValues`;

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
    const stepNames = Array.isArray(flowState) ? flowState.map((s: any) => s.id) : Object.keys(flowState || {});


    // keep currentStep in sync whenever activeStep or flowState changes
    useEffect(() => {
        if (!flowState) {
            setCurrentStep(null);
            return;
        }

        // If no activeStep is set, default to the first step's id
        if (!activeStep && Array.isArray(flowState) && flowState.length > 0) {
            setActiveStep(flowState[0].id);
            setCurrentStep(flowState[0]);
            return;
        }

        const found = Array.isArray(flowState) ? flowState.find((s: any) => s.id === activeStep) : null;
        setCurrentStep(found ?? null);
    }, [activeStep, flowState]);

    // safe initial active step


    const onSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
    };



    const submitStep = SubmitStep({activeStep, setSubmitting, setActiveStep, flowState, stepNames, formValues, setFormValues, submissionId, setSubmissionId, flow_id, requestSelectKey, setFlowState,setCurrentStep, saveSucceededRef, pendingNextRef});


    return (
        <div className={"mb-5"}>
            {/*Show a list of steps*/}
            <ul>
                {flowState.map((step: any) => (
                    <li key={step.id} className={"mb-2"}>
                        <button
                            className={`p-2 border rounded ${step.id === activeStep ? "bg-blue-500 text-white" : "bg-white text-black"}`}
                            onClick={() => setActiveStep(step.id)}
                        >
                            Step ID: {step.id} (Type: {step.type})
                        </button>
                    </li>
                ))}
            </ul>

            <h1>Test Flow Show</h1>


            {currentStep ? (
                <div key={currentStep.id} className={"mb-5 p-4 border"}>
                    <h2>Step ID: {currentStep.id}</h2>
                    <p>Type: {currentStep.type}</p>

                    {currentStep.fields &&
                        currentStep.fields
                            .filter((field: any) => field.active)
                            .map((field: any) => (
                                <div key={field.id} className={"mb-2 p-2 border"}>
                                    <RenderField field={field} formValues={formValues} setFormValues={setFormValues} />
                                </div>
                            ))}
                    <PrimaryButton onClick={submitStep} disabled={submitting}>Submit</PrimaryButton>
                </div>
            ) : (
                <div>No active step selected.</div>
            )}
        </div>
    );
}
