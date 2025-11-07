import {router} from "@inertiajs/react";

export default function SubmitStep(
    {
        activeStep = null,
        setActiveStep = (step: string | null) => {},
        stepNames = [],
        formValues = {},
        submissionId = null,
        setSubmissionId = (id: string | null) => {},
        setSubmitting = (submitting: boolean) => {},
        flow_id = null,
        requestSelectKey = (key: string | null) => {},
        saveSucceededRef = {current: false},
        pendingNextRef = {current: null},
        setFlowState = (state: any) => {},
        flowState = [],
        setCurrentStep = (step: any) => {
        }
    }: any) {
    return () => {


        if (!activeStep) return;


        const postOptions = {
            preserveScroll: true,
            preserveState: true,

            onSuccess: (page: any) => {
                const submission_id = page?.props?.flash?.submission_id ?? null;
                const flow = page?.props?.flow ?? null;
                const nextStep = page?.props?.flash?.data?.nextStep ?? null;
                handleSuccess(page, submission_id, nextStep, flow);
            },
            onError: (errors: any) => {
                console.error('Submission create error', errors);
                alert('Failed to save submission.');
            },
            onFinish: () => {
                setSubmitting(false);
                if (saveSucceededRef.current && pendingNextRef.current) {
                    try {
                        requestSelectKey(pendingNextRef.current);
                    } catch (e) {
                    }
                }
                saveSucceededRef.current = false;
                pendingNextRef.current = null;
            },
        };


        const node = flowState.find((s: any) => s && s.id === activeStep) ?? {};
        const currentStepKey = activeStep;

        const payload: any = {step: currentStepKey, data: {}};
        if (node.fields && Array.isArray(node.fields)) {
            for (const f of node.fields) {
                const name = f.name ?? `field_${f.field_id}`;
                payload.data[name] = formValues[name] ?? null;
            }
            payload['flow_id'] = flow_id;
        } else if (node.html) {
            payload.html = node.html;
        }

        const currentIndex = stepNames.indexOf(currentStepKey as string);
        const isLast = currentIndex !== -1 && currentIndex >= stepNames.length - 1;
        const nextKey = stepNames[currentIndex + 1] ?? null;

        saveSucceededRef.current = false;
        pendingNextRef.current = null;
        setSubmitting(true);

        const handleSuccess = (page: any, submission_id: string | number, serverNext: string | null, flow: any) => {
            // Prefer server-provided flow/state when available, otherwise keep current flowState
            if (flow) {
                try {
                    setFlowState(flow);
                } catch (e) {
                    // ignore errors updating flow state
                }
            }

            setSubmissionId(submission_id);
            console.log("Submission saved successfully with ID:", submission_id);

            // Choose next step: prefer server hint, fallback to client-computed nextKey
            const chosenNext = serverNext ?? nextKey ?? null;

            // If we have a chosen next step, update active/current step immediately so UI moves on
            if (chosenNext !== null && chosenNext !== undefined) {
                try {
                    setActiveStep(chosenNext);
                    // also notify parent via requestSelectKey (uses parent's logic for selecting)
                    try {
                        requestSelectKey(chosenNext);
                    } catch (e) {
                        // ignore
                    }
                    // attempt to set current step from the newly-provided flow if available, else from local flowState
                    const sourceFlow = flow && Array.isArray(flow) ? flow : flowState;
                    const found = Array.isArray(sourceFlow) ? sourceFlow.find((s: any) => s.id === chosenNext) : null;
                    setCurrentStep(found ?? null);
                } catch (e) {
                    // ignore any errors setting step
                    console.error('Error setting next step', e);
                }
            }

            // reset form values for the next step (so previously-entered values don't leak into the next step)
            // NOTE: previously we cleared formValues here. To preserve entered data when the user
            // navigates back to previous steps, we no longer wipe the formValues on success.
            // If desired, you can selectively clear fields belonging to the completed step only.

            // mark refs so onFinish can also trigger selection if something else overrides the immediate change
            saveSucceededRef.current = true;
            pendingNextRef.current = chosenNext;
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
                            if (['created_at', 'updated_at', 'step', 'data', 'html'].includes(k)) continue;
                            return String(v);
                        }
                    }
                    return null;
                }
                return null;
            };

            const sidParam = extractId(submissionId);
            console.log(sidParam);


            router.put(route('submissions.update', sidParam), payload, postOptions);

        } else {


            router.post(route('submissions.store'), payload, postOptions)
        }
    };
}
