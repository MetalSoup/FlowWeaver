import { useNode, useEditor } from '@craftjs/core';
import React from 'react';
import ContentEditable from 'react-contenteditable';

import { TextSettings } from './TextSettings';

export type TextProps = {
  fontSize: string;
  textAlign: string;
  fontWeight: string;
  color: Record<'r' | 'g' | 'b' | 'a', string>;
  shadow: number;
  text: string;
  margin: [string, string, string, string];
};

// Helper: produce a stable CSS rgba(...) string from many possible stored shapes
const normalizeColor = (c: any) => {
  if (!c) return undefined;
  // array-like [r,g,b,a]
  if (Array.isArray(c)) {
    const [r = 0, g = 0, b = 0, a = 1] = c;
    return `rgba(${Number(r)}, ${Number(g)}, ${Number(b)}, ${Number(a)})`;
  }

  // if it's already a string like 'rgba(...)' or '#rrggbb'
  if (typeof c === 'string') {
    return c;
  }

  // object with r,g,b,a keys (or numeric-indexed)
  const r = c.r ?? c[0] ?? 0;
  const g = c.g ?? c[1] ?? 0;
  const b = c.b ?? c[2] ?? 0;
  const a = c.a ?? c[3] ?? 1;
  return `rgba(${Number(r)}, ${Number(g)}, ${Number(b)}, ${Number(a)})`;
};

export const Text = ({
  fontSize,
  textAlign,
  fontWeight,
  color,
  shadow,
  text,
  margin,
}: Partial<TextProps>) => {
  const {
    connectors: { connect },
    actions: { setProp },
  } = useNode();
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  return (
    <ContentEditable
      innerRef={connect}
      html={text} // innerHTML of the editable div
      disabled={!enabled}
      onChange={(e) => {
        setProp((prop) => (prop.text = e.target.value), 500);
      }} // use true to disable editing
      tagName="h2" // Use a custom HTML tag (uses a div by default)
      style={{
        width: '100%',
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        color: normalizeColor(color),
        fontSize: `${fontSize}px`,
        textShadow: `0px 0px 2px rgba(0,0,0,${(shadow || 0) / 100})`,
        fontWeight,
        textAlign,
      }}
    />
  );
};

Text.craft = {
  displayName: 'Text',
  props: {
    fontSize: '15',
    textAlign: 'left',
    fontWeight: '500',
    color: { r: 92, g: 90, b: 90, a: 1 },
    margin: [0, 0, 0, 0],
    shadow: 0,
    text: 'Text',
  },
  related: {
    toolbar: TextSettings,
  },
};
