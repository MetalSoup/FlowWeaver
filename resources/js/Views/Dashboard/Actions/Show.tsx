import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';
import React from 'react';

export default function ActionShow() {
    const props: any = usePage().props;
    const authUser = props.auth?.user ?? null;
    const a = props.action || {};

    return (
        <DashboardLayout user={authUser}>
            <Head title={`Action ${a.id || ''}`} />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Action #{a.id}</h1>
                <div className="mb-4"><strong>Time:</strong> {a.created_at ? new Date(a.created_at).toLocaleString() : ''}</div>
                <div className="mb-4"><strong>Event:</strong> {a.event}</div>
                <div className="mb-4"><strong>Node:</strong> {a.node_id}</div>
                <div className="mb-4"><strong>Submission:</strong> {a.submission_id}</div>
                <div className="mb-4"><strong>Email:</strong> {a.email}</div>

                <div className="mb-4">
                    <strong>Request Headers:</strong>
                    <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(a.request_headers, null, 2)}</pre>
                </div>

                <div className="mb-4">
                    <strong>Request Body:</strong>
                    <pre className="bg-gray-100 p-2 rounded">{a.request_body}</pre>
                </div>

                <div className="mb-4">
                    <strong>Response Headers:</strong>
                    <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(a.response_headers, null, 2)}</pre>
                </div>

                <div className="mb-4">
                    <strong>Response Body:</strong>
                    <pre className="bg-gray-100 p-2 rounded">{a.response_body}</pre>
                </div>

                <div className="mb-4">
                    <strong>Sent Values:</strong>
                    <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(a.sent_values, null, 2)}</pre>
                </div>
            </div>
        </DashboardLayout>
    );
}
