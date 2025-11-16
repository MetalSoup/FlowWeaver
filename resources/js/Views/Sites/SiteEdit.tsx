import DashboardLayout from "@/Layouts/DashboardLayout";
// using `any` for the site prop to keep the editor flexible
import { Head, router } from "@inertiajs/react";
import {useState} from "react";
export default function SiteEdit({auth, site}: { auth: any, site: any }) {
    const [name, setName] = useState(site.name ? site.name : "");
    const [description, setDescription] = useState(site.description ? site.description : "");
    const onChangeName = (event: any) => {
        setName(event.target.value);
    }
    const onChangeDescription = (event: any) => {
        setDescription(event.target.value);
    }

    const onSave = () => {
        // if new site (no id) create, otherwise update
        if (!site.id) {
            router.post(route('sites.store'), { name, description });
        } else {
            router.put(route('sites.update', site.id), { name, description });
        }
    }

    const onSelect = () => {
        // Post the site id to the selection endpoint to set session('selected_site')
        if (site.id) {
            router.post(route('sites.storeSelection'), { site_id: site.id });
        }
    }

    return (
        <DashboardLayout
            user={auth.user}
            header={<h1>Edit Site - {name || 'New Site'}</h1>}
        >
            <Head title={"Edit Site - " + (name || 'New Site')}/>
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
                            {site.id && (
                                <button onClick={onSelect} className="ml-3 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Select this site</button>
                            )}
                        </div>

                    </div>




                </div>
            </div>

        </DashboardLayout>
    );

}
