import React from 'react';
import { useNode } from '@craftjs/core';

export default function ColumnSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="p-2">
      <div className="mb-2">Column settings</div>
      <label className="block text-sm mb-1">Width</label>
      <input
        type="text"
        value={props.width}
        onChange={(e) => setProp((p: any) => (p.width = e.target.value))}
        className="w-full p-1 border rounded"
      />

      <label className="block text-sm mt-2 mb-1">Padding (top,right,bottom,left)</label>
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((idx) => (
          <input
            key={idx}
            type="number"
            value={props.padding?.[idx] ?? 0}
            onChange={(e) =>
              setProp((p: any) => {
                const pad = p.padding || [0, 0, 0, 0];
                pad[idx] = Number(e.target.value);
                p.padding = pad;
              })
            }
            className="w-full p-1 border rounded"
          />
        ))}
      </div>

      <label className="block text-sm mt-2 mb-1">Background</label>
      <input
        type="text"
        value={JSON.stringify(props.background || '')}
        onChange={(e) => setProp((p: any) => (p.background = e.target.value))}
        className="w-full p-1 border rounded"
      />

      <label className="block text-sm mt-2 mb-1">Color</label>
      <input
        type="text"
        value={JSON.stringify(props.color || '')}
        onChange={(e) => setProp((p: any) => (p.color = e.target.value))}
        className="w-full p-1 border rounded"
      />

      <label className="block text-sm mt-2 mb-1">Margin (t,r,b,l)</label>
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((idx) => (
          <input
            key={idx}
            type="number"
            value={props.margin?.[idx] ?? 0}
            onChange={(e) =>
              setProp((p: any) => {
                const m = p.margin || [0, 0, 0, 0];
                m[idx] = Number(e.target.value);
                p.margin = m;
              })
            }
            className="w-full p-1 border rounded"
          />
        ))}
      </div>
    </div>
  );
}
