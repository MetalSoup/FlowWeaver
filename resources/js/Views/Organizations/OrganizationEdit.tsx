import DashboardLayout from "@/Layouts/DashboardLayout";
import {Head, router} from "@inertiajs/react";
import {useState} from "react";

export default function OrganizationEditor({auth, organization}: any) {
    const [name, setName] = useState(organization.name ? organization.name : "");
    const onChangeName = (event: any) => {
        setName(event.target.value);
    }

    const onSave = () => {
        //if it's a new organization, create it, otherwise update it
        if (!organization.id) {
            router.post(route('organizations.store'), {name: name});
        } else {
            router.put(route('organizations.update', organization.id), {name: name});
        }
    }

    return (
        <DashboardLayout
            user={auth.user}


            header={<h1>Edit Organization - {name && name}</h1> }
        >
            <Head title={"Edit Organization - " + name}/>
            <div className={"flex flex-col md:flex-row h-full"}>

                <div className={"w-full h-full bg-gray-100 dark:bg-gray-800"}>
                    <div className={"p-5"}>
                        <div className={"mb-5"}>
                            <label className="block text-sm font-bold mb-1">Name</label>
                            <input onChange={onChangeName} type="text"
                                   className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                   defaultValue={name}/>
                        </div>
                        {/* submit button*/}
                        <button onClick={onSave}
                                className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"}>Save
                        </button>

                    </div>


                </div>
            </div>

        </DashboardLayout>
    );

}

