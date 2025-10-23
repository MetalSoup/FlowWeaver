import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import {Head, Link, router, useForm} from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import SelectInput from "@/Components/SelectInput";
import React, {useEffect} from "react";

export default function Create({auth, selected_instance}: { auth: any; selected_instance?: number | null }) {
    const {data, setData, post, errors} = useForm({
        name: "",
        type: "text",
        label: "",
        instance_id: selected_instance ?? null,

    });

    // require instance selection
    useEffect(() => {
        if (!selected_instance) {
            router.get(route('instances.select'));
        }
    }, [selected_instance]);

    const generateSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '_') // Replace spaces with -
            .replace(/[^\w\-]+/g, '') // Remove all non-word chars
            .replace(/--+/g, '-') // Replace multiple - with single -
            ; // Trim - from end of text
    };

    const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setData("name", generateSlug(value));
    };

    const onChangeLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setData("label", value);

        // Generate name from label This doesn't work. It's either field name or label
        //setData("name", generateSlug(value));



    };

    const onSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        // ensure instance_id is present
        setData('instance_id', selected_instance ?? null);
        post(route("fields.store"));
    };

    return (
        <DashboardLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h1>
                        Create new Field
                    </h1>
                </div>
            }
        >
            <Head title="Fields"/>


            <form
                onSubmit={onSubmit}
                className={"p-5"}
            >
                <div className="mt-4">
                    <InputLabel htmlFor="field_name" value="Label"/>

                    <TextInput
                        id="label"
                        type="text"
                        name="label"
                        value={data.label}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={onChangeLabel}
                    />

                    <InputError message={errors.name} className="mt-2"/>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="field_name" value="Field Name"/>

                    <TextInput
                        id="field_name"
                        type="text"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={onChangeName}
                    />

                    <InputError message={errors.name} className="mt-2"/>
                </div>
                <div className="mt-4">
                    <InputLabel htmlFor="field_type" value="Field Type"/>

                    <SelectInput onChange={(e) => setData("type", e.target.value)}>

                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="tel">Telephone Number</option>
                        <option value="url">URL</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="radio">Radio</option>
                        <option value="select">Select</option>
                        <option value="textarea">Textarea</option>
                        <option value="hidden">Hidden</option>
                        <option value="number">Number</option>
                        <option value="color">Color</option>
                        <option value="date">Date</option>
                        <option value="datetime-local">Datetime-local</option>
                        <option value="file">File</option>
                        <option value="image">Image</option>
                        <option value="month">Month</option>
                        <option value="week">Week</option>
                        <option value="time">Time</option>
                        <option value="password">Password</option>
                        <option value="range">Range Slider</option>
                        <option value="reset">Reset</option>
                        <option value="search">Search</option>
                        <option value="button">Button</option>
                        <option value="submit">Submit</option>


                    </SelectInput>

                    <InputError message={errors.name} className="mt-2"/>
                </div>


                <div className="mt-4 text-right">
                    <Link
                        href={route("fields.index")}
                        className="bg-gray-100 py-1 px-3 text-gray-800 rounded shadow transition-all hover:bg-gray-200 mr-2"
                    >
                        Cancel
                    </Link>
                    <button
                        className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-600">
                        Submit
                    </button>
                </div>
            </form>


        </DashboardLayout>
    );
}
