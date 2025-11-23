import React, { useMemo } from 'react';
import { Element, useNode } from '@craftjs/core';
import { HtmlSettings } from './HtmlSettings';

// A tiny canvas component used for placeholder dropzones
export const PlaceholderDrop: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="html-placeholder min-h-[40px] border-dashed border-2 border-gray-300 rounded p-2 bg-transparent">
      {children}
    </div>
  );
};

// Mark as a craft canvas so other nodes can be dropped inside
(PlaceholderDrop as any).craft = {
  displayName: 'PlaceholderDrop',
  isCanvas: true,
  props: { id: undefined },
};

export type HtmlProps = {
  html: string;
};

export const Html: React.FC<Partial<HtmlProps>> = ({ html = '' }) => {
  const { connectors } = useNode((node: any) => ({ connectors: node.connectors }));

  // Lightweight client-side sanitizer: strip <script> tags and on* attributes and javascript: URLs
  const sanitizeHtml = (input: string) => {
    if (typeof document === 'undefined') return input;
    try {
      const container = document.createElement('div');
      container.innerHTML = input;
      // remove script/style tags
      container.querySelectorAll('script,style').forEach((n) => n.remove());
      // walk elements and remove event handler attributes and javascript: urls
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, null);
      const nodes: Element[] = [];
      while (walker.nextNode()) nodes.push(walker.currentNode as Element);
      nodes.forEach((el) => {
        // remove attributes starting with on (onclick, onmouseover) and javascript: in href/src
        Array.from(el.attributes).forEach((attr) => {
          const name = attr.name || '';
          const val = attr.value || '';
          if (/^on/i.test(name)) el.removeAttribute(name);
          if ((name === 'href' || name === 'src' || name === 'xlink:href') && /^\s*javascript:/i.test(val)) el.removeAttribute(name);
        });
      });
      return container.innerHTML;
    } catch (e) {
      return input;
    }
  };

  // Split the HTML by [placeholder] tokens (case-insensitive) using RegExp ctor to avoid literal escape warnings
  const parts = useMemo(() => {
    if (!html) return [''];
    const re = new RegExp('\\[placeholder]', 'i');
    return String(html).split(re);
  }, [html]);

  return (
    <div ref={(ref) => connectors.connect && connectors.connect(ref)} className="w-full">
      {parts.map((part, idx) => (
        <React.Fragment key={idx}>
          {part ? (
            <div className="html-fragment" dangerouslySetInnerHTML={{ __html: sanitizeHtml(part) }} />
          ) : null}

          {idx < parts.length - 1 ? (
            // Insert a craft canvas dropzone for each placeholder
            <Element id={`html_placeholder_${idx}`} is={PlaceholderDrop} canvas key={`ph-${idx}`}>
              {/* If empty show a hint */}
            </Element>
          ) : null}
        </React.Fragment>
      ))}
    </div>
  );
};

// export default already above; ensure TS knows craft is attached
// (Html as any).craft was assigned for craftjs metadata
(Html as any).craft = {
  displayName: 'Html',
  props: {
    html: '<p>Custom HTML — use [placeholder] to add dropzones</p>',
  },
  related: {
    toolbar: HtmlSettings,
  },
  rules: {
    canMoveIn: () => true,
  },
};

// Named export `Html` is used throughout the app; no default export needed.
