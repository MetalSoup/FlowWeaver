import DashboardLayout from "@/Layouts/DashboardLayout";
import {SingleInstanceProps} from "@/types";
import { Head } from "@inertiajs/react";
import {useState} from "react";
export default function InstanceEditor({auth, instance}: SingleInstanceProps) {
    const [name, setName] = useState(instance.name ? instance.name : "New Instance");
    const onChangeName = (event: any) => {
        setName(event.target.value);
    }
    return (
        <DashboardLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Instance - {name}</h2>}
        >
            <Head title={"Edit Instance - " + name}/>
            <div className={"flex flex-col md:flex-row h-full"}>

                <div className={"w-full h-full bg-gray-100 dark:bg-gray-800"}>
                    <div className={"p-5"}>
                        <div className={"mb-5"}>
                            <label className="block text-sm font-bold mb-1">Name</label>
                            <input onChange={onChangeName} type="text" className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" defaultValue={name}/>
                        </div>

                    </div>





                </div>
            </div>

        </DashboardLayout>
    );

}
