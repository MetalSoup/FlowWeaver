import React, { useEffect, useState } from "react";

export default function RenderField({field, formValues = {}, setFormValues, pageOverrides = {}, onSelectField, isEditorEnabled = false, selectedFieldId}: any)  {
    const [validationError, setValidationError] = useState<string | null>(null);

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

    // apply per-page overrides if present; also support global defaults stored under __defaults
    const overrides = (pageOverrides && pageOverrides[fid]) || {};
    const defaults = (pageOverrides && pageOverrides.__defaults) || {};
    const labelToRender = (overrides && typeof overrides.label !== 'undefined' && overrides.label !== '') ? overrides.label : (field.label ?? '');
    const displayMode = overrides.display || null; // 'buttons' or null
    const optionLabelOverrides = (overrides.options) || {};
    const optionStyle = overrides.optionStyle || 'default';
    const labelPosition = overrides.labelPosition || 'top';
    const placeholderText = overrides.placeholder ?? '';
    const defaultValue = overrides.defaultValue ?? null;
    const required = overrides.required === true;
    const regex = overrides.regex ?? '';

    // Use explicit default class names only (don't attempt to compose class strings from concrete values)
    const defaultContainerComposed = defaults.containerClass ?? '';
    const defaultLabelComposed = defaults.labelClass ?? '';
    const defaultInputComposed = defaults.inputClass ?? '';

    // Merge classes: global defaults first (explicit), then per-field overrides (per-field takes precedence)
    const mergedContainerClass = `${defaultContainerComposed || ''} ${overrides.containerClass ?? ''}`.trim();
    const mergedLabelClass = `${defaultLabelComposed || ''} ${overrides.labelClass ?? ''}`.trim();
    const mergedInputClass = `${defaultInputComposed || ''} ${overrides.inputClass ?? ''}`.trim();

    const renderOptionLabel = (opt: any) => {
        const raw = optionLabelOverrides[opt.value];
        return raw != null && raw !== '' ? raw : opt.label;
    };

    // initialize default value if provided and formValues does not contain a value yet
    useEffect(() => {
        const nameKey = name;
        if ((formValues[nameKey] === undefined || formValues[nameKey] === null || formValues[nameKey] === '') && defaultValue != null && defaultValue !== '') {
            setFormValues((prev: any) => ({ ...(prev || {}), [nameKey]: defaultValue }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // validate a value against regex if present; accept /pattern/flags syntax
    const validateValue = (val: any) => {
        if (!regex || typeof val !== 'string') { setValidationError(null); return true; }
        try {
            let pattern = regex;
            let flags = '';
            if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
                const last = pattern.lastIndexOf('/');
                flags = pattern.slice(last + 1);
                pattern = pattern.slice(1, last);
            }
            const re = new RegExp(pattern, flags);
            const ok = re.test(val);
            setValidationError(ok ? null : 'Value does not match required format');
            return ok;
        } catch (e) {
            // invalid regex - do not block input but show error
            setValidationError('Invalid regex');
            return false;
        }
    };

    // compute container classes to show hover and selected state
    const fidKey = String(field.field_id ?? field.id ?? '');
    const isSelected = selectedFieldId != null && String(selectedFieldId) === fidKey;
    const containerBase = "mb-2 p-2 rounded";
    const editorCursor = isEditorEnabled ? ' cursor-pointer' : '';
    const hoverStyle = isEditorEnabled ? ' hover:border-blue-400 hover:shadow-sm' : '';
    const selectedStyle = isEditorEnabled && isSelected ? ' border-2 border-blue-500 bg-blue-50' : ' border border-transparent';
    // add group/relative to support hover overlay
    const containerClass = `group relative ${containerBase}${editorCursor}${hoverStyle}${selectedStyle} ${mergedContainerClass}`.trim();

    // build inline style objects from concrete defaults and per-field overrides
    const containerStyle: any = {};
    const labelStyle: any = {};
    const inputStyle: any = {};

    // container style values (prefer per-field overrides, fallback to defaults)
    const cBg = overrides.containerBgColor ?? defaults.containerBgColor;
    if (cBg) containerStyle.backgroundColor = cBg;
    const cBw = overrides.containerBorderWidth ?? defaults.containerBorderWidth;
    if (cBw) containerStyle.borderWidth = cBw;
    const cBc = overrides.containerBorderColor ?? defaults.containerBorderColor;
    if (cBc) containerStyle.borderColor = cBc;
    const cBs = overrides.containerBorderStyle ?? defaults.containerBorderStyle;
    if (cBs) containerStyle.borderStyle = cBs;
    const cPad = overrides.containerPadding ?? defaults.containerPadding;
    if (cPad) containerStyle.padding = cPad;
    const cMar = overrides.containerMargin ?? defaults.containerMargin;
    if (cMar) containerStyle.margin = cMar;
    const cShadow = overrides.containerBoxShadow ?? defaults.containerBoxShadow;
    if (cShadow) containerStyle.boxShadow = cShadow;
    const cBradius = overrides.containerBorderRadius ?? defaults.containerBorderRadius;
    if (cBradius) containerStyle.borderRadius = cBradius;

    // label style
    const lColor = overrides.labelColor ?? defaults.labelColor;
    if (lColor) labelStyle.color = lColor;
    const lFs = overrides.labelFontSize ?? defaults.labelFontSize;
    if (lFs) labelStyle.fontSize = lFs;
    const lMb = overrides.labelMarginBottom ?? defaults.labelMarginBottom;
    if (lMb) labelStyle.marginBottom = lMb;

    // input style
    const iBg = overrides.inputBgColor ?? defaults.inputBgColor;
    if (iBg) inputStyle.backgroundColor = iBg;
    const iBc = overrides.inputBorderColor ?? defaults.inputBorderColor;
    if (iBc) inputStyle.borderColor = iBc;
    const iPad = overrides.inputPadding ?? defaults.inputPadding;
    if (iPad) inputStyle.padding = iPad;
    const iText = overrides.inputText ?? defaults.inputText;
    if (iText) inputStyle.color = iText;

    // input base class - fall back to a reasonable default if nothing specified
    const inputBaseClass = `${mergedInputClass || 'w-full border rounded p-2'}`.trim();

    // When the editor is enabled, clicking the field container should select the field.
    // We avoid selecting when the user clicked an interactive control (input/select/textarea/button/a/label)
    // so normal form interaction still works when not in editor mode. This mirrors how components
    // are selected in the editor (click-to-select).
    const handleContainerClick = (e: React.MouseEvent) => {
        if (!isEditorEnabled || typeof onSelectField !== 'function') return;
        try {
            const tgt = (e.target as HTMLElement) || null;
            // If the click originated on an interactive element, don't treat it as a select action.
            if (tgt && typeof tgt.closest === 'function') {
                const interactive = tgt.closest('input,select,textarea,button,a,label');
                if (interactive) return;
            }
            e.stopPropagation();
            // Call the onSelectField callback with the canonical field id
            onSelectField(fid);
        } catch (err) {
            // ignore
        }
    };

    switch (inputType) {
        case "textarea":
            // layout variations: left label or top
            if (labelPosition === 'left') {
                return (
                    <div key={fid} className={containerClass} style={containerStyle} data-flow-field-id={fid}>
                        <div className="flex items-start">
                            <div className={`w-1/3 pr-3 pt-2 ${mergedLabelClass}`.trim()}>{labelToRender}{required ? ' *' : ''}</div>
                            <div className="flex-1">
                                <textarea id={name} name={name} className={inputBaseClass} style={inputStyle} placeholder={labelPosition === 'inside' ? (placeholderText || labelToRender || '') : ''} value={formValues[name] ?? ''} required={required} onChange={(e) => { updateField(name, e.target.value); validateValue(e.target.value); }} />
                                {validationError ? <div className="text-xs text-red-600 mt-1">{validationError}</div> : null}
                            </div>
                        </div>
                    </div>
                );
            }
            return (
                <div key={fid} className={containerClass} style={containerStyle} data-flow-field-id={fid} onClick={handleContainerClick}>
                     {labelPosition !== 'none' && labelPosition !== 'inside' && <label htmlFor={name} className={`block mb-1 ${mergedLabelClass}`.trim()} style={labelStyle}>{labelToRender}{required ? ' *' : ''}</label>}
                     <textarea id={name} name={name} className={inputBaseClass} style={inputStyle} placeholder={labelPosition === 'inside' ? (placeholderText || labelToRender || '') : ''} value={formValues[name] ?? ''} required={required} onChange={(e) => { updateField(name, e.target.value); validateValue(e.target.value); }} />
                     {validationError ? <div className="text-xs text-red-600 mt-1">{validationError}</div> : null}
                 </div>
             );
        case "select":
            if (labelPosition === 'left') {
                return (
                    <div key={fid} className={containerClass} style={containerStyle} data-flow-field-id={fid}>
                        <div className="flex items-center">
                            <div className="w-1/3 pr-3">{labelToRender}{required ? ' *' : ''}</div>
                            <div className="flex-1">
                                <select id={name} name={name} className={inputBaseClass} value={formValues[name] ?? ''} required={required} onChange={(e) => updateField(name, e.target.value)}>
                                    <option value="">-- select --</option>
                                    {options.map((opt: any) => (
                                        <option key={opt.value} value={opt.value} dangerouslySetInnerHTML={{ __html: renderOptionLabel(opt) || '' }}></option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                );
            }
            return (
                <div key={fid} className={containerClass} style={containerStyle} data-flow-field-id={fid} onClick={handleContainerClick}>
                     {labelPosition !== 'none' && labelPosition !== 'inside' && <label htmlFor={name} className={`block mb-1 ${mergedLabelClass}`.trim()} style={labelStyle}>{labelToRender}{required ? ' *' : ''}</label>}
                     <select id={name} name={name} className={inputBaseClass} value={formValues[name] ?? ''} required={required} onChange={(e) => updateField(name, e.target.value)}>
                         <option value="">-- select --</option>
                         {options.map((opt: any) => (
                             <option key={opt.value} value={opt.value} dangerouslySetInnerHTML={{ __html: renderOptionLabel(opt) || '' }}></option>
                         ))}
                     </select>
                 </div>
             );
        case "radio":
            // if displayMode === 'buttons', render as buttons
            if (displayMode === 'buttons') {
                const current = formValues[name];
                return (
                    <div key={fid} className={containerClass} style={containerStyle} data-flow-field-id={fid}>
                         <div className="block mb-1 font-medium" style={labelStyle}>{labelToRender}{required ? ' *' : ''}</div>
                         <div className="flex flex-wrap gap-2">
                            {(options.length > 0 ? options : [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]).map((opt: any, idx: number) => (
                                <button
                                    key={opt.value + idx}
                                    type="button"
                                    className={`px-3 py-1 rounded ${optionStyle === 'pill' ? 'rounded-full' : ''} ${current === opt.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'}`}
                                    onClick={() => updateField(name, opt.value)}
                                    dangerouslySetInnerHTML={{ __html: renderOptionLabel(opt) || '' }}
                                />
                            ))}
                         </div>
                     </div>
                 );
             }

            return (
                <div key={fid} className={containerClass} style={containerStyle} data-flow-field-id={fid} onClick={handleContainerClick}>
                     {labelPosition !== 'inside' && labelPosition !== 'none' ? (
                     <div className={`block mb-1 font-medium ${mergedLabelClass}`.trim()} style={labelStyle}>{labelToRender}{required ? ' *' : ''}</div>
                     ) : null}
                     <div className="flex flex-col">
                        {(options.length > 0 ? options : [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]).map((opt: any, idx: number) => (
                            <label key={opt.value + idx} className="inline-flex items-center space-x-2">
                                <input type="radio" name={name} value={opt.value} checked={formValues[name] === opt.value} onChange={(e) => updateField(name, e.target.value)} required={required} />
                                <div dangerouslySetInnerHTML={{ __html: renderOptionLabel(opt) || '' }}></div>
                            </label>
                        ))}
                    </div>
                </div>
            );
        case "checkbox":
            // buttons display for checkboxes (treat as toggle buttons multiple select)
            if (displayMode === 'buttons') {
                const current = formValues[name];
                const selectedArr: any[] = Array.isArray(current) ? current : (current ? [current] : []);
                const toggle = (val: any) => {
                    let next: any[];
                    if (selectedArr.includes(val)) next = selectedArr.filter((v) => v !== val);
                    else next = [...selectedArr, val];
                    updateField(name, next);
                };
                return (
                    <div key={fid} className={containerClass} style={containerStyle} data-flow-field-id={fid}>
                        <div className="block mb-1 font-medium">{labelToRender}{required ? ' *' : ''}</div>
                        <div className="flex flex-wrap gap-2">
                            {(options.length > 0 ? options : [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]).map((opt: any, idx: number) => {
                                const checked = selectedArr.includes(opt.value);
                                return (
                                    <button
                                        key={opt.value + idx}
                                        type="button"
                                        className={`px-3 py-1 rounded ${optionStyle === 'pill' ? 'rounded-full' : ''} ${checked ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'}`}
                                        onClick={() => toggle(opt.value)}
                                        dangerouslySetInnerHTML={{ __html: renderOptionLabel(opt) || '' }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                );
            }

            return (
                <div key={fid} className={containerClass} style={containerStyle} data-flow-field-id={fid} onClick={handleContainerClick}>
                     {labelPosition !== 'inside' && labelPosition !== 'none' ? (
                     <div className={`block mb-1 font-medium ${mergedLabelClass}`.trim()} style={labelStyle}>{labelToRender}{required ? ' *' : ''}</div>
                     ) : null}
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
                                    <input type="checkbox" name={name} value={opt.value} checked={checked} onChange={() => toggle()} required={required} />
                                    <div dangerouslySetInnerHTML={{ __html: renderOptionLabel(opt) || '' }}></div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            );
        default:
            const htmlType = ["text", "email", "tel", "number", "password", "date"].includes(inputType) ? inputType : "text";
            // special-case 'html' field type: render raw HTML block
            if (inputType === 'html') {
                return (
                    <div key={fid} className={containerClass} style={containerStyle} data-flow-field-id={fid} onClick={handleContainerClick}>
                         <div dangerouslySetInnerHTML={{ __html: field.html || '' }} />
                    </div>
                );
            }

            // handle normal input types with label positioning and validation
            if (labelPosition === 'left') {
                return (
                    <div key={fid} className={containerClass} style={containerStyle} data-flow-field-id={fid}>
                        <div className="flex items-center">
                            <div className="w-1/3 pr-3">{labelToRender}{required ? ' *' : ''}</div>
                            <div className="flex-1">
                                <input id={name} name={name} type={htmlType} className={inputBaseClass} style={inputStyle} autoComplete="on" value={formValues[name] ?? ''} placeholder={labelPosition === 'inside' ? (placeholderText || labelToRender || '') : ''} required={required} pattern={regex || undefined} onChange={(e) => { updateField(name, e.target.value); validateValue(e.target.value); }} />
                                {validationError ? <div className="text-xs text-red-600 mt-1">{validationError}</div> : null}
                            </div>
                        </div>
                    </div>
                );
            }

             return (
                <div key={fid} className={containerClass} style={containerStyle} data-flow-field-id={fid} onClick={handleContainerClick}>
                     {labelPosition !== 'none' && labelPosition !== 'inside' && <label htmlFor={name} className={`block mb-1 ${mergedLabelClass}`.trim()} style={labelStyle} dangerouslySetInnerHTML={{ __html: labelToRender || '' }}></label>}
                     <input id={name} name={name} type={htmlType} className={inputBaseClass} style={inputStyle} autoComplete="on" value={formValues[name] ?? ''} placeholder={labelPosition === 'inside' ? (placeholderText || labelToRender || '') : ''} required={required} pattern={regex || undefined} onChange={(e) => { updateField(name, e.target.value); validateValue(e.target.value); }} />
                     {validationError ? <div className="text-xs text-red-600 mt-1">{validationError}</div> : null}
                 </div>
             );
     }

 }
