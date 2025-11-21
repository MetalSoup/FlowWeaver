import React from 'react';
import DOMPurify from 'dompurify';
import FlowReadOnly from './FlowReadOnly';

// Lightweight read-only components that mirror editor components' visual output
// These deliberately avoid craftjs hooks (useNode/useEditor) so they can be rendered
// outside the editor in a safe, non-editable context.

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

export const ReadOnlyContainer: React.FC<any> = ({
  flexDirection = 'column',
  alignItems = 'flex-start',
  justifyContent = 'flex-start',
  fillSpace = 'no',
  padding = ['0', '0', '0', '0'],
  margin = ['0', '0', '0', '0'],
  background,
  color,
  shadow = 0,
  radius = 0,
  width = '100%',
  height = 'auto',
  children,
}) => {
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection,
    alignItems,
    justifyContent,
    background: normalizeColor(background),
    color: normalizeColor(color),
    padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
    margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
    boxShadow: shadow === 0 ? 'none' : `0px 3px 100px ${shadow}px rgba(0, 0, 0, 0.13)`,
    borderRadius: `${radius}px`,
    width,
    height,
    boxSizing: 'border-box',
  };
  if (fillSpace === 'yes') (style as any).flex = 1;
  return <div style={style}>{children}</div>;
};

export const ReadOnlyText: React.FC<any> = ({
  fontSize = 15,
  textAlign = 'left',
  fontWeight = '500',
  color = { r: 92, g: 90, b: 90, a: 1 },
  shadow = 0,
  text = '',
  margin = [0, 0, 0, 0],
}) => {
  const style: React.CSSProperties = {
    width: '100%',
    margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
    color: normalizeColor(color),
    fontSize: typeof fontSize === 'string' ? `${fontSize}px` : `${fontSize}px`,
    textShadow: `0px 0px 2px rgba(0,0,0,${(shadow || 0) / 100})`,
    fontWeight: fontWeight as any,
    textAlign: textAlign as any,
    boxSizing: 'border-box',
    wordBreak: 'break-word',
  };

  // Use DOMPurify for robust sanitization before rendering HTML
  const sanitized = typeof text === 'string' && text.length > 0
    ? DOMPurify.sanitize(text, {
        ALLOWED_TAGS: ['b','i','em','strong','a','p','h1','h2','h3','h4','h5','ul','ol','li','br','span','div','img'],
        ALLOWED_ATTR: ['href','src','alt','title','target','rel','class','style'],
      })
    : '';

  return <div style={style} dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

export const ReadOnlyButton: React.FC<any> = ({
  text = 'Button',
  background = { r: 59, g: 130, b: 246, a: 1 },
  color = { r: 255, g: 255, b: 255, a: 1 },
  radius = 6,
}) => {
  const style: React.CSSProperties = {
    display: 'inline-block',
    padding: '8px 12px',
    background: normalizeColor(background) || '#3b82f6',
    color: normalizeColor(color) || '#fff',
    borderRadius: `${radius}px`,
    textDecoration: 'none',
  };
  return <a style={style}>{text}</a>;
};

export const ReadOnlyVideo: React.FC<any> = ({ src, poster, width = '100%', height = 'auto' }) => {
  if (!src) return null;
  return (
    <video controls style={{ width, height, display: 'block' }} src={src} poster={poster} />
  );
};

export const ReadOnlyImage: React.FC<any> = ({ public_url, url, src, alt, caption, width, height, loading = 'lazy' }) => {
  const displaySrc = public_url ?? url ?? src ?? '';
  if (!displaySrc) return null;
  const style: React.CSSProperties = { display: 'block', width: '100%', height: 'auto' };
  if (width) style.width = width;
  if (height) style.height = height;
  return (
    <div>
      <img src={displaySrc} alt={alt ?? ''} style={style} loading={loading as any} />
      {caption ? <div style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>{caption}</div> : null}
    </div>
  );
};

export const Fallback: React.FC<any> = ({ type, children, props }) => {
  return (
    <div style={{ border: '1px dashed #ffcc00', padding: 12, background: '#fff7dd' }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Unknown / Fallback component: {String(type)}</div>
      {props && (
        <pre style={{ fontSize: 12, background: '#fff', padding: 8, border: '1px solid #eee', overflow: 'auto' }}>{JSON.stringify(props, null, 2)}</pre>
      )}
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  );
};

// Replace Flow placeholder with a visible read-only representation
export const registry: Record<string, React.ComponentType<any>> = {
  Container: ReadOnlyContainer,
  Text: ReadOnlyText,
  Button: ReadOnlyButton,
  Video: ReadOnlyVideo,
  Image: ReadOnlyImage,
  // Add aliases or common editor-resolved names
  FlexColumn: ReadOnlyContainer,
  Flow: FlowReadOnly,
  // Fallback is used by renderer when type not found
  __FALLBACK__: Fallback,
};

export default registry;

