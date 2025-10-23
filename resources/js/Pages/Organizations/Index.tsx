import DashboardLayout from '@/Layouts/DashboardLayout';
import {Head, Link} from '@inertiajs/react';
import { PageProps } from '@/types';

export default function Dashboard({auth, instances}: {
    auth: any,
    instances: any
}) {
    console.log(instances);
    return (
        <DashboardLayout
            user={auth.user}
            header={<h1>Instances</h1>}
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
                            Created At
                        </th>
                        <th className={"text-left"}>
                            Updated At
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {instances.map((instance: any) => (
                        <tr key={instance.id}>
                            <td>{instance.id}</td>
                            <td><Link href={route("instances.edit", instance.id)}>{instance.name}</Link></td>
                            <td>{instance.description}</td>
                            <td>{instance.created_at}</td>
                            <td>{instance.updated_at}</td>
                        </tr>
                    ))}

                    </tbody>

                </table>
            </div>

        </DashboardLayout>
    );
}
