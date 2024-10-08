import {Handle, Position} from '@xyflow/react';
import TextInput from "@/Components/TextInput";
import {json} from "node:stream/consumers";
import {useState} from "react";



// @ts-ignore
export default function WebhookNode({data, isConnectable}) {

    if (!data.details) {
        data.details = { fields: [] };
    } else if (!Array.isArray(data.details.fields)) {
        data.details.fields = [];
    }

    const [fields, setFields] = useState(data.details.fields || {name: '' , value: ''});


    const addField = () => {
        setFields([...fields, { name: '' }]);
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

            <div className="relative bg-gray-300 dark:bg-gray-700 dark:text-white p-2 pl-4">
                <Handle
                    type="target"
                    position={Position.Left}
                    style={{position: 'absolute', top: '50%'}}
                    onConnect={(params) => console.log('handle onConnect', params)}
                    isConnectable={isConnectable}
                    id="previous"
                />
                <h2>Webhook</h2>
            </div>
            <div className="relative dark:bg-gray-600 bg-gray-100 dark:text-white">
                <div className="hook_url">

                    <div className="w-full">
                        <label className="block uppercase tracking-wide font-bold mb-2 p-2"
                               htmlFor="grid-first-name">
                            URL
                        </label>

                        <div className="relative">
                            <Handle
                                type="target"
                                position={Position.Left}
                                style={{position: 'absolute', top: '50%'}}
                                onConnect={(params) => console.log('handle onConnect', params)}
                                isConnectable={isConnectable}
                                id={"webhook_url"}
                            />
                            <div className="p-2">
                            <input
                                className="nodrag appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                id="grid-first-name"
                                type="text"
                                placeholder=""
                                onChange={onChangeURL}
                                defaultValue={data.url}

                            />
                            </div>
                        </div>

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

                            >Add Field</button>
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
        </>
    );
}
