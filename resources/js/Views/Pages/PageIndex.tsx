import React, {useState} from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {Head, Link, router} from '@inertiajs/react';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from "@/Components/PrimaryButton";
import IndexTable from '@/Components/IndexTable';
import { showAppToast } from '@/utils/toast';

export default function PagesIndex({ auth, pages = {data: []} }: { auth: any; pages?: any }) {
    const rows = pages?.data ?? [];

    const [confirming, setConfirming] = useState(false);
    const [selectedPage, setSelectedPage] = useState<any | null>(null);

    // Use module toast helper
    const showToast = (msg: string) => { try { showAppToast(msg); } catch(e) {} };

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
                showToast('Page deleted');
                // reload the current list to reflect deletion
                router.reload();
            },
            onError: () => {
                showToast('Failed to delete page');
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

                {/* Toasts are shown via the global app snackbar */}
            </div>
        </DashboardLayout>
    );
}
