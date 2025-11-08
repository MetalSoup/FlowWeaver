import DashboardLayout from '@/Layouts/DashboardLayout';
import {Head, Link} from "@inertiajs/react";
import IndexTable from '@/Components/IndexTable';
import { useState } from 'react';
import Tooltip from '@/Components/Tooltip';
// Explicit icon imports (only those used) to avoid bundling the whole icon set
import {
    TextboxIcon,
    EnvelopeSimpleIcon,
    PhoneCallIcon,
    LinkSimpleIcon,
    CheckSquareIcon,
    RadioButtonIcon,
    ListMagnifyingGlassIcon,
    AlignLeftIcon,
    EyeSlashIcon,
    NumberSquareOneIcon,
    PaletteIcon,
    CalendarIcon,
    CalendarBlankIcon,
    FileIcon,
    ImageIcon,
    CalendarPlusIcon,
    ClockIcon,
    LockKeyIcon,
    SlidersHorizontalIcon,
    ArrowCounterClockwiseIcon,
    MagnifyingGlassIcon,
    HandTapIcon,
    CheckCircleIcon,
    WarningIcon,
} from '@phosphor-icons/react';

// Map of field `type` values to the human-friendly labels matching the create form
const TYPE_LABELS: Record<string, string> = {
    'text': 'Text',
    'email': 'Email',
    'tel': 'Telephone Number',
    'url': 'URL',
    'checkbox': 'Checkbox',
    'radio': 'Radio',
    'select': 'Select',
    'textarea': 'Textarea',
    'hidden': 'Hidden',
    'number': 'Number',
    'color': 'Color',
    'date': 'Date',
    'datetime-local': 'Datetime-local',
    'file': 'File',
    'image': 'Image',
    'month': 'Month',
    'week': 'Week',
    'time': 'Time',
    'password': 'Password',
    'range': 'Range Slider',
    'reset': 'Reset',
    'search': 'Search',
    'button': 'Button',
    'submit': 'Submit',
};

const getTypeLabel = (t: string | undefined | null) => {
    if (!t) return '';
    return TYPE_LABELS[t] ?? t;
}

// Map types to the actual imported Phosphor icon components (explicit imports)
const TYPE_ICONS: Record<string, any> = {
    'text': TextboxIcon,
    'email': EnvelopeSimpleIcon,
    'tel': PhoneCallIcon,
    'url': LinkSimpleIcon,
    'checkbox': CheckSquareIcon,
    'radio': RadioButtonIcon,
    'select': ListMagnifyingGlassIcon,
    'textarea': AlignLeftIcon,
    'hidden': EyeSlashIcon,
    'number': NumberSquareOneIcon,
    'color': PaletteIcon,
    'date': CalendarIcon,
    'datetime-local': CalendarBlankIcon,
    'file': FileIcon,
    'image': ImageIcon,
    'month': CalendarBlankIcon,
    'week': CalendarPlusIcon,
    'time': ClockIcon,
    'password': LockKeyIcon,
    'range': SlidersHorizontalIcon,
    'reset': ArrowCounterClockwiseIcon,
    'search': MagnifyingGlassIcon,
    'button': HandTapIcon,
    'submit': CheckCircleIcon,
};

const renderTypeIcon = (t: string | undefined | null) => {
    if (!t) return null;
    const Comp = TYPE_ICONS[t];
    if (!Comp) return null;
    return <Comp size={16} className="inline-block mr-2 align-text-bottom text-gray-500" />;
}

