import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { FlexColumn } from '../FlexColumn';

export const FlexRowSettings = () => {
  const {
    actions: { setProp },
    props,
    id: nodeId,
  } = useNode((node) => ({ props: node.data.props, id: node.id }));

  const { actions: editorActions, query } = useEditor(() => ({}));

  const addColumn = (atIndex?: number) => {
    const id = 'col-' + Math.random().toString(36).slice(2, 9);
    setProp((p: any) => {
      const list = Array.isArray(p.columnsList) ? [...p.columnsList] : [];
      if (typeof atIndex === 'number' && atIndex >= 0 && atIndex <= list.length) {
        list.splice(atIndex, 0, id);
      } else {
        list.push(id);
      }
      p.columnsList = list;
      p.columns = list.length;
    });

    // Try to explicitly create a FlexColumn node under this FlexRow using Craft editor actions.
    // Different Craft versions expose different APIs; try common fallbacks.
    setTimeout(() => {
      try {
        const actionsAny: any = editorActions;
        // 1) try createNode (some integrations)
        if (actionsAny && typeof actionsAny.createNode === 'function') {
          try {
            actionsAny.createNode({ id, type: FlexColumn, data: {} }, nodeId);
            return;
          } catch (e) {
            // ignore and try next
          }
        }

        // 2) try generic add / addNode
        if (actionsAny && typeof actionsAny.add === 'function') {
          try {
            actionsAny.add(id, FlexColumn, nodeId);
            return;
          } catch (e) {}
        }

        // 3) try deserialize to inject the node (best-effort)
        if (actionsAny && typeof actionsAny.deserialize === 'function') {
          try {
            const nodeShape: any = {
              nodes: {
                [id]: {
                  data: { props: {}, type: (FlexColumn as any).craft?.displayName || 'FlexColumn' },
                  nodes: {},
                },
              },
              rootNode: id,
            };
            actionsAny.deserialize(nodeShape);
            // then attempt to move deserialized node under parent
            if (typeof actionsAny.move === 'function') {
              // move the created node under nodeId
              actionsAny.move(id, nodeId, 0);
            }
            return;
          } catch (e) {
            // ignore
          }
        }

        // If none of the above APIs exist, log a helpful message for debugging.
        // The columnsList fallback still ensures a placeholder Element will be rendered.
        // eslint-disable-next-line no-console
        console.warn('addColumn: unable to call editor create API; relying on columnsList fallback');
      } catch (e) {
        // swallow
      }
    }, 50);
  };

  const removeColumnAt = (index: number) => {
    // Mark pending removal so the UI can animate out
    setProp((p: any) => {
      const removeList = Array.isArray(p.removePending) ? [...p.removePending] : [];
      const list = Array.isArray(p.columnsList) ? [...p.columnsList] : [];
      if (index < 0 || index >= list.length) return;
      const removedId = list[index];
      if (!removeList.includes(removedId)) removeList.push(removedId);
      p.removePending = removeList;
    });

    // After animation duration, finalize remove: move children then delete node and remove id from columnsList/removePending
    const ANIM_MS = 260;
    setTimeout(() => {
      setProp((p: any) => {
        const list = Array.isArray(p.columnsList) ? [...p.columnsList] : [];
        if (index < 0 || index >= list.length) return;
        const removedId = list[index];
        const targetId = index - 1 >= 0 ? list[index - 1] : (index + 1 < list.length ? list[index + 1] : null);

        try {
          const removedNode: any = query.node(removedId);
          const childMap = removedNode?.data?.nodes || {};
          const childIds = Object.keys(childMap || {});

          if (targetId && childIds.length > 0 && editorActions && typeof (editorActions as any).move === 'function') {
            childIds.forEach((childId, idx) => {
              try {
                (editorActions as any).move(childId, targetId, idx);
              } catch (e) {
                // ignore individual move errors
              }
            });
          }

          // attempt to delete the removed node using common editor action names
          try {
            const a: any = editorActions;
            if (a && typeof a.removeNode === 'function') {
              a.removeNode(removedId);
            } else if (a && typeof a.delete === 'function') {
              a.delete(removedId);
            } else if (a && typeof a.remove === 'function') {
              a.remove(removedId);
            } else if (a && typeof a.clear === 'function') {
              // fallback: try clear/invalidate
              // no-op
            }
          } catch (e) {
            // ignore deletion failures
          }
        } catch (e) {
          // ignore errors
        }

        // finally remove from arrays
        list.splice(index, 1);
        p.columnsList = list;
        p.removePending = Array.isArray(p.removePending) ? p.removePending.filter((x: string) => x !== removedId) : [];
        p.columns = list.length || 1;
      });
    }, ANIM_MS);
  };

  const list = Array.isArray(props.columnsList) ? props.columnsList : [];

  return (
    <div className="p-2">
      <div className="mb-2">FlexRow settings</div>

      <label className="block text-sm mb-1">Columns</label>
      <div className="mb-2">
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="number"
            value={props.columns}
            onChange={(e) => setProp((p: any) => (p.columns = Number(e.target.value)))}
            className="w-20 p-1 border rounded"
          />
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => addColumn()}
              className="px-2 py-1 bg-green-500 text-white rounded text-sm"
            >
              Add
            </button>
          </div>
        </div>

        {/* list columns with remove buttons */}
        <div>
          {list.map((colId: string, idx: number) => (
            <div key={colId} className="flex items-center justify-between mb-1">
              <div className="text-sm">Column {idx + 1} ({colId})</div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => addColumn(idx + 1)}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  + after
                </button>
                <button
                  type="button"
                  onClick={() => removeColumnAt(idx)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <label className="block text-sm mt-2 mb-1">Gap (px)</label>
      <input
        type="number"
        value={props.gap}
        onChange={(e) => setProp((p: any) => (p.gap = Number(e.target.value)))}
        className="w-full p-1 border rounded"
      />
    </div>
  );
};
