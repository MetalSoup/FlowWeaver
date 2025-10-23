import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Dashboard({auth, instances = []}: {
    auth: any,
    instances?: any
}) {
    console.log(instances);
    const onSelect = (id: number) => {
        // POST the instance_id to the server to set session selected_instance
        router.post(route('instances.storeSelection'), { instance_id: id });
    }
    return (
        <DashboardLayout
            user={auth.user}
            header={<div className="flex justify-between items-center"><h1>Instances</h1><Link href={route('instances.create')} className="bg-blue-500 text-white py-1 px-3 rounded">Create Instance</Link></div>}
        >
            <Head title="Instances"/>


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
                            Slug
                        </th>
                        <th className={"text-left"}>
                            Actions
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
                    {instances && instances.length ? instances.map((instance: any) => (
                        <tr key={instance.id}>
                            <td>{instance.id}</td>
                            <td><Link href={route("instances.edit", instance.id)}>{instance.name}</Link></td>
                            <td>{instance.description}</td>
                            <td>
                                <button onClick={() => onSelect(instance.id)} className="bg-green-500 text-white py-1 px-2 rounded">Select</button>
                            </td>
                            <td>{instance.created_at}</td>
                            <td>{instance.updated_at}</td>
                        </tr>
                    )) : (
                        <tr><td colSpan={6} className="p-6 text-gray-900">No instances found.</td></tr>
                    )}

                    </tbody>

                </table>
            </div>

        </DashboardLayout>
    );
}
