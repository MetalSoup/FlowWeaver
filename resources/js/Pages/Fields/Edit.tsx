import DashboardLayout from "@/Layouts/DashboardLayout";
import {router} from "@inertiajs/react";
import { useState } from "react";

export default function EditField({auth, field}: {auth:any,field:any})
{
    const [name , setName] = useState(field.name);
    const [type , setType] = useState(field.type);

    const onChangeName = (e: { target: { value: any; }; }) => {
        setName(e.target.value);
    }
    const onChangeType = (e: { target: { value: any; }; }) => {
        setType(e.target.value);
    }
    const onSubmit = (e: { preventDefault: () => void; }) => {
    /*    e.preventDefault();
        router.put(route('fields.update', { field: field.id }), {name: name, type: type});*/
    }
    console.log(field.id);



    return (
        <DashboardLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Field</h2>}>
            <div className={"p-5"}>
                <form onSubmit={onSubmit} className={"w-full"}>
                    <input type="hidden" name="_method" value="PUT" />
                    <div className={"mb-4"}>
                        <label htmlFor="name" className={"block text-gray-700 text-sm font-bold mb-2"}>Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={name}
                            onChange={onChangeName}
                            className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}
                        />
                    </div>
                    <div className={"mb-4"}>
                        <label htmlFor="type" className={"block text-gray-700 text-sm font-bold mb-2"}>Type</label>
                        <input
                            type="text"
                            name="type"
                            id="type"
                            value={type}
                            onChange={onChangeType}
                            className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}
                        />

                    </div>


                    <div className={"mb-4"}>
                        <button type="submit" className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"}>Submit</button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
