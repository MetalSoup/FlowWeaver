import React, { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function Flow({ flowID }: { flowID: number | null }) {
    const { props: pageProps }: any = usePage();

    // Helper: extract compiled flow and its flow_id from various Inertia response shapes
    const extractFlowFromPageProps = (p: any) => {
        if (!p) return { flow: null, flow_id: null };

        // Common direct locations
        const directFlow = p?.flash?.flow ?? p?.flow ?? p?.props?.flow ?? p?.props?.page?.props?.flow ?? p?.props?.initialProps?.flow ?? p?.props?.props?.flow ?? null;
        const directFlowId = p?.flash?.flow_id ?? p?.flow_id ?? p?.props?.flow_id ?? p?.props?.page?.props?.flow_id ?? null;
        if (directFlow) return { flow: directFlow, flow_id: directFlowId };

        // As a last resort, search deeply for a key named 'flow' with an object value
        if (p?.props) {
            const deepFind = (obj: any): any => {
                if (!obj || typeof obj !== 'object') return null;
                if (obj.flow && obj.flow && typeof obj.flow === 'object' && Object.keys(obj.flow).length > 0) return { flow: obj.flow, flow_id: obj.flow_id ?? null };
                for (const k of Object.keys(obj)) {
                    try {
                        const found = deepFind(obj[k]);
                        if (found) return found;
                    } catch (e) { /* ignore */ }
                }
                return null;
            };
            const found = deepFind(p.props);
            if (found) return { flow: found.flow, flow_id: found.flow_id ?? null };
        }

        return { flow: null, flow_id: null };
    };

    // Initialize state from any server-provided flow (only if it's for our flowID)
    const initialExtract = extractFlowFromPageProps(pageProps);
    const initialFlow = (initialExtract.flow && initialExtract.flow_id && flowID && Number(initialExtract.flow_id) === Number(flowID))
        ? initialExtract.flow
        : null;

    const [loadedFlow, setLoadedFlow] = useState<any | null>(initialFlow);

    // Prevent duplicate simultaneous requests.
    const loadingRef = useRef(false);

    useEffect(() => {
        console.debug('Flow.mount useEffect start', { flowID, initialExtract });
        if (!flowID) return;
        if (loadingRef.current) return;

        // If the server already provided the flow for this page and it matches our id,
        // use it and skip fetching.
        const { flow: serverFlow, flow_id: serverFlowId } = extractFlowFromPageProps(pageProps);
        if (serverFlow && serverFlowId && Number(serverFlowId) === Number(flowID)) {
            console.debug('Flow: using server-provided flow for', flowID);
            setLoadedFlow(serverFlow);
            return;
        }

        loadingRef.current = true;
        console.debug('Flow: fetching get_flow for', flowID);

        // Fetch compiled flow via the JSON `get_flow` endpoint so multiple Flow instances
        // can load independently without stomping shared flash.
        (async () => {
            try {
                const url = route('get_flow', { flow: flowID });
                const res = await fetch(url, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    },
                });
                if (!res.ok) {
                    console.warn('Flow component: get_flow returned status', res.status);
                    return;
                }
                const json = await res.json();
                console.debug('Flow: get_flow response', flowID, json);
                // Try several common locations for the compiled flow
                const flowFromJson = json?.flow ?? json?.props?.flow ?? json?.props?.page?.props?.flow ?? json?.props?.initialProps?.flow ?? null;
                let flow = null;
                if (flowFromJson && typeof flowFromJson === 'object' && Object.keys(flowFromJson).length > 0) {
                    flow = flowFromJson;
                }
                // Deep search as last resort
                if (!flow && json?.props) {
                    const deepFind = (obj:any) => {
                        if (!obj || typeof obj !== 'object') return null;
                        if (obj.flow && obj.flow && typeof obj.flow === 'object' && Object.keys(obj.flow).length > 0) return obj.flow;
                        for (const k of Object.keys(obj)) {
                            try {
                                const val = obj[k];
                                const found = deepFind(val);
                                if (found) return found;
                            } catch (e) {}
                        }
                        return null;
                    };
                    flow = deepFind(json.props);
                }

                if (flow) {
                    setLoadedFlow(flow);
                    console.debug('Flow: setLoadedFlow for', flowID, 'steps', Object.keys(flow || {}).length);
                } else {
                    console.debug('Flow: no flow found in get_flow response for', flowID);
                }

            } catch (err) {
                console.warn('Flow component: fetching compiled flow failed', err);
            } finally {
                loadingRef.current = false;
            }
        })();

    }, [flowID]);

    return <div>Flow {flowID} - {loadedFlow ? 'loaded' : 'not loaded'}</div>;
}
