// SpacingControl: UI for Top/Right/Bottom/Left numeric inputs with unit selector and link/unlink toggle.
// value prop is a CSS spacing string like "8px" or "10px 0 10px 0"; onChange returns same format.
import {useEffect, useState} from "react";
import {CaretDownIcon, LinkBreakIcon, LinkSimpleIcon} from "@phosphor-icons/react";

export function SpacingControl({value = '', onChange, title = ''}: { value?: string, onChange: (v: string) => void , title?: string }) {
    // parse value into parts and unit
    const parse = (val: string) => {
        if (!val || typeof val !== 'string') return {parts: ['', '', '', ''], unit: 'px'};
        const toks = val.trim().split(/\s+/);
        // extract unit from first token
        const match = toks[0].match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
        let unit = 'px';
        if (match && match[2]) unit = match[2];
        const nums = toks.map(t => {
            const m = t.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
            return m ? m[1] : '';
        });
        if (nums.length === 1) return {parts: [nums[0], nums[0], nums[0], nums[0]], unit};
        if (nums.length === 2) return {parts: [nums[0], nums[1], nums[0], nums[1]], unit};
        if (nums.length === 3) return {parts: [nums[0], nums[1], nums[2], nums[1]], unit};
        if (nums.length >= 4) return {parts: [nums[0], nums[1], nums[2], nums[3]], unit};
        return {parts: ['', '', '', ''], unit};
    };

    const [linked, setLinked] = useState(true);
    const p = parse(value);
    const [top, setTop] = useState<string>(p.parts[0] ?? '');
    const [right, setRight] = useState<string>(p.parts[1] ?? '');
    const [bottom, setBottom] = useState<string>(p.parts[2] ?? '');
    const [left, setLeft] = useState<string>(p.parts[3] ?? '');
    const [unit, setUnit] = useState<string>(p.unit || 'px');

    // When external value changes, sync internal state
    useEffect(() => {
        const parsed = parse(value);
        setTop(parsed.parts[0] ?? '');
        setRight(parsed.parts[1] ?? '');
        setBottom(parsed.parts[2] ?? '');
        setLeft(parsed.parts[3] ?? '');
        setUnit(parsed.unit || 'px');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // Build CSS value and notify parent
    const notify = (t: string, r: string, b: string, l: string, u: string) => {
        // If all sides are equal, store single value
        if (t !== '' && t === r && r === b && b === l) {
            onChange(`${t}${u}`);
        } else {
            const parts = [t || '0', r || '0', b || '0', l || '0'];
            onChange(parts.map(x => `${x}${u}`).join(' '));
        }
    };

    const onTop = (v: string) => {
        setTop(v);
        if (linked) {
            setRight(v);
            setBottom(v);
            setLeft(v);
            notify(v, v, v, v, unit);
        } else {
            notify(v, right, bottom, left, unit);
        }
    };
    const onRight = (v: string) => {
        setRight(v);
        if (linked) {
            setTop(v);
            setBottom(v);
            setLeft(v);
            notify(v, v, v, v, unit);
        } else {
            notify(top, v, bottom, left, unit);
        }
    };
    const onBottom = (v: string) => {
        setBottom(v);
        if (linked) {
            setTop(v);
            setRight(v);
            setLeft(v);
            notify(v, v, v, v, unit);
        } else {
            notify(top, right, v, left, unit);
        }
    };
    const onLeft = (v: string) => {
        setLeft(v);
        if (linked) {
            setTop(v);
            setRight(v);
            setBottom(v);
            notify(v, v, v, v, unit);
        } else {
            notify(top, right, bottom, v, unit);
        }
    };
    const onUnit = (u: string) => {
        setUnit(u);
        notify(top, right, bottom, left, u);
    };
    const toggleLink = () => {
        const next = !linked;
        setLinked(next);
        if (next) { // apply top to all
            setRight(top);
            setBottom(top);
            setLeft(top);
            notify(top, top, top, top, unit);
        }
    };

    return (
        <div className={"flex flex-col space-y-2"}>
            <div className={"flex flex-row justify-between"}>
            {title}
            <div className={"flex self-end flex-row items-center"}>

                <select value={unit} onChange={(e) => onUnit(e.target.value)} className="p-1 text-sm border-none bg-none">
                    <option value="px">px</option>
                    <option value="rem">rem</option>
                    <option value="em">em</option>
                    <option value="%">%</option>
                </select>
                <CaretDownIcon size={10} weight={"bold"} className={"-ml-3"}/>
            </div>
            </div>

            <div className="flex items-start ">

                <div className="grid grid-cols-4 ">
                    <div className={"text-center"}>
                        <input type="number" step="1" className="border-r rounded-l-[3px] w-full p-1 text-sm text-center" value={top}
                               onChange={(e) => onTop(e.target.value)} placeholder=""/>
                        <div className={"text-sm"}>Top</div>
                    </div>
                    <div className={"text-center"}>

                        <input type="number" step="1" className="border-r w-full p-1 text-sm text-center" value={right}
                               onChange={(e) => onRight(e.target.value)} placeholder=""/>
                        <div className={"text-sm"}>Right</div>
                    </div>
                    <div className={"text-center"}>
                        <input type="number" step="1" className="border-r w-full p-1 text-sm text-center" value={bottom}
                               onChange={(e) => onBottom(e.target.value)} placeholder=""/>
                        <div className={"text-sm"}>Bottom</div>
                    </div>
                    <div className={"text-center"}>
                        <input type="number" step="1" className="border-r rounded-r-[3px] w-full p-1 text-sm text-center" value={left}
                               onChange={(e) => onLeft(e.target.value)} placeholder=""/>
                        <div className={"text-sm"}>Left</div>
                    </div>

                </div>
                <div>
                    <button type="button" onClick={toggleLink}
                            className={`p-[6px] border  ${linked ? 'bg-gray-100' : ''}`}
                            title={linked ? 'Linked' : 'Unlinked'}>
                        {linked ? <LinkSimpleIcon size={16} weight="bold"/> : <LinkBreakIcon size={16} weight="bold"/>}
                    </button>
                </div>

            </div>
        </div>
    );
}
