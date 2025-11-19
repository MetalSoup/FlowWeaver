import React, {createContext, useContext, useEffect, useState} from 'react';
import { router } from '@inertiajs/react';

type DashboardSidebarContextShape = {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
    dark: boolean;
    setDark: (v: boolean) => void;
    hidden: boolean;
    setHidden: (v: boolean) => void;
}

const DashboardSidebarContext = createContext<DashboardSidebarContextShape | null>(null);

export const DashboardSidebarProvider: React.FC<{children: React.ReactNode, user?: any}> = ({children, user}) => {
    // initialize collapsed from localStorage
    const [collapsed, setCollapsed] = useState<boolean>(() => {
        try {
            return localStorage.getItem('sidebar-collapsed') === '1';
        } catch (e) {
            return false;
        }
    });

    // theme init (prefer server-provided user preference if present)
    const [dark, setDark] = useState<boolean>(() => {
        try {
            const serverPref = (user as any)?.preferences?.theme;
            if (serverPref) {
                return serverPref === 'dark';
            }
            const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
            if (stored) return stored === 'dark';
            if (typeof window !== 'undefined' && window.matchMedia) {
                return window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
        } catch (e) {}
        return false;
    });

    const [hidden, setHidden] = useState<boolean>(false);

    // persist collapsed
    useEffect(() => {
        try { localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0'); } catch (e) {}
    }, [collapsed]);

    // persist theme and update <html> class
    const _initialSync = React.useRef(false);
    useEffect(() => {
        try {
            localStorage.setItem('theme', dark ? 'dark' : 'light');
            if (typeof document !== 'undefined') {
                if (dark) document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
            }

            if (!_initialSync.current) {
                _initialSync.current = true;
                return;
            }

            // Try to persist to server if user pref differs
            try {
                const serverPref = (user as any)?.preferences?.theme;
                const currentPref = dark ? 'dark' : 'light';
                if (serverPref === currentPref) return;
                const payload: any = { preferences: { theme: currentPref } };
                router.post(route('preferences.update'), payload, {});
            } catch (e) {}
        } catch (e) {}
    }, [dark, user]);

    return (
        <DashboardSidebarContext.Provider value={{collapsed, setCollapsed, dark, setDark, hidden, setHidden}}>
            {children}
        </DashboardSidebarContext.Provider>
    );
};

export const useDashboardSidebar = () => {
    const ctx = useContext(DashboardSidebarContext);
    if (!ctx) throw new Error('useDashboardSidebar must be used inside DashboardSidebarProvider');
    return ctx;
};

export default DashboardSidebarContext;

