import { useCallback, useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Nodes/NodeComponents/NodeBody";
import NodeEndHandle from "@/Nodes/NodeComponents/NodeEndHandle";
import InputWithOverride from "@/Nodes/NodeComponents/InputWithOverride";
import SelectWithoutOverride from "@/Nodes/NodeComponents/SelectWithoutOverride";
import NodeOutputHandle from "@/Nodes/NodeComponents/NodeOutputHandle";
import { v4 as uuidv4 } from 'uuid';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/20/solid';
import { useReactFlow, useUpdateNodeInternals } from "@xyflow/react";

export default function WebhookNode({ data, isConnectable }: { data: any, isConnectable: any }) {
    const { getEdges, setEdges } = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();

    if (!Array.isArray(data.fields)) {
        data.fields = [];
    }
    if (!Array.isArray(data.headers)) {
        data.headers = [];
    }
    const nodeID: string = data.id;

    const [fields, setFields] = useState(data.fields.map((field: any) => ({ ...field, id: uuidv4() })));
    const [headers, setHeaders] = useState(data.headers.map((header: any) => ({ ...header, id: uuidv4() })));
    const [sendAsJson, setSendAsJson] = useState(data.sendAsJson || true);
    const [isSoap, setIsSoap] = useState(data.isSoap || false);

    useEffect(() => {
        data.fields = fields;
        data.headers = headers;
        updateNodeInternals(nodeID);
    }, [fields, headers, updateNodeInternals, nodeID]);

    const removeConnectedEdges = useCallback((handleIds: any | any[]) => {
        const edges = getEdges();
        const handleIdArray = Array.isArray(handleIds) ? handleIds : [handleIds];
        const updatedEdges = edges.filter(edge =>
            !handleIdArray.includes(edge.sourceHandle) && !handleIdArray.includes(edge.targetHandle)
        );
        setEdges(updatedEdges);
    }, [getEdges, setEdges]);

    const addField = () => {
        setFields((prevFields: any) => {
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
        setFields((prevFields: any[]) => {
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

    const onMethodChange = (event: { target: { value: any; }; }) => {
        data.method = event.target.value;
    };

    const onChangeField = (event: { target: { value: any; id: string; }; }) => {
        const [fieldType, id] = event.target.id.split('_');
        setFields((prevFields: any[]) => {
            return prevFields.map((field: any) =>
                field.id === id ? {...field, [fieldType]: event.target.value} : field
            );
        });
    };

    const onChangeHeader = (event: { target: { value: any; id: string; }; }) => {
        const [headerType, id] = event.target.id.split('_');
        setHeaders((prevHeaders: any[]) => {
            return prevHeaders.map((header: any) =>
                header.id === id ? {...header, [headerType]: event.target.value} : header
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

    const onDragEnd = (result: any) => {
        if (!result.destination) return;

        const reorder = (list: any[], startIndex: number, endIndex: number) => {
            const result = Array.from(list);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result;
        };

        if (result.type === "fields") {
            setFields((prevFields: any[]) => reorder(prevFields, result.source.index, result.destination.index));
        } else if (result.type === "headers") {
            setHeaders((prevHeaders: any[]) => reorder(prevHeaders, result.source.index, result.destination.index));
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

                <InputWithOverride isConnectable={isConnectable} onChange={onChangeURL} id={nodeID+"_webhookURL"}
                                   value={data.url} label={"Endpoint URL"} />

                <SelectWithoutOverride
                    label={"Method"}
                    onChange={onMethodChange}
                    value={data.method || "GET"}
                    id={nodeID+"_method"}

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

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="fields" type="fields">
                        {(provided) => (
                            <div className={"relative nodrag"} {...provided.droppableProps} ref={provided.innerRef}>
                                <button
                                    className="absolute top-0 right-0 bg-transparent text-gray-200 hover:text-blue-500"
                                    onClick={addField}
                                >
                                    <PlusCircleIcon className="h-5 w-5"/>
                                </button>
                                <h2 className={"font-bold siz"}>Fields</h2>
                                {fields.map((field: any, index: number) => (
                                    <Draggable key={field.id} draggableId={field.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={"bg-white/10 pt-3 overflow-hidden mb-3 relative flex"}
                                            >
                                                <div className={"flex-col"}>
                                                    <InputWithOverride
                                                        isConnectable={isConnectable} placeholder={"key"}
                                                        onChange={onChangeField} id={"key_" + field.id} value={field.key}
                                                    />
                                                </div>
                                                <div className={"flex-col"}>
                                                    <InputWithOverride
                                                        isConnectable={isConnectable} placeholder={"value"}
                                                        onChange={onChangeField} id={"value_" + field.id} value={field.value}
                                                    />
                                                </div>
                                                <button
                                                    className="absolute top-0 right-0 bg-transparent text-gray-200 hover:text-red-500"
                                                    onClick={() => onDeleteField(field.id)}
                                                >
                                                    <TrashIcon className="h-5 w-5"/>
                                                </button>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>

                    <Droppable droppableId="headers" type="headers">
                        {(provided) => (
                            <div className={"relative nodrag"} {...provided.droppableProps} ref={provided.innerRef}>
                                <button
                                    className="absolute top-0 right-0 bg-transparent text-gray-200 hover:text-blue-500"
                                    onClick={addHeader}
                                >
                                    <PlusCircleIcon className="h-5 w-5"/>
                                </button>
                                <h2>Headers</h2>
                                {headers.map((header: any, index: number) => (
                                    <Draggable key={header.id} draggableId={header.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={"bg-white/10 pt-3 overflow-hidden mb-3 relative flex"}
                                            >
                                                <div className={"flex-col"}>
                                                    <InputWithOverride
                                                        isConnectable={isConnectable} placeholder={"key"}
                                                        onChange={onChangeHeader} id={"key_" + header.id} value={header.key}
                                                    />
                                                </div>
                                                <div className={"flex-col"}>
                                                    <InputWithOverride
                                                        isConnectable={isConnectable} placeholder={"value"}
                                                        onChange={onChangeHeader} id={"value_" + header.id} value={header.value}
                                                    />
                                                </div>
                                                <button
                                                    className="absolute top-0 right-0 bg-transparent text-gray-200 hover:text-red-500"
                                                    onClick={() => onDeleteHeader(header.id)}
                                                >
                                                    <TrashIcon className="h-5 w-5"/>
                                                </button>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <div className="relative">
                    <div className="p-2"></div>
                </div>
            </NodeBody>
        </>
    );
}
