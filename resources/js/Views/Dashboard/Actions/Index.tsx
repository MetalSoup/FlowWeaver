import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';

export default function ActionsIndex() {
    const props: any = usePage().props;
    const authUser = props.auth?.user ?? null;
    const actions = props.actions || { data: [] };

    return (
        <DashboardLayout user={authUser}>
            <Head title="Actions" />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Actions</h1>
                <div className="overflow-x-auto bg-white rounded shadow">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 text-left">Time</th>
                                <th className="p-3 text-left">Event</th>
                                <th className="p-3 text-left">Node</th>
                                <th className="p-3 text-left">Submission</th>
                                <th className="p-3 text-left">Email</th>
                                <th className="p-3 text-left">Preview</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actions.data && actions.data.length ? (
                                actions.data.map((a: any) => (
                                    <tr key={a.id} className="border-t">
                                        <td className="p-3 align-top">{new Date(a.created_at).toLocaleString()}</td>
                                        <td className="p-3 align-top">{a.event}</td>
                                        <td className="p-3 align-top">{a.node_id}</td>
                                        <td className="p-3 align-top">{a.submission_id}</td>
                                        <td className="p-3 align-top">{a.email}</td>
                                        <td className="p-3 align-top"><Link href={route('dashboard.actions.show', a.id)} className="text-blue-600">View</Link></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center">No actions found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    {actions.links ? (
                        // If Inertia serialized links as HTML, render dangerously; otherwise render simple prev/next
                        typeof actions.links === 'string' ? (
                            <div dangerouslySetInnerHTML={{ __html: actions.links }} />
                        ) : (
                            <div className="flex gap-2">
                                {actions.prev_page_url && <Link href={actions.prev_page_url} className="px-3 py-1 bg-gray-200 rounded">Previous</Link>}
                                {actions.next_page_url && <Link href={actions.next_page_url} className="px-3 py-1 bg-gray-200 rounded">Next</Link>}
                            </div>
                        )
                    ) : null}
                </div>
            </div>
        </DashboardLayout>
    );
}
