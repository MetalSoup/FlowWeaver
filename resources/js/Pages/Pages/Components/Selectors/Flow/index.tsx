import React from 'react';

import { FlowSettings } from './FlowSettings';



import ShowFlow from "@/Pages/Flows/Show";
import {useEditor, useNode} from "@craftjs/core";
import { usePage } from '@inertiajs/react';


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

    // Try to resolve a flow object/sequence to pass into ShowFlow. Many server
    // shapes exist so try a few common locations.
    const selectedFlow = (flow_id != null && flows && Array.isArray(flows))
        ? flows.find((f: any) => Number(f.id) === Number(flow_id))
        : null;

    // Helper: detect whether an object looks like the compiled/display flow
    // shape expected by ShowFlow (keyed steps with `fields` or `html`).
    const looksLikeCompiled = (obj: any) => {
        if (!obj || typeof obj !== 'object') return false;
        const vals = Object.values(obj);
        if (!Array.isArray(vals) || vals.length === 0) return false;
        return vals.some((v: any) => v && (v.fields || v.html));
    };

    let flowData: any = null;
    if (selectedFlow) {
        // If the selectedFlow already contains compiled display steps, use it.
        const candidate = selectedFlow.data?.sequence ?? selectedFlow.sequence ?? selectedFlow;
        if (looksLikeCompiled(candidate)) {
            flowData = candidate;
        } else {
            // Otherwise don't pass raw sequence — let ShowFlow fetch the compiled version by flow_id.
            flowData = null;
        }
    } else {
        // If no selectedFlow from props, fallback to any provided `flow` prop (from craft node props)
        flowData = looksLikeCompiled(flow) ? flow : null;
    }

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
          disabled={!enabled}
          flow_id={flow_id}
          flow={flowData}
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
