import DashboardLayout from '@/Layouts/DashboardLayout';
import {Head, Link} from "@inertiajs/react";
import IndexTable from '@/Components/IndexTable';

export default function Fields({ auth, fields }:{auth:any,fields:any}) {
    // Support either a plain array or a paginator object with .data (match InstanceIndex)
    const rows = Array.isArray(fields) ? fields : (fields?.data ?? []);
    const pages = Array.isArray(fields) ? undefined : fields;
    // If backend returned a plain array (no paginator), but there are more rows than a single page,
    // synthesize a minimal paginator object so IndexTable will render pagination links that
    // navigate to `?page=N` and let the server handle the actual pagination on subsequent requests.
    const pageSize = 15;
    const pagesForTable = (() => {
        if (pages) return pages;
        if (!Array.isArray(fields)) return undefined;
        const total = fields.length;
        const last = Math.max(1, Math.ceil(total / pageSize));
        if (last <= 1) return undefined;

        // build simple links array compatible with IndexTable (objects with url,label,active)
        const base = typeof window !== 'undefined' ? window.location.pathname : route('fields.index');
        const links: any[] = [];
        // prev
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

    const columns = [
        { key: 'id', label: 'ID', className: 'w-16' },
        { key: 'name', label: 'Name', sortable: true, render: (f: any) => <Link href={route('fields.edit', f.id)} className="text-blue-600">{f.name}</Link> },
        { key: 'type', label: 'Type' },
        { key: 'created_at', label: 'Created At', sortable: true },
        { key: 'updated_at', label: 'Updated At', sortable: true },
    ];

    return (
        <DashboardLayout
            user={auth.user}
            header={<div className="flex justify-between items-center"><h1>Fields</h1><Link href={route('fields.create')} className="bg-blue-500 text-white py-1 px-3 rounded">Create Field</Link></div>}
        >
            <Head title="Fields"/>
            <div className={"p-5"}>

                <IndexTable
                    rows={rows}
                    columns={columns}
                    pages={pagesForTable}
                    searchEnabled={true}
                    searchPlaceholder="Search fields..."
                    baseRoute="fields.index"
                    queryParam="q"
                    debounceMs={300}
                    noResultsMessage="No fields found."
                />
            </div>
        </DashboardLayout>
    );
}
