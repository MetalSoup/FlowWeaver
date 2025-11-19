import {useState, PropsWithChildren, ReactNode, useEffect} from 'react';
import {User} from '@/types';
import DashboardSideMenu from '@/Layouts/DashboardSideMenu';
import {usePage} from '@inertiajs/react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { registerToastHandler, unregisterToastHandler } from '@/utils/toast';
import { DashboardSidebarProvider } from '@/Layouts/DashboardSidebarContext';


export default function DashboardLayout({user, header, children, containerClassName = ""}: PropsWithChildren<{
    user: User,
    header?: ReactNode,
    containerClassName?: string
}>) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const {props} = usePage();
    const selectedSite = (props as any).selected_site;
    const siteName = selectedSite?.name ?? user?.name ?? 'Admin';

    // Global app snackbar for consistent toasts across the app. Expose a window helper so non-layout components can trigger it.
    const [appToastMsg, setAppToastMsg] = useState<string | null>(null);
    const [appToastOpen, setAppToastOpen] = useState(false);

    useEffect(() => {
        // register the module-level handler so callers using `showAppToast` will show a snackbar
        registerToastHandler((msg: string) => {
            try { setAppToastMsg(msg); setAppToastOpen(true); } catch (e) { /* ignore */ }
        });
        return () => { try { unregisterToastHandler(); } catch (e) { /* ignore */ } };
    }, []);

    const handleCloseAppToast = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setAppToastOpen(false);
        setTimeout(() => setAppToastMsg(null), 200);
    };

    return (
        <DashboardSidebarProvider user={user}>
            <div>


            <div className="flex flex-row bg-red-500">
                <DashboardSideMenu user={user} name={siteName} selectedSite={selectedSite}
                                   onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                   showingNavigationDropdown={showingNavigationDropdown}/>
                 <div className={"flex flex-col flex-1 h-screen overflow-y-auto"}>
                    {header && (
                        <header className="bg-gray-100 shadow dark:bg-gray-700 dark:text-white sticky top-0 z-10">
                            <div className="py-4 px-4 sm:px-6 lg:px-8">{header}</div>
                        </header>
                    )}
                    {/* Global Snackbar rendered inside the layout so all pages use the same MUI toast */}
                    <Snackbar open={appToastOpen} autoHideDuration={2500} onClose={handleCloseAppToast} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                        <Alert onClose={handleCloseAppToast} severity="success" sx={{ width: '100%' }}>
                            {appToastMsg}
                        </Alert>
                    </Snackbar>
                    <div className="flex flex-col  w-auto  bg-grey-100 dark:bg-gray-800">


                        <main
                            className={"flex flex-col bg-white dark:bg-gray-800 dark:text-white " + containerClassName}>{children}</main>
                    </div>

                </div>
            </div>

        </div>
        </DashboardSidebarProvider>
     );
 }
