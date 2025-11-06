import { useState, PropsWithChildren, ReactNode } from 'react';
import { User } from '@/types';
import DashboardSideMenu from '@/Layouts/DashboardSideMenu';
import { usePage } from '@inertiajs/react';



export default function DashboardLayout({ user, header, children }: PropsWithChildren<{ user: User, header?: ReactNode }>) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const { props } = usePage();
    const selectedInstance = (props as any).selected_instance;
    const instanceName = selectedInstance?.name ?? user?.name ?? 'Admin';

    return (
        <div>


            <div className="flex flex-col md:flex-row">
                <DashboardSideMenu user={user} name={instanceName} selectedInstance={selectedInstance}
                                   onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                   showingNavigationDropdown={showingNavigationDropdown}/>
                <div className="w-full flex flex-col h-screen overflow-y-auto bg-grey-100 dark:bg-gray-800">
                    {header && (
                        <header className="bg-gray-100 shadow dark:bg-gray-700 dark:text-white">
                            <div className="py-4 px-4 sm:px-6 lg:px-8">{header}</div>
                        </header>
                    )}

                    <main className={"flex flex-col bg-white dark:bg-gray-800 dark:text-white"}>{children}</main>
                </div>

            </div>

        </div>
    );
}
