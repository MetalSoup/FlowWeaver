import {Handle, Position} from '@xyflow/react';
import TextInput from "@/Components/TextInput";
import {json} from "node:stream/consumers";
import {useState} from "react";
import {Select} from "@headlessui/react";



// @ts-ignore
export default function ComparisonNode({data, isConnectable}) {

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

    const onChangeOperator = (event: { target: { value: any; }; }) => {
        data.operator = event.target.value;
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
                <h2>Comparison</h2>
            </div>

            <input
                className="nodrag appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="grid-comparand-left"
                type="text"
                placeholder=""
                onChange={onChangeURL}
                defaultValue={data.comparandLeft}

            />
            <Handle
                type="target"
                position={Position.Left}
                id="comparandRightOverride"
                style={{bottom: 30, top: 'auto'}}
                isConnectable={isConnectable}
            />

            <Handle
                type="target"
                position={Position.Left}
                id="comparandRightOverride"
                style={{bottom: 10, top: 'auto'}}
                isConnectable={isConnectable}
            />

            <input
                className="nodrag appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="grid-comparand-right"
                type="text"
                placeholder=""
                onChange={onChangeURL}
                defaultValue={data.comparandRight}

            />


            <div className="relative dark:bg-gray-600 bg-gray-100 dark:text-white">
                <div className="hook_url">

                    <div className="w-full">
                        <label className="block uppercase tracking-wide font-bold mb-2 p-2"
                               htmlFor="grid-first-name">
                            Comparison
                        </label>

                        <div className="relative">
                            <Handle
                                type="target"
                                position={Position.Left}
                                style={{position: 'absolute', top: '50%'}}
                                onConnect={(params) => console.log('handle onConnect', params)}
                                isConnectable={isConnectable}
                                id={"comparison_operator"}
                            />
                            <div className="p-2">
                                <Select defaultValue={data.operator} onChange={onChangeOperator}
                                        className={"nodrag appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"}>
                                    <option value={"=="}>Equal to</option>
                                    <option value={">"}>Greater than</option>
                                    <option value={"<"}>Less than</option>
                                    <option value={"!="}>Not equal to</option>
                                </Select>

                            </div>
                        </div>

                    </div>


                </div>
            </div>


            <Handle
                type="source"
                position={Position.Right}
                id="trueNext"
                style={{bottom: 30, top: 'auto'}}
                isConnectable={isConnectable}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="falseNext"
                style={{bottom: 10, top: 'auto'}}
                isConnectable={isConnectable}
            />
        </>
    );
}
