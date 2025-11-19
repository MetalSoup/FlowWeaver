import React from 'react';

import { ContainerSettings } from './ContainerSettings';

import { Resizer } from '../Resizer';

export type ContainerProps = {
  background: Record<'r' | 'g' | 'b' | 'a', number>;
  color: Record<'r' | 'g' | 'b' | 'a', number>;
  flexDirection: string;
  alignItems: string;
  justifyContent: string;
  fillSpace: string;
  width: string;
  height: string;
  padding: string[];
  margin: string[];
  marginTop: number;
  marginLeft: number;
  marginBottom: number;
  marginRight: number;
  shadow: number;
  children: React.ReactNode;
  radius: number;
};

const defaultProps = {
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  fillSpace: 'no',
  padding: ['0', '0', '0', '0'],
  margin: ['0', '0', '0', '0'],
  background: { r: 255, g: 255, b: 255, a: 1 },
  color: { r: 0, g: 0, b: 0, a: 1 },
  shadow: 0,
  radius: 0,
  width: '100%',
  height: 'auto',
};

// Helper to produce a stable rgba(...) string from various shapes
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

export const Container = (props: Partial<ContainerProps>) => {
  props = {
    ...defaultProps,
    ...props,
  };
  const {
    flexDirection,
    alignItems,
    justifyContent,
    fillSpace,
    background,
    color,
    padding,
    margin,
    shadow,
    radius,
    children,
  } = props;

  // Determine if the container has no meaningful children.
  // React.Children.count returns 0 for null/undefined/false and for arrays containing only those.
  const isEmpty = React.Children.count(children) === 0;

  return (
    <Resizer
      propKey={{ width: 'width', height: 'height' }}
      style={{
        justifyContent,
        flexDirection,
        alignItems,
        background: normalizeColor(background),
        color: normalizeColor(color),
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        boxShadow:
          shadow === 0
            ? 'none'
            : `0px 3px 100px ${shadow}px rgba(0, 0, 0, 0.13)`,
        borderRadius: `${radius}px`,
        flex: fillSpace === 'yes' ? 1 : 'unset',
        // If empty, give a visual placeholder instead of removing the container
        ...(isEmpty
          ? { minHeight: '20px', border: '1px dashed #ccc' }
          : {}),
      }}
    >
      {children && React.Children.count(children) > 0 ? (
        children
      ) : (
        <div className="w-full h-full border-2 border-dashed border-gray-300 rounded p-4 text-sm text-gray-500 flex items-center justify-center pointer-events-none select-none">
          Empty container
        </div>
      )}
    </Resizer>
  );
};

Container.craft = {
  displayName: 'Container',
  props: defaultProps,
  rules: {
    canMoveIn: () => true,
  },
  related: {
    toolbar: ContainerSettings,
  },
};
