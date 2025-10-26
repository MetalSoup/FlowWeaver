import React, { useRef } from 'react';
import { Resizer } from '../Resizer';
import { FlexRowSettings } from './FlexRowSettings';
import { Element } from '@craftjs/core';
import { FlexColumn } from '../FlexColumn';

export type FlexRowProps = {
  columns: number;
  columnsList?: string[];
  removePending?: string[];
  gap: number;
  alignItems: 'stretch' | 'flex-start' | 'center' | 'flex-end';
  justifyContent:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around';
  background?: any;
  color?: any;
  padding: string[];
  margin: string[];
  width: string;
  height: string;
  fillSpace: string;
  children?: React.ReactNode;
};

const defaultProps: Partial<FlexRowProps> = {
  columns: 2,
  columnsList: [],
  removePending: [],
  gap: 16,
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  padding: ['0', '0', '0', '0'],
  margin: ['0', '0', '0', '0'],
  background: { r: 255, g: 255, b: 255, a: 0 },
  color: { r: 0, g: 0, b: 0, a: 1 },
  width: '100%',
  height: 'auto',
  fillSpace: 'no',
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

export const FlexRow = (incomingProps: Partial<FlexRowProps>) => {
  const props = { ...defaultProps, ...incomingProps } as FlexRowProps;
  const {
    columns,
    columnsList,
    removePending,
    gap,
    alignItems,
    justifyContent,
    background,
    color,
    padding,
    margin,
    fillSpace,
    children,
    width,
    height,
  } = props;

  const childArray = React.Children.toArray(children);
  // stable id base so fallback placeholder Element ids don't change between renders
  const idBaseRef = useRef<string>('flexrow-' + Math.random().toString(36).slice(2, 9));

  // Determine the column ids to render. Prefer persistent columnsList, otherwise fall back to numeric columns
  const colIds: string[] = (columnsList && columnsList.length > 0)
    ? columnsList
    : Array.from({ length: columns }).map((_, i) => `${idBaseRef.current}-col-${i}`);

  // A small wrapper that animates in on mount and animates out when the id is in removePending
  const ColumnWrapper: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
      // mount animation
      const t = setTimeout(() => setMounted(true), 10);
      return () => clearTimeout(t);
    }, []);

    const isRemoving = Array.isArray(removePending) && removePending.includes(id);

    const style: React.CSSProperties = {
      transition: 'transform 220ms ease, opacity 220ms ease',
      transform: mounted && !isRemoving ? 'scale(1)' : 'scale(0.98)',
      opacity: mounted && !isRemoving ? 1 : 0,
    };

    return (
      <div style={style} className="flex-1">
        {children}
      </div>
    );
  };

  const renderedChildren = (
    <>
      {colIds.map((colId: string, i: number) => (
        childArray[i] ? (
          <ColumnWrapper key={`col-${i}`} id={colId}>{childArray[i]}</ColumnWrapper>
        ) : (
          <ColumnWrapper key={colId} id={colId}><Element id={colId} canvas is={FlexColumn} /></ColumnWrapper>
        )
      ))}
    </>
  );

  return (
    <Resizer
      propKey={{ width: 'width', height: 'height' }}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: `${gap}px`,
        alignItems,
        justifyContent,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        background: normalizeColor(background),
        color: normalizeColor(color),
        width,
        height,
        flex: fillSpace === 'yes' ? 1 : 'unset',
      }}
    >
      {renderedChildren}
    </Resizer>
  );
};

// craft metadata
(FlexRow as any).craft = {
  displayName: 'FlexRow',
  props: defaultProps,
  rules: {
    canDrag: () => true,
  },
  related: {
    toolbar: FlexRowSettings,
  },
};

export default FlexRow;
