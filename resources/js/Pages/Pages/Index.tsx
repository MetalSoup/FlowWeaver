import DashboardLayout from '@/Layouts/DashboardLayout';
import {Head, Link} from '@inertiajs/react';
import { PageProps } from '@/types';




export default function Dashboard({ auth, pages }: PageProps) {
    return (
        <DashboardLayout
            user={auth.user}
            header={<h1>Pages</h1>}
        >
            <Head title="Pages" />
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
                {pages.data.map((page) => (
                    <tr key={page.id}>
                        <td>{page.id}</td>
                        <td><Link href={route("pages.edit",page.id)} >{page.name}</Link></td>
                        <td>{page.slug}</td>
                        <td>{page.created_at}</td>
                        <td>{page.updated_at}</td>
                    </tr>
                ))}

                </tbody>

            </table>
            </div>

        </DashboardLayout>
    );
}
