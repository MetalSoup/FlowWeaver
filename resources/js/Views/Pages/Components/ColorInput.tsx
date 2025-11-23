import Input from "@/Components/Input";
import React, {useEffect, useRef, useState} from 'react';
import { ChromePicker } from 'react-color';

export default function ColorInput({ value = '', onChange, placeholder = '' }: { value?: string|any, onChange: (v: string)=>void, placeholder?: string }) {
  const [text, setText] = useState<string>(value || '');
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement|null>(null);
  useEffect(() => { setText(value || ''); }, [value]);

  // Close popover on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!open) return;
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [open]);

  const normalizeForColorInput = (v: any) => {
    if (v == null || v === '') return '#000000';
    // if v is not a string, try to convert object/array to rgba string
    if (typeof v !== 'string') {
      if (Array.isArray(v)) {
        const [r = 0, g = 0, b = 0, a = 1] = v;
        return `rgba(${Number(r)}, ${Number(g)}, ${Number(b)}, ${Number(a)})`;
      }
      if (typeof v === 'object') {
        const r = v.r ?? v[0] ?? 0;
        const g = v.g ?? v[1] ?? 0;
        const b = v.b ?? v[2] ?? 0;
        const a = v.a ?? v[3] ?? 1;
        return `rgba(${Number(r)}, ${Number(g)}, ${Number(b)}, ${Number(a)})`;
      }
      // fallback to string conversion
      v = String(v);
    }
    v = v.trim();
    // if hex shorthand expand
    if (/^#([0-9a-f]{3})$/i.test(v)) return v.replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i, '#$1$1$2$2$3$3');
    // if simple hex or rgb/rgba/hsl, return as-is (ChromePicker accepts these)
    if (/^#([0-9a-f]{6})$/i.test(v) || /^rgba?\(/i.test(v) || /^hsla?\(/i.test(v)) return v;
    // fallback: try to pick named colors (ChromePicker accepts named colors in some browsers) else default
    return v || '#000000';
  };

  const handlePickerChange = (color: any) => {
    const c = color.rgb;
    const out = (typeof c.a === 'number' && c.a < 1) ? `rgba(${c.r},${c.g},${c.b},${+c.a.toFixed(2)})` : color.hex;
    setText(out);
    onChange && onChange(out);
  };

  const handleTextChange = (v: string) => {
    setText(v);
    onChange && onChange(v);
  };

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center space-x-2">
        <button type="button" onClick={() => setOpen(s => !s)} className="w-8 h-8 p-0 border rounded" style={{ background: normalizeForColorInput(text) }} aria-label="Open color picker"></button>
        <Input type="text" value={text} placeholder={placeholder} onChange={(e) => handleTextChange(e.target.value)} />
      </div>
      {open ? (
        <div style={{ position: 'absolute', zIndex: 50, top: '40px', left: 0 }}>
          <ChromePicker color={normalizeForColorInput(text)} onChange={handlePickerChange} />
        </div>
      ) : null}
    </div>
  );
}
