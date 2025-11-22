import {Link} from "@inertiajs/react";
import Dropdown from "@/Components/Dropdown";
import {
    BuildingOfficeIcon,
    CubeIcon,
    IdentificationCardIcon,
    MoonIcon,
    SignOutIcon,
    SunDimIcon
} from "@phosphor-icons/react";
import React from "react";

export default function MainMenu({navItems, dark, itemTextClass, hoverText, textPrimary ,textSecondary, textTertiary, initials, user, selectedOrganization, selectedSite, setDark, toggleTextClass, toggleBgClass, toggleHoverBg, toggleBorderClass}:
                                 {
                                        navItems: { label: string; href: string; icon: React.ReactNode }[];
                                        dark: boolean;
                                        itemTextClass: string;
                                        hoverText: string;
                                        textPrimary: string;
                                        textSecondary: string;
                                        textTertiary: string;
                                        initials: string;
                                        user: { name: string; email?: string } | null;
                                        selectedOrganization: { name?: string } | null;
                                        selectedSite: { name?: string } | null;
                                        setDark: (dark: boolean) => void;
                                        toggleTextClass: string;
                                        toggleBgClass: string;
                                        toggleHoverBg: string;
                                        toggleBorderClass: string;
                                 }) {
    return (
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
                                    className={`truncate block ${textPrimary}`}>{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
            <div className="border-t border-white/10 mt-6 pt-4 px-3">
                <div className={`text-xs ${textTertiary} px-3 `}>Account</div>
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
                                <div className={`min-w-0 `}>
                                    <div
                                        className={`${textPrimary} text-sm truncate`}>{user ? user.name : "Guest"}</div>
                                    <div
                                        className={`${textSecondary} text-xs`}>{user ? (user.email ?? "") : "Not signed in"}</div>

                                        <div className={`${textTertiary} text-xs mt-1`}>
                                            <div>{selectedOrganization ? (selectedOrganization.name ?? '') : ''}</div>
                                            <div>{selectedSite ? (selectedSite.name ?? '') : ''}</div>
                                        </div>


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
    );
}
