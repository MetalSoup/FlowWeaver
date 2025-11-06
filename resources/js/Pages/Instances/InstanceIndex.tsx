import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import IndexTable from '@/Components/IndexTable';

export default function InstanceIndex({auth, instances = []}: {
    auth: any,
    instances?: any
}) {
    // Support either a plain array or a paginator object with .data
    const rows = Array.isArray(instances) ? instances : (instances?.data ?? []);
    const pages = Array.isArray(instances) ? undefined : instances;

    const onSelect = (id: number) => {
        // POST the instance_id to the server to set session selected_instance
        router.post(route('instances.storeSelection'), { instance_id: id });
    }

    const columns = [
        { key: 'id', label: 'ID', className: 'w-16', sortable: true },
        { key: 'name', label: 'Name', sortable: true, render: (instance: any) => <Link href={route('instances.edit', instance.id)}>{instance.name}</Link> },
        { label: 'Actions', render: (instance: any) => (
            <div>
                <button onClick={() => onSelect(instance.id)} className="bg-green-500 text-white py-1 px-2 rounded">Select</button>
            </div>
        ) },
        { key: 'created_at', label: 'Created At', sortable: true, render: (instance: any) => instance.created_at ?? '' },
        { key: 'updated_at', label: 'Updated At', sortable: true, render: (instance: any) => instance.updated_at ?? '' },
    ];

    return (
        <DashboardLayout
            user={auth.user}
            header={<div className="flex justify-between items-center"><h1>Instances</h1><Link href={route('instances.create')} className="bg-blue-500 text-white py-1 px-3 rounded">Create Instance</Link></div>}
        >
            <Head title="Instances"/>


            <div className={"p-5"}>
                <IndexTable
                    rows={rows}
                    columns={columns}
                    pages={pages}
                    searchEnabled={true}
                    searchPlaceholder="Search instances..."
                    baseRoute="instances.index"
                    queryParam="q"
                    debounceMs={300}
                    noResultsMessage="No instances found."
                />
            </div>

        </DashboardLayout>
    );
}
