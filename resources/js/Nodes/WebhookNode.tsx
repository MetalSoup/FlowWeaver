import {useCallback, useEffect, useState} from "react";
import {DndContext, closestCenter} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Nodes/NodeComponents/NodeBody";
import NodeEndHandle from "@/Nodes/NodeComponents/NodeEndHandle";
import InputWithOverride from "@/Nodes/NodeComponents/InputWithOverride";
import NodeOutputHandle from "@/Nodes/NodeComponents/NodeOutputHandle";
import {v4 as uuidv4} from 'uuid';
import { PlusCircle } from 'phosphor-react';
import {useReactFlow, useUpdateNodeInternals} from "@xyflow/react";
import {SingleValue} from 'react-select';
import SelectWithoutOverride from "@/Nodes/NodeComponents/SelectWithoutOverride";
import SelectWithOverride from "@/Nodes/NodeComponents/SelectWithOverride";
import {usePage} from "@inertiajs/react";
import {SortableItem} from "@/Nodes/NodeComponents/SortableItem";
import NodeSection from "@/Nodes/NodeComponents/NodeSection";
import CheckBoxWithoutOverride from "@/Nodes/NodeComponents/CheckBoxWithoutOverride";
import NodeSectionContent from "@/Nodes/NodeComponents/NodeSectionContent";

export default function WebhookNode({data}: { data: any }) {
    const {fields}: any = usePage().props;

    // Use field.name as the option value and label for display
    const fieldOptions = fields.map((field: any) => ({
        value: field.name,
        label: field.label,
    }));
    const {getEdges, setEdges} = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();

    if (!Array.isArray(data.hookFields)) {
        data.hookFields = [];
    }
    if (!Array.isArray(data.headers)) {
        data.headers = [];
    }
    const nodeID: string = data.id;

    // helper to create a nice fallback label from a name
    const humanize = (name: string | null) => {
        if (!name) return '';
        return name.split('_').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }

    // Store hookFields and headers as { id, key, name, label, field_id }
    const [hookFields, setHookFields] = useState(data.hookFields.map((f: any) => {
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

    const [headers, setHeaders] = useState(data.headers.map((h: any) => {
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

    const [sendAsJson, setSendAsJson] = useState(data.sendAsJson ?? true);
    const [isSoap, setIsSoap] = useState(data.isSoap || false);



    useEffect(() => {
        // persist the structured arrays back to node data
        data.hookFields = hookFields;
        data.headers = headers;
        updateNodeInternals(nodeID);
    }, [hookFields, headers, updateNodeInternals, nodeID]);

    const removeConnectedEdges = useCallback((handleIds: any | any[]) => {
        const edges = getEdges();
        const handleIdArray = Array.isArray(handleIds) ? handleIds : [handleIds];
        const updatedEdges = edges.filter(edge =>
            !handleIdArray.includes(edge.sourceHandle) && !handleIdArray.includes(edge.targetHandle)
        );
        setEdges(updatedEdges);
    }, [getEdges, setEdges]);

    const addField = () => {
        setHookFields((prevFields: any) => {
            const newFields = [...prevFields, {key: '', name: null, label: '', field_id: null, id: uuidv4()}];
            updateNodeInternals(nodeID);
            return newFields;
        });
    };

    const addHeader = () => {
        setHeaders((prevHeaders: any) => {
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
        data.url = event.target.value;
    };

    const onMethodChange = (newValue: SingleValue<{ value: any; label: any }>) => {
        if (newValue) {
            data.method = newValue.value;
        }
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

    const onSendAsJsonChange = (isChecked: boolean) => {
        setSendAsJson(isChecked);
        data.sendAsJson = isChecked;
    };

    const onIsSoapChange = (isChecked: boolean) => {
        setIsSoap(isChecked);
        data.isSoap = isChecked;
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
                    data.heading = newHeading;
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
                                          nodeID={nodeID}>
                            Response
                        </NodeOutputHandle>
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
                                        />
                                    </div>
                                    <div className={"flex-col"}>
                                        <SelectWithOverride
                                            onChange={(newValue: SingleValue<{
                                                value: any;
                                                label: any;
                                            }>) => onChangeFieldValue(field.id, newValue)}
                                            handleID={field.id + "-field-value-override"}
/*                                            value={{value: field.value, label: field.value}}*/

                                            value={(() => {
                                                const selectedOption = field.name == null
                                                    ? null
                                                    : (fieldOptions.find((o: any) => o.value === field.name) ?? { value: field.name, label: field.label ?? field.name });

                                                return selectedOption;
                                            })()}
                                            nodeID={nodeID}
                                            className={"nodrag text-gray-700"}
                                            isSearchable={true}
                                            options={fieldOptions}
                                            creatable={true}
                                        />
                                    </div>
                                </SortableItem>
                            ))}
                        </SortableContext>
                        <div
                            className="addButton block py-1 text-center w-full"
                            onClick={addField}
                        >
                            <PlusCircle size={24} />
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
                                        />
                                    </div>
                                    <div className={"flex-col"}>
                                        <SelectWithOverride
                                            onChange={(newValue: SingleValue<{
                                                value: any;
                                                label: any;
                                            }>) => onChangeHeaderValue(header.id, newValue)}
                                            handleID={header.id + "-header-value-override"}

                                            value={(() => {
                                                const selectedOption = header.name == null
                                                    ? null
                                                    : (fieldOptions.find((o: any) => o.value === header.name) ?? { value: header.name, label: header.label ?? header.name });

                                                return selectedOption;
                                            })()}
                                            nodeID={nodeID}
                                            className={"nodrag text-gray-700"}
                                            isSearchable={true}
                                            options={fieldOptions}
                                            creatable={true}
                                        />
                                    </div>
                                </SortableItem>
                            ))}
                        </SortableContext>
                        <div
                            className="addButton block py-1 text-center w-full"
                            onClick={addHeader}
                        >
                            <PlusCircle size={24} />
                        </div>
                    </NodeSection>
                </DndContext>

            </NodeBody>
        </>
    );
}
