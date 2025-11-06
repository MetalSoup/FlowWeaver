import DashboardLayout from '@/Layouts/DashboardLayout';
import {Link} from "@inertiajs/react";
import {FlowProps} from "@/types";


export default function FlowIndex({ auth, flows } :FlowProps) {
    return (
        <DashboardLayout
            user={auth.user}
            header={<div className="flex justify-between items-center"><h1>Flows</h1><Link href={route('flows.create')} className="bg-blue-500 text-white py-1 px-3 rounded">Create Flow</Link></div>}
        >

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
                            <td><Link href={route("flows.edit", flow.id)}>{flow.name}</Link><Link href={route("flows.edit", flow.id)}>Edit</Link><Link href={route("flows.show", flow.id)}>View</Link></td>

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
