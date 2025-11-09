// Simple DOM-based tooltip helper for handle debugging
// Creates a single floating tooltip element appended to document.body and exposes show/hide/update functions.

const TOOLTIP_ID = 'flow-handle-tooltip';

function isEnabled() {
    try {
        if (typeof window === 'undefined') return false;
        const params = new URLSearchParams(window.location.search);
        return params.get('handles') === '1';
    } catch (e) {
        return false;
    }
}

function ensureTooltip() {
    if (!isEnabled()) return null;
    let el = document.getElementById(TOOLTIP_ID) as HTMLDivElement | null;
    if (!el) {
        el = document.createElement('div');
        el.id = TOOLTIP_ID;
        el.style.position = 'fixed';
        el.style.pointerEvents = 'none';
        el.style.zIndex = '9999';
        el.style.padding = '6px 8px';
        el.style.background = 'rgba(0,0,0,0.8)';
        el.style.color = 'white';
        el.style.fontSize = '12px';
        el.style.borderRadius = '6px';
        el.style.transition = 'transform 0.06s ease, opacity 0.08s ease';
        el.style.opacity = '0';
        el.style.transform = 'translateY(-6px)';
        el.style.whiteSpace = 'pre';
        el.style.maxWidth = '320px';
        el.style.wordBreak = 'break-word';
        document.body.appendChild(el);
    }
    return el;
}

export function showHandleTooltip(text: string, x: number, y: number) {
    if (!isEnabled()) return;
    const el = ensureTooltip();
    if (!el) return;
    el.textContent = text;
    const offsetX = 12;
    const offsetY = 18;
    // clamp to viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = x + offsetX;
    let top = y + offsetY;
    // if overflowing right, move left
    if (left + 220 > vw) left = Math.max(8, x - 220 - 8);
    if (top + 40 > vh) top = Math.max(8, y - 40 - 8);
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
}

export function moveHandleTooltip(x: number, y: number) {
    if (!isEnabled()) return;
    const el = document.getElementById(TOOLTIP_ID) as HTMLDivElement | null;
    if (!el) return;
    const offsetX = 12;
    const offsetY = 18;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = x + offsetX;
    let top = y + offsetY;
    if (left + 220 > vw) left = Math.max(8, x - 220 - 8);
    if (top + 40 > vh) top = Math.max(8, y - 40 - 8);
    el.style.left = left + 'px';
    el.style.top = top + 'px';
}

export function hideHandleTooltip() {
    if (!isEnabled()) return;
    const el = document.getElementById(TOOLTIP_ID) as HTMLDivElement | null;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px)';
}

export default {
    show: showHandleTooltip,
    move: moveHandleTooltip,
    hide: hideHandleTooltip,
};
