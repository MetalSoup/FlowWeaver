import DashboardLayout from "@/Layouts/DashboardLayout";
import {Head, router} from "@inertiajs/react";

export default function Select({auth, organizations}: {
    auth: any,
    organizations: any[]
}) {
    const onClick = (event:any) => {
        //use key as organization_id
        let organization_id = event.target.id;
        console.log(organization_id);




        router.post(route('organizations.storeSelection', {organization_id}));
    }
    return (
        <DashboardLayout
            user={auth.user}

            header={<h1>Select organization</h1>}
        >
            <Head title="Select organization" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">Select an organization to edit</div>
                        {organizations.map((organization) => (
                            <div onClick={onClick} key={organization.id} id={organization.id} className="p-6 text-gray-900">{organization.name}</div>
                        ),)}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
