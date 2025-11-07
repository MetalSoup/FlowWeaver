import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import IndexTable from '@/Components/IndexTable';

export default function OrganizationIndex({ auth, organizations = [] }: {
    auth: any,
    organizations?: any
}) {
    // Support either a plain array or a paginator object with .data
    const rows = Array.isArray(organizations) ? organizations : (organizations?.data ?? []);
    const pages = Array.isArray(organizations) ? undefined : organizations;

    // If backend returned a plain array (no paginator), but there are more rows than a single page,
    // synthesize a minimal paginator object so IndexTable will render pagination links that
    // navigate to `?page=N` and let the server handle the actual pagination on subsequent requests.
    const pageSize = 15;
    const pagesForTable = (() => {
        if (pages) return pages;
        if (!Array.isArray(organizations)) return undefined;
        const total = organizations.length;
        const last = Math.max(1, Math.ceil(total / pageSize));
        if (last <= 1) return undefined;

        const base = typeof window !== 'undefined' ? window.location.pathname : route('organizations.index');
        const links: any[] = [];
        links.push({ url: 1 < 2 ? `${base}?page=${1}` : null, label: '&laquo;', active: false });
        for (let i = 1; i <= last; i++) {
            links.push({ url: `${base}?page=${i}`, label: String(i), active: i === 1 });
        }
        links.push({ url: 1 < last ? `${base}?page=${2}` : null, label: '&raquo;', active: false });

        return {
            links,
            meta: {
                current_page: 1,
                last_page: last,
                total,
            },
        };
    })();

    const onSelect = (id: number) => {
        router.post(route('organizations.storeSelection'), { organization_id: id });
    }

    const columns = [
        { key: 'id', label: 'ID', className: 'w-16' },
        { key: 'name', label: 'Name', sortable: true, render: (o: any) => <Link href={route('organizations.edit', o.id)} className="text-blue-600">{o.name}</Link> },
        { label: 'Actions', render: (o: any) => (
            <div>
                <button onClick={() => onSelect(o.id)} className="bg-green-500 text-white py-1 px-2 rounded">Select</button>
            </div>
        ) },
        { key: 'created_at', label: 'Created At', sortable: true },
        { key: 'updated_at', label: 'Updated At', sortable: true },
    ];

    return (
        <DashboardLayout
            user={auth.user}
            header={<div className="flex justify-between items-center"><h1>Organizations</h1><Link href={route('organizations.create')} className="bg-blue-500 text-white py-1 px-3 rounded">Create Organization</Link></div>}
        >
            <Head title="Organizations"/>

            <div className={"p-5"}>
                <IndexTable
                    rows={rows}
                    columns={columns}
                    pages={pagesForTable}
                    searchEnabled={true}
                    searchPlaceholder="Search organizations..."
                    baseRoute="organizations.index"
                    queryParam="q"
                    debounceMs={300}
                    noResultsMessage="No organizations found."
                />
            </div>

        </DashboardLayout>
    );
}
