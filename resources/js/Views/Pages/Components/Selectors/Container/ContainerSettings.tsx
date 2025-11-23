import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import { ToolbarSection } from '../../editor';
import { SpacingControl } from '@/Views/Pages/Components/SpacingControl';
import { BoxShadowControl } from '@/Views/Pages/Components/BoxShadowControl';
import { BorderControl } from '@/Views/Pages/Components/BorderControl';
import ColorInput from '@/Views/Pages/Components/ColorInput';
import { DeviceMobileIcon, DeviceTabletIcon, DesktopIcon, ArrowRight, ArrowDown, ArrowLeft, ArrowUp, LinkSimple, LinkBreak } from '@phosphor-icons/react';

const DeviceIcon = ({ children, active, onClick }: any) => (
  <button onClick={onClick} className={`p-1 mx-1 rounded ${active ? 'bg-gray-200 dark:bg-gray-700' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
    {children}
  </button>
);

// helper: convert spacing string (e.g. "10px 20px") into [top,right,bottom,left] numeric strings (px values without unit)
const spacingToArray = (val: string) => {
  if (!val || typeof val !== 'string') return ['0', '0', '0', '0'];
  const toks = val.trim().split(/\s+/);
  const nums = toks.map((t) => {
    const m = String(t).match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
    return m ? String(Number(m[1])) : '0';
  });
  if (nums.length === 1) return [nums[0], nums[0], nums[0], nums[0]];
  if (nums.length === 2) return [nums[0], nums[1], nums[0], nums[1]];
  if (nums.length === 3) return [nums[0], nums[1], nums[2], nums[1]];
  return [nums[0] || '0', nums[1] || '0', nums[2] || '0', nums[3] || '0'];
};

// helper: convert various color shapes into a CSS string
const colorToString = (c: any) => {
  if (!c) return '';
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) {
    const [r = 0, g = 0, b = 0, a = 1] = c;
    return `rgba(${Number(r)}, ${Number(g)}, ${Number(b)}, ${Number(a)})`;
  }
  // object with r,g,b,a or numeric indexes
  const r = c.r ?? c[0] ?? 0;
  const g = c.g ?? c[1] ?? 0;
  const b = c.b ?? c[2] ?? 0;
  const a = c.a ?? c[3] ?? 1;
  return `rgba(${Number(r)}, ${Number(g)}, ${Number(b)}, ${Number(a)})`;
};

const getStoredViewport = () => {
  try {
    const v = typeof window !== 'undefined' ? window.localStorage.getItem('editor:viewportSize') : null;
    if (v === 'mobile' || v === 'tablet' || v === 'desktop') return v;
  } catch (e) {
    // ignore
  }
  return 'desktop';
};

export const ContainerSettings = () => {
  const { actions, props } = useNode((node: any) => ({
    actions: node.actions,
    props: node.data.props,
  }));
  const setProp = actions?.setProp as any;

  const [unit, setUnit] = useState('px');
  const [gapLinked, setGapLinked] = useState(true);
  const [bp, setBp] = useState<'desktop' | 'tablet' | 'mobile'>(getStoredViewport());

  useEffect(() => {
    const onStorage = () => setBp(getStoredViewport());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Listen for global viewport messages from PageEditor (keeps toolbar in sync)
  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      try {
        if (!ev?.data) return;
        const d = ev.data;
        if (d && d.type === 'editor:setViewport') {
          const v = d.viewport;
          if (v === 'mobile' || v === 'tablet' || v === 'desktop') setBp(v);
        }
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // set viewport globally: update local state, persist to localStorage and notify PageEditor via postMessage
  const setGlobalViewport = (v: 'desktop' | 'tablet' | 'mobile') => {
    try {
      setBp(v);
      // Prefer calling the editor API directly when available
      try {
        const api = (window as any).__editorApi;
        if (api && typeof api.setViewport === 'function') {
          api.setViewport(v);
          // also persist to localStorage for other listeners
          try { window.localStorage.setItem('editor:viewportSize', v); } catch (e) {}
          return;
        }
      } catch (e) {}
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('editor:viewportSize', v);
        // notify PageEditor in the same window (and any frames) to update their state
        window.postMessage({ type: 'editor:setViewport', viewport: v }, '*');
      }
    } catch (e) {
      // ignore
    }
  };

  // Generic resolver: returns a canonical value for the current breakpoint
  const resolveResponsive = (key: string) => {
    const v = props?.[key];
    if (v == null) return '';
    // if object keyed by breakpoints
    if (typeof v === 'object' && !Array.isArray(v)) {
      return v[bp] ?? v.desktop ?? '';
    }
    // array or primitive - return as-is
    return v;
  };

  const updateResponsive = (key: string, value: any) => {
    if (typeof setProp !== 'function') return;
    setProp((p: any) => {
      const curResponsive = p[`${key}_responsive`];
      let newResponsive: any;
      if (curResponsive && typeof curResponsive === 'object' && !Array.isArray(curResponsive)) {
        newResponsive = { ...curResponsive };
      } else if (p[key] && typeof p[key] === 'object' && !Array.isArray(p[key])) {
        newResponsive = { ...p[key] };
      } else {
        // convert legacy to responsive object: use existing value as fallback for all breakpoints
        const fallback = p[key] ?? value;
        newResponsive = { desktop: fallback, tablet: fallback, mobile: fallback };
      }
      newResponsive[bp] = value;
      p[`${key}_responsive`] = newResponsive;
      // also set the simple prop to the current bp value for compatibility with Resizer and other logic
      p[key] = value;
    });
  };

  const updateProp = (key: string, value: any) => {
    // keep for non-responsive quick updates
    if (typeof setProp !== 'function') return;
    setProp((p: any) => (p[key] = value));
  };

  // small helper to get spacing string for SpacingControl (it expects "8px 4px" etc.)
  const spacingForControl = (key: string) => {
    const v = resolveResponsive(key);
    if (Array.isArray(v)) return v.join(' ') + 'px';
    if (typeof v === 'string') return v;
    return '';
  };

  // helper to parse spacing string and update responsive padding/margin
  const updateSpacingResponsive = (key: string, v: string) => {
    const arr = spacingToArray(v);
    updateResponsive(key, arr);
  };

  return (
    <div>
      <ToolbarSection title="Container">
        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Container Layout
          </label>
          <select
            value={resolveResponsive('containerLayout') || 'flexbox'}
            onChange={(e) => updateResponsive('containerLayout', e.target.value)}
            className="w-full rounded border px-2 py-1 bg-transparent"
          >
            <option value="flexbox">Flexbox</option>
            <option value="grid">Grid</option>
            <option value="block">Block</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Content Width
          </label>
          <select
            value={resolveResponsive('contentWidth') || 'boxed'}
            onChange={(e) => updateResponsive('contentWidth', e.target.value)}
            className="w-full rounded border px-2 py-1 bg-transparent"
          >
            <option value="boxed">Boxed</option>
            <option value="full">Full</option>
          </select>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs text-gray-500 dark:text-gray-400">
              Width
            </label>
            <div className="flex items-center">
              <DeviceIcon active={bp === 'desktop'} onClick={() => setGlobalViewport('desktop')}><DesktopIcon size={14} /></DeviceIcon>
              <DeviceIcon active={bp === 'tablet'} onClick={() => setGlobalViewport('tablet')}><DeviceTabletIcon size={14} /></DeviceIcon>
              <DeviceIcon active={bp === 'mobile'} onClick={() => setGlobalViewport('mobile')}><DeviceMobileIcon size={14} /></DeviceIcon>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={0}
              max={2000}
              value={parseInt(String(resolveResponsive('width') || 1140))}
              onChange={(e) => updateResponsive('width', `${e.target.value}${unit}`)}
              className="w-full"
            />
            <input
              value={String(resolveResponsive('width') || '')}
              onChange={(e) => updateResponsive('width', e.target.value)}
              className="w-20 rounded border px-2 py-1"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="rounded border px-2 py-1"
            >
              <option value="px">px</option>
              <option value="%">%</option>
              <option value="vw">vw</option>
            </select>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs text-gray-500 dark:text-gray-400">
              Min Height
            </label>
            <div className="text-xs text-gray-400">px</div>
          </div>
          <input
            type="range"
            min={0}
            max={2000}
            value={parseInt(String(resolveResponsive('minHeight') || 0))}
            onChange={(e) => updateResponsive('minHeight', `${e.target.value}px`)}
            className="w-full"
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Direction
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => updateResponsive('flexDirection', 'row')}
              className={`p-2 rounded ${resolveResponsive('flexDirection') === 'row' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => updateResponsive('flexDirection', 'column')}
              className={`p-2 rounded ${resolveResponsive('flexDirection') === 'column' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}>
              <ArrowDown size={16} />
            </button>
            <button
              onClick={() => updateResponsive('flexDirection', 'row-reverse')}
              className={`p-2 rounded ${resolveResponsive('flexDirection') === 'row-reverse' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}>
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => updateResponsive('flexDirection', 'column-reverse')}
              className={`p-2 rounded ${resolveResponsive('flexDirection') === 'column-reverse' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}>
              <ArrowUp size={16} />
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Justify Content
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => updateResponsive('justifyContent', 'flex-start')}
              className={`p-2 rounded ${resolveResponsive('justifyContent') === 'flex-start' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}>
              Left
            </button>
            <button
              onClick={() => updateResponsive('justifyContent', 'center')}
              className={`p-2 rounded ${resolveResponsive('justifyContent') === 'center' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}>
              Center
            </button>
            <button
              onClick={() => updateResponsive('justifyContent', 'flex-end')}
              className={`p-2 rounded ${resolveResponsive('justifyContent') === 'flex-end' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}>
              Right
            </button>
            <button
              onClick={() => updateResponsive('justifyContent', 'space-between')}
              className={`p-2 rounded ${resolveResponsive('justifyContent') === 'space-between' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}>
              Space
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Align Items
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => updateResponsive('alignItems', 'flex-start')}
              className={`p-2 rounded ${resolveResponsive('alignItems') === 'flex-start' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}>
              Top
            </button>
            <button
              onClick={() => updateResponsive('alignItems', 'center')}
              className={`p-2 rounded ${resolveResponsive('alignItems') === 'center' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}>
              Middle
            </button>
            <button
              onClick={() => updateResponsive('alignItems', 'flex-end')}
              className={`p-2 rounded ${resolveResponsive('alignItems') === 'flex-end' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}>
              Bottom
            </button>
            <button
              onClick={() => updateResponsive('alignItems', 'stretch')}
              className={`p-2 rounded ${resolveResponsive('alignItems') === 'stretch' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}>
              Stretch
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Gaps
          </label>
          <div className="flex items-center gap-2">
            <input
              value={(Array.isArray(resolveResponsive('gaps')) ? resolveResponsive('gaps')[0] : (resolveResponsive('gaps') || ''))}
              onChange={(e) => {
                const other = Array.isArray(resolveResponsive('gaps')) ? resolveResponsive('gaps')[1] : '';
                updateResponsive('gaps', [e.target.value, other]);
                if (gapLinked) updateResponsive('gaps', [e.target.value, e.target.value]);
              }}
              className="w-1/2 rounded border px-2 py-1"
            />
            <input
              value={(Array.isArray(resolveResponsive('gaps')) ? resolveResponsive('gaps')[1] : (resolveResponsive('gaps') || ''))}
              onChange={(e) => {
                const other = Array.isArray(resolveResponsive('gaps')) ? resolveResponsive('gaps')[0] : '';
                updateResponsive('gaps', [other, e.target.value]);
              }}
              className="w-1/2 rounded border px-2 py-1"
            />
            <button
              onClick={() => setGapLinked(!gapLinked)}
              className="ml-2 p-1 border rounded"
            >
              {gapLinked ? <LinkSimple size={16} /> : <LinkBreak size={16} />}
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Wrap
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => updateResponsive('wrap', 'nowrap')}
              className={`p-2 rounded ${resolveResponsive('wrap') === 'nowrap' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}>
              No wrap
            </button>
            <button
              onClick={() => updateResponsive('wrap', 'wrap')}
              className={`p-2 rounded ${resolveResponsive('wrap') === 'wrap' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}>
              Wrap
            </button>
            <button
              onClick={() => updateResponsive('wrap', 'wrap-reverse')}
              className={`p-2 rounded ${resolveResponsive('wrap') === 'wrap-reverse' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}>
              Wrap rev
            </button>
          </div>
        </div>
      </ToolbarSection>

      {/* Decoration: map shared controls into Container props */}
      <ToolbarSection title="Decoration">
        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Background</label>
          <ColorInput
            value={colorToString(props?.background) || ''}
            placeholder="#fff"
            onChange={(v: any) => updateProp('background', v)}
          />
        </div>

        <div className="mb-3">
          <BorderControl
            title={"Border"}
            value={
              (props && `${props.containerBorderWidth || ''}|${props.containerBorderUnit || 'px'}|${props.containerBorderStyle || 'solid'}|${props.containerBorderColor || ''}|${props.radius || ''}`) || ''
            }
            onChange={(v: any) => {
              const parts = (v || '').split('|');
              const widthsRaw = parts[0] || '';
              const u = parts[1] || 'px';
              const s = parts[2] || 'solid';
              const c = parts[3] || '';
              const radius = parts[4] || '';
              const widths = widthsRaw
                .trim()
                .split(/\s+/)
                .map((w: string) => (w === '' ? '0' : /(?:px|rem|em|%)$/i.test(w) ? w : `${w}${u}`))
                .join(' ');
              updateProp('containerBorderWidth', widths);
              updateProp('containerBorderUnit', u);
              updateProp('containerBorderStyle', s);
              updateProp('containerBorderColor', c);
              // map border radius into existing radius prop used by Container
              updateProp('radius', radius ? Number(String(radius).replace(/[^0-9.]/g, '')) : 0);
            }}
          />
        </div>

        <div className="mb-3">
          <SpacingControl
            title={"Padding"}
            value={spacingForControl('padding')}
            onChange={(v: any) => updateSpacingResponsive('padding', v)}
          />
        </div>

        <div className="mb-3">
          <SpacingControl
            title={"Margin"}
            value={spacingForControl('margin')}
            onChange={(v: any) => updateSpacingResponsive('margin', v)}
          />
        </div>

        <div className="mb-3">
          <BoxShadowControl
            title={"Box Shadow"}
            value={resolveResponsive('boxShadow') || ''}
            onChange={(v: any) => updateResponsive('boxShadow', v)}
          />
        </div>
      </ToolbarSection>
    </div>
  );
};

export default ContainerSettings;
