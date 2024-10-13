import {Handle, Position} from '@xyflow/react';
import {useState} from "react";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Nodes/NodeComponents/NodeBody";
import NodeEndHandle from "@/Nodes/NodeComponents/NodeEndHandle";
import InputWithOverride from "@/Nodes/InputWithOverride";


// @ts-ignore
export default function WebhookNode({data, isConnectable}) {

    if (!data.details) {
        data.details = {fields: []};
    } else if (!Array.isArray(data.details.fields)) {
        data.details.fields = [];
    }
    const nodeID: string = data.id;

    const [fields, setFields] = useState(data.details.fields || {name: '', value: ''});


    const addField = () => {
        setFields([...fields, {name: ''}]);
        data.details.fields = fields;
    };

    const onChangeURL = (event: { target: { value: any; }; }) => {


        data.url = event.target.value;


    }

    const onChangeField = (event: { target: { value: any; }; }) => {
        // update all fields
        setFields(fields.map((field: any) => {
            return {
                ...field,
                name: event.target.value
            };
        }));
    }




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


                    </div>
                </div>

                <InputWithOverride isConnectable={isConnectable} onChange={onChangeURL} id={"webhookURL"} value={data.url} nodeID={nodeID}>

                </InputWithOverride>

                <div className="relative dark:bg-gray-600 bg-gray-100 dark:text-white">
                    <div className="hook_url">

                        <div className="w-full">
                            <label className="block uppercase tracking-wide font-bold mb-2 p-2"
                                   htmlFor="grid-first-name">
                                URL
                            </label>



                        </div>


                    </div>
                </div>
                <div className={"dark:bg-gray-500 dark:text-white p-2"}>
                    <h2>Fields</h2>
                    <div className="w-full">
                        <label className="block uppercase tracking-wide font-bold mb-2 p-2"
                               htmlFor="grid-first-name">
                            Field Name
                        </label>


                        {fields.map((field: any, index: number) => {
                            return (
                                <div className="relative" key={index}>
                                    <Handle
                                        type="source"
                                        position={Position.Right}
                                        style={{position: 'absolute', top: '50%'}}
                                        onConnect={(params) => console.log('handle onConnect', params)}
                                        isConnectable={isConnectable}
                                        id={"webhook_field_" + index}
                                    />
                                    <div className="p-2">
                                        <input
                                            className="nodrag appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                            id="grid-first-name"
                                            type="text"
                                            placeholder=""
                                            defaultValue={field.name}
                                            onChange={onChangeField}
                                        />
                                    </div>
                                </div>
                            );
                        })}


                        <div className="relative">
                            <Handle
                                type="source"
                                position={Position.Right}
                                style={{position: 'absolute', top: '50%'}}
                                onConnect={(params) => console.log('handle onConnect', params)}
                                isConnectable={isConnectable}
                                id={"webhook_field"}
                            />
                            <div className="p-2">

                                <input
                                    className="nodrag appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-first-name"
                                    type="text"
                                    placeholder=""
                                />
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={addField}

                                >Add Field
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


                <Handle
                    type="source"
                    position={Position.Right}
                    id="next"
                    style={{bottom: 10, top: 'auto'}}
                    isConnectable={isConnectable}
                />
            </NodeBody>
        </>
    );
}
