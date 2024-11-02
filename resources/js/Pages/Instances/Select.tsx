import DashboardLayout from "@/Layouts/DashboardLayout";
import {Head, router} from "@inertiajs/react";

export default function Select({auth, instances}: {
    auth: any,
    instances: any[]
}) {
    const onClick = (event:any) => {
        //use key as instance_id
        let instance_id = event.target.id;
        console.log(instance_id);




        router.post(route('instances.storeSelection', {instance_id}));
    }
    return (
        <DashboardLayout
            user={auth.user}

            header={<h1>Select Instance</h1>}
        >
            <Head title="Select Instance" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">Select an instance to edit</div>
                        {instances.map((instance) => (
                            <div onClick={onClick} key={instance.id} id={instance.id} className="p-6 text-gray-900">{instance.name}</div>
                        ),)}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
