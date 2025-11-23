import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { ImageSettings } from './ImageSettings';
import {Resizer} from "@/Views/Pages/Components/Selectors/Resizer";

const PLACEHOLDER = `data:image/svg+xml;utf8,` + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' font-size='24' fill='%23757577' dominant-baseline='middle' text-anchor='middle'>Image Placeholder</text></svg>`
);

export const Image = (props: any) => {
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));
  const { connectors: { connect, drag } } = useNode((node) => ({ selected: node.events.selected }));

  const src = props.public_url ?? props.url ?? props.src ?? PLACEHOLDER;
  const alt = props.alt ?? props.file_name ?? 'Image';
  const width = props.width ?? undefined;
  const height = props.height ?? undefined;
  const caption = props.caption ?? undefined;
  const loading = props.loading ?? 'lazy';

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <Resizer
        propKey={{ width: 'width', height: 'height' }}
      ref={(ref: any) => connect(drag(ref))}
      className="w-full"
    >
      <img src={src} alt={alt} className="w-full h-auto object-cover" style={style} loading={loading} />
      {caption ? <div className="text-sm text-gray-600 mt-1">{caption}</div> : null}
    </Resizer>
  );
};

Image.craft = {
  displayName: 'Image',
  props: {
    src: PLACEHOLDER,
    url: null,
    public_url: null,
    file_name: 'Placeholder',
    alt: '',
    caption: '',
    width: '',
    height: '',
    loading: 'lazy',
  },
  related: {
    toolbar: ImageSettings,
  },
};

export default Image;
