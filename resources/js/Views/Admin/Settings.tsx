import React, {useState} from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {Head, router, usePage} from '@inertiajs/react';
import Select from '@/Components/Select';

export default function AdminSettings(){
    const { props }: any = usePage();
    const siteDomain = props.siteDomain;
    const pages = props.pages || [];

    const [domain, setDomain] = useState(siteDomain ? siteDomain.domain : '');
    const [defaultPageId, setDefaultPageId] = useState(siteDomain ? (siteDomain.default_page_id ?? '') : '');
    const [notFoundPageId, setNotFoundPageId] = useState(siteDomain ? (siteDomain.not_found_page_id ?? '') : '');

    const onSave = (e:any) => {
        e.preventDefault();
        router.post(route('admin.settings.update'), {
            domain, default_page_id: defaultPageId || null, not_found_page_id: notFoundPageId || null
        });
    }

    return (
        <DashboardLayout user={props.auth.user} header={<h1>Admin Settings</h1>}>
            <Head title="Admin Settings" />
            <div className="p-6 bg-white rounded shadow">
                <form onSubmit={onSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Main Domain</label>
                        <input value={domain} onChange={(e)=>setDomain(e.target.value)} className="mt-1 block w-full rounded bg-gray-100 dark:bg-gray-700 p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Default page</label>
                        <Select value={defaultPageId} onChange={(e:any)=>setDefaultPageId(e.target.value)}>
                            <option value="">(none)</option>
                            {pages.map((p:any)=> (<option key={p.id} value={p.id}>{p.name}</option>))}
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">404 page</label>
                        <Select value={notFoundPageId} onChange={(e:any)=>setNotFoundPageId(e.target.value)}>
                            <option value="">(none)</option>
                            {pages.map((p:any)=> (<option key={p.id} value={p.id}>{p.name}</option>))}
                        </Select>
                    </div>

                    <div>
                        <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded">Save</button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    )
}

