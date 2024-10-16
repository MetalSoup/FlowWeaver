import {useEffect, useState} from "react";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Nodes/NodeComponents/NodeBody";
import NodeEndHandle from "@/Nodes/NodeComponents/NodeEndHandle";
import InputWithOverride from "@/Nodes/NodeComponents/InputWithOverride";
import {Select} from "@headlessui/react";
import SelectWithoutOverride from "@/Nodes/NodeComponents/SelectWithoutOverride";
import NodeOutputHandle from "@/Nodes/NodeComponents/NodeOutputHandle";

export default function WebhookNode({data, isConnectable} :{data:any, isConnectable:any}) {

    if (!Array.isArray(data.fields)) {
        data.fields = [];
    }
    if (!Array.isArray(data.headers)) {
        data.headers = [];
    }
    const nodeID: string = data.id;

    const [fields, setFields] = useState(data.fields || {name: '', value: ''});
    const [headers, setHeaders] = useState(data.headers || {name: '', value: ''});
    const [sendAsJson, setSendAsJson] = useState(data.sendAsJson || false);

    const addField = () => {
        setFields([...fields, {name: '', value: ''}]);
        data.fields = fields;
    };

    const addHeader = () => {
        setHeaders([...headers, {name: '', value: ''}]);
        data.headers = headers;
    };

    const onDeleteField = (index: number) => {
        const updatedFields = fields.filter((_field: any, i: number) => i !== index);
        setFields(updatedFields);
        data.fields = updatedFields;
    };

    const onDeleteHeader = (index: number) => {
        const updatedHeaders = headers.filter((_header: any, i: number) => i !== index);
        setHeaders(updatedHeaders);
        data.headers = updatedHeaders;
    };

    const onChangeURL = (event: { target: { value: any; }; }) => {
        data.url = event.target.value;
    };

    const onMethodChange = (event: { target: { value: any; }; }) => {
        data.method = event.target.value;
    };

    const onChangeField = (event: { target: { value: any; id: string; }; }) => {
        const index = parseInt(event.target.id.split('_')[1], 10);
        const fieldType = event.target.id.split('_')[0];

        const updatedFields = fields.map((field: any, i: number) =>
            i === index ? {...field, [fieldType]: event.target.value} : field
        );

        setFields(updatedFields);
        data.fields = updatedFields;
    };

    const onChangeHeader = (event: { target: { value: any; id: string; }; }) => {
        const index = parseInt(event.target.id.split('_')[1], 10);
        const headerType = event.target.id.split('_')[0];

        const updatedHeaders = headers.map((header: any, i: number) =>
            i === index ? {...header, [headerType]: event.target.value} : header
        );

        setHeaders(updatedHeaders);
        data.headers = updatedHeaders;
    };

    const onSendAsJsonChange = (event: { target: { checked: boolean; }; }) => {
        setSendAsJson(event.target.checked);
        data.sendAsJson = event.target.checked;
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

                <InputWithOverride isConnectable={isConnectable} onChange={onChangeURL} id={"webhookURL"}
                                   value={data.url} nodeID={nodeID} label={"Endpoint URL"}/>

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

                <h2>Fields</h2>
                {fields.map((field: any, index: number) => (
                    <div key={index} className={"bg-white/10 pt-3 overflow-hidden mb-3"}>
                        <InputWithOverride
                            isConnectable={isConnectable} placeholder={"key"}
                            onChange={onChangeField} id={"name_" + index} value={field.name}
                            nodeID={nodeID}/>
                        <InputWithOverride
                            isConnectable={isConnectable} placeholder={"value"}
                            onChange={onChangeField} id={"value_" + index} value={field.value}
                            nodeID={nodeID}/>
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                            onClick={() => onDeleteField(index)}
                        >
                            Remove
                        </button>
                    </div>
                ))}

                <h2>Headers</h2>
                {headers.map((header: any, index: number) => (
                    <div key={index} className={"bg-white/10 pt-3 overflow-hidden mb-3"}>
                        <InputWithOverride
                            isConnectable={isConnectable} placeholder={"key"}
                            onChange={onChangeHeader} id={"name_" + index} value={header.name}
                            nodeID={nodeID}/>
                        <InputWithOverride
                            isConnectable={isConnectable} placeholder={"value"}
                            onChange={onChangeHeader} id={"value_" + index} value={header.value}
                            nodeID={nodeID}/>
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                            onClick={() => onDeleteHeader(index)}
                        >
                            Remove
                        </button>
                    </div>
                ))}

                <div className="relative">
                    <div className="p-2">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={addField}
                        >
                            Add Field
                        </button>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={addHeader}
                        >
                            Add Header
                        </button>
                    </div>
                </div>


            </NodeBody>
        </>
    );
}
