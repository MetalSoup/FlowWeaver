import DashboardLayout from "@/Layouts/DashboardLayout";
import {Head, useForm} from "@inertiajs/react";
import { useState } from "react";
import PrimaryButton from "@/Components/PrimaryButton";
import InputError from "@/Components/InputError";

export default function EditField({auth, field}: {auth:any,field:any})
{



     /*{ field looks like this
    "id": 1,
    "name": "likes_dogies",
    "description": "Testing",
    "type": "checkbox",
    "status": "active",
    "site_id": 1,
    "created_at": "2025-10-25T07:10:17.000000Z",
    "updated_at": "2025-11-01T13:56:01.000000Z",
    "options": {
        "answers": [
            {
                "label": "Yes",
                "value": "yes"
            },
            {
                "label": "No",
                "value": "no"
            }
        ]
    },
    "label": "Do you like dogs"
}*/


    const {data, setData, put, errors} = useForm({
        name: field.name || "",
        type: field.type || "text",
        label: field.label || "",
        description: field.description || "",
        options: field.options || {},
        _method: 'PUT'
    });

    const [nameClientError, setNameClientError] = useState<string | null>(null);

    const generateSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '_') // Replace spaces with _
            .replace(/[^A-Za-z0-9_-]+/g, '') // Remove all chars except letters, numbers, underscore, hyphen
            .replace(/__+/g, '_') // collapse multiple underscores
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const validateNameClient = (value: string) => {
        if (!value) return 'Name is required.';
        const re = /^[A-Za-z][A-Za-z0-9_-]*$/;
        if (!re.test(value)) {
            return 'Name must start with a letter and contain only letters, numbers, underscores, or hyphens.';
        }
        return null;
    };

    const onChangeName = (e: { target: { value: any; }; }) => {
        const slug = generateSlug(e.target.value);
        setData('name', slug);
        const clientErr = validateNameClient(slug);
        setNameClientError(clientErr);
    }

    const onChangeLabel = (e: { target: { value: any; }; }) => {
        setData('label', e.target.value);
    }
    const onChangeType = (e: { target: { value: any; }; }) => {
        setData('type', e.target.value);
    }

    const setDescription = (value: string) => {
        setData('description', value);
    }
    const onSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        // Prevent submit if client-side validation fails
        const clientErr = validateNameClient(data.name);
        setNameClientError(clientErr);
        if (clientErr) return;
        put(route("fields.update", field.id));
    }

    // Drag-and-drop handlers
    const onDragStart = (e: any, index: number) => {
        e.dataTransfer.setData('text/plain', String(index));
        // For Firefox
        e.dataTransfer.effectAllowed = 'move';
    }
    const onDragOver = (e: any) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    const onDrop = (e: any, dropIndex: number) => {
        e.preventDefault();
        const dragIndex = Number(e.dataTransfer.getData('text/plain'));
        if (isNaN(dragIndex)) return;
        if (!data.options || !data.options.answers) return;
        const newAnswers = [...data.options.answers];
        const [moved] = newAnswers.splice(dragIndex, 1);
        newAnswers.splice(dropIndex, 0, moved);
        setData("options",{ ...data.options, answers: newAnswers });
    }

    const addAnswer = () => {
        const newAnswers = data.options && data.options.answers ? [...data.options.answers] : [];
        newAnswers.push({ label: '', value: '', selected: false });
        setData("options",{ ...data.options, answers: newAnswers });

    };

    const updateAnswerLabel = (index: number, label: string) => {
        const newAnswers = [...(data.options.answers || [])];
        newAnswers[index] = { ...newAnswers[index], label };
        setData("options",{ ...data.options, answers: newAnswers });
    };

    const updateAnswerValue = (index: number, value: string) => {
        const newAnswers = [...(data.options.answers || [])];
        newAnswers[index] = { ...newAnswers[index], value };
        setData("options",{ ...data.options, answers: newAnswers });
    };

    const toggleAnswerSelected = (index: number) => {
        const newAnswers = [...(data.options.answers || [])];
        newAnswers[index] = { ...newAnswers[index], selected: !newAnswers[index].selected };
        setData("options",{ ...data.options, answers: newAnswers });
    };

    const removeAnswer = (index: number) => {
        const newAnswers = [...(data.options.answers || [])];
        newAnswers.splice(index, 1);
        setData("options",{ ...data.options, answers: newAnswers });
    };




    return (
        <DashboardLayout
            user={auth.user}
            header={<h1>Edit Field</h1>}>
            <Head title={"Edit Field"}></Head>
            <div className={"p-5"}>
                <form onSubmit={onSubmit} className={"w-full"}>

                    <div className={"mb-4"}>
                        <label htmlFor="name" className={"block mb-2"}>Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={data.name}
                            onChange={onChangeName}
                            className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}
                        />
                        {/* show server error first, then client error if present */}
                        <InputError message={errors.name ?? nameClientError} className="mt-2" />
                    </div>
                    <div className={"mb-4"}>
                        <label htmlFor="label" className={"block mb-2"}>Default Label</label>
                        <input
                            type="text"
                            name="label"
                            id="label"
                            value={data.label}
                            onChange={onChangeLabel}
                            className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}
                        />
                    </div>
                    <div className={"mb-4"}>
                        <label htmlFor="description" className={"block  mb-2"}>Description</label>
                        <textarea
                            name="description"
                            id="description"
                            value={data.description}
                            onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
                            className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}
                        />
                    </div>
                    <div className={"mb-4"}>
                        <label htmlFor="type" className={"block  mb-2"}>Type</label>
                        <select name="type" onChange={onChangeType} value={data.type} className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}>
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="tel">Telephone</option>
                            <option value="url">URL</option>
                            <option value="date">Date</option>
                            <option value="datetime">Date</option>
                            <option value="number">Number</option>
                            <option value="radio">Radio</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="select">Select</option>
                            <option value="textarea">Textarea</option>
                            <option value="hidden">Hidden</option>

                        </select>



                    </div>
                    {(data.type === "radio" || data.type === "checkbox" || data.type === "select") && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold">Answers</h3>
                                <button type="button" onClick={addAnswer} className="bg-white border rounded px-3 py-1 text-sm">+ Answer</button>
                            </div>

                            {data.options && data.options.answers && data.options.answers.length > 0 ? (
                                <div className="space-y-2">
                                    {data.options.answers.map((option: any, index: number) => (
                                        <div
                                            key={index}
                                            draggable
                                            onDragStart={(e) => onDragStart(e, index)}
                                            onDragOver={onDragOver}
                                            onDrop={(e) => onDrop(e, index)}
                                            className="flex items-center gap-3 border rounded p-2">
                                            <div className="cursor-move px-2 text-gray-600">≡</div>
                                            <input
                                                type="text"
                                                name={`option_label_${index}`}
                                                value={option.label}
                                                onChange={(e) => updateAnswerLabel(index, e.target.value)}
                                                placeholder="Label"
                                                className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                                            />
                                            <input
                                                type="text"
                                                name={`option_value_${index}`}
                                                value={option.value}
                                                onChange={(e) => updateAnswerValue(index, e.target.value)}
                                                placeholder="Value"
                                                className="w-48 shadow appearance-none border rounded py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                                            />
                                            <label className="flex items-center gap-2 text-sm">
                                                <span className="text-sm">Selected:</span>
                                                <input type="checkbox" checked={!!option.selected} onChange={() => toggleAnswerSelected(index)} />
                                            </label>
                                            <button type="button" onClick={() => removeAnswer(index)} className="text-red-600 px-2">×</button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600">No options available. Please add options.</p>
                            )}

                        </div>
                    )}



                    <div className={"mb-4"}>
                        <PrimaryButton type="submit" disabled={!!(errors.name || nameClientError)}>Submit</PrimaryButton>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