export default function Fields({ auth, fields }:{auth:any,fields:any}) {
    // Support either a plain array or a paginator object with .data (match InstanceIndex)
    const isPaginator = !Array.isArray(fields) && !!fields;
    const allRows = Array.isArray(fields) ? fields : (fields?.data ?? []);
    const pages = isPaginator ? fields : undefined;
    // pagesForTable will be synthesized later (after instanceRows is known) if needed.
    let pagesForTable: any = pages;

    // Split default vs instance fields
    const defaultRows = allRows.filter((r: any) => r.is_default);
    const instanceRows = allRows.filter((r: any) => !r.is_default);

    // If the data was a plain array, synthesize pagination meta for instanceRows only
    if (!pages) {
        const pageSize = 15;
        if (Array.isArray(fields)) {
            const total = instanceRows.length;
            const last = Math.max(1, Math.ceil(total / pageSize));
            if (last > 1) {
                const base = typeof window !== 'undefined' ? window.location.pathname : route('fields.index');
                const links: any[] = [];
                links.push({ url: 1 < 2 ? `${base}?page=${1}` : null, label: '&laquo;', active: false });
                for (let i = 1; i <= last; i++) {
                    links.push({ url: `${base}?page=${i}`, label: String(i), active: i === 1 });
                }
                links.push({ url: 1 < last ? `${base}?page=${2}` : null, label: '&raquo;', active: false });
                pagesForTable = {
                    links,
                    meta: {
                        current_page: 1,
                        last_page: last,
                        total,
                    },
                };
            }
        }
    }

    // collapsed state for default fields section (collapsed by default)
    const [defaultsCollapsed, setDefaultsCollapsed] = useState<boolean>(true);

    // Columns for instance fields (editable)
    const columnsInstance = [
        { key: 'id', label: 'ID', className: 'w-16' },
        // Swap: show Label before Name
        { key: 'label', label: 'Label', sortable: true },
        { key: 'name', label: 'Name', sortable: true, render: (f: any) => (
            <Link href={route('fields.edit', f.id)} className="text-blue-600">{f.name}</Link>
        ) },
        { key: 'type', label: 'Type', render: (f: any) => {
            const needsOptions = ['radio','checkbox','select'].includes(String(f.type));
            // Options are provided under f.options.answers per the API shape
            const hasOptions = f && f.options && Array.isArray(f.options.answers) && f.options.answers.length > 0;
            const showWarning = needsOptions && !hasOptions;
            return (
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span>{renderTypeIcon(f.type)}</span>
                        <span>{getTypeLabel(f.type)}</span>
                    </div>
                    {showWarning ? (
                        <Tooltip content="This field expects answers but none are defined. Click to add options." >
                            <Link href={route('fields.edit', f.id) + '#options'} className="ml-2 inline-flex items-center p-1" aria-label="Missing options">
                                <WarningIcon size={16} weight={"bold"} className="text-yellow-500" />
                            </Link>
                        </Tooltip>
                     ) : null}
                 </div>
             );
         } },
        { key: 'created_at', label: 'Created At', sortable: true },
        { key: 'updated_at', label: 'Updated At', sortable: true },
    ];

    // Columns for default (read-only) fields
    const columnsDefault = [
        // ID column removed for default fields per request
        // Swap: show Label before Name
        { key: 'label', label: 'Label' },
        { key: 'name', label: 'Name' },
        { key: 'type', label: 'Type', render: (f: any) => {

            return (
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span>{renderTypeIcon(f.type)}</span>
                        <span>{getTypeLabel(f.type)}</span>
                    </div>
                 </div>
             );
         } },
    ];

    return (
        <DashboardLayout
            user={auth.user}
            header={<div className="flex justify-between items-center"><h1>Fields</h1><Link href={route('fields.create')} className="bg-blue-500 text-white py-1 px-3 rounded">Create Field</Link></div>}
        >
            <Head title="Fields"/>
            <div className={"p-5"}>

                {/* Default fields section (collapsed by default) */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-medium">Default fields</h2>
                        <button type="button" onClick={() => setDefaultsCollapsed(c => !c)} className="text-sm text-blue-600">
                            {defaultsCollapsed ? `Show (${defaultRows.length})` : 'Hide'}
                        </button>
                    </div>
                    {!defaultsCollapsed && (
                        <IndexTable
                            rows={defaultRows}
                            columns={columnsDefault}
                            pages={undefined}
                            searchEnabled={false}
                            baseRoute="fields.index"
                            queryParam="q"
                            debounceMs={300}
                            noResultsMessage="No default fields."
                        />
                    )}
                </div>

                {/* Instance-specific fields section */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-medium">Instance fields</h2>
                    </div>
                    <IndexTable
                        rows={instanceRows}
                        columns={columnsInstance}
                        pages={pagesForTable}
                        searchEnabled={true}
                        searchPlaceholder="Search fields..."
                        baseRoute="fields.index"
                        queryParam="q"
                        debounceMs={300}
                        noResultsMessage="No instance fields found."
                    />
                </div>
                 </div>
         </DashboardLayout>
     );
 }
