import React, {useEffect, useState, useRef} from 'react';
import {LinkBreakIcon, LinkSimpleIcon, CaretDownIcon} from '@phosphor-icons/react';
import SketchPicker from 'react-color';
import BorderRadiusControl from './BorderRadiusControl';
import Select from "@/Components/Select";
import Input from "@/Components/Input";

// BorderControl: UI for editing border widths (T R B L) with unit and link/unlink,
// plus border-style and color. Value is stored as an object-string or CSS pieces.
// For compatibility with existing places where a single string is used, this component
// accepts and returns a combined object-like string separated by `||` in the form:
// "widths|unit|style|color" where widths is either single value or 4-space-separated values.
// Example: "1 1 1 1|px|solid|#e5e7eb"

export function BorderControl({value = '', onChange, title = ''}: { value?: string, onChange: (v: string) => void, title?: string }) {
    const parse = (val: string) => {
        if (!val || typeof val !== 'string') return {parts: ['', '', '', ''], unit: 'px', style: 'solid', color: '', colorParts: ['', '', '', ''], radius: '', radiusParts: ['', '', '', '']};
        // try to parse our internal serialized form first
        if (val.includes('|')) {
            const [widths, unitRaw, style, color, radius] = val.split('|');
            const toks = widths.trim().split(/\s+/);
            const nums: string[] = [];
            let detectedUnit = unitRaw || 'px';
            for (const t of toks) {
                const m = t.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
                if (m) {
                    nums.push(m[1]);
                    if (m[2]) detectedUnit = m[2];
                } else {
                    // keep empty string for non-matching tokens so positions stay consistent
                    nums.push('');
                }
            }
            // parse color into parts (allow space-separated color values for per-side colors)
            const colorStr = (color || '').trim();
            const colorToks = colorStr === '' ? ['', '', '', ''] : colorStr.split(/\s+/);
            const colorParts = ((): string[] => {
                if (colorToks.length === 1) return [colorToks[0], colorToks[0], colorToks[0], colorToks[0]];
                if (colorToks.length === 2) return [colorToks[0], colorToks[1], colorToks[0], colorToks[1]];
                if (colorToks.length === 3) return [colorToks[0], colorToks[1], colorToks[2], colorToks[1]];
                return [colorToks[0]||'', colorToks[1]||'', colorToks[2]||'', colorToks[3]||''];
            })();
            // parse radius into parts (allow space-separated values for per-corner radii)
            const radiusStr = (radius || '').trim();
            const radiusToks = radiusStr === '' ? ['', '', '', ''] : radiusStr.split(/\s+/);
            const radiusParts = ((): string[] => {
                if (radiusToks.length === 1) return [radiusToks[0], radiusToks[0], radiusToks[0], radiusToks[0]];
                if (radiusToks.length === 2) return [radiusToks[0], radiusToks[1], radiusToks[0], radiusToks[1]];
                if (radiusToks.length === 3) return [radiusToks[0], radiusToks[1], radiusToks[2], radiusToks[1]];
                return [radiusToks[0]||'', radiusToks[1]||'', radiusToks[2]||'', radiusToks[3]||''];
            })();
            if (nums.length === 1) return {parts: [nums[0], nums[0], nums[0], nums[0]], unit: detectedUnit || 'px', style: style || 'solid', color: colorStr || '', colorParts};
            if (nums.length === 2) return {parts: [nums[0], nums[1], nums[0], nums[1]], unit: detectedUnit || 'px', style: style || 'solid', color: colorStr || '', colorParts};
            if (nums.length === 3) return {parts: [nums[0], nums[1], nums[2], nums[1]], unit: detectedUnit || 'px', style: style || 'solid', color: colorStr || '', colorParts};
            return {parts: [nums[0]||'', nums[1]||'', nums[2]||'', nums[3]||''], unit: detectedUnit || 'px', style: style || 'solid', color: colorStr || '', colorParts, radius: radiusStr || '', radiusParts};
        }
        // fallback: try to parse as CSS border shorthand (e.g., "1px solid #e5e7eb")
        const toks = val.trim().split(/\s+/);
        let unit = 'px';
        let style = 'solid';
        let color = '';
        let radius = '';
        const widthToks: string[] = [];
        for (const t of toks) {
            if (/^(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)$/i.test(t)) { style = t; continue; }
            if (/^#|^rgb|^hsl|^rgba|^hsla|^[a-z]+$/i.test(t)) { color = t; continue; }
            const m = t.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
            if (m) { widthToks.push(m[1]); if (m[2]) unit = m[2]; }
        }
        const nums = widthToks;
        const colorStr = (color || '').trim();
        const colorToks = colorStr === '' ? ['', '', '', ''] : colorStr.split(/\s+/);
        const colorParts = ((): string[] => {
            if (colorToks.length === 1) return [colorToks[0], colorToks[0], colorToks[0], colorToks[0]];
            if (colorToks.length === 2) return [colorToks[0], colorToks[1], colorToks[0], colorToks[1]];
            if (colorToks.length === 3) return [colorToks[0], colorToks[1], colorToks[2], colorToks[1]];
            return [colorToks[0]||'', colorToks[1]||'', colorToks[2]||'', colorToks[3]||''];
        })();
        const radiusStr = (radius || '').trim();
        const radiusToks = radiusStr === '' ? ['', '', '', ''] : radiusStr.split(/\s+/);
        const radiusParts = ((): string[] => {
            if (radiusToks.length === 1) return [radiusToks[0], radiusToks[0], radiusToks[0], radiusToks[0]];
            if (radiusToks.length === 2) return [radiusToks[0], radiusToks[1], radiusToks[0], radiusToks[1]];
            if (radiusToks.length === 3) return [radiusToks[0], radiusToks[1], radiusToks[2], radiusToks[1]];
            return [radiusToks[0]||'', radiusToks[1]||'', radiusToks[2]||'', radiusToks[3]||''];
        })();
        if (nums.length === 1) return {parts: [nums[0], nums[0], nums[0], nums[0]], unit, style, color: colorStr || '', colorParts};
        if (nums.length === 2) return {parts: [nums[0], nums[1], nums[0], nums[1]], unit, style, color: colorStr || '', colorParts};
        if (nums.length === 3) return {parts: [nums[0], nums[1], nums[2], nums[1]], unit, style, color: colorStr || '', colorParts};
        if (nums.length >= 4) return {parts: [nums[0], nums[1], nums[2], nums[3]], unit, style, color: colorStr || '', colorParts};
        return {parts: ['', '', '', ''], unit, style, color: colorStr || '', colorParts, radius: radiusStr || '', radiusParts};
    };

    const p = parse(value);
    const [linked, setLinked] = useState(true);
    const [top, setTop] = useState<string>(p.parts[0] ?? '');
    const [right, setRight] = useState<string>(p.parts[1] ?? '');
    const [bottom, setBottom] = useState<string>(p.parts[2] ?? '');
    const [left, setLeft] = useState<string>(p.parts[3] ?? '');
    const [unit, setUnit] = useState<string>(p.unit || 'px');
    const [style, setStyle] = useState<string>(p.style || 'solid');
    // support per-side colors stored as a space-separated string in the serialized value
    const [colorParts, setColorParts] = useState<string[]>(p.colorParts ?? [p.color || '', p.color || '', p.color || '', p.color || '']);
    // support per-corner border-radius values (TL TR BR BL)
    const [radiusParts, setRadiusParts] = useState<string[]>(p.radiusParts ?? [p.radius || '', p.radius || '', p.radius || '', p.radius || '']);

    // pickers open state: when linked, use single picker; when unlinked, separate per-side
    const [singlePickerOpen, setSinglePickerOpen] = useState<boolean>(false);
    const [sidePickersOpen, setSidePickersOpen] = useState<{top:boolean,right:boolean,bottom:boolean,left:boolean}>({top:false,right:false,bottom:false,left:false});
    const rootRef = useRef<HTMLDivElement | null>(null);

    // debounce timer to avoid parent overwriting mid-typing
    const notifyTimer = useRef<number | null>(null);
    const notifyDelay = 350;

    useEffect(() => {
        const parsed = parse(value);
        setTop(parsed.parts[0] ?? '');
        setRight(parsed.parts[1] ?? '');
        setBottom(parsed.parts[2] ?? '');
        setLeft(parsed.parts[3] ?? '');
        setUnit(parsed.unit || 'px');
        setStyle(parsed.style || 'solid');
        setColorParts(parsed.colorParts || [parsed.color || '', parsed.color || '', parsed.color || '', parsed.color || '']);
        setRadiusParts(parsed.radiusParts || [parsed.radius || '', parsed.radius || '', parsed.radius || '', parsed.radius || '']);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const serialize = (t: string, r: string, b: string, l: string, u: string, s: string, c: string, radiusStr?: string) => {
        // store in our compact pipe-delimited format
        // Previously we coerced empty values to '0' which could cause parent state to
        // overwrite user input unexpectedly. Preserve empty strings and join them.
        const parts = [t || '', r || '', b || '', l || ''];
        const allEqualAndNonEmpty = parts[0] !== '' && parts.every(p => p === parts[0]);
        const widths = allEqualAndNonEmpty ? parts[0] : parts.join(' ');
        // append radius as the fifth segment (may be empty)
        return `${widths}|${u}|${s}|${c}|${radiusStr || ''}`;
    };

    const notifyImmediate = (t: string, r: string, b: string, l: string, u: string, s: string, c: string, radiusStr?: string) => {
        // clear any pending debounced notify and call parent immediately
        if (notifyTimer.current) {
            clearTimeout(notifyTimer.current);
            notifyTimer.current = null;
        }
        onChange(serialize(t, r, b, l, u, s, c, radiusStr || ''));
    };

    const scheduleNotify = (t: string, r: string, b: string, l: string, u: string, s: string, c: string, radiusStr?: string) => {
        if (notifyTimer.current) clearTimeout(notifyTimer.current);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        notifyTimer.current = window.setTimeout(() => {
            notifyTimer.current = null;
            onChange(serialize(t, r, b, l, u, s, c, radiusStr || ''));
        }, notifyDelay) as unknown as number;
    };

    // helper to build the serialized color string from parts
    const colorsToString = (partsArr: string[]) => {
        // preserve empty tokens so parent can decide how to interpret; join with single space
        return partsArr.join(' ').trim();
    };
    const radiiToString = (partsArr: string[]) => {
        return partsArr.join(' ').trim();
    };

    // handle outside clicks to close any open pickers
    useEffect(() => {
        const onDocClick = (ev: MouseEvent) => {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(ev.target as Node)) {
                setSinglePickerOpen(false);
                setSidePickersOpen({top:false,right:false,bottom:false,left:false});
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    useEffect(() => {
        return () => {
            if (notifyTimer.current) {
                clearTimeout(notifyTimer.current);
                notifyTimer.current = null;
            }
        };
    }, []);

    const onTop = (v: string) => {
        setTop(v);
        if (linked) {
            setRight(v); setBottom(v); setLeft(v);
            // when linked, update immediately so all inputs reflect the value
            notifyImmediate(v, v, v, v, unit, style, colorsToString(colorParts), radiiToString(radiusParts));
        } else {
            // schedule update while typing
            scheduleNotify(v, right, bottom, left, unit, style, colorsToString(colorParts), radiiToString(radiusParts));
        }
    };
    const onRight = (v: string) => {
        setRight(v);
        if (linked) { setTop(v); setBottom(v); setLeft(v); notifyImmediate(v, v, v, v, unit, style, colorsToString(colorParts), radiiToString(radiusParts)); }
        else { scheduleNotify(top, v, bottom, left, unit, style, colorsToString(colorParts), radiiToString(radiusParts)); }
    };
    const onBottom = (v: string) => {
        setBottom(v);
        if (linked) { setTop(v); setRight(v); setLeft(v); notifyImmediate(v, v, v, v, unit, style, colorsToString(colorParts), radiiToString(radiusParts)); }
        else { scheduleNotify(top, right, v, left, unit, style, colorsToString(colorParts), radiiToString(radiusParts)); }
    };
    const onLeft = (v: string) => {
        setLeft(v);
        if (linked) { setTop(v); setRight(v); setBottom(v); notifyImmediate(v, v, v, v, unit, style, colorsToString(colorParts), radiiToString(radiusParts)); }
        else { scheduleNotify(top, right, bottom, v, unit, style, colorsToString(colorParts), radiiToString(radiusParts)); }
    };
    const onUnit = (u: string) => { setUnit(u); notifyImmediate(top, right, bottom, left, u, style, colorsToString(colorParts), radiiToString(radiusParts)); };
    const onStyle = (s: string) => { setStyle(s); notifyImmediate(top, right, bottom, left, unit, s, colorsToString(colorParts), radiiToString(radiusParts)); };
    // set color for a given side ('top'|'right'|'bottom'|'left'), or all when linked
    const onColorSide = (side: 'top'|'right'|'bottom'|'left', cHex: string) => {
        const next = [...colorParts];
        if (linked) {
            // set all
            for (let i=0;i<4;i++) next[i] = cHex;
            setColorParts(next);
            notifyImmediate(top, right, bottom, left, unit, style, colorsToString(next), radiiToString(radiusParts));
        } else {
            const idx = side === 'top' ? 0 : side === 'right' ? 1 : side === 'bottom' ? 2 : 3;
            next[idx] = cHex;
            setColorParts(next);
            notifyImmediate(top, right, bottom, left, unit, style, colorsToString(next), radiiToString(radiusParts));
        }
    };
    // radius handlers
    const onRadiusSide = (side: 'tl'|'tr'|'br'|'bl', val: string) => {
        const next = [...radiusParts];
        if (linked) {
            for (let i=0;i<4;i++) next[i] = val;
            setRadiusParts(next);
            notifyImmediate(top, right, bottom, left, unit, style, colorsToString(colorParts), radiiToString(next));
        } else {
            const idx = side === 'tl' ? 0 : side === 'tr' ? 1 : side === 'br' ? 2 : 3;
            next[idx] = val;
            setRadiusParts(next);
            notifyImmediate(top, right, bottom, left, unit, style, colorsToString(colorParts), radiiToString(next));
        }
    };
    const toggleLink = () => { const next = !linked; setLinked(next); if (next) { setRight(top); setBottom(top); setLeft(top); // when linking, unify colors and radii too
            const unified = [colorParts[0]||'', colorParts[0]||'', colorParts[0]||'', colorParts[0]||'']; setColorParts(unified);
            const unifiedR = [radiusParts[0]||'', radiusParts[0]||'', radiusParts[0]||'', radiusParts[0]||'']; setRadiusParts(unifiedR);
            notifyImmediate(top, top, top, top, unit, style, colorsToString(unified), radiiToString(unifiedR)); } };

    return (
        <div className={"flex flex-col space-y-2"} ref={rootRef}>
            <div className={"flex flex-row justify-between items-center"}>
                <div>{title}</div>
                <div className={"flex items-center space-x-2"}>
                    <div className={"flex items-center"}>
                        <Select value={unit} onChange={(e) => onUnit(e.target.value)} className="p-1 text-sm">
                            <option value="px">px</option>
                            <option value="rem">rem</option>
                            <option value="em">em</option>
                            <option value="%">%</option>
                        </Select>

                    </div>
                    <Select value={style} onChange={(e) => onStyle(e.target.value)} className="p-1 text-sm border rounded">
                        <option value="none">none</option>
                        <option value="solid">solid</option>
                        <option value="dashed">dashed</option>
                        <option value="dotted">dotted</option>
                        <option value="double">double</option>
                    </Select>
                    <button type="button" onClick={toggleLink} className={`p-[6px] border  ${linked ? 'bg-gray-100' : ''}`} title={linked ? 'Linked' : 'Unlinked'}>
                        {linked ? <LinkSimpleIcon size={16} weight="bold"/> : <LinkBreakIcon size={16} weight="bold"/>}
                    </button>
                </div>
            </div>

            <div className="flex items-start">
                <div className="grid grid-cols-4 gap-2 w-full">
                    <div className={"text-center"}>
                        <Input type="number" step="1" className="border-r rounded-l-[3px] w-full p-1 text-sm text-center" value={top}
                               onChange={(e) => onTop(e.target.value)} placeholder=""/>
                        <div className={"text-sm"}>Top</div>
                    </div>
                    <div className={"text-center"}>
                        <Input type="number" step="1" className="border-r w-full p-1 text-sm text-center" value={right}
                               onChange={(e) => onRight(e.target.value)} placeholder=""/>
                        <div className={"text-sm"}>Right</div>
                    </div>
                    <div className={"text-center"}>
                        <Input type="number" step="1" className="border-r w-full p-1 text-sm text-center" value={bottom}
                               onChange={(e) => onBottom(e.target.value)} placeholder=""/>
                        <div className={"text-sm"}>Bottom</div>
                    </div>
                    <div className={"text-center"}>
                        <Input type="number" step="1" className="w-full text-sm text-center" value={left}
                               onChange={(e) => onLeft(e.target.value)} placeholder=""/>
                        <div className={"text-sm"}>Left</div>
                    </div>
                </div>
            </div>



            <div className="flex items-center space-x-2">
                {/* Color swatches + pickers: show one when linked, or four when unlinked */}
                {linked ? (
                    <div className="flex items-center space-x-2">
                        <button type="button" onClick={() => setSinglePickerOpen(v => !v)} className="w-8 h-8 rounded border" style={{background: colorParts[0] || 'transparent'}} title={colorParts[0] || 'No color'} />
                        {singlePickerOpen ? (
                            <div className="absolute z-50 mt-2">
                                <SketchPicker color={colorParts[0] || '#000'} onChangeComplete={(col) => onColorSide('top', col.hex)} />
                            </div>
                        ) : null}
                        <div className="text-sm">Color</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-2 w-full">
                        {(['top','right','bottom','left'] as const).map((side, idx) => (
                            <div key={side} className="flex items-center space-x-2">
                                <button type="button" onClick={() => setSidePickersOpen(s => ({...s, [side]: !s[side]}))} className="w-full h-8 rounded border" style={{background: colorParts[idx] || 'transparent'}} title={colorParts[idx] || 'No color'} />
                                {sidePickersOpen[side] ? (
                                    <div className="absolute z-50 mt-2">
                                        <SketchPicker color={colorParts[idx] || '#000'} onChangeComplete={(col) => onColorSide(side, col.hex)} />
                                    </div>
                                ) : null}

                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Radius control (separate component) */}
            <div className="w-full mb-2">
                <BorderRadiusControl
                    title={"Radius"}
                    value={radiiToString(radiusParts)}
                    onChange={(rStr) => {
                        // parse rStr into parts and update local state, then notify parent with full serialized value
                        const toks = (rStr || '').trim().split(/\s+/).filter(x => x !== '');
                        const parts = (() => {
                            if (toks.length === 0) return ['', '', '', ''];
                            if (toks.length === 1) return [toks[0], toks[0], toks[0], toks[0]];
                            if (toks.length === 2) return [toks[0], toks[1], toks[0], toks[1]];
                            if (toks.length === 3) return [toks[0], toks[1], toks[2], toks[1]];
                            return [toks[0]||'', toks[1]||'', toks[2]||'', toks[3]||''];
                        })();
                        setRadiusParts(parts);
                        // notify parent with current widths/unit/style/colors and the new radius string
                        notifyImmediate(top, right, bottom, left, unit, style, colorsToString(colorParts), rStr);
                    }}
                />
            </div>

        </div>
    );
}

// no default export — use the named export BorderControl
