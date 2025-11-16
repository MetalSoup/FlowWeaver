import { useEditor } from '@craftjs/core';
import React from 'react';

export * from './ToolbarItem';
export * from './ToolbarSection';
export * from './ToolbarTextInput';
export * from './ToolbarDropdown';

export const Toolbar = () => {
  const { active, related } = useEditor((state, query) => {
    // TODO: handle multiple selected elements
    const currentlySelectedNodeId = query.getEvent('selected').first();
    return {
      active: currentlySelectedNodeId,
      related:
        currentlySelectedNodeId && state.nodes[currentlySelectedNodeId].related,
    };
  });

  return (
    <div className="h-full">
      {active && related.toolbar && React.createElement(related.toolbar)}
      {!active && (
        <div
          className=""
          style={{
            color: 'rgba(0, 0, 0, 0.5607843137254902)',
            fontSize: '11px',
          }}
        >
            <strong className="pb-1">Click on a component to start editing.</strong>

        </div>
      )}
    </div>
  );
};
