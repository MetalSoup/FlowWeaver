import DashboardLayout from '@/Layouts/DashboardLayout';
import {Link} from "@inertiajs/react";
import IndexTable from '@/Components/IndexTable';
import {FlowProps} from "@/types";
import React, { useMemo } from 'react';


export default function FlowIndex({ auth, flows } :FlowProps) {
    const rows = useMemo(() => flows?.data ?? [], [flows]);

    const columns = useMemo(() => [
        { key: 'id', label: 'ID', className: 'w-16' },
        { key: 'name', label: 'Name', sortable: true, render: (flow: any) => <Link href={route('flows.edit', flow.id)} className="text-blue-600">{flow.name}</Link> },
        { key: 'created_at', label: 'Created At', sortable: true },
        { key: 'updated_at', label: 'Updated At', sortable: true },
    ], [flows]);

    return (
        <DashboardLayout
            user={auth.user}
            header={<div className="flex justify-between items-center"><h1>Flows</h1><Link href={route('flows.create')} className="bg-blue-500 text-white py-1 px-3 rounded">Create Flow</Link></div>}
        >

            <div className={"p-5"}>
                <IndexTable
                    rows={rows}
                    columns={columns}
                    pages={flows}
                    searchEnabled={true}
                    searchPlaceholder="Search flows..."
                    baseRoute="flows.index"
                    noResultsMessage="No flows found."
                />
            </div>
        </DashboardLayout>
    );
}
