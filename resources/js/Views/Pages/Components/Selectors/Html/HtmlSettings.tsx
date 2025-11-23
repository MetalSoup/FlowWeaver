import React from 'react';
import { useNode } from '@craftjs/core';
import { ToolbarSection } from '../../editor';
import Textarea from '@/Components/Textarea';

export const HtmlSettings = () => {
  const { actions, props } = useNode((node: any) => ({ actions: node.actions, props: node.data.props }));
  const setProp = actions?.setProp as any;

  return (
    <div>
      <ToolbarSection title="Html">
        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">HTML</label>
          <Textarea
            value={props?.html || ''}
            onChange={(e: any) => {
              const v = e.target.value;
              if (typeof setProp === 'function') setProp((p: any) => (p.html = v));
            }}
            rows={6}
            placeholder="Enter raw HTML. Use [placeholder] to insert dropzones where other selectors can be dropped."
          />
        </div>
        <div className="text-xs text-gray-400">Tip: Use the token [placeholder] where you want components to be droppable.</div>
      </ToolbarSection>
    </div>
  );
};

export default HtmlSettings;

