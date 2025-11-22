import React, {useEffect, useState, useRef} from "react";
import {User} from "@/types";
import {router, usePage} from "@inertiajs/react";
import {
    ChartLineUpIcon,
    FilesIcon,
    FlowArrowIcon,
    TextboxIcon,
    IdentificationCardIcon,
    ArrowFatLinesRightIcon
} from "@phosphor-icons/react";
import {useDashboardSidebar} from '@/Layouts/DashboardSidebarContext';
import MainMenu from "@/Layouts/MainMenu";


export default function DashboardSideMenu(props: {
    user: User | undefined,
    name: string,
    selectedSite?: { id: number; name: string } | null,
    onClick: () => void,
    showingNavigationDropdown: boolean
}) {
    const {user, name, selectedSite} = props;

    const {props: pageProps} = usePage();
    const selectedOrganization = (pageProps as any).selected_organization;
    const isSuperAdmin = (pageProps as any).isSuperAdmin ?? false;

    // Read global sidebar state from context
    const sidebarCtx = (() => {
        try {
            return useDashboardSidebar();
        } catch (e) {
            return null;
        }
    })();

    const dark = sidebarCtx ? sidebarCtx.dark : ((): boolean => {
        try {
            const serverPref = (user as any)?.preferences?.theme;
            if (serverPref) return serverPref === 'dark';
            const stored = localStorage.getItem('theme');
            if (stored) return stored === 'dark';
            if (typeof window !== 'undefined' && window.matchMedia) return window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch (e) {
        }
        return false;
    })();
    const setDark = sidebarCtx ? sidebarCtx.setDark : (() => {
    });


    // write theme preference and update <html> class when `dark` changes
    const _initialSync = useRef<boolean>(false);
    useEffect(() => {
        try {
            localStorage.setItem('theme', dark ? 'dark' : 'light');
            if (typeof document !== 'undefined') {
                if (dark) document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
            }

            // Avoid posting on initial mount (which would trigger an Inertia visit and
            // cause the component to remount). Only persist to server when the user
            // actually changes the theme.
            if (!_initialSync.current) {
                // Mark that we've completed the initial sync and skip the server post
                _initialSync.current = true;
                return;
            }

            // Only POST if server-stored preference is different from current value.
            try {
                const serverPref = (user as any)?.preferences?.theme;
                const currentPref = dark ? 'dark' : 'light';
                if (serverPref === currentPref) {
                    return; // nothing to persist
                }


                const payload: any = {preferences: {theme: currentPref}};
                // Post to user preferences update endpoint using inertia
                // so it updates without a full page reload.
                // We use `preserveState` to avoid remounting the component.
                // @ts-ignore

                router.post(route('preferences.update'), payload, {});

            } catch (e) {
                // ignore serverPref/read errors
                console.error('Error checking server preference', e);
            }
        } catch (e) {
            console.error('Error syncing theme preference', e);
        }
    }, [dark, user]);

    // derive initials for avatar fall-back
    const initials = ((user?.name ?? name ?? "")).split(" ").map(s => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

    // text colors that react to the runtime `dark` state so the toggle is immediately visible
    const textPrimary = dark ? 'text-white' : 'text-gray-900';
    const textSecondary = dark ? 'text-white/70' : 'text-gray-600';
    const textTertiary = dark ? 'text-white/60' : 'text-gray-500';
    const itemTextClass = dark ? 'text-white/90' : 'text-gray-700';
    const hoverText = dark ? 'hover:text-white' : 'hover:text-gray-900';
    const toggleTextClass = dark ? 'text-white/90' : 'text-gray-700';
    const toggleHoverBg = dark ? 'hover:bg-white/5' : 'hover:bg-gray-200';
    const toggleBgClass = dark ? 'bg-white/6' : 'bg-gray-100';
    const toggleBorderClass = dark ? '' : 'border border-gray-200';

    const navItems = [
        {
            href: route("dashboard"), label: "Dashboard", icon: (
                <ChartLineUpIcon size={25}/>
            )
        },
        {
            href: route("pages.index"), label: "Pages", icon: (
                <FilesIcon size={25}/>
            )
        },
        {
            href: route("flows.index"), label: "Flows", icon: (
                <FlowArrowIcon size={25}/>
            )
        },
        {
            href: route("fields.index"), label: "Fields", icon: (
                <TextboxIcon size={25}/>
            )
        }
    ];

    if (isSuperAdmin) {
        navItems.push({ href: route('admin.settings.index'), label: 'Admin', icon: (<IdentificationCardIcon size={25}/>)});
    }

    // detect if we are on editor routes (page edit or flow edit) so we can enable compact behavior
    const [isEditorRoute, setIsEditorRoute] = useState(false);
    useEffect(() => {
        try {
            if (typeof window === 'undefined') return;
            const p = window.location.pathname;
            const isPageEdit = /\/dashboard\/pages\/.+\/edit/.test(p) || /\/pages\/.+\/edit/.test(p);
            const isFlowEdit = /\/dashboard\/flows\/.+\/edit/.test(p) || /\/flows\/.+\/edit/.test(p);
            setIsEditorRoute(!!(isPageEdit || isFlowEdit));
        } catch (e) {
            setIsEditorRoute(false);
        }
    }, []);

    // local state for the inline expanded menu when in editor route
    // default to open; we'll force it open when not on editor routes but allow toggling when on editor routes
    const [editorMenuOpen, setEditorMenuOpen] = useState(true);

    // refs and state to animate the editor menu sliding open/closed
    const editorMenuWrapperRef = useRef<HTMLDivElement | null>(null);
    const editorMenuContentRef = useRef<HTMLDivElement | null>(null);
    const [editorMenuHeight, setEditorMenuHeight] = useState(0);

    // Ensure menu is always open when NOT on an editor route. When on an editor route
    // we allow the user to toggle (do not overwrite user toggles).
    useEffect(() => {
        if (isEditorRoute) {
            setEditorMenuOpen(false);
        }
    }, [isEditorRoute]);

    useEffect(() => {
        const updateHeight = () => {
            try {
                if (editorMenuContentRef.current) {
                    setEditorMenuHeight(editorMenuContentRef.current.scrollHeight);
                }
            } catch (e) {
                // ignore
            }
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, [navItems.length]);

    useEffect(() => {
        // if opened, ensure we measured height and set scroll to top (no-op usually)
        try {
            if (editorMenuOpen && editorMenuContentRef.current) {
                setEditorMenuHeight(editorMenuContentRef.current.scrollHeight);
            }
        } catch (e) {
        }
    }, [editorMenuOpen]);

    // Close the editor menu when clicking/tapping outside of it (and outside the toggle button)
    useEffect(() => {
        const onPointerDown = (e: PointerEvent) => {
            try {
                // Only allow outside-click to close the menu when we are on an editor route
                // (when the menu is toggleable). When not on an editor route the menu must
                // remain open.
                if (!editorMenuOpen || !isEditorRoute) return;
                const target = e.target as Node | null;
                const wrapper = editorMenuWrapperRef.current;
                const toggleBtn = typeof document !== 'undefined' ? document.getElementById('dashboard-show-menu') : null;
                // if click is inside wrapper or inside the toggle button, do nothing
                if (target && wrapper && wrapper.contains(target)) return;
                if (target && toggleBtn && toggleBtn.contains(target)) return;
                // otherwise close the menu
                setEditorMenuOpen(false);
            } catch (err) {
                // ignore errors
            }
        };

        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [editorMenuOpen]);

    return <aside
        className={`relative bg-sidebar h-screen hidden sm:flex sm:flex-col w-80 shadow-xl bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-50 border-r-2  border-gray-50`}>

        <div className="flex items-center gap-3 px-3 py-3 border-b border-white/10">
            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-white/10 ms-2">
                {/* simple logo mark (use currentColor so it follows text color) */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor">
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20"/>
                </svg>
            </div>


            <div className="ml-auto flex items-center gap-2">


                {/* theme toggle */}

            </div>
        </div>


        <nav className="py-4 flex-1 overflow-y-auto">
            {/* If this is an editor route, collapse primary nav to a single inline Show Menu button */}
            {isEditorRoute ? (
                <div className="px-2">
                    <button
                        id="dashboard-show-menu"
                        aria-controls="dashboard-main-nav"
                        aria-expanded={editorMenuOpen}
                        onClick={() => setEditorMenuOpen(v => !v)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') setEditorMenuOpen(false);
                        }}
                        className={`w-full mb-2 flex items-center justify-center p-2 rounded bg-gray-700 ${toggleTextClass} ${toggleBgClass} hover:${toggleHoverBg}`}
                        title="Show Menu"
                    >

                            {/* subtle rotate animation while opening */}
                            <span className={`inline-block transform transition-transform duration-300 ${editorMenuOpen ? 'rotate-90' : 'rotate-0'}`}>
                                <ArrowFatLinesRightIcon size={25}/>
                            </span>

                        <span>Main Menu</span>
                    </button>

                    {/* Animated container: always mounted so CSS transitions can run */}

                </div>
            ) : null}


            <div
                ref={editorMenuWrapperRef}
                className={`${isEditorRoute ? ' transition-all duration-1000 ease-in-out' : ''} overflow-hidden  mt-3`}
                style={{height: editorMenuOpen ? editorMenuHeight : 0}}
                aria-hidden={!editorMenuOpen}
            >
                <div ref={editorMenuContentRef}>

                    <MainMenu
                        setDark={setDark}
                        navItems={navItems}
                        dark={dark}
                        itemTextClass={itemTextClass}
                        hoverText={hoverText}
                        textPrimary={textPrimary}
                        textSecondary={textSecondary}
                        textTertiary={textTertiary}
                        initials={initials}
                        user={user}
                        selectedOrganization={selectedOrganization}
                        selectedSite={selectedSite}
                        toggleTextClass={toggleTextClass}
                        toggleBgClass={toggleBgClass}
                        toggleHoverBg={toggleHoverBg}
                        toggleBorderClass={toggleBorderClass}
                    />
                </div>
            </div>



            <div id="dashboard-sidebar-bottom"
                 aria-hidden="true"></div>

            <div className="-me-2 flex items-center sm:hidden px-3 pb-4">
                <button
                    onClick={props.onClick}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out w-full"
                >
                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path
                            className={!props.showingNavigationDropdown ? "inline-flex" : "hidden"}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                        <path
                            className={props.showingNavigationDropdown ? "inline-flex" : "hidden"}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>


        </nav>

    </aside>;
}
