import React, { useState, useRef, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { XIcon, CaretUpIcon, CaretDownIcon } from '@phosphor-icons/react';

type Column = {
    key?: string;
    label: string;
    className?: string;
    render?: (row: any) => React.ReactNode;
    sortable?: boolean; // new
};

type Props = {
    rows: any; // accepts either an array of rows or a paginator object with .data
    columns: Column[];
    pages?: any;
    searchEnabled?: boolean;
    searchPlaceholder?: string;
    baseRoute?: string; // used for fallback page link generation (e.g. 'pages.index')
    // New props
    queryParam?: string; // name of the query param to use for search (default: 'q')
    debounceMs?: number; // debounce delay for search (default: 250)
    noResultsMessage?: string; // custom message when there are no rows
    minSearchRows?: number; // hide search when total rows < this threshold (default: 10)
};

// Reusable index table with optional search and pagination rendering.
export default function IndexTable({ rows, columns, pages, searchEnabled = true, searchPlaceholder = 'Search...', baseRoute, queryParam = 'q', debounceMs = 250, noResultsMessage = 'No records.', minSearchRows = 10 }: Props) {
     const [q, setQ] = useState('');
     const qRef = useRef<number | null>(null);
     const [internalRows, setInternalRows] = useState<any[] | null>(null);
     const [loading, setLoading] = useState(false);

    // Determine total count: prefer paginator meta.total if available, otherwise fall back to local rows length
    const totalCount = (() => {
        try {
            if (pages) {
                // meta.total is common in Laravel paginator
                const metaTotal = pages?.meta?.total ?? pages?.total;
                if (typeof metaTotal !== 'undefined' && metaTotal !== null) return Number(metaTotal);
            }
        } catch (e) {
            // ignore
        }
        return Array.isArray(rows) ? rows.length : 0;
    })();

    // Show search when enabled and either the total count meets the min threshold
    // or there is an active query string (so users can clear/update the search)
    const showSearch = searchEnabled && (totalCount >= (minSearchRows ?? 10) || (q && q.length > 0));

    // Sort state
    const [sort, setSort] = useState<string | null>(null);
    // Default first sort direction is now 'asc'
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

    // Clear any client-side sorted rows when server-provided rows change
    useEffect(() => {
        setInternalRows(null);
        // sync sort/direction from URL after server navigation
        if (typeof window !== 'undefined') {
            try {
                const params = new URLSearchParams(window.location.search);
                const s = params.get('sort');
                const d = params.get('direction');
                if (s) setSort(s);
                if (d === 'asc' || d === 'desc') setDirection(d);
            } catch (e) {
                // ignore
            }
        }
    }, [rows]);

    useEffect(() => {
        return () => {
            if (qRef.current) window.clearTimeout(qRef.current);
        };
    }, []);

    // Initialize search input and sort params from current URL query param on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const params = new URLSearchParams(window.location.search);
            const initial = params.get(queryParam ?? 'q');
            if (initial) {
                setQ(initial);
            }
            const s = params.get('sort');
            const d = params.get('direction');
            if (s) setSort(s);
            if (d === 'asc' || d === 'desc') setDirection(d);
        } catch (e) {
            // ignore URL parsing errors
        }
    }, [queryParam]);

    const submitSearch = (value: string) => {
        // Debounce according to prop
        if (qRef.current) window.clearTimeout(qRef.current);
        qRef.current = window.setTimeout(() => {
            // Submit to current path with configurable query param (Inertia will handle preserving other params if needed)
            router.get(window.location.pathname, { [queryParam]: value }, { preserveState: true, replace: false });
        }, debounceMs);
    };

    const onChangeSearch = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setQ(ev.target.value);
        submitSearch(ev.target.value);
    };

    // build query object merging existing params with overrides
    const buildQuery = (overrides: Record<string, any> = {}) => {
        const params = new URLSearchParams(window.location.search);
        // copy existing params
        const qObj: Record<string, string> = {};
        for (const [k, v] of params.entries()) {
            qObj[k] = v;
        }
        // apply overrides (undefined deletes)
        Object.keys(overrides).forEach(k => {
            const v = overrides[k];
            if (v === undefined || v === null || v === '') {
                delete qObj[k];
            } else {
                qObj[k] = String(v);
            }
        });
        return qObj;
    };

    const changeSort = (columnKey?: string) => {
        if (!columnKey) return;
        // When choosing a new column, default to 'asc'
        let newDir: 'asc' | 'desc' = 'asc';
        if (sort === columnKey) {
            // toggle direction when clicking the same column
            newDir = direction === 'desc' ? 'asc' : 'desc';
        }
        setSort(columnKey);
        setDirection(newDir);

        // Only do client-side immediate sorting when there's no server paginator.
        // For server-paginated lists (`pages` present) we rely on the server to return the full sorted page
        // to avoid double-sorting and UI flash.
        if (!pages) {
            try {
                const clientSorted = sortRowsClient(rows, columnKey, newDir);
                setInternalRows(clientSorted);
            } catch (e) {
                // ignore client sort failures
            }
        }

        const qObj = buildQuery({ sort: columnKey, direction: newDir, page: 1 });
        // Issue Inertia GET to the current pathname with query object so Inertia performs an XHR visit
        setLoading(true);
        router.get(window.location.pathname, qObj, {
            preserveState: true,
            preserveScroll: true,
            replace: false,
            onSuccess: () => {
                // server returned new props; clear client-side temporary sort
                setInternalRows(null);
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    // Clear the search input and remove the query param from the URL, then navigate via Inertia
    const clearSearch = () => {
        setQ('');
        if (qRef.current) window.clearTimeout(qRef.current);

        if (typeof window !== 'undefined') {
            try {
                const params = new URLSearchParams(window.location.search);
                params.delete(queryParam);
                const queryObj: Record<string, string> = {};
                for (const [k, v] of params.entries()) {
                    queryObj[k] = v;
                }
                router.get(window.location.pathname, queryObj, { preserveState: true, replace: false });
                return;
            } catch (e) {
                // fallback to simple navigation
            }
        }

        router.get(window.location.pathname, {}, { preserveState: true, replace: false });
    };

    const renderPagination = () => {
        if (!pages) return null;

        const rawLinks = pages.links;
        let linksArr: any[] | null;

        const tryParseJson = (val: any) => {
            if (typeof val !== 'string') return val;
            try {
                return JSON.parse(val);
            } catch (e) {
                return val;
            }
        };

        const normalizeObjectLike = (obj: any) => {
            if (!obj || typeof obj !== 'object') return null;
            const keys = Object.keys(obj);
            const allNumeric = keys.length > 0 && keys.every(k => /^\d+$/.test(k));
            if (allNumeric) {
                return keys
                    .map(k => ({ k: Number(k), v: obj[k] }))
                    .sort((a, b) => a.k - b.k)
                    .map(x => x.v);
            }
            try {
                return Object.values(obj);
            } catch (e) {
                return null;
            }
        };

        const parsed = tryParseJson(rawLinks);

        if (Array.isArray(parsed)) {
            linksArr = parsed;
        } else if (parsed && typeof parsed === 'object') {
            linksArr = normalizeObjectLike(parsed);
        } else {
            // Unexpected pages.links shape — silently ignore in production and development
            linksArr = null;
        }

        if (linksArr && typeof (linksArr as any).map === 'function') {
            const safeLinks = (linksArr as any[]).filter(Boolean);
            return (
                <nav className="mt-4">
                    <ul className="inline-flex items-center -space-x-px">
                        {safeLinks.map((link: any, idx: number) => {
                            let linkObj = link;
                            if (typeof link === 'string') {
                                const anchorMatch = link.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
                                if (anchorMatch) {
                                    linkObj = { url: anchorMatch[1], label: anchorMatch[2] };
                                } else {
                                    linkObj = { label: link };
                                }
                            }

                            if (!linkObj || typeof linkObj !== 'object') {
                                const plainLabel = String(linkObj ?? '');
                                return (
                                    <li key={idx} >
                                        <span className="px-3 py-1 border text-sm text-gray-700">{plainLabel}</span>
                                    </li>
                                );
                            }

                            const label = (linkObj.label || '').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»');
                            const isActive = !!linkObj.active;

                            return (
                                <li key={idx} >
                                    {linkObj.url ? (
                                        <Link
                                            href={linkObj.url}
                                            className={
                                                'px-3 py-1 border  text-sm ' + (isActive ? 'bg-gray-900 text-white' : 'bg-white text-gray-700')
                                            }
                                        >
                                            <span  dangerouslySetInnerHTML={{ __html: label }} />
                                        </Link>
                                    ) : (
                                        <span className="px-3 py-1 border text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: label }} />
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            );
        }

        // Fallback: try to use pages.meta (current_page, last_page)
        const meta = pages.meta || {};
        const current = Number(meta.current_page || 1);
        const last = Number(meta.last_page || 1);
        if (last <= 1) return null;

        const pageLinks: any[] = [];
        const base = baseRoute ? route(baseRoute) : window.location.pathname;
        pageLinks.push({ label: '«', url: current > 1 ? `${base}?page=${current - 1}` : null });

        const win = 5;
        const start = Math.max(1, current - Math.floor(win / 2));
        const end = Math.min(last, start + win - 1);

        for (let i = start; i <= end; i++) {
            pageLinks.push({ label: String(i), url: `${base}?page=${i}`, active: i === current });
        }

        pageLinks.push({ label: '»', url: current < last ? `${base}?page=${current + 1}` : null });

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

    const sortRowsClient = (arr: any[], key: string | undefined, dir: 'asc' | 'desc') => {
        if (!key) return arr.slice();
        const copy = arr.slice();
        copy.sort((a: any, b: any) => {
            const va = a?.[key];
            const vb = b?.[key];
            if (va == null && vb == null) return 0;
            if (va == null) return dir === 'asc' ? -1 : 1;
            if (vb == null) return dir === 'asc' ? 1 : -1;
            // numeric compare if both are numbers
            const na = Number(va);
            const nb = Number(vb);
            if (!Number.isNaN(na) && !Number.isNaN(nb)) {
                return dir === 'asc' ? na - nb : nb - na;
            }
            // date compare if ISO-like
            const da = Date.parse(String(va));
            const db = Date.parse(String(vb));
            if (!Number.isNaN(da) && !Number.isNaN(db)) {
                return dir === 'asc' ? da - db : db - da;
            }
            // string fallback
            return dir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
        });
        return copy;
    };

    // Determine which rows to render: for paginated lists rely on server rows, otherwise use client-sorted internalRows when present
    const displayRows = pages ? (Array.isArray(rows) ? rows : (rows?.data ?? [])) : (internalRows ?? rows);

    return (
        <div>
            <div className="mb-4 flex justify-between items-center">
                <div />
                {showSearch && (
                    <div className="w-64 relative">
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-1 dark:bg-gray-500 dark:text-white dark:placeholder:text-gray-400"
                            placeholder={searchPlaceholder}
                            value={q}
                            onChange={onChangeSearch}
                        />
                        {q ? (
                            <button
                                type="button"
                                onClick={clearSearch}
                                aria-label="Clear search"
                                title="Clear search"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                <XIcon size={16} weight="bold" className={"dark:text-gray-200"} />
                            </button>
                        ) : null}
                    </div>
                )}
            </div>

            <div className="relative overflow-x-auto bg-white dark:bg-gray-900 rounded border dark:border-gray-600">
                {loading ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/40">
                        <svg className="animate-spin h-6 w-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                    </div>
                ) : null}

                <table className="w-full table-auto">
                    <thead>
                        <tr>
                            {columns.map((col, idx) => {
                                const isActive = sort === col.key;
                                const ariaSort = isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none';
                                // Use a subtle background change for active column: slightly darker in light mode, slightly lighter in dark mode
                                const labelClass = isActive ? 'font-semibold underline' : '';

                                const thBgClass = isActive ? 'bg-gray-50 dark:bg-gray-800' : '';

                                return (
                                    <th key={idx} className={`text-left px-3 py-2 ${thBgClass} ${col.className || ''} whitespace-nowrap transition-colors duration-150`} aria-sort={ariaSort}>
                                        <div className="flex items-center">
                                            <span className={labelClass}>{col.label}</span>
                                            {col.sortable ? (() => {
                                                // Determine the next direction for this column
                                                const nextDir: 'asc' | 'desc' = isActive ? (direction === 'desc' ? 'asc' : 'desc') : 'asc';
                                                // Build query object (used for debug / future link building)
                                                try {
                                                    const qObj = buildQuery({ sort: col.key, direction: nextDir, page: 1 });
                                                    // no-op here; kept for parity and potential enhancements
                                                    void qObj;
                                                } catch (e) {
                                                    // ignore
                                                }

                                                return (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.preventDefault(); changeSort(col.key); }}
                                                        className="ml-2 p-1 rounded hover:bg-gray-100 focus:outline-none"
                                                        title={`Sort by ${col.label}`}
                                                        aria-label={`Sort by ${col.label}`}
                                                    >
                                                        {isActive && direction === 'asc' ? (
                                                            <CaretUpIcon size={16} className="text-gray-500" />
                                                        ) : isActive && direction === 'desc' ? (
                                                            <CaretDownIcon size={16} className="text-gray-500" />
                                                        ) : (
                                                            <span className="text-gray-400">
                                                                <CaretUpIcon size={16} />
                                                                <CaretDownIcon size={16} />
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })() : null}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {displayRows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-4 text-gray-500">
                                    {noResultsMessage}
                                </td>
                            </tr>
                        ) : (
                            displayRows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800 border-t dark:border-gray-700">
                                    {columns.map((col, colIndex) => {
                                        const content = col.render ? col.render(row) : row[col.key as keyof typeof row];
                                        const cellBgClass = sort === col.key ? 'bg-gray-50 dark:bg-gray-800' : '';
                                        return (
                                            <td key={colIndex} className={`px-3 py-2 ${cellBgClass} ${col.className || ''} whitespace-nowrap transition-colors duration-150`}>
                                                {content}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                     </tbody>
                </table>
            </div>

            {pages && renderPagination()}
        </div>
    );
}
