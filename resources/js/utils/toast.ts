// A tiny toast registration utility.
// Components can import `showAppToast` and call it to request a toast.
// A single UI (e.g. DashboardLayout) should call `registerToastHandler(handler)` to receive toasts.

let handler: ((msg: string) => void) | null = null;

export const registerToastHandler = (fn: (msg: string) => void) => {
    handler = fn;
};

export const unregisterToastHandler = () => {
    handler = null;
};

export const showAppToast = (msg: string) => {
    try {
        if (handler) handler(msg);
        else {
            // fallback to console so failures are visible during development
            // (do not throw to avoid breaking caller code)
            console.warn('showAppToast: no handler registered, message:', msg);
        }
    } catch (e) {
        console.warn('showAppToast failed', e);
    }
};

