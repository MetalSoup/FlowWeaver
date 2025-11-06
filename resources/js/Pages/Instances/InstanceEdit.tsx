import DashboardLayout from "@/Layouts/DashboardLayout";
// using `any` for the instance prop to keep the editor flexible
import { Head, router } from "@inertiajs/react";
import {useState} from "react";
export default function InstanceEdit({auth, instance}: { auth: any, instance: any }) {
    const [name, setName] = useState(instance.name ? instance.name : "");
    const [description, setDescription] = useState(instance.description ? instance.description : "");
    const onChangeName = (event: any) => {
        setName(event.target.value);
    }
    const onChangeDescription = (event: any) => {
        setDescription(event.target.value);
    }

    const onSave = () => {
        // if new instance (no id) create, otherwise update
        if (!instance.id) {
            router.post(route('instances.store'), { name, description });
        } else {
            router.put(route('instances.update', instance.id), { name, description });
        }
    }

    const onSelect = () => {
        // Post the instance id to the selection endpoint to set session('selected_instance')
        if (instance.id) {
            router.post(route('instances.storeSelection'), { instance_id: instance.id });
        }
    }

    return (
        <DashboardLayout
            user={auth.user}
            header={<h1>Edit Instance - {name || 'New Instance'}</h1>}
        >
            <Head title={"Edit Instance - " + (name || 'New Instance')}/>
            <div className={"flex flex-col md:flex-row h-full"}>

                <div className={"w-full h-full bg-gray-100 dark:bg-gray-800"}>
                    <div className={"p-5"}>
                        <div className={"mb-5"}>
                            <label className="block text-sm font-bold mb-1">Name</label>
                            <input onChange={onChangeName} type="text" className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" value={name}/>
                        </div>

                        <div className={"mb-5"}>
                            <label className="block text-sm font-bold mb-1">Description</label>
                            <textarea onChange={onChangeDescription} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" value={description} />
                        </div>

                        <div className={"mt-4"}>
                            <button onClick={onSave} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded">Save</button>
                            {instance.id && (
                                <button onClick={onSelect} className="ml-3 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Select this instance</button>
                            )}
                        </div>

                    </div>




                </div>
            </div>

        </DashboardLayout>
    );

}
