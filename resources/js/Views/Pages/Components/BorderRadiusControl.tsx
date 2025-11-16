import React, {useEffect, useState} from 'react';
import {LinkBreakIcon, LinkSimpleIcon} from '@phosphor-icons/react';

// BorderRadiusControl: manage border-radius values (TL TR BR BL) with link/unlink
// Now uses numeric inputs plus a shared unit select (px, rem, em, %).
// Accepts a space-separated radius string with units (e.g. "4px" or "4px 2px 4px 2px") and
// calls onChange with a radius string that includes units (same format).

export default function BorderRadiusControl({value = '', onChange, title = ''}: { value?: string, onChange: (v: string) => void, title?: string }) {
    const parse = (val: string) => {
        // returns { parts: [tl,tr,br,bl] as numeric strings (may be ''), unit: string }
        if (!val || typeof val !== 'string' || val.trim() === '') return {parts: ['', '', '', ''], unit: 'px'};
        const toks = val.trim().split(/\s+/);
        const nums: string[] = [];
        let detectedUnit = '';
        for (const t of toks) {
            const m = t.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
            if (m) {
                nums.push(m[1]);
                if (m[2]) detectedUnit = detectedUnit || m[2];
            } else {
                // try to accept numeric-only
                const m2 = t.match(/^(-?\d*\.?\d+)$/);
                if (m2) { nums.push(m2[1]); } else { nums.push(''); }
            }
        }
        // normalize into 4 values per CSS shorthand rules
        const parts = (() => {
            if (nums.length === 1) return [nums[0], nums[0], nums[0], nums[0]];
            if (nums.length === 2) return [nums[0], nums[1], nums[0], nums[1]];
            if (nums.length === 3) return [nums[0], nums[1], nums[2], nums[1]];
            return [nums[0]||'', nums[1]||'', nums[2]||'', nums[3]||''];
        })();
        return {parts, unit: detectedUnit || 'px'};
    };

    const parsed = parse(value || '');
    const [linked, setLinked] = useState(true);
    const [tl, setTl] = useState<string>(parsed.parts[0] ?? '');
    const [tr, setTr] = useState<string>(parsed.parts[1] ?? '');
    const [br, setBr] = useState<string>(parsed.parts[2] ?? '');
    const [bl, setBl] = useState<string>(parsed.parts[3] ?? '');
    const [unit, setUnit] = useState<string>(parsed.unit || 'px');

    useEffect(() => {
        const p = parse(value || '');
        setTl(p.parts[0]); setTr(p.parts[1]); setBr(p.parts[2]); setBl(p.parts[3]);
        setUnit(p.unit || 'px');
        const allEq = p.parts[0] !== '' && p.parts.every(x => x === p.parts[0]);
        setLinked(allEq);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const buildRadiusString = (partsArr: string[], u: string) => {
        // attach units to numeric parts (leave empty parts as empty tokens)
        const tokens = partsArr.map(p => (p === '' ? '' : `${p}${u}`));
        const allEqAndNonEmpty = partsArr[0] !== '' && partsArr.every(p => p === partsArr[0]);
        return allEqAndNonEmpty ? `${partsArr[0]}${u}` : tokens.join(' ').trim();
    };

    const propagate = (nextParts: string[], u: string) => {
        onChange(buildRadiusString(nextParts, u));
    };

    const onSetTl = (v: string) => {
        // v comes from number input; keep as string including decimal
        setTl(v);
        if (linked) {
            const next = [v, v, v, v];
            setTr(v); setBr(v); setBl(v);
            propagate(next, unit);
        } else {
            const next = [v, tr, br, bl];
            propagate(next, unit);
        }
    };
    const onSetTr = (v: string) => {
        setTr(v);
        if (linked) { setTl(v); setBr(v); setBl(v); propagate([v,v,v,v], unit); }
        else propagate([tl, v, br, bl], unit);
    };
    const onSetBr = (v: string) => {
        setBr(v);
        if (linked) { setTl(v); setTr(v); setBl(v); propagate([v,v,v,v], unit); }
        else propagate([tl, tr, v, bl], unit);
    };
    const onSetBl = (v: string) => {
        setBl(v);
        if (linked) { setTl(v); setTr(v); setBr(v); propagate([v,v,v,v], unit); }
        else propagate([tl, tr, br, v], unit);
    };

    const onUnitChange = (u: string) => {
        setUnit(u);
        // notify parent with current numeric parts and new unit
        propagate([tl, tr, br, bl], u);
    };

    const toggleLink = () => {
        const next = !linked;
        setLinked(next);
        if (next) {
            // unify to TL value (first non-empty)
            const unified = tl || tr || br || bl || '';
            setTl(unified); setTr(unified); setBr(unified); setBl(unified);
            propagate([unified,unified,unified,unified], unit);
        }
    };

    return (
        <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
                <div>{title}</div>
                <div className="flex items-center space-x-2">
                    <select value={unit} onChange={(e) => onUnitChange(e.target.value)} className="p-1 text-sm border rounded">
                        <option value="px">px</option>
                        <option value="rem">rem</option>
                        <option value="em">em</option>
                        <option value="%">%</option>
                    </select>
                    <button type="button" onClick={toggleLink} className={`p-[6px] border ${linked ? 'bg-gray-100' : ''}`} title={linked ? 'Linked' : 'Unlinked'}>
                        {linked ? <LinkSimpleIcon size={16} weight="bold"/> : <LinkBreakIcon size={16} weight="bold"/>}
                    </button>
                </div>
            </div>

            {linked ? (
                <div className="flex items-center space-x-2">
                    <input type="number" step="0.25" className="flex-1 border rounded p-1 text-sm" placeholder="Radius (e.g. 4)" value={tl} onChange={(e) => onSetTl(e.target.value)} />
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-2 w-full">
                    <div className="text-center"><input type="number" step="0.25" className="w-full border rounded p-1 text-sm text-center" placeholder="TL" value={tl} onChange={(e) => onSetTl(e.target.value)} /><div className="text-sm">TL</div></div>
                    <div className="text-center"><input type="number" step="0.25" className="w-full border rounded p-1 text-sm text-center" placeholder="TR" value={tr} onChange={(e) => onSetTr(e.target.value)} /><div className="text-sm">TR</div></div>
                    <div className="text-center"><input type="number" step="0.25" className="w-full border rounded p-1 text-sm text-center" placeholder="BR" value={br} onChange={(e) => onSetBr(e.target.value)} /><div className="text-sm">BR</div></div>
                    <div className="text-center"><input type="number" step="0.25" className="w-full border rounded p-1 text-sm text-center" placeholder="BL" value={bl} onChange={(e) => onSetBl(e.target.value)} /><div className="text-sm">BL</div></div>
                </div>
            )}
        </div>
    );
}
