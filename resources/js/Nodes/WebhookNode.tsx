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
import {PlusCircleIcon} from '@heroicons/react/20/solid';
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

    const fieldOptions = fields.map((field: any) => ({
        value: field.id,
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

    const [hookFields, setHookFields] = useState(data.hookFields.map((field: any) => ({...field, id: field.id || uuidv4()})));
    const [headers, setHeaders] = useState(data.headers.map((header: any) => ({...header, id: header.id || uuidv4()})));
    const [sendAsJson, setSendAsJson] = useState(data.sendAsJson ?? true);
    const [isSoap, setIsSoap] = useState(data.isSoap || false);




    useEffect(() => {
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
            const newFields = [...prevFields, {key: '', value: '', id: uuidv4()}];
            updateNodeInternals(nodeID);
            return newFields;
        });
    };

    const addHeader = () => {
        setHeaders((prevHeaders: any) => {
            const newHeaders = [...prevHeaders, {key: '', value: '', id: uuidv4()}];
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
            if (newValue) {
                return prevFields.map((field: any) =>
                    field.id === id ? {...field, value: newValue.value} : field
                );
            }
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
            if (newValue) {
                return prevHeaders.map((header: any) =>
                    header.id === id ? {...header, value: newValue.value} : header
                );
            }
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
                                            value={{value: field.value, label: field.value}}
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
                            <PlusCircleIcon className="h-6 w-6 mx-auto"/>
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
                                            value={{value: header.value, label: header.value}}
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
                            <PlusCircleIcon className="h-6 w-6 mx-auto"/>
                        </div>
                    </NodeSection>
                </DndContext>

            </NodeBody>
        </>
    );
}
