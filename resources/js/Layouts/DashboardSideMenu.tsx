import React, {useEffect, useState, useRef} from "react";
import {User} from "@/types";
import {Link, router, usePage} from "@inertiajs/react";
import Dropdown from "@/Components/Dropdown";
import {
    ChartLineUpIcon,
    CubeIcon,
    FilesIcon,
    FlowArrowIcon,
    MoonIcon,
    SunDimIcon,
    TextboxIcon,
    BuildingOfficeIcon, IdentificationCardIcon, SignOutIcon, ArrowFatLinesRightIcon
} from "@phosphor-icons/react";
import {useDashboardSidebar} from '@/Layouts/DashboardSidebarContext';


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

    // Read global sidebar state from context
    const sidebarCtx = (() => {
        try {
            return useDashboardSidebar();
        } catch (e) {
            return null;
        }
    })();

    const collapsed = sidebarCtx ? sidebarCtx.collapsed : ((): boolean => {
        try {
            return localStorage.getItem('sidebar-collapsed') === '1';
        } catch (e) {
            return false;
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

    // persist collapsed state when it changes
    useEffect(() => {
        try {
            localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0');
        } catch (e) {
        }
    }, [collapsed]);

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
    const [editorMenuOpen, setEditorMenuOpen] = useState(false);

    // refs and state to animate the editor menu sliding open/closed
    const editorMenuWrapperRef = useRef<HTMLDivElement | null>(null);
    const editorMenuContentRef = useRef<HTMLDivElement | null>(null);
    const [editorMenuHeight, setEditorMenuHeight] = useState(0);

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
                if (!editorMenuOpen) return;
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
        className={`relative bg-sidebar h-screen hidden sm:flex sm:flex-col ${collapsed ? 'w-20' : 'w-64'} shadow-xl bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-gray-50`}
        aria-expanded={!collapsed}>

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
                        className={`w-full flex items-center justify-center p-2 rounded bg-gray-700 ${toggleTextClass} ${toggleBgClass} hover:${toggleHoverBg}`}
                        title="Show Menu"
                    >

                            {/* subtle rotate animation while opening */}
                            <span className={`inline-block transform transition-transform duration-300 ${editorMenuOpen ? 'rotate-90' : 'rotate-0'}`}>
                                <ArrowFatLinesRightIcon size={25}/>
                            </span>

                        <span className={`ml-2 ${collapsed ? 'hidden' : ''}`}>Main Menu</span>
                    </button>

                    {/* Animated container: always mounted so CSS transitions can run */}
                    <div
                        ref={editorMenuWrapperRef}
                        className={`overflow-hidden transition-all duration-300 ease-in-out mt-3`}
                        style={{
                            maxHeight: editorMenuOpen ? `${editorMenuHeight}px` : '0px',
                            opacity: editorMenuOpen ? 1 : 0,
                            transform: editorMenuOpen ? 'translateY(0)' : 'translateY(-6px)'
                        }}
                        aria-hidden={!editorMenuOpen}
                    >
                        <div ref={editorMenuContentRef}>
                            <ul id="dashboard-main-nav" className="space-y-1">
                                {navItems.map(item => {
                                    const isActive = (typeof window !== 'undefined') && (() => {
                                        try {
                                            const itemPath = new URL(String(item.href), window.location.origin).pathname;
                                            return itemPath === window.location.pathname;
                                        } catch (e) {
                                            return false;
                                        }
                                    })();
                                    const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-md mx-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/30";
                                    const activeClasses = isActive
                                        ? `bg-white/6 ring-1 ring-white/10 shadow-sm ${dark ? 'text-white' : 'text-gray-900'}`
                                        : `${itemTextClass} hover:bg-white/5 ${hoverText}`;
                                    return (
                                        <li key={item.label}>
                                            <Link href={item.href} className={`${baseClasses} ${activeClasses}`}
                                                  onClick={() => setEditorMenuOpen(false)}>
                                                <span className={`flex-shrink-0 ${itemTextClass}`}>{item.icon}</span>
                                                <span className={`truncate ${textPrimary}`}>{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="border-t border-white/10 mt-6 pt-4 px-3">
                                <div className={`text-xs ${textTertiary} px-3 ${collapsed ? 'hidden' : ''}`}>Account</div>
                                <div className="mt-2">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <div className="flex items-center gap-3 px-3 py-4">
                                                <div className="flex-shrink-0">
                                                    <div
                                                        className={`h-10 w-10 rounded-full bg-white/10 flex items-center justify-center ${textPrimary} font-semibold`}>
                                                        {initials}
                                                    </div>
                                                </div>
                                                <div className={`min-w-0 ${collapsed ? 'hidden' : ''}`}>
                                                    <div
                                                        className={`${textPrimary} text-sm truncate`}>{user ? user.name : "Guest"}</div>
                                                    <div
                                                        className={`${textSecondary} text-xs`}>{user ? (user.email ?? "") : "Not signed in"}</div>
                                                    {(!collapsed) && (
                                                        <div className={`${textTertiary} text-xs mt-1`}>
                                                            <div>{selectedOrganization ? (selectedOrganization.name ?? '') : ''}</div>
                                                            <div>{selectedSite ? (selectedSite.name ?? '') : ''}</div>
                                                        </div>


                                                    )}
                                                </div>


                                            </div>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content>
                                            <Dropdown.Link href={route("organizations.index")}
                                                           className="px-2 py-1 text-gray-500 flex items-center gap-3"><span
                                                className={`flex-shrink-0 `}><BuildingOfficeIcon
                                                size={25}/></span><span>Organizations</span></Dropdown.Link>
                                            <Dropdown.Link href={route("sites.index")}
                                                           className={"px-2 py-1 text-gray-500 flex items-center gap-3"}><span
                                                className={`flex-shrink-0 `}><CubeIcon
                                                size={25}/></span><span>Sites</span></Dropdown.Link>

                                            <div className="border-t my-2"/>
                                            <Dropdown.Link href={route("profile.edit")}
                                                           className={"flex items-center gap-3"}><IdentificationCardIcon
                                                size={25}/> Profile</Dropdown.Link>
                                            <Dropdown.Link href={route("logout")} method="post" as="button"
                                                           className={"flex items-center gap-3"}><SignOutIcon size={25}/>Log Out</Dropdown.Link>
                                            <button
                                                onClick={() => setDark(!dark)}
                                                title={dark ? 'Switch to light' : 'Switch to dark'}
                                                aria-pressed={dark}
                                                style={{color: dark ? '#ffffff' : '#111827'}}
                                                className={`inline-flex items-center justify-center p-1 rounded-md ${toggleTextClass} ${toggleBgClass} ${toggleBorderClass} ${toggleHoverBg} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${dark ? 'focus-visible:ring-white/30' : 'focus-visible:ring-gray-300'}`}
                                            >
                                                {dark ? (
                                                    <SunDimIcon size={25}/>
                                                ) : (
                                                    <MoonIcon size={25}/>
                                                )}
                                            </button>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {!isEditorRoute && (
                <>
                    <ul className="space-y-1">
                        {navItems.map(item => {
                            // if editor route is active and editorMenuOpen is used, keep the primary listing but allow it to be hidden by `editorMenuOpen` UI; otherwise render as before
                            const isActive = (typeof window !== 'undefined') && (() => {
                                try {
                                    const itemPath = new URL(String(item.href), window.location.origin).pathname;
                                    return itemPath === window.location.pathname;
                                } catch (e) {
                                    return false;
                                }
                            })();
                            const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-md mx-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/30";
                            const activeClasses = isActive
                                ? `bg-white/6 ring-1 ring-white/10 shadow-sm ${dark ? 'text-white' : 'text-gray-900'}`
                                : `${itemTextClass} hover:bg-white/5 ${hoverText}`;

                            return (
                                <li key={item.label}>
                                    <Link href={item.href} className={`${baseClasses} ${activeClasses}`}>
                                        <span className={`flex-shrink-0 ${itemTextClass}`}>{item.icon}</span>
                                        <span
                                            className={`truncate ${collapsed ? 'hidden' : 'block'} ${textPrimary}`}>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="border-t border-white/10 mt-6 pt-4 px-3">
                        <div className={`text-xs ${textTertiary} px-3 ${collapsed ? 'hidden' : ''}`}>Account</div>
                        <div className="mt-2">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <div className="flex items-center gap-3 px-3 py-4">
                                        <div className="flex-shrink-0">
                                            <div
                                                className={`h-10 w-10 rounded-full bg-white/10 flex items-center justify-center ${textPrimary} font-semibold`}>
                                                {initials}
                                            </div>
                                        </div>
                                        <div className={`min-w-0 ${collapsed ? 'hidden' : ''}`}>
                                            <div
                                                className={`${textPrimary} text-sm truncate`}>{user ? user.name : "Guest"}</div>
                                            <div
                                                className={`${textSecondary} text-xs`}>{user ? (user.email ?? "") : "Not signed in"}</div>
                                            {(!collapsed) && (
                                                <div className={`${textTertiary} text-xs mt-1`}>
                                                    <div>{selectedOrganization ? (selectedOrganization.name ?? '') : ''}</div>
                                                    <div>{selectedSite ? (selectedSite.name ?? '') : ''}</div>
                                                </div>


                                            )}
                                        </div>


                                    </div>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route("organizations.index")}
                                                   className="px-2 py-1 text-gray-500 flex items-center gap-3"><span
                                        className={`flex-shrink-0 `}><BuildingOfficeIcon
                                        size={25}/></span><span>Organizations</span></Dropdown.Link>
                                    <Dropdown.Link href={route("sites.index")}
                                                   className={"px-2 py-1 text-gray-500 flex items-center gap-3"}><span
                                        className={`flex-shrink-0 `}><CubeIcon
                                        size={25}/></span><span>Sites</span></Dropdown.Link>

                                    <div className="border-t my-2"/>
                                    <Dropdown.Link href={route("profile.edit")}
                                                   className={"flex items-center gap-3"}><IdentificationCardIcon
                                        size={25}/> Profile</Dropdown.Link>
                                    <Dropdown.Link href={route("logout")} method="post" as="button"
                                                   className={"flex items-center gap-3"}><SignOutIcon size={25}/>Log Out</Dropdown.Link>
                                    <button
                                        onClick={() => setDark(!dark)}
                                        title={dark ? 'Switch to light' : 'Switch to dark'}
                                        aria-pressed={dark}
                                        style={{color: dark ? '#ffffff' : '#111827'}}
                                        className={`inline-flex items-center justify-center p-1 rounded-md ${toggleTextClass} ${toggleBgClass} ${toggleBorderClass} ${toggleHoverBg} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${dark ? 'focus-visible:ring-white/30' : 'focus-visible:ring-gray-300'}`}
                                    >
                                        {dark ? (
                                            <SunDimIcon size={25}/>
                                        ) : (
                                            <MoonIcon size={25}/>
                                        )}
                                    </button>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </>
            )}

            {/*{ href: route("sites.index"), label: "Sites", icon: (
                 <Cube size={25}/>
             ) },*/}


            {/* Stable portal target inside the side menu so editor sidebars appear visually within it.
                This element is intentionally placed here and kept stable (not recreated) to host the portal. */}
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

