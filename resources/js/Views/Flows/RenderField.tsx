import React from "react";

export default function RenderField({field, formValues = {}, setFormValues}: any)  {

    const updateField = (name: string, value: any) => {
        setFormValues((prev: any) => {
            return {...(prev || {}), [name]: value};
        });
    };

    const normalizeOptions = (opts: any) => {
        if (!opts) return [];
        if (!Array.isArray(opts)) return [];
        return opts.map((o: any) => {
            if (typeof o === "string") return { value: o, label: o };
            if (o && typeof o === "object") return { value: o.value ?? o.id ?? o.label ?? "", label: o.label ?? o.value ?? o.id ?? "" };
            return { value: String(o), label: String(o) };
        });
    };


    const inputType = field.type === "default" ? "text" : field.type;
    const options = normalizeOptions(field.answers);
    // support either `field_id` or `id` depending on source
    const fid = field.field_id ?? field.id;
    const name = field.name ?? `field_${fid}`;

    switch (inputType) {
        case "textarea":
            return (
                <div key={fid} className="mb-2">
                    <label htmlFor={name} className="block mb-1">{field.label}</label>
                    <textarea id={name} name={name} className="w-full border rounded p-2" value={formValues[name] ?? ''} onChange={(e) => updateField(name, e.target.value)} />
                </div>
            );
        case "select":
            return (
                <div key={fid} className="mb-2">
                    <label htmlFor={name} className="block mb-1">{field.label}</label>
                    <select id={name} name={name} className="w-full border rounded p-2" value={formValues[name] ?? ''} onChange={(e) => updateField(name, e.target.value)}>
                        <option value="">-- select --</option>
                        {options.map((opt: any) => (
                            <option key={opt.value} value={opt.value} dangerouslySetInnerHTML={{ __html: opt.label || '' }}></option>
                        ))}
                    </select>
                </div>
            );
        case "radio":
            return (
                <div key={fid} className="mb-2">
                    <div className="block mb-1 font-medium">{field.label}</div>
                    <div className="flex flex-col">
                        {(options.length > 0 ? options : [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]).map((opt: any, idx: number) => (
                            <label key={opt.value + idx} className="inline-flex items-center space-x-2">
                                <input type="radio" name={name} value={opt.value} checked={formValues[name] === opt.value} onChange={(e) => updateField(name, e.target.value)} />
                                <div dangerouslySetInnerHTML={{ __html: opt.label || '' }}></div>
                            </label>
                        ))}
                    </div>
                </div>
            );
        case "checkbox":
            return (
                <div key={fid} className="mb-2">
                    <div className="block mb-1 font-medium">{field.label}</div>
                    <div className="flex flex-col">
                        {(options.length > 0 ? options : [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]).map((opt: any, idx: number) => {
                            // Normalize current value to an array so we can support multiple selections.
                            const current = formValues[name];
                            const selected: any[] = Array.isArray(current) ? current : (current ? [current] : []);
                            const checked = selected.includes(opt.value);

                            const toggle = () => {
                                let next: any[];
                                if (checked) {
                                    next = selected.filter((v) => v !== opt.value);
                                } else {
                                    next = [...selected, opt.value];
                                }
                                updateField(name, next);
                            };

                            return (
                                <label key={opt.value + idx} className="inline-flex items-center space-x-2">
                                    <input type="checkbox" name={name} value={opt.value} checked={checked} onChange={toggle} />
                                    <div dangerouslySetInnerHTML={{ __html: opt.label || '' }}></div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            );
        default:
            const htmlType = ["text", "email", "tel", "number", "password", "date"].includes(inputType) ? inputType : "text";
            return (
                <div key={fid} className="mb-2">
                    <label htmlFor={name} className="block mb-1" dangerouslySetInnerHTML={{ __html: field.label || '' }}></label>
                    <input id={name} name={name} type={htmlType} className="w-full border rounded p-2" autoComplete="on" value={formValues[name] ?? ''} onChange={(e) => updateField(name, e.target.value)} />
                </div>
            );
    }
 };
