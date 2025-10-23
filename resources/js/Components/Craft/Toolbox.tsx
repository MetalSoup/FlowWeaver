import React, { useEffect, useRef } from 'react';
import { useEditor, Element, ROOT_NODE } from '@craftjs/core';
import { CraftText, CraftContainer } from '@/Nodes/CraftNodes';

export const Toolbox: React.FC = () => {
  // useEditor provides actions, query and connectors; connectors.create lets us attach
  // native drag handlers to arbitrary DOM elements to create nodes on drop.
  const { actions, query, connectors } = useEditor() as any;

  // refs for drag-able buttons (entire item will be draggable now)
  const containerButtonRef = useRef<HTMLButtonElement | null>(null);
  const textButtonRef = useRef<HTMLButtonElement | null>(null);

  // Click fallback: adds immediately to selected canvas or root
  const addToParent = (reactEl: any) => {
    const tree = (query.parseReactElement(reactEl as any) as any).toNodeTree();
    const selected = query.getEvent('selected').first && query.getEvent('selected').first();
    const parentId = selected && query.node(selected).isCanvas() ? selected : ROOT_NODE;
    actions.addNodeTree(tree, parentId);
  };

  const addContainerWithText = () => {
    const reactEl = (
      <Element is={CraftContainer} canvas>
        <Element is={CraftText} text="Hello world" />
      </Element>
    );
    addToParent(reactEl);
  };

  const addText = () => {
    const reactEl = <Element is={CraftText} text="New text" />;
    addToParent(reactEl);
  };

  // Attach connectors.create to toolbox buttons so the entire item can be dragged into the canvas.
  useEffect(() => {
    if (!connectors) return;

    let cleanupContainer: (() => void) | undefined;
    let cleanupText: (() => void) | undefined;

    if (containerButtonRef.current && connectors.create) {
      const el = containerButtonRef.current;
      const reactEl = (
        <Element is={CraftContainer} canvas>
          <Element is={CraftText} text="Hello world" />
        </Element>
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cleanupContainer = connectors.create(el, reactEl as any);
    }

    if (textButtonRef.current && connectors.create) {
      const el = textButtonRef.current;
      const reactEl = <Element is={CraftText} text="New text" />;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cleanupText = connectors.create(el, reactEl as any);
    }

    return () => {
      const callCleanup = (cb: any) => {
        if (!cb) return;
        if (typeof cb === 'function') {
          try { cb(); } catch (e) { /* ignore cleanup errors */ }
          return;
        }
        if (cb && typeof cb.destroy === 'function') {
          try { cb.destroy(); } catch (e) { /* ignore */ }
          return;
        }
        if (cb && typeof cb.cleanup === 'function') {
          try { cb.cleanup(); } catch (e) { /* ignore */ }
          return;
        }
      };

      callCleanup(cleanupContainer);
      callCleanup(cleanupText);
    };
  }, [connectors]);

  return (
    <div className="p-4 bg-white border rounded">
      <h3 className="font-semibold mb-2">Toolbox</h3>
      <div className="flex flex-col gap-2">
        <button
          ref={containerButtonRef}
          className="p-2 border rounded text-left flex items-center gap-2"
          onClick={addContainerWithText}
          type="button"
          style={{ cursor: 'grab' }}
        >
          <span
            title="Drag to add Container"
            aria-label="Drag Container"
            className="inline-flex items-center justify-center w-6 h-6 rounded border bg-gray-100 hover:bg-gray-200"
          >
            {/* simple drag icon */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6h2v2h-2zM6 6h2v2H6zM14 6h2v2h-2zM18 6h2v2h-2zM10 10h2v2h-2zM6 10h2v2H6zM14 10h2v2h-2zM18 10h2v2h-2z" fill="#374151" />
            </svg>
          </span>
          <span>Container + Text</span>
        </button>

        <button
          ref={textButtonRef}
          className="p-2 border rounded text-left flex items-center gap-2"
          onClick={addText}
          type="button"
          style={{ cursor: 'grab' }}
        >
          <span
            title="Drag to add Text"
            aria-label="Drag Text"
            className="inline-flex items-center justify-center w-6 h-6 rounded border bg-gray-100 hover:bg-gray-200"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7h16v2H4zM4 11h10v2H4zM4 15h8v2H4z" fill="#374151" />
            </svg>
          </span>
          <span>Text</span>
        </button>
      </div>
    </div>
  );
};
