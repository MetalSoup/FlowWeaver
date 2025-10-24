import React, {useRef, useState, useEffect} from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {Head, Link, router} from '@inertiajs/react';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';

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

    const renderPagination = () => {
        if (!pages) return null;

        // Normalize links: sometimes serializer returns an object-like structure
        const rawLinks = pages.links;
        let linksArr: any[] | null = null;

        if (Array.isArray(rawLinks)) {
            linksArr = rawLinks;
        } else if (rawLinks && typeof rawLinks === 'object') {
            // Object-like; convert to array of values
            try {
                linksArr = Object.values(rawLinks);
            } catch (err) {
                // ignore
            }
        } else {
            // unexpected shape — in dev log it so we can inspect server output
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.warn('Pages index: unexpected pages.links shape:', rawLinks);
            }
            linksArr = null;
        }

        // Ensure linksArr is actually iterable with map before using it
        if (linksArr && typeof (linksArr as any).map === 'function') {
            const safeLinks = (linksArr as any[]).filter(Boolean);
            return (
                <nav className="mt-4">
                    <ul className="inline-flex items-center -space-x-px">
                        {safeLinks.map((link: any, idx: number) => {
                            // If link is not an object, render a simple label
                            if (!link || typeof link !== 'object') {
                                const plainLabel = String(link ?? '');
                                return (
                                    <li key={idx} className="mx-1">
                                        <span className="px-3 py-1 border rounded-md text-sm text-gray-700">{plainLabel}</span>
                                    </li>
                                );
                            }

                            const label = (link.label || '').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»');
                            const isActive = !!link.active;
                            return (
                                <li key={idx} className="mx-1">
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            className={
                                                'px-3 py-1 border rounded-md text-sm ' + (isActive ? 'bg-gray-900 text-white' : 'bg-white text-gray-700')
                                            }
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: label }} />
                                        </Link>
                                    ) : (
                                        <span className="px-3 py-1 border rounded-md text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: label }} />
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            );
        }

        // Fallback: build pagination from pages.meta (current_page, last_page)
        const meta = pages.meta || {};
        const current = Number(meta.current_page || 1);
        const last = Number(meta.last_page || 1);
        if (last <= 1) return null;

        const pageLinks: any[] = [];
        // Previous
        pageLinks.push({ label: '«', url: current > 1 ? `${route('pages.index')}?page=${current - 1}` : null });
        // Numeric pages (limit to a reasonable window)
        const window = 5;
        const start = Math.max(1, current - Math.floor(window / 2));
        const end = Math.min(last, start + window - 1);

        for (let i = start; i <= end; i++) {
            pageLinks.push({ label: String(i), url: `${route('pages.index')}?page=${i}`, active: i === current });
        }

        // Next
        pageLinks.push({ label: '»', url: current < last ? `${route('pages.index')}?page=${current + 1}` : null });

        return (
            <nav className="mt-4">
                <ul className="inline-flex items-center -space-x-px">
                    {pageLinks.map((link: any, idx: number) => (
                        <li key={idx} className="mx-1">
                            {link.url ? (
                                <Link
                                    href={link.url}
                                    className={
                                        'px-3 py-1 border rounded-md text-sm ' + (link.active ? 'bg-gray-900 text-white' : 'bg-white text-gray-700')
                                    }
                                >
                                    {link.label}
                                </Link>
                            ) : (
                                <span className="px-3 py-1 border rounded-md text-sm text-gray-400">{link.label}</span>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        );
    };

    return (
        <DashboardLayout
            user={auth.user}
            header={<div className="flex justify-between items-center"><h1>Pages</h1><Link href={route('pages.create')} className="bg-blue-500 text-white py-1 px-3 rounded">Create Page</Link></div>}
        >
            <Head title="Pages" />

            <div className="p-5">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left">ID</th>
                            <th className="text-left">Name</th>
                            <th className="text-left">Actions</th>
                            <th className="text-left">Created At</th>
                            <th className="text-left">Updated At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows && rows.length ? (
                            rows.map((page: any) => (
                                <tr key={page.id} className="border-t">
                                    <td className="py-2">{page.id}</td>
                                    <td className="py-2"><Link href={route('pages.edit', page.id)}>{page.name}</Link></td>
                                    <td className="py-2">
                                        <Link href={route('pages.edit', page.id)} className="bg-gray-200 text-gray-800 py-1 px-2 rounded mr-2">Edit</Link>
                                        <button onClick={() => openConfirm(page)} className="bg-red-600 text-white py-1 px-2 rounded">Delete</button>
                                    </td>
                                    <td className="py-2">{page.created_at}</td>
                                    <td className="py-2">{page.updated_at}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-6 text-gray-900">
                                    No pages found. Create your first page using the "Create Page" button.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {renderPagination()}

                {/* confirmation modal */}
                <Modal show={confirming} onClose={closeConfirm}>
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900">Delete Page</h2>
                        <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete the page "{selectedPage?.name}"? This action cannot be undone.</p>

                        <div className="mt-6 flex justify-end">
                            <button onClick={closeConfirm} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
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
