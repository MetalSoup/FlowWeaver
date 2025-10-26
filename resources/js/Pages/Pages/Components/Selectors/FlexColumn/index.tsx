import React from 'react';
import { Resizer } from '../Resizer';
import { useNode } from '@craftjs/core';
import FlexColumnSettings from './FlexColumnSettings';

export type FlexColumnProps = {
  width?: string;
  height?: string;
  padding?: string[];
  margin?: string[];
  background?: any;
  children?: React.ReactNode;
};

const defaultProps: Partial<FlexColumnProps> = {
  width: 'auto',
  height: 'auto',
  padding: ['0', '0', '0', '0'],
  margin: ['0', '0', '0', '0'],
  background: { r: 255, g: 255, b: 255, a: 0 },
};

const normalizeColor = (c: any) => {
  if (!c) return undefined;
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) {
    const [r = 0, g = 0, b = 0, a = 1] = c;
    return `rgba(${Number(r)}, ${Number(g)}, ${Number(b)}, ${Number(a)})`;
  }
  const r = c.r ?? c[0] ?? 0;
  const g = c.g ?? c[1] ?? 0;
  const b = c.b ?? c[2] ?? 0;
  const a = c.a ?? c[3] ?? 1;
  return `rgba(${Number(r)}, ${Number(g)}, ${Number(b)}, ${Number(a)})`;
};

export const FlexColumn = (incomingProps: Partial<FlexColumnProps>) => {
  const props = { ...defaultProps, ...incomingProps } as FlexColumnProps;
  const { width, height, padding, margin, background, children } = props;

  const { isConnected } = useNode((node) => ({ isConnected: Boolean(node.data.nodes && Object.keys(node.data.nodes).length) }));

  return (
    <Resizer propKey={{ width: 'width', height: 'height' }} style={{ width, height }}>
      <div
        className="flex-1"
        style={{
          padding: `${padding?.[0] ?? 0}px ${padding?.[1] ?? 0}px ${padding?.[2] ?? 0}px ${padding?.[3] ?? 0}px`,
          margin: `${margin?.[0] ?? 0}px ${margin?.[1] ?? 0}px ${margin?.[2] ?? 0}px ${margin?.[3] ?? 0}px`,
          background: normalizeColor(background),
          minHeight: 20,
        }}
      >
        {children && React.Children.count(children) > 0 ? (
          children
        ) : (
          <div className="w-full h-full border-2 border-dashed border-gray-300 rounded p-4 text-sm text-gray-500 flex items-center justify-center">
            Empty column
          </div>
        )}
      </div>
    </Resizer>
  );
};

(FlexColumn as any).craft = {
  displayName: 'FlexColumn',
  props: defaultProps,
  rules: {
    canMoveIn: () => true,
  },
  related: {
    toolbar: FlexColumnSettings,
  },
};

export default FlexColumn;
