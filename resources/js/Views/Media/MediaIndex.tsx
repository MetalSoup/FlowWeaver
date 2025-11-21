import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { showAppToast } from '@/utils/toast';
import PrimaryButton from '@/Components/PrimaryButton';

export default function MediaIndex({ auth, images = [], files = [], onSelect = null }: { auth: any; images?: any[]; files?: any[]; onSelect?: ((m: any) => void) | null }) {
    const [tab, setTab] = useState<'images'|'files'>('images');
    const [preview, setPreview] = useState<any | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
        collection: 'files',
    });

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
        setData('file', f as any);
    };

    const submit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!data.file) {
            showAppToast('Please choose a file to upload');
            return;
        }

        post(route('media.store'), {
            onSuccess: () => {
                showAppToast('Upload successful');
                reset();
                // reload the page's props to fetch the new media list
                router.reload();
            },
            onError: () => {
                showAppToast('Upload failed');
            },
        });
    };

    const insertMedia = (m: any) => {
        // If an onSelect callback is provided (modal embedding), call it and return
        try {
            if (typeof onSelect === 'function') {
                onSelect(m);
                showAppToast('Inserted into editor');
                return;
            }
        } catch (e) {
            // ignore
        }

        // If the parent editor has a global handler, call it
        try {
            if (typeof (window as any).insertMedia === 'function') {
                (window as any).insertMedia(m);
                showAppToast('Inserted into editor');
                return;
            }
        } catch (e) {
            // ignore
        }

        // Fallback: postMessage to parent window or opener if opened as popup
        try {
            const target = (window as any).opener ?? window.parent ?? null;
            if (target && typeof target.postMessage === 'function') {
                target.postMessage({ type: 'media-selected', media: m }, '*');
                showAppToast('Inserted (postMessage)');
                return;
            }
        } catch (e) {
            // ignore
        }

        // Final fallback: copy URL to clipboard
        if (m && (m.public_url ?? m.url)) {
            try {
                navigator.clipboard.writeText((m.public_url ?? m.url) as string);
                showAppToast('URL copied to clipboard');
            } catch (e) {
                showAppToast('Could not insert media. URL: ' + ((m.public_url ?? m.url) ?? ''));
            }
        }
    };

    const displayUrl = (m: any) => (m.public_url ?? m.url ?? '');

    return (
        <DashboardLayout user={auth.user} header={<div className="flex justify-between items-center"><h1>Media</h1><Link href={route('media.index')} className="text-sm text-gray-500">Refresh</Link></div>}>
            <Head title="Media" />

            <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex space-x-2">
                        <button onClick={() => setTab('images')} className={`px-3 py-1 rounded ${tab === 'images' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'}`}>Images</button>
                        <button onClick={() => setTab('files')} className={`px-3 py-1 rounded ${tab === 'files' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'}`}>Files</button>
                    </div>

                    <form onSubmit={submit} className="flex items-center space-x-3">
                        <select className="border rounded px-2 py-1" value={data.collection} onChange={(e) => setData('collection', e.target.value)}>
                            <option value="files">Files</option>
                            <option value="images">Images</option>
                        </select>

                        <input type="file" onChange={onFileChange} className="border rounded px-2 py-1" />
                        <PrimaryButton type="submit" disabled={processing} className="ml-2">Upload</PrimaryButton>
                    </form>
                </div>

                {tab === 'images' && (
                    <div>
                        {images.length === 0 ? (
                            <div className="text-gray-500">No images yet.</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {images.map((m: any) => (
                                    <div key={m.id} className="bg-white dark:bg-gray-800 rounded shadow-sm overflow-hidden">
                                        <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                                            <img src={displayUrl(m)} alt={m.file_name} className="object-cover w-full h-full" />
                                        </div>
                                        <div className="p-2 flex items-center justify-between">
                                            <div className="text-sm truncate" title={m.file_name}>{m.file_name}</div>
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => setPreview(m)} className="text-sm text-gray-600 hover:text-gray-800">Preview</button>
                                                <button onClick={() => insertMedia(m)} className="text-sm text-indigo-600 hover:underline">Insert</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'files' && (
                    <div>
                        {files.length === 0 ? (
                            <div className="text-gray-500">No files yet.</div>
                        ) : (
                            <div className="space-y-3">
                                {files.map((f: any) => (
                                    <div key={f.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded text-gray-600">{f.mime_type?.split('/')?.[0] ?? 'file'}</div>
                                            <div className="text-sm truncate max-w-xs" title={f.file_name}>{f.file_name}</div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <a href={f.url} target="_blank" rel="noreferrer" className="text-sm text-gray-600 hover:underline">Open</a>
                                            <button onClick={() => insertMedia(f)} className="text-sm text-indigo-600 hover:underline">Insert</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Preview modal */}
                {preview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setPreview(null)}>
                        <div className="bg-white dark:bg-gray-900 rounded shadow-lg max-w-3xl w-full p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold">{preview.file_name}</h3>
                                <button onClick={() => setPreview(null)} className="text-gray-500">Close</button>
                            </div>
                            <div className="mt-3">
                                <img src={displayUrl(preview)} alt={preview.file_name} className="w-full h-auto" />
                            </div>
                            <div className="mt-3 flex justify-end">
                                <PrimaryButton onClick={() => insertMedia(preview)}>Insert</PrimaryButton>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
