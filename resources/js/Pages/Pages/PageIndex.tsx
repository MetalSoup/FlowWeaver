import React, {useRef, useState, useEffect} from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {Head, Link, router} from '@inertiajs/react';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from "@/Components/PrimaryButton";
import IndexTable from '@/Components/IndexTable';

export default function PagesIndex({ auth, pages = {data: []} }: { auth: any; pages?: any }) {
    const rows = pages?.data ?? [];

    const [confirming, setConfirming] = useState(false);
    const [selectedPage, setSelectedPage] = useState<any | null>(null);

    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const toastTimerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
        };
    }, []);

    const openConfirm = (page: any) => {
        setSelectedPage(page);
        setConfirming(true);
    };

    const closeConfirm = () => {
        setConfirming(false);
        setSelectedPage(null);
    };

    const deletePage = (e?: React.MouseEvent) => {
        e?.preventDefault();
        if (!selectedPage) return;

        router.delete(route('pages.destroy', selectedPage.id), {
            onSuccess: () => {
                setToastMsg('Page deleted');
                // reload the current list to reflect deletion
                router.reload();
                if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
                toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 2500);
            },
            onError: () => {
                setToastMsg('Failed to delete page');
                if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
                toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 2500);
            },
        });

        closeConfirm();
    };

    const columns = [
        { key: 'id', label: 'ID', className: 'w-16' },
        { key: 'name', label: 'Name', sortable: true, render: (page: any) => <Link href={route('pages.edit', page.id)} className="text-blue-600">{page.name}</Link> },
        { label: 'Actions', render: (page: any) => (
            <div>
                <Link href={route('pages.edit', page.id)} className="bg-gray-200 text-gray-800 py-1 px-2 rounded mr-2">Edit</Link>
                <button onClick={() => openConfirm(page)} className="bg-red-600 text-white py-1 px-2 rounded ">Delete</button>
            </div>
        ) },
        { key: 'created_at', label: 'Created At', sortable: true },
        { key: 'updated_at', label: 'Updated At', sortable: true },
    ];

    return (
        <DashboardLayout
            user={auth.user}
            header={<div className="flex justify-between items-center"><h1>Pages</h1><Link href={route('pages.create')} className="bg-blue-500 text-white py-1 px-3 rounded">Create Page</Link></div>}
        >
            <Head title="Pages" />

            <div className="p-5">
                <IndexTable
                    rows={rows}
                    columns={columns}
                    pages={pages}
                    searchEnabled={true}
                    searchPlaceholder="Search pages..."
                    baseRoute="pages.index"
                />

                {/* confirmation modal */}
                <Modal show={confirming} onClose={closeConfirm}>
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900">Delete Page</h2>
                        <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete the page "{selectedPage?.name}"? This action cannot be undone.</p>

                        <div className="mt-6 flex justify-end">
                            <PrimaryButton onClick={closeConfirm} className="px-4 py-2">Cancel</PrimaryButton>
                            <DangerButton className="ms-3" onClick={deletePage}>Delete</DangerButton>
                        </div>
                    </div>
                </Modal>

                {/* small toast */}
                {toastMsg && (
                    <div className="fixed right-4 bottom-4 bg-gray-900 text-white px-4 py-2 rounded shadow">
                        {toastMsg}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
