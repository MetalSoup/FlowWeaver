import React, { useEffect, useState } from "react";
import {User} from "@/types";
import {Link, usePage} from "@inertiajs/react";
import Dropdown from "@/Components/Dropdown";
import {
    CaretLeft,
    CaretRight,
    ChartLineUp,
    Cube,
    Files,
    FlowArrow,
    Moon,
    SunDim,
    Textbox
} from "phosphor-react";


export default function DashboardSideMenu(props: {
    user: User | undefined,
    name: string,
    selectedInstance?: { id: number; name: string } | null,
    onClick: () => void,
    showingNavigationDropdown: boolean
}) {
    const { user, name, selectedInstance } = props;

    const { props: pageProps } = usePage();
    const selectedOrganization = (pageProps as any).selected_organization;
    const organizations = ((user as any)?.organizations) ?? [];

    // collapsed state for a compact sidebar (persisted)
    const [collapsed, setCollapsed] = useState<boolean>(() => {
        try {
            return localStorage.getItem('sidebar-collapsed') === '1';
        } catch (e) {
            return false;
        }
    });

    // theme state (light/dark) persisted
    // start with a safe default (light) and initialize on mount to avoid SSR window/document access
    const [dark, setDark] = useState<boolean>(false);

    // initialize theme on client mount: prefer localStorage, then OS preference
    useEffect(() => {
        try {
            const stored = localStorage.getItem('theme');
            if (stored) {
                setDark(stored === 'dark');
                return;
            }

            if (typeof window !== 'undefined' && window.matchMedia) {
                setDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
            }
        } catch (e) {}
    }, []);

    // write theme preference and update <html> class when `dark` changes
    useEffect(() => {
        try {
            localStorage.setItem('theme', dark ? 'dark' : 'light');
            if (typeof document !== 'undefined') {
                if (dark) document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
            }
        } catch (e) {}
    }, [dark]);

    // derive initials for avatar fall-back
    const initials = ((user?.name ?? name ?? "")).split(" ").map(s => s[0]).filter(Boolean).slice(0,2).join("").toUpperCase();

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
        { href: route("dashboard"), label: "Dashboard", icon: (
                <ChartLineUp size={25}/>
            ) },
        { href: route("instances.index"), label: "Instances", icon: (
                <Cube size={25}/>
            ) },
        { href: route("pages.index"), label: "Pages", icon: (
                <Files size={25}/>
            ) },
        { href: route("flows.index"), label: "Flows", icon: (
                <FlowArrow size={25}/>
            ) },
        { href: route("fields.index"), label: "Fields", icon: (
                <Textbox size={25}/>
            ) }
    ];

    return <aside className={`relative bg-sidebar h-screen hidden sm:flex sm:flex-col ${collapsed ? 'w-20' : 'w-64'} shadow-xl bg-gray-200 dark:bg-gray-900`} aria-expanded={!collapsed}>

        <div className="flex items-center gap-3 px-3 py-3 border-b border-white/10">
            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-white/10 ms-2">
                {/* simple logo mark (use currentColor so it follows text color) */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20" />
                </svg>
            </div>

            <div className={`${collapsed ? 'hidden' : 'block'}`}>
                <div className={`${textPrimary} font-bold`}>
                    {selectedInstance ? (
                        <Link href={route('instances.edit', selectedInstance.id)} className={`${textPrimary} hover:underline`}>{selectedInstance.name}</Link>
                    ) : (
                        <Link href={route('instances.select')} className={`${textPrimary} hover:underline`}>{name}</Link>
                    )}
                </div>
                <div className={`${textSecondary} text-xs`}>Control panel</div>
            </div>

            <div className="ml-auto flex items-center gap-2">
                {/* collapse toggle */}
                <button
                    onClick={() => setCollapsed(c => !c)}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    aria-pressed={collapsed}
                    style={{ color: dark ? '#ffffff' : '#111827' }}
                    className={`inline-flex items-center justify-center p-1 rounded-md ${toggleTextClass} ${toggleBgClass} ${toggleBorderClass} ${toggleHoverBg} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${dark ? 'focus-visible:ring-white/30' : 'focus-visible:ring-gray-300'}`}
                >
                    {collapsed ? (
                        <CaretRight/> ) : (<CaretLeft/>)
                    }
                </button>

                {/* theme toggle */}
                <button
                    onClick={() => setDark(d => !d)}
                    title={dark ? 'Switch to light' : 'Switch to dark'}
                    aria-pressed={dark}
                    style={{ color: dark ? '#ffffff' : '#111827' }}
                    className={`inline-flex items-center justify-center p-1 rounded-md ${toggleTextClass} ${toggleBgClass} ${toggleBorderClass} ${toggleHoverBg} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${dark ? 'focus-visible:ring-white/30' : 'focus-visible:ring-gray-300'}`}
                >
                    {dark ? (
                        <SunDim size={25} />
                    ) : (
                        <Moon size={25}/>
                    )}
                </button>
            </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-4">
            <div className="flex-shrink-0">
                <div className={`h-10 w-10 rounded-full bg-white/10 flex items-center justify-center ${textPrimary} font-semibold`}>
                    {initials}
                </div>
            </div>
            <div className={`min-w-0 ${collapsed ? 'hidden' : ''}`}>
                <div className={`${textPrimary} text-sm truncate`}>{user ? user.name : "Guest"}</div>
                <div className={`${textSecondary} text-xs`}>{user ? (user.email ?? "") : "Not signed in"}</div>
                {(!collapsed) && (
                    <div className={`${textTertiary} text-xs mt-1`}>{selectedOrganization ? (selectedOrganization.name ?? '') : ''}</div>
                )}
            </div>

        </div>

        <nav className="px-2 py-4 flex-1 overflow-y-auto">
            <ul className="space-y-1">
                {navItems.map(item => {
                    // browser-only, safe check for active path
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
                                <span className={`truncate ${collapsed ? 'hidden' : 'block'} ${textPrimary}`}>{item.label}</span>
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
                            <button className={`w-full text-left px-4 py-2 rounded-md ${collapsed ? 'justify-center' : ''} transition ${textPrimary} hover:bg-white/5`}>{user ? user.name : "Guest"}</button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <div className="px-2 py-1 text-xs text-gray-500">Switch organization</div>
                            {organizations && Array.isArray(organizations) && organizations.length > 0 ? (
                                organizations.map((org: any) => (
                                    <Dropdown.Link key={org.id} href={route('organizations.storeSelection')} method="post" as="button" data={{organization_id: org.id}}>
                                        {org.name}
                                    </Dropdown.Link>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-xs text-gray-400">No organizations</div>
                            )}

                            <div className="border-t my-2" />
                            <Dropdown.Link href={route("profile.edit")}>Profile</Dropdown.Link>
                            <Dropdown.Link href={route("logout")} method="post" as="button">Log Out</Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </div>

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
