import React, {useEffect, useState, useRef} from 'react';

import { FlowSettings } from './FlowSettings';



import ShowFlow from "@/Views/Flows/FlowShow";
import {useEditor, useNode} from "@craftjs/core";
import {router, usePage} from '@inertiajs/react';


export type FlowProps = {
    flow_id?: number | null;
    flow?: any | null;
};

const defaultProps = {
  flow_id : null,
    flow : null,
};

export const Flow  = ({
                          flow,
                          flow_id,
                      }: Partial<FlowProps>) => {
    const {
        connectors: { connect, drag },
        selected,
    } = useNode((node) => ({
        selected: node.events.selected,
    }));
    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }));

    // Get flows provided as page props so editor toolbar can list them and
    // the component can render the selected flow's data.
    const { props: pageProps }: any = usePage();
    const flows: any[] = pageProps?.flows ?? pageProps?.flows?.data ?? [];
    const [thisFlow, SetThisFlow] = useState(flow ?? null);

    // Try to resolve a flow object/sequence to pass into ShowFlow. Many server
    // shapes exist so try a few common locations.
    const selectedFlow = (flow_id != null && flows && Array.isArray(flows))
        ? flows.find((f: any) => Number(f.id) === Number(flow_id))
        : null;

    // Use a ref to prevent duplicate simultaneous requests and avoid triggering
    // the effect via state changes caused by the request itself.
    const loadingRef = useRef(false);

    useEffect(() => {
        // Resolve an id to load: prefer selectedFlow (from page props) but fall back
        // to the explicit `flow_id` prop. This ensures each Flow instance requests
        // its own flow on mount even if page props are arranged differently.
        const selId = selectedFlow?.id ?? flow_id ?? null;
        // Only proceed if we have an identifier to load.
        if (!selId) return;
        if (loadingRef.current) return; // already fetching

        console.log('Selected flow changed:', selectedFlow);
        loadingRef.current = true;

        // Fetch the compiled flow via the JSON endpoint `get_flow` so multiple
        // Flow instances can load independently without stomping shared flash.
        (async () => {
            try {
                const url = route('get_flow', { flow: selId });
                const res = await fetch(url, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    },
                });
                if (!res.ok) {
                    console.warn('Flow selector: get_flow returned status', res.status);
                    return;
                }
                const json = await res.json();
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
                        if (r && typeof r === 'object' && Object.keys(r).length > 0) { remote = r; break; }
                    } catch (e) { /* ignore */ }
                }
                // Fallback: if json contains a top-level `flow` key
                if (!remote && json?.flow) remote = json.flow;
                // Deep search as last resort
                if (!remote && json?.props) {
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
                    remote = deepFind(json.props);
                }
                if (remote) {
                    console.debug('Flow selector: extracted compiled flow', remote);
                    SetThisFlow(remote);
                } else {
                    console.warn('Flow selector: could not find compiled flow in get_flow response', json);
                }
            } catch (err) {
                console.warn('Flow selector: fetching compiled flow failed', err);
            } finally {
                loadingRef.current = false;
            }
        })();

    }, [selectedFlow?.id, flow_id]);


  return (
    <div
      ref={(dom) => {
        // attach craft connect+drag to the outer wrapper so node can be selected/dragged
        if (dom) connect(drag(dom));
      }}
    >
      <div style={{ pointerEvents: enabled && !selected ? 'none' : 'auto' }}>
        <ShowFlow
          // ShowFlow expects flow_id and flow (object). Disabled when editor is disabled.

          flow_id={flow_id}
          flow={thisFlow}
        />
      </div>
    </div>
  );
};

Flow.craft = {
  displayName: 'Flow',
  props: defaultProps,
  related: {
    toolbar: FlowSettings,
  },
};
