import { useCallback, useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Nodes/NodeComponents/NodeBody";
import NodeEndHandle from "@/Nodes/NodeComponents/NodeEndHandle";
import InputWithOverride from "@/Nodes/NodeComponents/InputWithOverride";
import NodeOutputHandle from "@/Nodes/NodeComponents/NodeOutputHandle";
import { v4 as uuidv4 } from 'uuid';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/20/solid';
import { useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { SingleValue } from 'react-select';
import SelectWithoutOverride from "@/Nodes/NodeComponents/SelectWithoutOverride";
import SelectWithOverride from "@/Nodes/NodeComponents/SelectWithOverride";
import { usePage } from "@inertiajs/react";


function SortableItem(props: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition } = useSortable({ id: props.id, handle: ".handle" });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={"bg-white/10 pt-3 mb-3 relative flex"}>
            {props.children}
        </div>
    );
}

export default function WebhookNode({ data, isConnectable }: { data: any, isConnectable: any }) {
    const { fields }: any = usePage().props;


    const fieldOptions = fields.map((field: any) => ({
        value: field.id,
        label: field.name,
    }));
    const { getEdges, setEdges } = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();

    if (!Array.isArray(data.hookFields)) {
        data.hookFields = [];
    }
    if (!Array.isArray(data.headers)) {
        data.headers = [];
    }
    const nodeID: string = data.id;

    const [hookFields, setHookFields] = useState(data.hookFields.map((field: any) => ({ ...field, id: uuidv4() })));
    const [headers, setHeaders] = useState(data.headers.map((header: any) => ({ ...header, id: uuidv4() })));
    const [sendAsJson, setSendAsJson] = useState(data.sendAsJson || true);
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
            const newFields = [...prevFields, { key: '', value: '', id: uuidv4() }];
            updateNodeInternals(nodeID);
            return newFields;
        });
    };

    const addHeader = () => {
        setHeaders((prevHeaders: any) => {
            const newHeaders = [...prevHeaders, { key: '', value: '', id: uuidv4() }];
            updateNodeInternals(nodeID);
            return newHeaders;
        });
    };

    const onDeleteField = (id: string) => {
        removeConnectedEdges([`key_${id}-override`, `value_${id}-override`]);
        setHookFields((prevFields: any[]) => {
            const updatedFields = prevFields.filter((field: any) => field.id !== id);
            updateNodeInternals(nodeID);
            return updatedFields;
        });
    };

    const onDeleteHeader = (id: string) => {
        removeConnectedEdges([`key_${id}-override`, `value_${id}-override`]);
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
                    field.id === id ? { ...field, value: newValue.value } : field
                );
            }
        });
    };

    const onChangeFieldKey = (id: string, event: { target: { value: any; id: string; }; }) => {
        setHookFields((prevFields: any[]) => {
            return prevFields.map((field: any) =>
                field.id === id ? { ...field, key: event.target.value } : field
            );
        });
    };

    const onChangeHeader = (event: { target: { value: any; id: string; }; }) => {
        const [headerType, id] = event.target.id.split('_');
        setHeaders((prevHeaders: any[]) => {
            return prevHeaders.map((header: any) =>
                header.id === id ? { ...header, [headerType]: event.target.value } : header
            );
        });
    };

    const onSendAsJsonChange = (event: { target: { checked: boolean; }; }) => {
        setSendAsJson(event.target.checked);
        data.sendAsJson = event.target.checked;
    };

    const onIsSoapChange = (event: { target: { checked: boolean; }; }) => {
        setIsSoap(event.target.checked);
        data.isSoap = event.target.checked;
    };

    const onDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setHookFields((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <>
            <NodeBody>
                <NodeHeading>
                    Webhook
                </NodeHeading>

                <div className={"flex min-w-48 pb-5"}>
                    <div className="flex-none w-14">
                        <NodeStartHandle
                            id={"previous"} nodeID={nodeID}
                            onConnect={(params: any) => console.log('handle onConnect', params)}
                            isConnectable={isConnectable}
                        />
                    </div>

                    <div className="flex-1 text-right">
                        <NodeEndHandle
                            isConnectable={isConnectable}
                            onConnect={(params: any) => console.log('handle onConnect', params)}
                            id={"next"}
                            nodeID={nodeID}>

                        </NodeEndHandle>

                        <NodeOutputHandle id={"response"} isConnectable={isConnectable}
                                          onConnect={(params: any) => console.log('handle onConnect', params)}
                                          nodeID={nodeID}>
                            Response
                        </NodeOutputHandle>
                    </div>
                </div>

                <InputWithOverride
                    isConnectable={isConnectable}
                    onChange={onChangeURL}
                    handleID={"webhookURL-override"}
                    value={data.url}
                    label={"Endpoint URL"}
                    nodeID={nodeID}
                />
                <SelectWithoutOverride
                    onChange={onMethodChange}
                    className={"nodrag text-gray-700"}
                    id={"method"}
                    value={{ value: data.method || "GET", label: data.method || "GET" }}
                    isSearchable={false}
                    options={[
                        { value: "GET", label: "GET" },
                        { value: "POST", label: "POST" },
                        { value: "PUT", label: "PUT" },
                        { value: "DELETE", label: "DELETE" }
                    ]}
                />

                <div className="p-2">
                    <label>
                        <input
                            type="checkbox"
                            checked={sendAsJson}
                            onChange={onSendAsJsonChange}
                        />
                        Send as JSON
                    </label>
                </div>

                <div className="p-2">
                    <label>
                        <input
                            type="checkbox"
                            checked={isSoap}
                            onChange={onIsSoapChange}
                        />
                        Use SOAP
                    </label>
                </div>

                <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={hookFields} strategy={verticalListSortingStrategy}>

                        <div className={"relative nodrag"}>
                            <button
                                className="absolute top-0 right-0 bg-transparent text-gray-200 hover:text-blue-500"
                                onClick={addField}
                            >
                                <PlusCircleIcon className="h-5 w-5"/>
                            </button>
                            <h2 className={"font-bold siz"}>Fields</h2>
                            {hookFields.map((field: any) => (
                                <SortableItem  key={field.id} id={field.id}>
                                    <div className="drag-handle cursor-move p-2"> {/* Handle element */}
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                                        </svg>
                                    </div>
                                    <div className={"flex-col"}>
                                        <InputWithOverride
                                            isConnectable={isConnectable}
                                            placeholder={"key"}
                                            onChange={(id: any, event: {
                                                target: { value: any; id: string; };
                                            }) => onChangeFieldKey(field.id, event)}
                                            handleID={"key_" + field.id + "-override"}
                                            value={field.key}
                                            nodeID={nodeID}
                                        />
                                    </div>
                                    <div className={"flex-col"}>
                                        <SelectWithOverride
                                            isConnectable={isConnectable}
                                            onChange={(newValue: SingleValue<{
                                                value: any;
                                                label: any;
                                            }>) => onChangeFieldValue(field.id, newValue)}
                                            handleID={"value_" + field.id + "-override"}
                                            value={{value: field.value, label: field.value}}
                                            nodeID={nodeID}
                                            className={"nodrag text-gray-700"}
                                            isSearchable={true}
                                            options={fieldOptions}
                                        />
                                    </div>
                                    <button
                                        className="absolute top-0 right-0 bg-transparent text-gray-200 hover:text-red-500"
                                        onClick={() => onDeleteField(field.id)}
                                    >
                                        <TrashIcon className="h-5 w-5"/>
                                    </button>
                                </SortableItem>
                            ))}
                        </div>
                    </SortableContext>

                    <SortableContext items={headers} strategy={verticalListSortingStrategy}>
                        <div className={"relative nodrag"}>
                            <button
                                className="absolute top-0 right-0 bg-transparent text-gray-200 hover:text-blue-500"
                                onClick={addHeader}
                            >
                                <PlusCircleIcon className="h-5 w-5" />
                            </button>
                            <h2>Headers</h2>
                            {headers.map((header: any) => (
                                <SortableItem key={header.id} id={header.id}>
                                    <div className={"flex-col"}>
                                        <InputWithOverride
                                            isConnectable={isConnectable}
                                            placeholder={"key"}
                                            onChange={onChangeHeader}
                                            handleID={"key_" + header.id + "-override"}
                                            value={header.key}
                                            nodeID={nodeID}
                                        />
                                    </div>
                                    <div className={"flex-col"}>
                                        <InputWithOverride
                                            isConnectable={isConnectable}
                                            placeholder={"value"}
                                            onChange={onChangeHeader}
                                            handleID={"value_" + header.id + "-override"}
                                            value={header.value}
                                            nodeID={nodeID}
                                        />
                                    </div>
                                    <button
                                        className="absolute top-0 right-0 bg-transparent text-gray-200 hover:text-red-500"
                                        onClick={() => onDeleteHeader(header.id)}
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </SortableItem>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <div className="relative">
                    <div className="p-2"></div>
                </div>
            </NodeBody>
        </>
    );
}
