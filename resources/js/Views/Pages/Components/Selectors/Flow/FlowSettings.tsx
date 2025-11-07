import React from 'react';

import { ToolbarSection, ToolbarItem } from '../../editor';
import { ToolbarRadio } from '../../editor/Toolbar/ToolbarRadio';
import { usePage } from '@inertiajs/react';

export const FlowSettings = () => {
  // Read flows provided as page props so we can render them in a dropdown
  const { props: pageProps }: any = usePage();
  const flows: any[] = pageProps?.flows ?? pageProps?.flows?.data ?? [];

  return (
    <React.Fragment>
      <ToolbarSection title="Flow selection">
        <ToolbarItem
          full={true}
          propKey="flow_id"
          type="select"
          label="InstanceSelect flow"
          onChange={(v: any) => (v === '' ? null : Number(v))}
        >
          <option value="">-- none --</option>
          {Array.isArray(flows)
            ? flows.map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.name || f.title || `Flow ${f.id}`}
                </option>
              ))
            : null}
        </ToolbarItem>
      </ToolbarSection>
    </React.Fragment>
  );
};
