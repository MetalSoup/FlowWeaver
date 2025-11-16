import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import IndexTable from '@/Components/IndexTable';

export default function SiteIndex({auth, sites = []}: {
    auth: any,
    sites?: any
}) {
    // Support either a plain array or a paginator object with .data
    const rows = Array.isArray(sites) ? sites : (sites?.data ?? []);
    const pages = Array.isArray(sites) ? undefined : sites;

    const onSelect = (id: number) => {
        // POST the site_id to the server to set session selected_site
        router.post(route('sites.storeSelection'), { site_id: id });
    }

    const columns = [
        { key: 'id', label: 'ID', className: 'w-16', sortable: true },
        { key: 'name', label: 'Name', sortable: true, render: (site: any) => <Link href={route('sites.edit', site.id)}>{site.name}</Link> },
        { label: 'Actions', render: (site: any) => (
            <div>
                <button onClick={() => onSelect(site.id)} className="bg-green-500 text-white py-1 px-2 rounded">Select</button>
            </div>
        ) },
        { key: 'created_at', label: 'Created At', sortable: true, render: (site: any) => site.created_at ?? '' },
        { key: 'updated_at', label: 'Updated At', sortable: true, render: (site: any) => site.updated_at ?? '' },
    ];

    return (
        <DashboardLayout
            user={auth.user}
            header={<div className="flex justify-between items-center"><h1>Sites</h1><Link href={route('sites.create')} className="bg-blue-500 text-white py-1 px-3 rounded">Create Site</Link></div>}
        >
            <Head title="Sites"/>


            <div className={"p-5"}>
                <IndexTable
                    rows={rows}
                    columns={columns}
                    pages={pages}
                    searchEnabled={true}
                    searchPlaceholder="Search sites..."
                    baseRoute="sites.index"
                    queryParam="q"
                    debounceMs={300}
                    noResultsMessage="No sites found."
                />
            </div>

        </DashboardLayout>
    );
}
