import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import DashboardLayout from "@/Layouts/DashboardLayout";

export default function Dashboard({ auth }: PageProps) {
    return (
        <DashboardLayout
            user={auth.user}
            header={<h1>Dashboard</h1>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">Dashboardy stuff goes here</div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
