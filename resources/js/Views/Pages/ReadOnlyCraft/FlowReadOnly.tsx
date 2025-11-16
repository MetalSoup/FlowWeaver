import React, { useEffect, useRef, useState } from 'react';
import FlowShow from '@/Views/Flows/FlowShow';

// Read-only Flow renderer: fetches the compiled flow JSON by id (same endpoint the editor uses)
// and renders the existing FlowShow component. This keeps visual parity with the editor but
// avoids using craft.js hooks.

export default function FlowReadOnly({ flow_id, flow: initialFlow, field_id, field_overrides }: any) {
  const [thisFlow, setThisFlow] = useState<any>(initialFlow ?? null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const selId = (initialFlow && !flow_id) ? (initialFlow.id ?? null) : flow_id ?? (initialFlow?.id ?? null);
    if (!selId) return;
    if (loadingRef.current) return;
    loadingRef.current = true;

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
          console.warn('FlowReadOnly: get_flow returned status', res.status);
          return;
        }
        const json = await res.json();
        // try common paths like the editor does
        const tryPaths = [
          (p: any) => p?.flow,
          (p: any) => p?.props?.flow,
          (p: any) => p?.props?.page?.props?.flow,
          (p: any) => p?.props?.initialProps?.flow,
          (p: any) => p?.props?.props?.flow,
        ];
        let remote: any = null;
        for (const getter of tryPaths) {
          try {
            const r = getter(json);
            if (r && typeof r === 'object' && Object.keys(r).length > 0) { remote = r; break; }
          } catch (e) { /* ignore */ }
        }
        if (!remote && json?.flow) remote = json.flow;
        if (!remote && json?.props) {
          const deepFind = (obj: any): any => {
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
          setThisFlow(remote);
        } else {
          console.warn('FlowReadOnly: could not find compiled flow in get_flow response', json);
        }
      } catch (err) {
        console.warn('FlowReadOnly: fetching compiled flow failed', err);
      } finally {
        loadingRef.current = false;
      }
    })();

  }, [flow_id]);

  // Render FlowShow with isEditorEnabled=false so it behaves as a front-end flow
  return (
    <FlowShow flow={thisFlow} flow_id={flow_id} pageOverrides={field_overrides} isEditorEnabled={false} selectedFieldId={field_id} />
  );
}
