import React, {useState, useEffect, useRef} from 'react';
import {ToolbarSection, ToolbarItem} from '../../editor';
import {usePage} from '@inertiajs/react';
import {useNode} from '@craftjs/core';
import {SpacingControl} from "@/Views/Pages/Components/SpacingControl";
import {BoxShadowControl} from "@/Views/Pages/Components/BoxShadowControl";
import {BorderControl} from "@/Views/Pages/Components/BorderControl";
import ColorInput from '@/Views/Pages/Components/ColorInput';
import Select from "@/Components/Select";

export const FlowSettings = () => {
    // Read flows provided as page props so we can render them in a dropdown
    const {props: pageProps}: any = usePage();
    const flows: any[] = pageProps?.flows ?? pageProps?.flows?.data ?? [];

    // read and write craft node props for this selector
    const {
        actions: {setProp},
        flow_id: selectedFlowId,
        field_id: selectedFieldId,
        field_overrides: fieldOverrides,
    }: any = useNode((node: any) => ({
        flow_id: node.data.props.flow_id,
        field_id: node.data.props.field_id,
        field_overrides: node.data.props.field_overrides,
        actions: node.actions,
    }));

    // helper to find fields inside a flow object - flows may have different shapes
    const getFieldsFromFlow = (flow: any) => {
        if (!flow) return [];
        // common shapes
        if (Array.isArray(flow.fields)) return flow.fields;
        if (flow.form && Array.isArray(flow.form.fields)) return flow.form.fields;
        // nodes might include a Form node which contains fields
        if (Array.isArray(flow.nodes)) {
            for (const n of flow.nodes) {
                if (n && (n.type === 'Form' || n.type === 'form') && Array.isArray(n.fields)) return n.fields;
            }
        }
        // sometimes the flow itself may be an array (pre-serialized form content)
        if (Array.isArray(flow)) {
            // find first element that has fields
            for (const el of flow) {
                if (el && Array.isArray(el.fields)) return el.fields;
            }
        }
        return [];
    };

    const selectedFlow = flows.find((f: any) => String(f.id) === String(selectedFlowId));
    const fields = getFieldsFromFlow(selectedFlow);
    // reference fields to avoid unused-variable warnings from static analysis
    void fields;

    const updateFieldOverride = (fieldId: string, patch: any) => {
        setProp((props: any) => {
            const fo = props.field_overrides ? {...props.field_overrides} : {};
            fo[fieldId] = {...(fo[fieldId] || {}), ...patch};
            props.field_overrides = fo;
        }, 500);
    };

    // Special-case setting/clearing the label override: when the user clears the label input
    // remove the label property from the stored overrides so the renderer falls back to the
    // flow's original label. Preserve other override keys.
    const setLabelOverride = (fieldId: string, value: string) => {
        setProp((props: any) => {
            const fo = props.field_overrides ? {...props.field_overrides} : {};
            const cur = fo[fieldId] ? {...fo[fieldId]} : {};
            if (value === '' || value == null) {
                // remove the label override
                if (cur && Object.prototype.hasOwnProperty.call(cur, 'label')) delete cur.label;
            } else {
                cur.label = value;
            }
            // If cur is empty after deletion, remove the entire field override entry
            if (cur && Object.keys(cur).length > 0) fo[fieldId] = cur; else delete fo[fieldId];
            props.field_overrides = fo;
        }, 500);
    };

    const getOverrideFor = (fieldId: string) => {
        return (fieldOverrides && fieldOverrides[fieldId]) || {};
    };
    /*a flow form has this formatting:
     *
     * [
      {
        "id": "form_bopho48",
        "node_id": "form_bopho48",
        "type": "Form",
        "fields": [
          {
            "id": "5b945c76-0fc6-4df3-8d20-93d97e49ba1e",
            "field_id": null,
            "label": null,
            "name": null,
            "type": "html",
            "active": true,
            "html": "<h2>What do you need a loan for?</h2>\n<p>Select your reason so we can recommend the best product for your needs</p>"
          },
          {
            "id": "f13336bf-5c81-466d-96d7-6a05209dd7f0",
            "field_id": 4411778,
            "label": "What do you need a loan for?",
            "name": "loan_reason",
            "type": "checkbox",
            "active": true,
            "answers": [
              {
                "label": "<span>🏖</span> Holiday / Travel",
                "value": "Holiday / Travel",
                "selected": false
              },
              {
                "label": "🎓 Education",
                "value": "Education",
                "selected": false
              },
              {
                "label": "💳 Debt Consolidation",
                "value": "Debt Consolidation",
                "selected": false
              },
              {
                "label": "🚨 Emergency",
                "value": "Emergency",
                "selected": false
              },
              {
                "label": "🏠 Home Improvements",
                "value": "Home Improvements",
                "selected": false
              },
              {
                "label": "🚗 Vehicle",
                "value": "Vehicle",
                "selected": false
              },
              {
                "label": "💼 Other",
                "value": "Other",
                "selected": false
              }
            ]
          },
          {
            "id": "271d67c2-81a6-40d0-919c-ff608b79e061",
            "field_id": 3,
            "label": "Last Name",
            "name": "last_name",
            "type": "text",
            "active": true,
            "answers": null
          },
          {
            "id": "60b298a7-62a8-4d39-9f6b-0edcb55e6c86",
            "field_id": 4,
            "label": "Email",
            "name": "email",
            "type": "email",
            "active": true,
            "answers": null
          },
          {
            "id": "f4c54fe9-8e09-4cc4-aae9-61836e1efbeb",
            "field_id": 5,
            "label": "Phone",
            "name": "phone",
            "type": "tel",
            "active": true,
            "answers": null
          }
        ]
      },
      {
        "id": "rawhtml_z8n3904",
        "node_id": "rawhtml_z8n3904",
        "type": "RawHtml",
        "html": "<h1>Thank you.</h1><p>Thanks for your info</p>"
      },
      {
        "id": "rawhtml_pc0qm4r",
        "node_id": "rawhtml_pc0qm4r",
        "type": "RawHtml",
        "html": "You don't qualify"
      }
    ]
     * */
    return (
        <>

            <ToolbarSection title="Flow selection" expanded={true}>
                <div>
                    <label className="block text-sm mb-1">Select flow</label>
                    <Select
                        className={"w-full"}

                        value={selectedFlowId ?? ''}
                        onChange={(e) => {
                            const v = e.target.value === '' ? null : Number(e.target.value);
                            setProp((props: any) => {
                                props.flow_id = v;
                            }, 500);
                        }}
                    >
                        <option value="">-- none --</option>
                        {Array.isArray(flows)
                            ? flows.map((f: any) => (
                                <option key={f.id} value={f.id}>
                                    {f.name || f.title || `Flow ${f.id}`}
                                </option>
                            ))
                            : null}
                    </Select>
                </div>
            </ToolbarSection>


            {/* Helper style controls: concrete CSS value inputs (colors, sizes) */}
            <ToolbarSection title="Field Container Styling">
                <div className={"flex flex-col gap-4"}>
                    <div>
                        <label className="block">Background color</label>
                        <ColorInput
                            value={(fieldOverrides && fieldOverrides.__defaults && fieldOverrides.__defaults.containerBgColor) || ''}
                            placeholder="#fff" onChange={(v) => {
                            setProp((props: any) => {
                                const fo = props.field_overrides ? {...props.field_overrides} : {};
                                const cur = fo.__defaults ? {...fo.__defaults} : {};
                                cur.containerBgColor = v;
                                fo.__defaults = cur;
                                props.field_overrides = fo;
                            }, 300);
                        }}/>
                    </div>
                    <div>

                        <BorderControl
                            title={"Border"}
                            value={(fieldOverrides && fieldOverrides.__defaults && `${(fieldOverrides.__defaults.containerBorderWidth || '')}|${(fieldOverrides.__defaults.containerBorderUnit || 'px')}|${(fieldOverrides.__defaults.containerBorderStyle || 'solid')}|${(fieldOverrides.__defaults.containerBorderColor || '')}|${(fieldOverrides.__defaults.containerBorderRadius || '')}`) || ''}
                            onChange={(v) => {
                                // v is serialized as widths|unit|style|color|radius
                                const parts = (v || '').split('|');
                                const widthsRaw = parts[0] || '';
                                const u = parts[1] || 'px';
                                const s = parts[2] || 'solid';
                                const c = parts[3] || '';
                                const radius = parts[4] || '';
                                const widths = widthsRaw.trim().split(/\s+/).map(w => (w === '' ? '0' : (/(px|rem|em|%)$/i.test(w) ? w : `${w}${u}`))).join(' ');
                                setProp((props: any) => {
                                    const fo = props.field_overrides ? {...props.field_overrides} : {};
                                    const cur = fo.__defaults ? {...fo.__defaults} : {};
                                    cur.containerBorderWidth = widths;
                                    cur.containerBorderUnit = u;
                                    cur.containerBorderStyle = s;
                                    cur.containerBorderColor = c;
                                    cur.containerBorderRadius = radius;
                                    fo.__defaults = cur;
                                    props.field_overrides = fo;
                                }, 300);
                            }}
                        />
                    </div>
                    <div>

                        <SpacingControl
                            title={"Padding"}
                            value={(fieldOverrides && fieldOverrides.__defaults && fieldOverrides.__defaults.containerPadding) || ''}
                            onChange={(v) => {
                                setProp((props: any) => {
                                    const fo = props.field_overrides ? {...props.field_overrides} : {};
                                    const cur = fo.__defaults ? {...fo.__defaults} : {};
                                    cur.containerPadding = v;
                                    fo.__defaults = cur;
                                    props.field_overrides = fo;
                                }, 300);
                            }}
                        />
                    </div>
                    <div>
                        <SpacingControl
                            title={"Margin"}
                            value={(fieldOverrides && fieldOverrides.__defaults && fieldOverrides.__defaults.containerMargin) || ''}
                            onChange={(v) => {
                                setProp((props: any) => {
                                    const fo = props.field_overrides ? {...props.field_overrides} : {};
                                    const cur = fo.__defaults ? {...fo.__defaults} : {};
                                    cur.containerMargin = v;
                                    fo.__defaults = cur;
                                    props.field_overrides = fo;
                                }, 300);
                            }}
                        />

                    </div>
                    <div>

                        <BoxShadowControl
                            title={"Box Shadow"}
                            value={(fieldOverrides && fieldOverrides.__defaults && fieldOverrides.__defaults.containerBoxShadow) || ''}
                            onChange={(v) => {
                                setProp((props: any) => {
                                    const fo = props.field_overrides ? {...props.field_overrides} : {};
                                    const cur = fo.__defaults ? {...fo.__defaults} : {};
                                    cur.containerBoxShadow = v;
                                    fo.__defaults = cur;
                                    props.field_overrides = fo;
                                }, 300);
                            }}
                        />
                    </div>
                </div>

                <div className="mb-2 px-3 border-t pt-3">
                    <div>
                        <label className="text-sm text-light-gray-2 block mb-1">Label text color</label>
                        <ColorInput
                            value={(fieldOverrides && fieldOverrides.__defaults && fieldOverrides.__defaults.labelColor) || ''}
                            placeholder="#374151" onChange={(v) => {
                            setProp((props: any) => {
                                const fo = props.field_overrides ? {...props.field_overrides} : {};
                                const cur = fo.__defaults ? {...fo.__defaults} : {};
                                cur.labelColor = v;
                                fo.__defaults = cur;
                                props.field_overrides = fo;
                            }, 300);
                        }}/>
                    </div>
                    <div>
                        <label className="text-sm text-light-gray-2 block mb-1">Label font-size</label>
                        <input
                            className="appearance-none block w-full bg-white text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight"
                            value={(fieldOverrides && fieldOverrides.__defaults && fieldOverrides.__defaults.labelFontSize) || ''}
                            onChange={(e) => {
                                setProp((props: any) => {
                                    const fo = props.field_overrides ? {...props.field_overrides} : {};
                                    const cur = fo.__defaults ? {...fo.__defaults} : {};
                                    cur.labelFontSize = e.target.value;
                                    fo.__defaults = cur;
                                    props.field_overrides = fo;
                                }, 300);
                            }} placeholder="e.g. 0.875rem"/>
                    </div>
                    <div>
                        <label className="text-sm text-light-gray-2 block mb-1">Label margin-bottom</label>
                        <input
                            className="appearance-none block w-full bg-white text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight"
                            value={(fieldOverrides && fieldOverrides.__defaults && fieldOverrides.__defaults.labelMarginBottom) || ''}
                            onChange={(e) => {
                                setProp((props: any) => {
                                    const fo = props.field_overrides ? {...props.field_overrides} : {};
                                    const cur = fo.__defaults ? {...fo.__defaults} : {};
                                    cur.labelMarginBottom = e.target.value;
                                    fo.__defaults = cur;
                                    props.field_overrides = fo;
                                }, 300);
                            }} placeholder="e.g. 4px"/>
                    </div>
                </div>

                <div className="mb-2 px-3 border-t pt-3 flex flex col gap-2">
                    <div>
                        <label className="text-sm text-light-gray-2 block mb-1">Input background color</label>
                        <ColorInput
                            value={(fieldOverrides && fieldOverrides.__defaults && fieldOverrides.__defaults.inputBgColor) || ''}
                            placeholder="#fff" onChange={(v) => {
                            setProp((props: any) => {
                                const fo = props.field_overrides ? {...props.field_overrides} : {};
                                const cur = fo.__defaults ? {...fo.__defaults} : {};
                                cur.inputBgColor = v;
                                fo.__defaults = cur;
                                props.field_overrides = fo;
                            }, 300);
                        }}/>
                    </div>
                    <div>
                        <label className="text-sm text-light-gray-2 block mb-1">Input border color</label>
                        <ColorInput
                            value={(fieldOverrides && fieldOverrides.__defaults && fieldOverrides.__defaults.inputBorderColor) || ''}
                            placeholder="#e5e7eb" onChange={(v) => {
                            setProp((props: any) => {
                                const fo = props.field_overrides ? {...props.field_overrides} : {};
                                const cur = fo.__defaults ? {...fo.__defaults} : {};
                                cur.inputBorderColor = v;
                                fo.__defaults = cur;
                                props.field_overrides = fo;
                            }, 300);
                        }}/>
                    </div>
                    <div>
                        <label className="text-sm text-light-gray-2 block mb-1">Input padding</label>
                        <SpacingControl
                            value={(fieldOverrides && fieldOverrides.__defaults && fieldOverrides.__defaults.inputPadding) || ''}
                            onChange={(v) => {
                                setProp((props: any) => {
                                    const fo = props.field_overrides ? {...props.field_overrides} : {};
                                    const cur = fo.__defaults ? {...fo.__defaults} : {};
                                    cur.inputPadding = v;
                                    fo.__defaults = cur;
                                    props.field_overrides = fo;
                                }, 300);
                            }}
                        />
                    </div>
                </div>
            </ToolbarSection>


            {/* Field-specific overrides (stored per-page only) */}
            {selectedFieldId ? (
                <ToolbarSection title="Field overrides">
                    <div className="flex justify-end px-3">
                        <button
                            type="button"
                            className="text-sm text-red-600 mr-2"
                            onClick={() => {
                                // clear overrides for the selected field
                                setProp((props: any) => {
                                    if (!props.field_overrides) return;
                                    const fo = {...props.field_overrides};
                                    delete fo[selectedFieldId];
                                    props.field_overrides = fo;
                                }, 200);
                            }}
                        >
                            Clear overrides
                        </button>
                    </div>

                    {/* label override */}
                    <div className="mb-2 px-3">
                        <label className="text-sm text-light-gray-2 block mb-1">Label override</label>
                        <input
                            className="appearance-none block w-full bg-white text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight"
                            value={getOverrideFor(selectedFieldId).label ?? ''}
                            onChange={(e) => setLabelOverride(selectedFieldId, e.target.value)}
                            placeholder="Custom label for this page (leave empty to use flow label)"
                        />
                    </div>

                    {/* display style: default or buttons */}
                    <div className="mb-2 px-3">
                        <label className="text-sm text-light-gray-2 block mb-1">Display</label>
                        <div className="flex items-center space-x-3">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name={`display_${selectedFieldId}`}
                                    checked={(getOverrideFor(selectedFieldId).display || 'default') === 'default'}
                                    onChange={() => updateFieldOverride(selectedFieldId, {display: 'default'})}
                                />
                                <span className="ml-2">Default</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name={`display_${selectedFieldId}`}
                                    checked={getOverrideFor(selectedFieldId).display === 'buttons'}
                                    onChange={() => updateFieldOverride(selectedFieldId, {display: 'buttons'})}
                                />
                                <span className="ml-2">Buttons</span>
                            </label>
                        </div>
                    </div>

                    {/* new field options */}
                    <div className="mb-2 px-3">
                        <label className="text-sm text-light-gray-2 block mb-1">Label position</label>
                        <select
                            className="w-full border rounded p-2"
                            value={getOverrideFor(selectedFieldId).labelPosition || 'top'}
                            onChange={(e) => updateFieldOverride(selectedFieldId, {labelPosition: e.target.value})}
                        >
                            <option value="top">Top</option>
                            <option value="left">Left</option>
                            <option value="inside">Inside (placeholder)</option>
                            <option value="none">None</option>
                        </select>
                    </div>

                    <div className="mb-2 px-3">
                        <label className="text-sm text-light-gray-2 block mb-1">Placeholder text</label>
                        <input
                            className="appearance-none block w-full bg-white text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight"
                            value={getOverrideFor(selectedFieldId).placeholder ?? ''}
                            onChange={(e) => updateFieldOverride(selectedFieldId, {placeholder: e.target.value})}
                            placeholder="Placeholder shown for inputs"
                        />
                    </div>

                    <div className="mb-2 px-3">
                        <label className="text-sm text-light-gray-2 block mb-1">Custom class</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                className="appearance-none block w-full bg-white text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight"
                                value={getOverrideFor(selectedFieldId).containerClass ?? ''}
                                onChange={(e) => updateFieldOverride(selectedFieldId, {containerClass: e.target.value})}
                                placeholder="Container classes (e.g. p-2 bg-gray-50)"
                            />
                            <input
                                className="appearance-none block w-full bg-white text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight"
                                value={getOverrideFor(selectedFieldId).inputClass ?? ''}
                                onChange={(e) => updateFieldOverride(selectedFieldId, {inputClass: e.target.value})}
                                placeholder="Input classes (e.g. text-sm)"
                            />
                        </div>
                    </div>

                    {/* Per-field concrete appearance overrides (colors, sizes) */}
                    <div className="mb-2 px-3 border-t pt-3">
                        <label className="text-sm text-light-gray-2 block mb-1">Appearance values (field-specific
                            override)</label>
                        <div>
                            <ColorInput
                                value={(getOverrideFor(selectedFieldId).containerBgColor) || ''}
                                placeholder="#fff"
                                onChange={(v) => updateFieldOverride(selectedFieldId, {containerBgColor: v})}
                            />
                            <input
                                className="appearance-none block w-full bg-white text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight"
                                value={(getOverrideFor(selectedFieldId).containerBorderWidth) || ''}
                                onChange={(e) => updateFieldOverride(selectedFieldId, {containerBorderWidth: e.target.value})}
                                placeholder="Border width (e.g. 1px)"
                            />
                            <ColorInput
                                value={(getOverrideFor(selectedFieldId).containerBorderColor) || ''}
                                placeholder="#e5e7eb"
                                onChange={(v) => updateFieldOverride(selectedFieldId, {containerBorderColor: v})}
                            />
                        </div>

                        <div>
                            <div>
                                <SpacingControl
                                    value={(getOverrideFor(selectedFieldId).containerPadding) || ''}
                                    onChange={(v) => updateFieldOverride(selectedFieldId, {containerPadding: v})}
                                />
                            </div>
                            <div>
                                <input
                                    className="appearance-none block w-full bg-white text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight"
                                    value={(getOverrideFor(selectedFieldId).containerMargin) || ''}
                                    onChange={(e) => updateFieldOverride(selectedFieldId, {containerMargin: e.target.value})}
                                    placeholder="Margin (e.g. 0 0 8px 0)"
                                />
                            </div>
                            <div>
                                <BoxShadowControl
                                    title={"Box-shadow"}
                                    value={(getOverrideFor(selectedFieldId).containerBoxShadow) || ''}
                                    onChange={(v) => updateFieldOverride(selectedFieldId, {containerBoxShadow: v})}
                                />
                            </div>
                        </div>

                        <div>
                            <ColorInput
                                value={(getOverrideFor(selectedFieldId).labelColor) || ''}
                                placeholder="#374151"
                                onChange={(v) => updateFieldOverride(selectedFieldId, {labelColor: v})}
                            />
                            <input
                                className="appearance-none block w-full bg-white text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight"
                                value={(getOverrideFor(selectedFieldId).labelFontSize) || ''}
                                onChange={(e) => updateFieldOverride(selectedFieldId, {labelFontSize: e.target.value})}
                                placeholder="Label font-size (e.g. 0.875rem)"
                            />
                            <input
                                className="appearance-none block w-full bg-white text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight"
                                value={(getOverrideFor(selectedFieldId).labelMarginBottom) || ''}
                                onChange={(e) => updateFieldOverride(selectedFieldId, {labelMarginBottom: e.target.value})}
                                placeholder="Label margin-bottom (e.g. 4px)"
                            />
                        </div>

                        <div>
                            <ColorInput
                                value={(getOverrideFor(selectedFieldId).inputBgColor) || ''}
                                placeholder="#fff"
                                onChange={(v) => updateFieldOverride(selectedFieldId, {inputBgColor: v})}
                            />
                            <ColorInput
                                value={(getOverrideFor(selectedFieldId).inputBorderColor) || ''}
                                placeholder="#e5e7eb"
                                onChange={(v) => updateFieldOverride(selectedFieldId, {inputBorderColor: v})}
                            />
                            <SpacingControl
                                value={(getOverrideFor(selectedFieldId).inputPadding) || ''}
                                onChange={(v) => updateFieldOverride(selectedFieldId, {inputPadding: v})}
                            />
                        </div>
                    </div>
                </ToolbarSection>
            ) : null}
        </>
    );
};
