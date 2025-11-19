import {useCallback, useEffect, useState} from "react";
import {closestCenter, DndContext} from "@dnd-kit/core";
import {arrayMove, SortableContext, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {v4 as uuidv4} from 'uuid';
import {PlusCircleIcon} from '@phosphor-icons/react';
import Select, { SingleValue } from 'react-select';
import {useReactFlow, useUpdateNodeInternals} from "@xyflow/react";

import NodeHeading from "@/Views/Flows/Nodes/NodeComponents/NodeHeading";
import NodeStartHandle from "@/Views/Flows/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Views/Flows/Nodes/NodeComponents/NodeBody";
import NodeEndHandle from "@/Views/Flows/Nodes/NodeComponents/NodeEndHandle";
import InputWithOverride from "@/Views/Flows/Nodes/NodeComponents/InputWithOverride";
import NodeOutputHandle from "@/Views/Flows/Nodes/NodeComponents/NodeOutputHandle";
import SelectWithoutOverride from "@/Views/Flows/Nodes/NodeComponents/SelectWithoutOverride";
import {usePage} from "@inertiajs/react";
import {SortableItem} from "@/Views/Flows/Nodes/NodeComponents/SortableItem";
import NodeSection from "@/Views/Flows/Nodes/NodeComponents/NodeSection";
import CheckBoxWithoutOverride from "@/Views/Flows/Nodes/NodeComponents/CheckBoxWithoutOverride";
import NodeSectionContent from "@/Views/Flows/Nodes/NodeComponents/NodeSectionContent";
import NodeInputHandle from "@/Views/Flows/Nodes/NodeComponents/NodeInputHandle";

export default function WebhookNode({data}: { data: any }) {
    const {fields}: any = usePage().props;

    // Use field.name as the option value and label for display
    const fieldOptions = fields.map((field: any) => ({
        value: field.name,
        label: field.label,
    }));
    const {getEdges, setEdges, setNodes} = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();

    // don't mutate incoming `data` prop during render; use defaults when reading below
    const nodeID: string = data.id;

    // Helper to persist arbitrary node-level data into the React Flow nodes state
    const updateNodeData = (partial: any) => {
        // Defer to a macrotask to ensure React has completed rendering before we call setState on other providers.
        setTimeout(() => {
            try {
                if (typeof setNodes === 'function') {
                    setNodes((nds:any[]) => nds.map((n:any) => n.id !== nodeID ? n : {...n, data: {...(n.data || {}), ...partial}}));
                }
            } catch (err) {
                // ignore
            }

            try {
                if (data && typeof data === 'object') {
                    for (const k in partial) {
                        // @ts-ignore
                        data[k] = partial[k];
                    }
                }
            } catch (err) {
                // ignore
            }

            try {
                updateNodeInternals(nodeID);
            } catch (err) {
                // ignore
            }
        }, 0);
    }

    // Synchronous version used for user-driven changes (textarea/checkbox) so Save operations see them immediately.
    const updateNodeDataImmediate = (partial: any) => {
        try {
            if (typeof setNodes === 'function') {
                setNodes((nds:any[]) => nds.map((n:any) => n.id !== nodeID ? n : {...n, data: {...(n.data || {}), ...partial}}));
            }
        } catch (err) {
            // ignore
        }
        try {
            if (data && typeof data === 'object') {
                for (const k in partial) {
                    // @ts-ignore
                    data[k] = partial[k];
                }
            }
        } catch (err) {
            // ignore
        }
        try {
            updateNodeInternals(nodeID);
        } catch (err) {
            // ignore
        }
    }

    // helper to create a nice fallback label from a name
    const humanize = (name: string | null) => {
        if (!name) return '';
        return name.split('_').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }

    // Store hookFields and headers as { id, key, name, label, field_id }
    const [hookFields, setHookFields] = useState((data.hookFields ?? []).map((f: any) => {
        const name = f.name ?? f.value ?? null;
        const matched = fields.find((fld: any) => fld.name === name || fld.id === name || fld.id === f.field_id);
        return {
            ...f,
            id: f.id || uuidv4(),
            key: f.key ?? '',
            name: name,
            label: matched?.label ?? f.label ?? humanize(name),
            field_id: matched?.id ?? f.field_id ?? null,
        };
    }));

    const [headers, setHeaders] = useState((data.headers ?? []).map((h: any) => {
        const name = h.name ?? h.value ?? null;
        const matched = fields.find((fld: any) => fld.name === name || fld.id === name || fld.id === h.field_id);
        return {
            ...h,
            id: h.id || uuidv4(),
            key: h.key ?? '',
            name: name,
            label: matched?.label ?? h.label ?? humanize(name),
            field_id: matched?.id ?? h.field_id ?? null,
        };
    }));

    // mappings: {id, label, path, variableName}
    const [mappings, setMappings] = useState((data.mappings ?? []).map((m: any) => ({
        ...m,
        id: m.id || uuidv4(),
        label: m.label ?? m.path ?? '',
        path: m.path ?? '',
        variableName: m.variableName ?? null,
        type: m.type ?? 'any',
    })));

    const typeOptions = [
        { value: 'any', label: 'Any' },
        { value: 'string', label: 'String' },
        { value: 'number', label: 'Number' },
        { value: 'boolean', label: 'Boolean' },
    ];

    // initialize sampleText/xmlMode from incoming data so saved flows re-open with the same test content
    const [sampleText, setSampleText] = useState(data.sampleText ?? '');
    const [previewResults, setPreviewResults] = useState<{[k:string]: any}>({});
    const [xmlMode, setXmlMode] = useState<boolean>(data.xmlMode ?? false);

    const [sendAsJson, setSendAsJson] = useState(data.sendAsJson ?? true);
    const [isSoap, setIsSoap] = useState(data.isSoap || false);



    useEffect(() => {
        // Persist hookFields, headers, and mappings back into the global nodes state so saving the flow includes them.
        try {
            setNodes((nds:any[]) => nds.map((n:any) => {
                if (n.id !== nodeID) return n;
                const newData = {
                    ...(n.data || {}),
                    hookFields: hookFields.map((f:any) => ({...f})),
                    headers: headers.map((h:any) => ({...h})),
                    mappings: mappings.map(m => ({id: m.id, label: m.label, path: m.path, variableName: m.variableName, type: m.type}))
                };
                return {...n, data: newData};
            }));
        } catch (err) {
            // ignore setNodes errors if not available
        }
        // update internals so handles and visuals refresh
        updateNodeInternals(nodeID);
    }, [hookFields, headers, mappings, setNodes, updateNodeInternals, nodeID]);

    // Also keep the incoming `data` prop in sync for saving flows that serialize node.data
    useEffect(() => {
        try {
            data.mappings = mappings.map(m => ({id: m.id, label: m.label, path: m.path, variableName: m.variableName, type: m.type}));
        } catch (e) {
            // ignore non-writable data
        }
    }, [mappings, data]);

    // Persist the Test Mappings sample text and xmlMode into node data so saving the flow stores them
    useEffect(() => {
        try {
            updateNodeData({ sampleText: sampleText ?? '', xmlMode: !!xmlMode });
        } catch (e) {
            // ignore
        }
    }, [sampleText, xmlMode]);

    const removeConnectedEdges = useCallback((handleIds: any | any[]) => {
        const edges = getEdges();
        const handleIdArray = Array.isArray(handleIds) ? handleIds : [handleIds];
        const updatedEdges = edges.filter(edge =>
            !handleIdArray.includes(edge.sourceHandle) && !handleIdArray.includes(edge.targetHandle)
        );
        setEdges(updatedEdges);
    }, [getEdges, setEdges]);

    const addMapping = () => {
        const newMapping = {id: uuidv4(), label: '', path: '', variableName: '', type: 'any'};
        setMappings((prev: any[]) => {
            const next = [...prev, newMapping];
            updateNodeData({mappings: next.map(m => ({id: m.id, label: m.label, path: m.path, variableName: m.variableName, type: m.type}))});
            updateNodeInternals(nodeID);
            return next;
        });
    };

    const onDeleteMapping = (id: string) => {
        removeConnectedEdges(id+'-mapping');
        setMappings((prev: any[]) => {
            const updated = prev.filter(m => m.id !== id);
            updateNodeData({mappings: updated.map(m => ({id: m.id, label: m.label, path: m.path, variableName: m.variableName, type: m.type}))});
            updateNodeInternals(nodeID);
            return updated;
        });
    };

    const onChangeMapping = (id: string, key: string, value: any) => {
        setMappings((prev: any[]) => {
            const updated = prev.map(m => m.id === id ? {...m, [key]: value} : m);
            updateNodeData({mappings: updated.map(m => ({id: m.id, label: m.label, path: m.path, variableName: m.variableName, type: m.type}))});
            return updated;
        });
    };

    const addField = () => {
        setHookFields((prevFields: any) => {
            const newFields = [...prevFields, {key: '', name: null, label: '', field_id: null, id: uuidv4()}];
            updateNodeInternals(nodeID);
            return newFields;
        });
    };

    const addHeader = () => {
        setHeaders((prevHeaders: any[]) => {
            const newHeaders = [...prevHeaders, {key: '', name: null, label: '', field_id: null, id: uuidv4()}];
            updateNodeInternals(nodeID);
            return newHeaders;
        });
    };

    const onDeleteField = (id: string) => {
        removeConnectedEdges([id+'-field-key-override', id+'-field-value-override']);
        setHookFields((prevFields: any[]) => {
            const updatedFields = prevFields.filter((field: any) => field.id !== id);
            updateNodeInternals(nodeID);
            return updatedFields;
        });
    };

    const onDeleteHeader = (id: string) => {
        removeConnectedEdges([id+'-header-key-override', id+'-header-value-override']);
        setHeaders((prevHeaders: any[]) => {
            const updatedHeaders = prevHeaders.filter((header: any) => header.id !== id);
            updateNodeInternals(nodeID);
            return updatedHeaders;
        });
    };

    const onChangeURL = (event: { target: { value: any; }; }) => {
        updateNodeData({url: event.target.value});
    };

    const onMethodChange = (newValue: SingleValue<{ value: any; label: any }>) => {
        if (newValue) {
            updateNodeData({method: newValue.value});
        }
    };

    const onSendAsJsonChange = (isChecked: boolean) => {
        setSendAsJson(isChecked);
        updateNodeData({sendAsJson: isChecked});
    };

    const onIsSoapChange = (isChecked: boolean) => {
        setIsSoap(isChecked);
        updateNodeData({isSoap: isChecked});
    };

    const onChangeFieldValue = (id: string, newValue: SingleValue<{ value: any; label: any }>) => {
        setHookFields((prevFields: any[]) => {
            return prevFields.map((field: any) => {
                if (field.id !== id) return field;

                const selectedName = newValue ? newValue.value : null;
                const matched = fields.find((f: any) => f.name === selectedName || f.id === selectedName);

                return {
                    ...field,
                    name: selectedName,
                    label: matched?.label ?? (selectedName ? humanize(selectedName) : ''),
                    field_id: matched?.id ?? null,
                };
            });
        });
    };

    const onChangeFieldKey = (id: string, event: { target: { value: any; id: string; }; }) => {
        setHookFields((prevFields: any[]) => {
            return prevFields.map((field: any) =>
                field.id === id ? {...field, key: event.target.value} : field
            );
        });
    };

    const onChangeHeaderValue = (id: string, newValue: SingleValue<{ value: any; label: any }>) => {
        setHeaders((prevHeaders: any[]) => {
            return prevHeaders.map((header: any) => {
                if (header.id !== id) return header;

                const selectedName = newValue ? newValue.value : null;
                const matched = fields.find((f: any) => f.name === selectedName || f.id === selectedName);

                return {
                    ...header,
                    name: selectedName,
                    label: matched?.label ?? (selectedName ? humanize(selectedName) : ''),
                    field_id: matched?.id ?? null,
                };
            });
        });
    };

    const onChangeHeaderKey = (id: string, event: { target: { value: any; id: string; }; }) => {
        setHeaders((prevHeaders: any[]) => {
            return prevHeaders.map((header: any) =>
                header.id === id ? {...header, key: event.target.value} : header
            );
        });
    };

    const onDragEnd = (event: any) => {
        const {active, over} = event;

        if (active.id !== over.id) {
            setHookFields((items: any[]) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });

            setHeaders((items: any[]) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <>
            <NodeBody className={"webhookNode"}>
                <NodeHeading onChange={(newHeading: string) => {
                    updateNodeData({heading: newHeading});
                }}>
                    {data.heading || "Webhook"}
                </NodeHeading>


                <NodeSection className={"flex"}>
                    <div className="flex-none w-14">
                        <NodeStartHandle
                            id={"previous"} nodeID={nodeID}
                            onConnect={(params: any) => console.log('handle onConnect', params)}
                        />
                    </div>

                    <div className="flex-1 text-right">
                        <NodeEndHandle
                            onConnect={(params: any) => console.log('handle onConnect', params)}
                            id={"next"}
                            nodeID={nodeID}>

                        </NodeEndHandle>

                        <NodeOutputHandle id={"response-value"}
                                          onConnect={(params: any) => console.log('handle onConnect', params)}
                                          nodeID={nodeID}
                                          dataType={"any"}>
                            Response
                        </NodeOutputHandle>
                        {mappings.map((m:any) => (
                            <NodeOutputHandle key={m.id} id={m.id + "-mapping"} nodeID={nodeID} dataType={m.type ?? 'any'}>
                                {m.label || m.path || 'mapped'}
                            </NodeOutputHandle>
                        ))}
                    </div>
                </NodeSection>
                <NodeSection>

                    <InputWithOverride
                        onChange={onChangeURL}
                        handleID={"webhookURL-override"}
                        value={data.url}
                        label={"Endpoint URL"}
                        nodeID={nodeID}
                        className={"mb-7"}
                        dataType={"text"}
                    />
                    <SelectWithoutOverride
                        onChange={onMethodChange}
                        label={"Method"}
                        value={{value: data.method || "GET", label: data.method || "GET"}}
                        isSearchable={false}
                        options={[
                            {value: "GET", label: "GET"},
                            {value: "POST", label: "POST"},
                            {value: "PUT", label: "PUT"},
                            {value: "DELETE", label: "DELETE"}
                        ]}
                    />
                </NodeSection>

                <NodeSection>
                    <NodeSectionContent>


                    <CheckBoxWithoutOverride
                        onChange={onSendAsJsonChange}
                        isTrue={sendAsJson}
                        label="Send as JSON"
                        id={"sendAsJson"}

                    />
                    </NodeSectionContent>
                    <NodeSectionContent>
                    <CheckBoxWithoutOverride
                        onChange={onIsSoapChange}
                        isTrue={isSoap}
                        label="Use SOAP"
                        id={"isSoap"}
                    />
                    </NodeSectionContent>
                </NodeSection>


                <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <NodeSection className={"relative nodrag"}>
                        <NodeSectionContent>

                            <h2 className={"font-bold"}>

                                Fields
                            </h2>
                        </NodeSectionContent>

                        <SortableContext items={hookFields} strategy={verticalListSortingStrategy}>
                            {hookFields.map((field: any) => (
                                <SortableItem key={field.id} id={field.id} onDeleteField={onDeleteField} field={field}>
                                    <div className={"flex-col"}>
                                        <InputWithOverride
                                            placeholder={"key"}
                                            onChange={(event: {
                                                target: { value: any; id: string; };
                                            }) => onChangeFieldKey(field.id, event)}
                                            handleID={field.id + "-field-key-override"}
                                            value={field.key}
                                            nodeID={nodeID}
                                            dataType={"text"}
                                        />
                                    </div>
                                    <div className={"flex-col"}>
                                        <NodeInputHandle nodeID={nodeID} handleID={field.id + "-field-value-override"} dataType={"text"}>
                                            <Select
                                                className={"r-select w-[300px] nowheel nodrag text-gray-700"}
                                                onChange={(newValue: SingleValue<{value:any;label:any;}>) => onChangeFieldValue(field.id, newValue)}
                                                defaultValue={field.name == null ? null : (fieldOptions.find((o: any) => o.value === field.name) ?? {value: field.name, label: field.label ?? field.name})}
                                                id={"fieldValue"}
                                                isSearchable={true}
                                                options={fieldOptions}
                                            />
                                        </NodeInputHandle>
                                    </div>
                                </SortableItem>
                            ))}
                        </SortableContext>
                        <div
                            className="addButton block py-1 text-center w-full"
                            onClick={addField}
                        >
                            <PlusCircleIcon size={24} />
                        </div>
                    </NodeSection>
                    <NodeSection className={"relative nodrag"}>
                        <NodeSectionContent>


                            <h2>Headers</h2>
                        </NodeSectionContent>
                        <SortableContext items={headers} strategy={verticalListSortingStrategy}>
                            {headers.map((header: any) => (
                                <SortableItem key={header.id} id={header.id} onDeleteField={onDeleteHeader}
                                              field={header}>
                                    <div className={"flex-col"}>
                                        <InputWithOverride
                                            placeholder={"key"}
                                            onChange={(event: {
                                                target: { value: any; id: string; };
                                            }) => onChangeHeaderKey(header.id, event)}
                                            handleID={header.id + "-header-key-override"}
                                            value={header.key}
                                            nodeID={nodeID}
                                            dataType={"text"}
                                        />
                                    </div>
                                    <div className={"flex-col"}>
                                        <NodeInputHandle nodeID={nodeID} handleID={header.id + "-header-value-override"} dataType={"text"}>
                                            <Select
                                                className={"r-select w-[300px] nowheel nodrag text-gray-700"}
                                                onChange={(newValue: SingleValue<{value:any;label:any;}>) => onChangeHeaderValue(header.id, newValue)}
                                                defaultValue={header.name == null ? null : (fieldOptions.find((o: any) => o.value === header.name) ?? {value: header.name, label: header.label ?? header.name})}
                                                id={"headerValue"}
                                                isSearchable={true}
                                                options={fieldOptions}
                                            />
                                        </NodeInputHandle>
                                    </div>
                                </SortableItem>
                            ))}
                        </SortableContext>
                        <div
                            className="addButton block py-1 text-center w-full"
                            onClick={addHeader}
                        >
                            <PlusCircleIcon size={24} />
                        </div>
                    </NodeSection>
                    <NodeSection className={"relative nodrag"}>
                        <NodeSectionContent>

                            <h2 className={"font-bold"}>

                                Mappings
                            </h2>
                        </NodeSectionContent>

                        <SortableContext items={mappings} strategy={verticalListSortingStrategy}>
                            {mappings.map((mapping: any) => (
                                <SortableItem key={mapping.id} id={mapping.id} onDeleteField={onDeleteMapping} field={mapping}>
                                    <div className={"flex-col"}>
                                        <InputWithOverride
                                            placeholder={"Label"}
                                            onChange={(event: {
                                                target: { value: any; id: string; };
                                            }) => onChangeMapping(mapping.id, 'label', event.target.value)}
                                            handleID={mapping.id + "-mapping-label-override"}
                                            value={mapping.label}
                                            nodeID={nodeID}
                                            dataType={"text"}
                                        />
                                    </div>
                                    <div className={"flex-col"}>
                                        <InputWithOverride
                                            placeholder={"Path"}
                                            onChange={(event: {
                                                target: { value: any; id: string; };
                                            }) => onChangeMapping(mapping.id, 'path', event.target.value)}
                                            handleID={mapping.id + "-mapping-path-override"}
                                            value={mapping.path}
                                            nodeID={nodeID}
                                            dataType={"text"}
                                        />
                                    </div>
                                    {/* field dropdown removed - we will use node outputs/handles instead */}
                                    <div className={"flex-col"}>
                                        <Select
                                            className={"r-select w-[120px] nowheel nodrag text-gray-700"}
                                            onChange={(newValue: SingleValue<{value:any;label:any;}>) => onChangeMapping(mapping.id, 'type', newValue ? newValue.value : 'any')}
                                            defaultValue={typeOptions.find((o:any) => o.value === mapping.type) ?? typeOptions[0]}
                                            options={typeOptions}
                                            isSearchable={false}
                                        />
                                    </div>
                                    <div className={"flex-col ml-3 w-56 text-left text-sm text-gray-300"}>
                                        {(() => {
                                            const v = previewResults[mapping.id];
                                            let text = '—';
                                            if (v === '__NOT_FOUND__') text = '(not found)';
                                            else if (v === null) text = 'null';
                                            else if (v !== undefined) text = String(v);
                                            return <div>Preview: {text}</div>;
                                        })()}
                                    </div>
                                </SortableItem>
                            ))}
                        </SortableContext>
                        <div
                            className="addButton block py-1 text-center w-full"
                            onClick={addMapping}
                        >
                            <PlusCircleIcon size={24} />
                        </div>
                    </NodeSection>
                    <NodeSection className={"relative nodrag mt-2"}>
                        <NodeSectionContent>
                            <h2>Test Mappings</h2>
                        </NodeSectionContent>
                        <div className={"p-2"}>
                            <textarea value={sampleText} onChange={(e) => { setSampleText(e.target.value); updateNodeDataImmediate({ sampleText: e.target.value }); }} placeholder={"Paste a sample JSON or XML response here"} className={"w-full h-32 bg-gray-800 text-white p-2 rounded"} />
                            <div className={"flex gap-2 mt-2"}>
                            {previewResults && previewResults.__error ? (
                                <div className={"text-red-400 mb-2"}>{String(previewResults.__error)}</div>
                            ) : null}
                            </div>
                            <div className={"flex items-center gap-4 mt-2"}>
                                <label className={"flex items-center gap-2 text-sm text-gray-300"}>
                                    <input type="checkbox" checked={xmlMode} onChange={(e) => { setXmlMode(e.target.checked); updateNodeDataImmediate({ xmlMode: !!e.target.checked }); }} />
                                    <span>Treat sample as XML</span>
                                </label>
                            </div>
                            <div className={"flex gap-2 mt-2"}>
                                <button type="button" className={"px-3 py-1 bg-blue-600 rounded"} onClick={(e) => { e.preventDefault();
                                      try {
                                     // run mappings against sample
                                     const trimmed = (sampleText || '').trim();
                                     if (!trimmed) {
                                         setPreviewResults({__error: 'No sample provided'});
                                         return;
                                     }

                                     // If the sample looks like a full HTML page, bail with a friendly error instead of letting DOMParser produce cryptic messages
                                     if (/^<!doctype\s+html|^<html/i.test(trimmed)) {
                                         setPreviewResults({__error: 'Input appears to be an HTML page. Please paste raw JSON or XML response body.'});
                                         return;
                                     }

                                     let parsed:any = null;
                                     // Try JSON first; if it fails, only try XML when xmlMode is enabled and input appears to be XML
                                     try {
                                        // remove BOM if present
                                        const cleaned = trimmed.replace(/^\uFEFF/, '');
                                        parsed = JSON.parse(cleaned);
                                    } catch (jsonErr:any) {
                                        if (!xmlMode) {
                                            setPreviewResults({__error: `JSON parse error: ${jsonErr.message}`});
                                            return;
                                        }
                                        // xmlMode is enabled: only attempt DOMParser when input looks like XML
                                        if (!trimmed.startsWith('<') && !trimmed.startsWith('<?xml')) {
                                            setPreviewResults({__error: `JSON parse error: ${jsonErr.message} (enable XML mode to attempt XML parsing)`});
                                            return;
                                        }
                                        try {
                                            const parser = new DOMParser();
                                            const xml = parser.parseFromString(trimmed, 'application/xml');
                                            const errors = xml.getElementsByTagName('parsererror');
                                            const nsErrors = xml.getElementsByTagNameNS('http://www.mozilla.org/newlayout/xml/parsererror.xml', 'parsererror');
                                            const rootName = xml.documentElement && xml.documentElement.nodeName ? xml.documentElement.nodeName.toLowerCase() : '';
                                            if ((errors && errors.length) || (nsErrors && nsErrors.length) || rootName === 'parsererror') {
                                                let msg = 'XML parse error';
                                                if (errors && errors.length && errors[0].textContent) msg = errors[0].textContent;
                                                else if (nsErrors && nsErrors.length && nsErrors[0].textContent) msg = nsErrors[0].textContent;
                                                else if (xml.documentElement && xml.documentElement.textContent) msg = xml.documentElement.textContent;
                                                setPreviewResults({__error: `XML parse error: ${msg}`});
                                                return;
                                            }
                                            const xmlToJson = (node:any) => {
                                                if (node.nodeType === 1) {
                                                    const obj:any = {};
                                                    if (node.attributes && node.attributes.length) {
                                                        for (let i = 0; i < node.attributes.length; i++) {
                                                            const att = node.attributes[i];
                                                            obj[att.name] = att.value;
                                                        }
                                                    }
                                                    if (node.childNodes && node.childNodes.length) {
                                                        for (let i = 0; i < node.childNodes.length; i++) {
                                                            const child = node.childNodes[i];
                                                            const name = child.nodeName;
                                                            if (child.nodeType === 3) { // text
                                                                const txt = child.nodeValue?.trim();
                                                                if (txt) return txt;
                                                            } else {
                                                                const val = xmlToJson(child);
                                                                if (obj[name] !== undefined) {
                                                                    if (!Array.isArray(obj[name])) obj[name] = [obj[name]];
                                                                    obj[name].push(val);
                                                                } else {
                                                                    obj[name] = val;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    return obj;
                                                } else if (node.nodeType === 3) {
                                                    return node.nodeValue;
                                                }
                                                return null;
                                            }
                                            const root = xml.documentElement;
                                            parsed = { [root.nodeName]: xmlToJson(root) };
                                        } catch (ex) {
                                            setPreviewResults({__error: 'Unable to parse sample as JSON or XML.'});
                                            return;
                                        }
                                    }

                                    const extract = (obj:any, path:string) => {
                                        if (!path) return undefined;
                                        const normalized = path.replace(/\[(\d+)(?=])/g, '.$1');
                                        const parts = normalized.split('.');
                                        let cur:any = obj;
                                        for (const p of parts) {
                                            if (p === '') continue;
                                            if (cur === null || cur === undefined) return undefined;
                                            if (Array.isArray(cur)) {
                                                const idx = parseInt(p, 10);
                                                if (isNaN(idx)) return undefined;
                                                cur = cur[idx];
                                            } else if (typeof cur === 'object') {
                                                // if property doesn't exist, return undefined so caller can distinguish missing vs null
                                                if (!Object.prototype.hasOwnProperty.call(cur, p)) return undefined;
                                                cur = cur[p];
                                            } else {
                                                return undefined;
                                            }
                                        }
                                        return cur;
                                    };

                                    const results:any = {};
                                    for (const m of mappings) {
                                        // If user accidentally put the JSON key into the Label field (common),
                                        // use the label as a fallback path when path is empty.
                                        const pathToUse = (m.path || '').trim() || (m.label || '').trim();
                                        let val = extract(parsed, pathToUse || '');
                                         // coerce in JS similar to backend
                                         if (m.type === 'boolean') {
                                             if (typeof val === 'string') {
                                                 const s = val.trim().toLowerCase();
                                                 val = (s === 'true' || s === '1' || s === 'yes');
                                             } else {
                                                 val = !!val;
                                             }
                                         } else if (m.type === 'number') {
                                             const n = Number(val);
                                             val = isNaN(n) ? null : n;
                                         } else if (m.type === 'string') {
                                             val = val === null || val === undefined ? null : String(val);
                                         }
                                        results[m.id] = val;
                                     }
                                    // Set preview results; for clarity map undefined -> special value so UI shows "(not found)"
                                    const uiResults:any = {};
                                    for (const id in results) {
                                        uiResults[id] = results[id] === undefined ? '__NOT_FOUND__' : results[id];
                                    }
                                    setPreviewResults(uiResults);
                                 } catch (err:any) {
                                     setPreviewResults({__error: err?.message || String(err)});
                                 }
                                 }}>Run mappings</button>
                                <button type="button" className={"px-3 py-1 bg-gray-600 rounded"} onClick={(e) => { e.preventDefault(); setSampleText(''); setPreviewResults({}); }}>Clear</button>
                             </div>
                         </div>
                     </NodeSection>
                </DndContext>

            </NodeBody>
        </>
    );
}
