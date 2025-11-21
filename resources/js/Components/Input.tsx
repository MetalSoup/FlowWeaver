/*this function should be able to accept all the standard settings an input can have plus some other settings and pass it to the <input>*/
import React, { useRef, useEffect, useState } from "react";
import { inputBase } from "./ui";
import {CaretUpIcon, CaretDownIcon, MinusIcon} from "@phosphor-icons/react";

export default function Input({ className = "", isFocused, type, onChange, value, defaultValue, min, max, step,
    dragSensitivity = 6, // pixels per step
    wheelStep = 1, // multiplier for wheel increments
    showDragTooltip = true,
    ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & { isFocused?: boolean; dragSensitivity?: number; wheelStep?: number; showDragTooltip?: boolean }) {
     const combined = `${inputBase}${className ? ` ${className}` : ""}`;
     const inputRef = useRef<HTMLInputElement | null>(null);
     const containerRef = useRef<HTMLDivElement | null>(null);
     const dragging = useRef(false);
     const dragStartY = useRef(0);
     const startValue = useRef(0);
     const prevUserSelect = useRef<string | null>(null);
     const prevOverflow = useRef<string | null>(null);
     const nativeWheelRef = useRef<((ev: WheelEvent) => void) | null>(null);
     const [tooltipVisible, setTooltipVisible] = useState(false);
     const [tooltipValue, setTooltipValue] = useState<string>('');
     const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const parseNumber = (v: any) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    const clamp = (v: number) => {
        let out = v;
        if (typeof min !== 'undefined') out = Math.max(out, Number(min));
        if (typeof max !== 'undefined') out = Math.min(out, Number(max));
        return out;
    };

    const applyValue = (newVal: number) => {
        const strVal = String(newVal);
        // If a React onChange handler is provided, call it with a synthetic-like event so controlled inputs update
        if (typeof onChange === 'function') {
            const syntheticEvent = { target: { value: strVal } } as unknown as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
        } else if (inputRef.current) {
            inputRef.current.value = strVal;
            // dispatch an input event so native listeners react
            inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    const getStep = () => (step ? Number(step) : 1);

    useEffect(() => {
        // ensure HTML5 number spinner is not shown by relying on Tailwind/appearance-none; some browsers still show it.
        // Additional global CSS can be added if needed. No side effects required here.
    }, []);

    // Drag handlers
    const onPointerMove = (e: PointerEvent) => {
        if (!dragging.current) return;
        const delta = dragStartY.current - e.clientY;
        const steps = Math.round(delta / dragSensitivity);
        const newVal = clamp(startValue.current + steps * getStep());
        applyValue(newVal);
        if (showDragTooltip) {
            setTooltipValue(String(newVal));
            const rect = inputRef.current?.getBoundingClientRect();
            const x = rect ? rect.left + rect.width / 2 : e.clientX;
            const y = rect ? rect.top - 10 : e.clientY - 20;
            setTooltipPos({ x, y });
            setTooltipVisible(true);
        }
    };

    const onPointerUp = () => {
         if (!dragging.current) return;
         dragging.current = false;
         window.removeEventListener('pointermove', onPointerMove);
         window.removeEventListener('pointerup', onPointerUp);
         // restore user-select
         if (prevUserSelect.current !== null) {
             try { document.body.style.userSelect = prevUserSelect.current; } catch (e) { /* ignore */ }
             prevUserSelect.current = null;
         }
         // restore scroll
         if (prevOverflow.current !== null) {
             try { document.body.style.overflow = prevOverflow.current; } catch (e) { /* ignore */ }
             prevOverflow.current = null;
         }
         // hide tooltip
         if (showDragTooltip) setTooltipVisible(false);
         // if input is not focused and pointer is not over container, remove wheel listener
         try {
             const activeEl = document.activeElement;
             const container = containerRef.current;
             const hasFocus = activeEl === inputRef.current || (container && container.contains(activeEl));
             if (!hasFocus) removeWheelListener();
         } catch (err) { /* ignore */ }
     };

    const startDrag = (e: React.PointerEvent) => {
        // only engage for number inputs
        if (type !== 'number') return;
        e.preventDefault();
        const current = inputRef.current;
        dragging.current = true;
        dragStartY.current = e.clientY;
        startValue.current = parseNumber(current?.value ?? value ?? defaultValue ?? 0);
        (e.target as Element).setPointerCapture(e.pointerId);
        // prevent text selection while dragging
        try {
            prevUserSelect.current = document.body.style.userSelect ?? null;
            document.body.style.userSelect = 'none';
            // also disable page scroll while dragging so pointer moves don't scroll the page
            prevOverflow.current = document.body.style.overflow ?? null;
            document.body.style.overflow = 'hidden';
        } catch (err) { /* ignore (e.g., SSR) */ }
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        // show initial tooltip
        if (showDragTooltip) {
            const rect = inputRef.current?.getBoundingClientRect();
            const x = rect ? rect.left + rect.width / 2 : e.clientX;
            const y = rect ? rect.top - 10 : e.clientY - 20;
            setTooltipValue(String(startValue.current));
            setTooltipPos({ x, y });
            setTooltipVisible(true);
        }
        // ensure wheel listener active during drag
        addWheelListener();
    };

    const increment = (dir: 1 | -1) => {
        const current = parseNumber(inputRef.current?.value ?? value ?? defaultValue ?? 0);
        const next = clamp(current + dir * getStep());
        applyValue(next);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        let sanitized = raw.replace(/[^0-9.\-]/g, '');
        const firstDotIndex = sanitized.indexOf('.');
        if (firstDotIndex !== -1) {
            sanitized = sanitized.substring(0, firstDotIndex + 1) + sanitized.substring(firstDotIndex + 1).replace(/\./g, '');
        }
        sanitized = sanitized.replace(/(?!^)-/g, '');
        if (typeof onChange === 'function') {
            const syntheticEvent = { target: { value: sanitized } } as unknown as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
        } else if (inputRef.current) {
            inputRef.current.value = sanitized;
            inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const raw = e.clipboardData.getData('text');
        let sanitized = raw.replace(/[^0-9.\-]/g, '');
        const firstDotIndex = sanitized.indexOf('.');
        if (firstDotIndex !== -1) {
            sanitized = sanitized.substring(0, firstDotIndex + 1) + sanitized.substring(firstDotIndex + 1).replace(/\./g, '');
        }
        sanitized = sanitized.replace(/(?!^)-/g, '');
        e.preventDefault();
        if (typeof onChange === 'function') {
            const syntheticEvent = { target: { value: sanitized } } as unknown as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
        } else if (inputRef.current) {
            inputRef.current.value = sanitized;
            inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    const handleBlur = () => {
        const cur = inputRef.current?.value ?? (typeof value !== 'undefined' ? String(value) : '');
        const n = Number(cur);
        if (!Number.isFinite(n)) return;
        const clamped = clamp(n);
        applyValue(clamped);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            increment(1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            increment(-1);
        }
    };

    // Add a window-level wheel listener (capture: true, passive: false) while the pointer is over the component.
    // Using a capture/non-passive listener on window ensures preventDefault actually stops page scrolling in all browsers.
    const addWheelListener = () => {
        if (nativeWheelRef.current) return;
        const container = containerRef.current || inputRef.current;
        if (!container) return;
        const handler = (ev: WheelEvent) => {
            // Only act for events that occurred within the container's rect (using client coords)
            try {
                const rect = container.getBoundingClientRect();
                const x = (ev as any).clientX;
                const y = (ev as any).clientY;
                if (typeof x === 'number' && typeof y === 'number') {
                    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return;
                } else {
                    if (!container.contains(ev.target as Node)) return;
                }
            } catch (err) { return; }

            ev.preventDefault();
            ev.stopPropagation();
            const dir = ev.deltaY < 0 ? 1 : -1;
            const current = parseNumber(inputRef.current?.value ?? value ?? defaultValue ?? 0);
            const next = clamp(current + dir * getStep() * wheelStep);
            applyValue(next);
            if (showDragTooltip) {
                const rect = inputRef.current?.getBoundingClientRect();
                const px = rect ? rect.left + rect.width / 2 : (ev as any).clientX || 0;
                const py = rect ? rect.top - 10 : (ev as any).clientY || 0;
                setTooltipValue(String(next));
                setTooltipPos({ x: px, y: py });
                setTooltipVisible(true);
                window.setTimeout(() => setTooltipVisible(false), 700);
            }
        };
        nativeWheelRef.current = handler;
        // attach to the container element with non-passive listener so preventDefault works
        try {
            (container as HTMLElement).addEventListener('wheel', handler, { passive: false });
        } catch (err) {
            // fallback to window-level capture listener if addEventListener fails
            window.addEventListener('wheel', handler, { passive: false, capture: true });
        }
    };

    const removeWheelListener = () => {
        if (!nativeWheelRef.current) return;
        const container = containerRef.current || inputRef.current;
        const handler = nativeWheelRef.current as EventListener;
        try {
            if (container) (container as HTMLElement).removeEventListener('wheel', handler as EventListener, { passive: false } as any);
        } catch (err) {
            try { window.removeEventListener('wheel', handler as EventListener, { capture: true } as any); } catch(e) {}
        }
        nativeWheelRef.current = null;
    };

     // cleanup on unmount
     useEffect(() => {
         return () => {
             removeWheelListener();
             if (prevUserSelect.current !== null) {
                 try { document.body.style.userSelect = prevUserSelect.current; } catch (e) { /* ignore */ }
                 prevUserSelect.current = null;
             }
             if (prevOverflow.current !== null) {
                 try { document.body.style.overflow = prevOverflow.current; } catch (e) { /* ignore */ }
                 prevOverflow.current = null;
             }
         };
     }, []);

    // Ensure the window-level wheel listener is active for number inputs so wheel scrolling is intercepted
    useEffect(() => {
        if (type === 'number') {
            addWheelListener();
            return () => removeWheelListener();
        }
        return undefined;
    }, [type]);

    // Render number input with custom controls
    if (type === 'number') {
        return (
            <div ref={containerRef} className="relative" onPointerEnter={addWheelListener} onPointerLeave={removeWheelListener}>
                <input
                    ref={inputRef}
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    className={`${combined} pr-5`}
                    style={{ WebkitAppearance: 'none', MozAppearance: 'textfield', appearance: 'none' }}
                    autoFocus={!!isFocused}
                    onFocus={() => addWheelListener()}
                    onChange={handleInputChange}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    onBlur={() => { handleBlur(); removeWheelListener(); }}
                    value={typeof value !== 'undefined' ? String(value) : (typeof defaultValue !== 'undefined' ? String(defaultValue) : '')}
                    {...rest}
                />

                {/* tooltip while dragging / wheel */}
                {tooltipVisible && (
                    <div
                        className="pointer-events-none absolute z-50 transform -translate-x-1/2"
                        style={{ left: tooltipPos.x, top: tooltipPos.y, position: 'fixed' }}
                    >
                        <div className="bg-gray-800 text-white text-xs rounded px-2 py-1">{tooltipValue}</div>
                    </div>
                )}

                <div className="absolute inset-y-0 right-0 flex flex-col items-center justify-center pr-1 text-sm">
                    <button
                        type="button"
                        aria-label="increment"
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-300"
                        onClick={() => increment(1)}
                    >
                        <CaretUpIcon weight={"duotone"} />
                    </button>

                    <button

                        title="drag to change"
                        onPointerDown={startDrag}
                        className="cursor-row-resize -mb-1.5 -mt-1.5"
                        style={{ touchAction: 'none' }}
                        > <MinusIcon/>
                    </button>

                    <button
                        type="button"
                        aria-label="decrement"
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-300"
                        onClick={() => increment(-1)}
                    >
                        <CaretDownIcon weight={"duotone"} />
                    </button>
                </div>
            </div>
        );
    }

    // Non-number inputs render normally
    return (
        <div className={"relative"}>
            <input ref={inputRef} className={combined} autoFocus={!!isFocused} type={type} onChange={onChange} value={value as any} defaultValue={defaultValue as any} {...rest} />
        </div>
    );
}
