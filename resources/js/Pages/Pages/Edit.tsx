import DashboardLayout from '@/Layouts/DashboardLayout';
import {Head} from '@inertiajs/react';
import CustomEditor from "@/Pages/Pages/Editor";
import {SinglePageProps} from "@/types";



export default function Dashboard({ auth, page } : SinglePageProps) {
    return (
        <DashboardLayout
            user={auth.user}
            header={<h1>Pages</h1>}
        >
            <Head title="Edit Page" />
            <div className={"p-5"}>
            <CustomEditor page={page}  auth={auth}/>

            </div>

        </DashboardLayout>
    );
}
