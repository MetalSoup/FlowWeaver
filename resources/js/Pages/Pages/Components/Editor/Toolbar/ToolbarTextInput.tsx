import { TextField, InputAdornment } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
import { ChromePicker } from 'react-color';

export type ToolbarTextInputProps = {
  prefix?: string;
  label?: string;
  type: string;
  onChange?: (value: any) => void;
  value?: any;
};
export const ToolbarTextInput = ({
  onChange,
  value,
  prefix,
  label,
  type,
  ...props
}: ToolbarTextInputProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const [active, setActive] = useState(false);

  // Helpers to parse various color shapes into a stable string or rgb object
  const normalizeColor = (c: any) => {
    if (!c) return '';
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

  const parseToRgbObject = (c: any) => {
    // If it's already an rgb object
    if (!c) return { r: 0, g: 0, b: 0, a: 1 };
    if (typeof c === 'object' && ('r' in c || 'g' in c || 'b' in c)) {
      return { r: Number(c.r ?? c[0] ?? 0), g: Number(c.g ?? c[1] ?? 0), b: Number(c.b ?? c[2] ?? 0), a: Number(c.a ?? c[3] ?? 1) };
    }
    if (typeof c === 'string') {
      const s = c.trim();
      // match rgba(r,g,b,a)
      const rgba = s.match(/rgba?\(([^)]+)\)/i);
      if (rgba && rgba[1]) {
        const parts = rgba[1].split(',').map(p => p.trim());
        const r = Number(parts[0] ?? 0);
        const g = Number(parts[1] ?? 0);
        const b = Number(parts[2] ?? 0);
        const a = parts[3] !== undefined ? Number(parts[3]) : 1;
        return { r, g, b, a };
      }
      // match hex
      const hex = s.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
      if (hex) {
        let h = hex[1];
        if (h.length === 3) {
          h = h.split('').map(ch => ch + ch).join('');
        }
        if (h.length === 4) {
          // rgba short form (#rgba)
          const r = parseInt(h[0] + h[0], 16);
          const g = parseInt(h[1] + h[1], 16);
          const b = parseInt(h[2] + h[2], 16);
          const a = parseInt(h[3] + h[3], 16) / 255;
          return { r, g, b, a };
        }
        if (h.length === 6 || h.length === 8) {
          const r = parseInt(h.substring(0, 2), 16);
          const g = parseInt(h.substring(2, 4), 16);
          const b = parseInt(h.substring(4, 6), 16);
          const a = h.length === 8 ? parseInt(h.substring(6, 8), 16) / 255 : 1;
          return { r, g, b, a };
        }
      }
    }
    // fallback
    return { r: 0, g: 0, b: 0, a: 1 };
  };

  React.useEffect(() => {
    let val = value;
    if (type === 'color' || type === 'bg')
      val = normalizeColor(value);
    setInternalValue(val);
  }, [value, type]);

  return (
    <div
      style={{ width: '100%', position: 'relative' }}
      onClick={() => {
        setActive(true);
      }}
    >
      {(type === 'color' || type === 'bg') && active ? (
        <div
          className="absolute"
          style={{
            zIndex: 99999,
            top: 'calc(100% + 10px)',
            left: '-5%',
          }}
        >
          <div
            className="fixed top-0 left-0 w-full h-full cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActive(false);
            }}
          ></div>
          <ChromePicker
            color={parseToRgbObject(value)}
            onChange={(color: any) => {
              onChange(color.rgb);
            }}
          />
        </div>
      ) : null}
      <TextField
        label={label}
        style={{ margin: 0, width: '100%' }}
        value={internalValue || ''}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onChange((e.target as any).value);
          }
        }}
        onChange={(e) => {
          setInternalValue(e.target.value);
        }}
        margin="dense"
        variant="standard"
        sx={{
          padding: 0,
          width: '100%',
          background: 'transparent',
          borderRadius: '100px',
          border: 'none',
          margin: 0,
          marginTop: 7,
          position: 'relative',
          '.MuiInputBase-input': {
            background: '#e5e5e5',
            borderRadius: '100px',
            fontSize: '0.9rem',
            position: 'relative',
            paddingLeft: '28px',
          },
        }}
        InputProps={{
          disableUnderline: true,
          startAdornment: ['color', 'bg'].includes(type) ? (
            <InputAdornment
              position="start"
              style={{
                position: 'absolute',
                marginTop: '2px',
                marginRight: '8px',
              }}
            >
              <div
                className="w-2 h-2 inline-block rounded-full relative z-10"
                style={{
                  left: '15px',
                  background: internalValue,
                }}
              />
            </InputAdornment>
          ) : null,
        }}
        InputLabelProps={{
          classes: {},
          shrink: true,
        }}
        {...props}
      />
    </div>
  );
};
