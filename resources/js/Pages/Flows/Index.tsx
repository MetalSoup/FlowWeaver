import DashboardLayout from '@/Layouts/DashboardLayout';
import {Link} from "@inertiajs/react";
import {FlowProps} from "@/types";
import {Button} from "@headlessui/react";

export default function Flows({ auth, flows } :FlowProps) {
    return (
        <DashboardLayout
            user={auth.user}
            header={<h1>Flows</h1>}>
            <Link href={route('flows.create')} className="bg-gray-100 inline-block ">Create New Flow</Link>
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
                            Created At
                        </th>
                        <th className={"text-left"}>
                            Updated At
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {flows.data.map((flow) => (
                        <tr key={flow.id}>
                            <td>{flow.id}</td>
                            <td><Link href={route("flows.edit", flow.id)}>{flow.name}</Link></td>

                            <td>{flow.created_at}</td>
                            <td>{flow.updated_at}</td>
                        </tr>
                    ))}

                    </tbody>
                </table>

            </div>
        </DashboardLayout>
    );
}
