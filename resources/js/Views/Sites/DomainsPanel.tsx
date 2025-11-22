import React, {useState} from 'react';
import {router, usePage} from "@inertiajs/react";
import Select from '@/Components/Select';

export default function DomainsPanel({site, domains, pages, auth, isSuperAdmin, mainDomain}: {site: any, domains: any[], pages: any[], auth: any, isSuperAdmin?: boolean, mainDomain?: string}) {
    const { props } : any = usePage();
    const errors = props.errors || {};
    const flash = props.flash || {};
    const [newDomain, setNewDomain] = useState('');
    const [savingDomainId, setSavingDomainId] = useState<number | null>(null);

    const addDomain = (e: any) => {
        e.preventDefault();
        if (!newDomain) return;
        router.post(route('sites.domains.store', site.id), {domain: newDomain});
    }

    const updateDomain = (domainId: number, payload: any) => {
        setSavingDomainId(domainId);
        router.put(route('domains.update', domainId), payload, {
            onFinish: () => setSavingDomainId(null)
        });
    }

    const deleteDomain = (domainId: number) => {
        if (!confirm('Delete this domain?')) return;
        router.delete(route('domains.destroy', domainId));
    }

    return (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded shadow p-4">
            <h3 className="font-semibold mb-3">Domains</h3>

            {flash.success && (
                <div className="mb-3 p-2 bg-green-50 text-green-800 rounded">{flash.success}</div>
            )}
            {flash.error && (
                <div className="mb-3 p-2 bg-red-50 text-red-800 rounded">{flash.error}</div>
            )}

            <div className="space-y-3">
                <form onSubmit={addDomain} className="flex">
                    <input value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="example.com" className="flex-1 mr-2 px-3 py-2 rounded bg-gray-100 dark:bg-gray-700" />
                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded">Add</button>
                </form>
                {errors.domain && (
                    <div className="text-sm text-red-600">{errors.domain}</div>
                )}

                {domains && domains.length === 0 && (
                    <div className="text-sm text-gray-500">No domains configured for this site.</div>
                )}

                {domains && domains.map((d: any) => (
                    <div key={d.id} className="border rounded p-3 bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                            <div className="font-medium">{d.domain}</div>
                            <div className="flex items-center space-x-2">
                                {(!(mainDomain && d.domain && mainDomain.toLowerCase() === d.domain.toLowerCase()) || isSuperAdmin) ? (
                                    <button onClick={() => deleteDomain(d.id)} className="text-red-500 hover:underline">Remove</button>
                                ) : (
                                    <div className="text-xs text-gray-500">Main domain — managed by super-admin</div>
                                )}
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Default page</label>
                                { (mainDomain && d.domain && mainDomain.toLowerCase() === d.domain.toLowerCase()) && !isSuperAdmin ? (
                                    <div className="text-sm text-gray-500">Managed by super-admin</div>
                                ) : (
                                    <>
                                        <Select value={d.default_page_id ?? ''} onChange={(e:any)=> updateDomain(d.id, { default_page_id: e.target.value || null })}>
                                            <option value="">(none)</option>
                                            {pages.map((p:any)=> (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </Select>
                                        {errors.default_page_id && <div className="text-sm text-red-600">{errors.default_page_id}</div>}
                                    </>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">404 page</label>
                                { (mainDomain && d.domain && mainDomain.toLowerCase() === d.domain.toLowerCase()) && !isSuperAdmin ? (
                                    <div className="text-sm text-gray-500">Managed by super-admin</div>
                                ) : (
                                    <>
                                        <Select value={d.not_found_page_id ?? ''} onChange={(e:any)=> updateDomain(d.id, { not_found_page_id: e.target.value || null })}>
                                            <option value="">(none)</option>
                                            {pages.map((p:any)=> (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </Select>
                                        {errors.not_found_page_id && <div className="text-sm text-red-600">{errors.not_found_page_id}</div>}
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                ))}

            </div>
        </div>
    )
}
