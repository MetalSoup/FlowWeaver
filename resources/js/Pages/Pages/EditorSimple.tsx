import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';

export default function EditorSimple({ auth, page = null, forms = {}, flows = [] }: { auth: any; page?: any; forms?: any; flows?: any }) {
    const isEditing = !!page;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: page?.name ?? '',
        content: page?.content ?? '',
    });

    const submit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (isEditing) {
            put(route('pages.update', page.id));
        } else {
            post(route('pages.store'));
        }
    };

    return (
        <DashboardLayout user={auth.user} header={<h1>{isEditing ? `Edit Page: ${page?.name ?? ''}` : 'Create Page'}</h1>}>
            <Head title={isEditing ? `Edit: ${page?.name || 'Page'}` : 'Create Page'} />

            <div className="p-6 overflow-auto">
                <form onSubmit={submit} className="space-y-4 max-w-4xl">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Content (HTML)</label>
                        <textarea
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            rows={18}
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm font-mono"
                        />
                        {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content}</p>}
                    </div>

                    <div className="flex items-center space-x-3">
                        <button type="submit" disabled={processing} className="bg-blue-600 text-white px-4 py-2 rounded">
                            {processing ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Page'}
                        </button>

                        <a href={route('pages.index')} className="text-sm text-gray-600">Cancel</a>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

