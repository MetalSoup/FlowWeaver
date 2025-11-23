import React from 'react';

import { ContainerSettings } from './ContainerSettings';

import { Resizer } from '../Resizer';

export type ContainerProps = {
  background: Record<'r' | 'g' | 'b' | 'a', number> | string;
  color: Record<'r' | 'g' | 'b' | 'a', number> | string;
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
  boxShadow?: string;
  containerBorderWidth?: string;
  containerBorderStyle?: string;
  containerBorderColor?: string;
  gaps?: string[];
  wrap?: string;
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
    boxShadow,
    containerBorderWidth,
    containerBorderStyle,
    containerBorderColor,
    gaps,
    wrap,
    children,
  } = props;

  // Determine current editor viewport from localStorage (desktop/tablet/mobile)
  const getViewport = () => {
    try {
      const v = typeof window !== 'undefined' ? window.localStorage.getItem('editor:viewportSize') : null;
      if (v === 'mobile' || v === 'tablet' || v === 'desktop') return v;
    } catch (e) {
      // ignore
    }
    return 'desktop';
  };
  const vp = getViewport();

  const resolveResponsiveProp = (key: string, fallback: any) => {
    const resp = (props as any)[`${key}_responsive`];
    if (resp && typeof resp === 'object' && !Array.isArray(resp)) {
      return resp[vp] ?? resp.desktop ?? fallback;
    }
    const cur = (props as any)[key];
    return cur != null ? cur : fallback;
  };

  // assemble final padding/margin values by resolving responsive props if present
  const finalPadding = (() => {
    const p = resolveResponsiveProp('padding', padding);
    if (Array.isArray(p)) return p;
    // if string like "8 4" or "8px 4px"
    if (typeof p === 'string') {
      const toks = String(p).trim().split(/\s+/).map(t => Number(t.replace(/[^0-9.-]/g, '')) || 0);
      if (toks.length === 1) return [toks[0], toks[0], toks[0], toks[0]];
      if (toks.length === 2) return [toks[0], toks[1], toks[0], toks[1]];
      if (toks.length === 3) return [toks[0], toks[1], toks[2], toks[1]];
      return [toks[0] || 0, toks[1] || 0, toks[2] || 0, toks[3] || 0];
    }
    return padding;
  })();

  const finalMargin = (() => {
    const m = resolveResponsiveProp('margin', margin);
    if (Array.isArray(m)) return m;
    if (typeof m === 'string') {
      const toks = String(m).trim().split(/\s+/).map(t => Number(t.replace(/[^0-9.-]/g, '')) || 0);
      if (toks.length === 1) return [toks[0], toks[0], toks[0], toks[0]];
      if (toks.length === 2) return [toks[0], toks[1], toks[0], toks[1]];
      if (toks.length === 3) return [toks[0], toks[1], toks[2], toks[1]];
      return [toks[0] || 0, toks[1] || 0, toks[2] || 0, toks[3] || 0];
    }
    return margin;
  })();

  // same for gaps, width, minHeight
  const finalGaps = (() => {
    const g = resolveResponsiveProp('gaps', gaps);
    if (Array.isArray(g)) return g;
    return g ? [g, g] : gaps;
  })();

  const finalBoxShadow = resolveResponsiveProp('boxShadow', boxShadow) || (shadow === 0 ? 'none' : `0px 3px 100px ${shadow}px rgba(0, 0, 0, 0.13)`);

  const finalWidth = resolveResponsiveProp('width', props.width);
  const finalMinHeight = resolveResponsiveProp('minHeight', undefined);

  // Determine if the container has no meaningful children.
  // React.Children.count returns 0 for null/undefined/false and for arrays containing only those.
  const isEmpty = React.Children.count(children) === 0;

  // helper to append px if numeric
  const ensureUnit = (val: any) => {
    if (val == null || val === '') return undefined;
    if (typeof val === 'number') return `${val}px`;
    if (/^-?\d+(?:\.\d+)?$/.test(String(val))) return `${val}px`;
    return String(val);
  };

  // derive border style
  const borderStyle: any = containerBorderWidth
    ? {
        borderStyle: containerBorderStyle || 'solid',
        borderColor: containerBorderColor || 'rgba(0,0,0,0.1)',
        borderWidth: containerBorderWidth,
      }
    : {};

  // derive gap styles (expect gaps as ['column','row'] possibly with units or numeric strings)
  const columnGap = finalGaps && finalGaps[0] != null ? (String(finalGaps[0]).match(/\d/) ? ensureUnit(finalGaps[0]) : undefined) : undefined;
  const rowGap = finalGaps && finalGaps[1] != null ? (String(finalGaps[1]).match(/\d/) ? ensureUnit(finalGaps[1]) : undefined) : undefined;

  return (
    <Resizer
      propKey={{ width: 'width', height: 'height' }}
      style={{
        justifyContent,
        flexDirection,
        alignItems,
        background: normalizeColor(background),
        color: normalizeColor(color),
        padding: `${finalPadding[0]}px ${finalPadding[1]}px ${finalPadding[2]}px ${finalPadding[3]}px`,
        margin: `${finalMargin[0]}px ${finalMargin[1]}px ${finalMargin[2]}px ${finalMargin[3]}px`,
        boxShadow: finalBoxShadow,
        borderRadius: `${radius}px`,
        flex: fillSpace === 'yes' ? 1 : 'unset',
        flexWrap: wrap || undefined,
        columnGap: columnGap,
        rowGap: rowGap,
        ...borderStyle,
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
