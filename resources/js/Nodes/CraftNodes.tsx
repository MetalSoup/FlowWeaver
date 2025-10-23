import React from 'react';
import { useNode } from '@craftjs/core';

// Export a context so the editor can tell nodes when we're in preview mode.
export const CraftPreviewContext = React.createContext(false);

type TextProps = {
  text?: string;
  fontSize?: number | string;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number | string;
  as?: string; // tag: 'p', 'h1', 'span', etc. 'none' will render as a plain span
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  letterSpacing?: number | string;
  wordSpacing?: number | string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-line' | 'pre-wrap';
};

export const CraftText: React.FC<TextProps> = ({ text = 'Text' }) => {
  // Get connectors, selection state and id for this node
  const { connectors, selected, id, data } = useNode((node: any) => ({
    connectors: node.connectors,
    selected: node.events.selected,
    id: node.id,
    data: node.data,
  })) as any;

  // read preview from context so nodes can disable editor connectors in preview
  const preview = React.useContext(CraftPreviewContext);

  const baseStyle: React.CSSProperties = { padding: 8, cursor: preview ? 'default' : 'grab' };
  const selectedStyle: React.CSSProperties = selected
    ? { outline: '2px solid #2563EB', outlineOffset: '2px', boxShadow: '0 1px 0 rgba(37,99,235,0.15)' }
    : {};

  // read styling props from node data.props (fall back to craft defaults)
  const props = (data && data.props) || {};
  const fontSize = props.fontSize ?? 16;
  const fontWeight = props.fontWeight ?? 'normal';
  const color = props.color ?? '#000000';
  const textAlign = props.textAlign ?? 'left';
  const lineHeight = props.lineHeight ?? undefined;
  const asTag = props.as ?? 'p';
  const fontFamily = props.fontFamily ?? undefined;
  const fontStyle = props.fontStyle ?? 'normal';
  const letterSpacing = props.letterSpacing ?? undefined;
  const wordSpacing = props.wordSpacing ?? undefined;
  const textTransform = props.textTransform ?? undefined;
  const textDecoration = props.textDecoration ?? undefined;
  const whiteSpace = props.whiteSpace ?? undefined;

  // ref handler to connect to craft connectors
  const setRef = (ref: any) => {
    if (!ref) return;
    if (!preview) {
      if (connectors && connectors.connect) connectors.connect(ref);
      if (connectors && connectors.drag) connectors.drag(ref);
    }
  };

  // Choose tag to render. If user selected 'none', fall back to a span (no semantic wrapper available)
  const Tag = asTag === 'none' ? 'span' : (asTag as any);

  // Build style object, including optional lineHeight
  const style: React.CSSProperties = {
    ...baseStyle,
    ...selectedStyle,
    color,
    fontWeight: fontWeight as any,
    textAlign: textAlign as any,
    fontSize: typeof fontSize === 'number' ? `${fontSize}px` : String(fontSize),
    ...(lineHeight !== undefined ? { lineHeight: typeof lineHeight === 'number' ? String(lineHeight) : String(lineHeight) } : {}),
    ...(fontFamily ? { fontFamily } : {}),
    ...(fontStyle ? { fontStyle } : {}),
    ...(letterSpacing !== undefined ? { letterSpacing: typeof letterSpacing === 'number' ? `${letterSpacing}px` : String(letterSpacing) } : {}),
    ...(wordSpacing !== undefined ? { wordSpacing: typeof wordSpacing === 'number' ? `${wordSpacing}px` : String(wordSpacing) } : {}),
    ...(textTransform ? { textTransform } : {}),
    ...(textDecoration && textDecoration !== 'none' ? { textDecoration } : {}),
    ...(whiteSpace ? { whiteSpace } : {}),
  };

  return React.createElement(Tag, {
    ref: setRef,
    style,
    'data-craft-selected': selected ? 'true' : 'false',
    'data-craft-node': id,
  }, text);
};

;(CraftText as any).craft = {
  displayName: 'Text',
  props: {
    text: 'Text',
    fontSize: 16,
    fontWeight: 'normal',
    color: '#000000',
    textAlign: 'left',
    lineHeight: undefined,
    as: 'p',
    fontFamily: undefined,
    fontStyle: 'normal',
    letterSpacing: undefined,
    wordSpacing: undefined,
    textTransform: undefined,
    textDecoration: undefined,
    whiteSpace: undefined,
  },
};

// Accept arbitrary props and forward them to the root div so we can pass attributes like data-craft-root
export const CraftContainer: React.FC<any> = ({ children, ...rest }) => {
  const { connectors, selected, id, data } = useNode((node: any) => ({
    connectors: node.connectors,
    selected: node.events.selected,
    id: node.id,
    data: node.data,
  })) as any;

  const preview = React.useContext(CraftPreviewContext);

  // read styling props from node data.props and provide sensible fallbacks
  const props = (data && data.props) || {};

  // padding/margin may be provided as numbers (px) or strings like '1rem' or '12px'
  const normalizeSpacing = (v: any, fallback: any) => {
    if (v === undefined || v === null || v === '') return typeof fallback === 'number' ? `${fallback}px` : String(fallback);
    return typeof v === 'number' ? `${v}px` : String(v);
  };

  const paddingValue = normalizeSpacing(props.padding, 12);
  const marginValue = normalizeSpacing(props.margin, 0);

  const borderWidth = (props.borderWidth !== undefined && props.borderWidth !== null) ? String(props.borderWidth) : '1';
  const borderStyle = props.borderStyle ?? 'solid';
  const borderColor = props.borderColor ?? '#e5e7eb';
  const borderRadius = props.borderRadius !== undefined && props.borderRadius !== null ? (typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : String(props.borderRadius)) : '6px';
  const boxShadow = props.boxShadow && props.boxShadow !== '' ? String(props.boxShadow) : undefined;
  const backgroundColor = props.backgroundColor ?? undefined;
  const color = props.color ?? undefined;

  // Build computed styles - prefer explicit props, otherwise fall back to previous defaults
  const computedBorder = (borderStyle === 'none' || Number(borderWidth) === 0) ? undefined : `${borderWidth}px ${borderStyle} ${borderColor}`;

  const baseStyle: React.CSSProperties = {
    padding: paddingValue,
    margin: marginValue,
    border: computedBorder ?? '1px solid #e5e7eb',
    borderRadius,
    cursor: preview ? 'default' : 'grab',
    backgroundColor,
    color,
    boxShadow,
  };

  const selectedStyle: React.CSSProperties = selected
    ? { outline: '2px solid #2563EB', outlineOffset: '2px', boxShadow: '0 1px 0 rgba(37,99,235,0.15)' }
    : {};

  return (
    <div
      ref={(ref: any) => {
        if (!ref) return;
        // containers should accept drops (connect) and also be draggable, but only in edit mode
        if (!preview) {
          if (connectors && connectors.connect) connectors.connect(ref);
          if (connectors && connectors.drag) connectors.drag(ref);
        }
      }}
      style={{ ...baseStyle, ...selectedStyle }}
      data-craft-selected={selected ? 'true' : 'false'}
      data-craft-node={id}
      {...rest}
    >
      {children}
    </div>
  );
};

;(CraftContainer as any).craft = {
  displayName: 'Container',
  isCanvas: true,
  props: {
    // layout
    padding: 12,
    margin: 0,
    // border
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: 6,
    // shadow
    boxShadow: '',
    // colors
    color: undefined,
    backgroundColor: undefined,
  },
};
