import React, {useEffect, useState} from 'react';
import {CaretDownIcon} from "@phosphor-icons/react";

// BoxShadowControl: UI for editing a single box-shadow value with inputs for
// offset-x, offset-y, blur, spread, unit selector, color and inset toggle.
// value prop is a CSS box-shadow string like "0 1px 3px 0 rgba(0,0,0,0.1)" or "inset 0 0 0 0 #000"
export function BoxShadowControl({value = '', onChange, title = ''}: { value?: string, onChange: (v: string) => void, title?: string }) {
    const parse = (val: string) => {
        if (!val || typeof val !== 'string') return {inset: false, parts: ['', '', '', ''], unit: 'px', color: ''};
        let s = val.trim();
        let inset = false;
        if (s.startsWith('inset')) {
            inset = true;
            s = s.replace(/^inset\s+/i, '');
        }
        // try to extract color token (last token). colors like rgba(...) are single token
        const toks = s.split(/\s+/);
        let color = '';
        if (toks.length > 0) {
            const last = toks[toks.length - 1];
            // if last token looks like a color (#, rgb, rgba, hsl, hsla or named) keep it as color
            if (/^#|^rgb|^hsl|^rgba|^hsla|^[a-z]+$/i.test(last)) {
                color = last;
                toks.pop();
            }
        }
        // remaining tokens should be 2-4 numeric values with optional unit
        const matchFirst = toks[0] ? toks[0].match(/^(-?\d*\.?\d+)([a-z%]*)$/i) : null;
        const unit = (matchFirst && matchFirst[2]) ? matchFirst[2] : 'px';
        const nums = toks.map(t => {
            const m = t.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
            return m ? m[1] : '';
        });
        // ensure we have 4 parts: offsetX offsetY blur spread
        const parts = ['', '', '', ''];
        if (nums.length === 1) { parts[0] = nums[0]; }
        if (nums.length === 2) { parts[0] = nums[0]; parts[1] = nums[1]; }
        if (nums.length === 3) { parts[0] = nums[0]; parts[1] = nums[1]; parts[2] = nums[2]; }
        if (nums.length >= 4) return {inset, parts: [nums[0], nums[1], nums[2], nums[3]], unit, color};
        return {inset, parts, unit, color};
    };

    const p = parse(value);
    const [inset, setInset] = useState<boolean>(p.inset);
    const [offsetX, setOffsetX] = useState<string>(p.parts[0] ?? '');
    const [offsetY, setOffsetY] = useState<string>(p.parts[1] ?? '');
    const [blur, setBlur] = useState<string>(p.parts[2] ?? '');
    const [spread, setSpread] = useState<string>(p.parts[3] ?? '');
    const [unit, setUnit] = useState<string>(p.unit || 'px');
    const [color, setColor] = useState<string>(p.color || '');

    useEffect(() => {
        const parsed = parse(value);
        setInset(parsed.inset);
        setOffsetX(parsed.parts[0] ?? '');
        setOffsetY(parsed.parts[1] ?? '');
        setBlur(parsed.parts[2] ?? '');
        setSpread(parsed.parts[3] ?? '');
        setUnit(parsed.unit || 'px');
        setColor(parsed.color || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const notify = (ox: string, oy: string, b: string, s: string, u: string, c: string, ins: boolean) => {
        const oxv = ox === '' ? '0' : ox;
        const oyv = oy === '' ? '0' : oy;
        const bv = b === '' ? '0' : b;
        const sv = s === '' ? '0' : s;
        const colorPart = c ? ` ${c}` : '';
        const insetPart = ins ? 'inset ' : '';
        onChange(`${insetPart}${oxv}${u} ${oyv}${u} ${bv}${u} ${sv}${u}${colorPart}`);
    };

    const onOffsetX = (v: string) => { setOffsetX(v); notify(v, offsetY, blur, spread, unit, color, inset); };
    const onOffsetY = (v: string) => { setOffsetY(v); notify(offsetX, v, blur, spread, unit, color, inset); };
    const onBlur = (v: string) => { setBlur(v); notify(offsetX, offsetY, v, spread, unit, color, inset); };
    const onSpread = (v: string) => { setSpread(v); notify(offsetX, offsetY, blur, v, unit, color, inset); };
    const onUnit = (u: string) => { setUnit(u); notify(offsetX, offsetY, blur, spread, u, color, inset); };
    const onColor = (c: string) => { setColor(c); notify(offsetX, offsetY, blur, spread, unit, c, inset); };
    const toggleInset = () => { const next = !inset; setInset(next); notify(offsetX, offsetY, blur, spread, unit, color, next); };

    return (
        <div className={"flex flex-col space-y-2"}>
            <div className={"flex flex-row justify-between items-center"}>
                <div>{title}</div>
                <div className={"flex items-center space-x-2"}>
                    <div className={"flex items-center"}>
                        <select value={unit} onChange={(e) => onUnit(e.target.value)} className="p-1 text-sm border-none bg-none">
                            <option value="px">px</option>
                            <option value="rem">rem</option>
                            <option value="em">em</option>
                            <option value="%">%</option>
                        </select>
                        <CaretDownIcon size={10} weight={"bold"} className={"-ml-3"}/>
                    </div>
                    <button type="button" onClick={toggleInset} className={`p-1 border rounded ${inset ? 'bg-gray-100' : ''}`} title={inset ? 'Inset' : 'Outset'}>
                        {inset ? 'inset' : 'outset'}
                    </button>
                </div>
            </div>

            <div className="flex items-start">
                <div className="grid grid-cols-4 gap-2 w-full">
                    <div className={"text-center"}>
                        <input type="number" step="1" className="border-r rounded-l-[3px] w-full p-1 text-sm text-center" value={offsetX}
                               onChange={(e) => onOffsetX(e.target.value)} placeholder=""/>
                        <div className={"text-sm"}>X</div>
                    </div>
                    <div className={"text-center"}>
                        <input type="number" step="1" className="border-r w-full p-1 text-sm text-center" value={offsetY}
                               onChange={(e) => onOffsetY(e.target.value)} placeholder=""/>
                        <div className={"text-sm"}>Y</div>
                    </div>
                    <div className={"text-center"}>
                        <input type="number" step="1" className="border-r w-full p-1 text-sm text-center" value={blur}
                               onChange={(e) => onBlur(e.target.value)} placeholder=""/>
                        <div className={"text-sm"}>Blur</div>
                    </div>
                    <div className={"text-center"}>
                        <input type="number" step="1" className="border-r rounded-r-[3px] w-full p-1 text-sm text-center" value={spread}
                               onChange={(e) => onSpread(e.target.value)} placeholder=""/>
                        <div className={"text-sm"}>Spread</div>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <input type="text" className="flex-1 border rounded p-2 text-sm" placeholder="Color (e.g. rgba(0,0,0,0.1) or #000)" value={color} onChange={(e) => onColor(e.target.value)} />
            </div>
        </div>
    );
}
