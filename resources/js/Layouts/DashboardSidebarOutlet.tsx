import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';

export const DashboardSidebarOutlet: React.FC<{children?: React.ReactNode, className?: string}> = ({children, className}) => {
    const [target, setTarget] = useState<HTMLElement | null>(null);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        const findTarget = () => document.getElementById('dashboard-sidebar-bottom');

        // initial attempt
        setTarget(findTarget());

        // If the DOM changes (side menu re-renders or other scripts mutate DOM) re-query the element.
        // Debounce updates to avoid excessive setState during bursts of mutations.
        const observer = new MutationObserver(() => {
            try { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); } catch (e) {}
            timeoutRef.current = window.setTimeout(() => {
                setTarget(findTarget());
                timeoutRef.current = null;
            }, 50) as unknown as number;
        });

        try {
            observer.observe(document.body, { childList: true, subtree: true });
        } catch (e) {
            // ignore environments that disallow observing
        }

        return () => {
            try { observer.disconnect(); } catch (e) {}
            try { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); } catch (e) {}
        };
    }, []);

    if (!target) return null;

    return ReactDOM.createPortal(<div className={className}>{children}</div>, target);
};

export default DashboardSidebarOutlet;
