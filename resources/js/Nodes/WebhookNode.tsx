import { useEffect, useState } from "react";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Nodes/NodeComponents/NodeBody";
import NodeEndHandle from "@/Nodes/NodeComponents/NodeEndHandle";
import InputWithOverride from "@/Nodes/NodeComponents/InputWithOverride";
import SelectWithoutOverride from "@/Nodes/NodeComponents/SelectWithoutOverride";
import NodeOutputHandle from "@/Nodes/NodeComponents/NodeOutputHandle";
import { v4 as uuidv4 } from 'uuid';
import {PlusCircleIcon, TrashIcon} from '@heroicons/react/20/solid';

export default function WebhookNode({ data, isConnectable }: { data: any, isConnectable: any }) {

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
    }, [fields]);

    useEffect(() => {
        data.headers = headers;
    }, [headers]);

    const addField = () => {
        setFields([...fields, { key: '', value: '', id: uuidv4() }]);
    };

    const addHeader = () => {
        setHeaders([...headers, { key: '', value: '', id: uuidv4() }]);
    };

    const onDeleteField = (id: string) => {
        const updatedFields = fields.filter((field: any) => field.id !== id);
        setFields(updatedFields);
    };

    const onDeleteHeader = (id: string) => {
        const updatedHeaders = headers.filter((header: any) => header.id !== id);
        setHeaders(updatedHeaders);
    };

    const onChangeURL = (event: { target: { value: any; }; }) => {
        data.url = event.target.value;
    };

    const onMethodChange = (event: { target: { value: any; }; }) => {
        data.method = event.target.value;
    };

    const onChangeField = (event: { target: { value: any; id: string; }; }) => {
        const [fieldType, id] = event.target.id.split('_');
        const updatedFields = fields.map((field: any) =>
            field.id === id ? { ...field, [fieldType]: event.target.value } : field
        );
        setFields(updatedFields);
    };

    const onChangeHeader = (event: { target: { value: any; id: string; }; }) => {
        const [headerType, id] = event.target.id.split('_');
        const updatedHeaders = headers.map((header: any) =>
            header.id === id ? { ...header, [headerType]: event.target.value } : header
        );
        setHeaders(updatedHeaders);
    };

    const onSendAsJsonChange = (event: { target: { checked: boolean; }; }) => {
        setSendAsJson(event.target.checked);
        data.sendAsJson = event.target.checked;
    };

    const onIsSoapChange = (event: { target: { checked: boolean; }; }) => {
        setIsSoap(event.target.checked);
        data.isSoap = event.target.checked;
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

                <SelectWithoutOverride label={"Method"} onChange={onMethodChange} value={data.method}>
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                </SelectWithoutOverride>
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
                <div className={"relative"}>
                    <button
                        className="absolute top-0 right-0 bg-transparent text-gray-200 hover:text-blue-500"
                        onClick={addField}
                    >
                        <PlusCircleIcon className="h-5 w-5"/>
                    </button>
                    <h2 className={"font-bold siz"}>Fields

                    </h2>
                    {fields.map((field: any) => (
                        <div key={field.id} className={"bg-white/10 pt-3 overflow-hidden mb-3 relative flex"}>
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
                                className="absolute top-2 right-0 bg-transparent text-gray-200 hover:text-red-500"
                                onClick={() => onDeleteField(field.id)}
                            >
                                <TrashIcon className="h-5 w-5"/>
                            </button>
                        </div>
                    ))}
                </div>


                <div className={"relative"}>
                    <button
                        className="absolute top-0 right-0 bg-transparent text-gray-200 hover:text-blue-500"
                        onClick={addHeader}
                    >
                        <PlusCircleIcon className="h-5 w-5"/>
                    </button>
                    <h2>Headers</h2>
                    {headers.map((header: any) => (
                        <div key={header.id} className={"bg-white/10 pt-3 overflow-hidden mb-3 relative"}>
                            <InputWithOverride
                                isConnectable={isConnectable} placeholder={"key"}
                                onChange={onChangeHeader} id={"key_" + header.id} value={header.key}
                            />
                            <InputWithOverride
                                isConnectable={isConnectable} placeholder={"value"}
                                onChange={onChangeHeader} id={"value_" + header.id} value={header.value}
                            />
                            <button
                                className="absolute top-2 right-0 bg-transparent text-gray-200 hover:text-red-500"
                                onClick={() => onDeleteHeader(header.id)}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>


                <div className="relative">
                    <div className="p-2">


                    </div>
                </div>
            </NodeBody>
        </>
    );
}
