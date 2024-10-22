import DashboardLayout from '@/Layouts/DashboardLayout';
import {Link, router, useForm} from "@inertiajs/react";
import { useState } from 'react';

export default function Fields({ auth, fields }:{auth:any,fields:any}) {
    const { data, setData, post, reset, errors } = useForm({
        name: '',
        type: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('fields.store'), {
            name: data.name,
            type: data.type
            /*onSuccess: () => reset()*/
        });
    };

    return (
        <DashboardLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Fields</h2>}>
            <Link href={route('fields.create')} className="bg-gray-100 inline-block ">Create New Field</Link>
            <div className={"p-5"}>
                <form onSubmit={handleSubmit} className="mb-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        {errors.name && <div className="text-red-600">{errors.name}</div>}
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                        <input
                            type="text"
                            id="type"
                            value={data.type}
                            onChange={e => setData('type', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        {errors.type && <div className="text-red-600">{errors.type}</div>}
                    </div>
                    <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2">Add Field</button>
                </form>
                <table className={"w-full"}>
                    <thead>
                    <tr>
                        <th className={"text-left"}>
                            ID
                        </th>
                        <th className={"text-left"}>
                            Name
                        </th>
                        <th className={"text-left"}>
                            Created At
                        </th>
                        <th className={"text-left"}>
                            Updated At
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {fields.data.map((field : any) => (
                        <tr key={field.id}>
                            <td>{field.id}</td>
                            <td><Link href={route("fields.edit", field.id)}>{field.name}</Link></td>
                            <td>{field.created_at}</td>
                            <td>{field.updated_at}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}
