import DashboardLayout from '@/Layouts/DashboardLayout';
import {Head} from '@inertiajs/react';
import CustomEditor from "@/Pages/Pages/Editor";
import {SinglePageProps} from "@/types";



export default function Dashboard({ auth, page } : SinglePageProps) {
    return (
        <DashboardLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Pages</h2>}
        >
            <Head title="Edit Page" />
            <div className={"p-5"}>
            <CustomEditor page={page}  auth={auth}/>

            </div>

        </DashboardLayout>
    );
}
