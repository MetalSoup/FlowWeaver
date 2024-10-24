import DashboardLayout from '@/Layouts/DashboardLayout';
import {Link, router, useForm} from "@inertiajs/react";
import { useState } from 'react';

export default function Fields({ auth, fields }:{auth:any,fields:any}) {
    const { data, setData, post, reset, errors } = useForm({
        name: '',
        type: ''
    });



    return (
        <DashboardLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Fields</h2>}>
            <Link href={route('fields.create')} className="bg-gray-100 inline-block ">Create New Field</Link>
            <div className={"p-5"}>

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
                            Type
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
                            <td>{field.type}</td>
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
