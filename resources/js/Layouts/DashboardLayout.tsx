import { useState, PropsWithChildren, ReactNode } from 'react';
import { User } from '@/types';
import DashboardSideMenu from '@/Layouts/DashboardSideMenu';



export default function DashboardLayout({ user, header, children }: PropsWithChildren<{ user: User, header?: ReactNode }>) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div>


            <div className="flex flex-col md:flex-row">
                <DashboardSideMenu user={user} name={user.name}
                                   onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                   showingNavigationDropdown={showingNavigationDropdown}/>
                <div className="w-full flex flex-col h-screen overflow-y-hidden">
                    {header && (
                        <header className="bg-white shadow dark:bg-gray-800 dark:text-white">
                            <div className="py-4 px-4 sm:px-6 lg:px-8">{header}</div>
                        </header>
                    )}

                    <main className={"flex flex-col h-screen"}>{children}</main>
                </div>

            </div>

        </div>
    );
}
