import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import {Head, Link, useForm} from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import SelectInput from "@/Components/SelectInput";

export default function Create({auth}: { auth: any; }) {
    const {data, setData, post, errors, reset} = useForm({
        name: "",
        type: "text"
    });

    const onSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        post(route("fields.store"));
    };

    return (
        <DashboardLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Create new Field
                    </h2>
                </div>
            }
        >
            <Head title="Fields"/>


            <form
                onSubmit={onSubmit}
                className={"p-5"}
            >

                <div className="mt-4">
                    <InputLabel htmlFor="field_name" value="Field Name"/>

                    <TextInput
                        id="field_name"
                        type="text"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={(e) => setData("name", e.target.value)}
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
