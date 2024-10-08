import {Handle, Position} from '@xyflow/react';
import TextInput from "@/Components/TextInput";
import {json} from "node:stream/consumers";
import {useState} from "react";
import {Select} from "@headlessui/react";
import Checkbox from "@/Components/Checkbox";



// @ts-ignore
export default function BranchNode({data, isConnectable}) {

    if (!data.details) {
        data.details = { fields: [] };
    } else if (!Array.isArray(data.details.fields)) {
        data.details.fields = [];
    }


    const [isTrue, setIsTrue] = useState(data.isTrue || false);



    const onChangeBool = (event: { target: { checked: boolean; }; }) => {
        setIsTrue(event.target.checked);
        data.isTrue = event.target.checked;
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
                <h2>Branch</h2>
            </div>
            <div className={"relative"}>
                <label>Is True?</label>
                <Handle
                    type="target"
                    position={Position.Left}
                    id="booleanOverride"
                    isConnectable={isConnectable}
                />
                <Checkbox
                    className=""
                    id="grid-boolean"
                    type="checkbox"
                    placeholder=""
                    onChange={onChangeBool}
                    checked={isTrue}

                /></div>


            <div className={"relative text-right pr-5"}>True
                <Handle
                    type="source"
                    position={Position.Right}
                id="trueNext"

                isConnectable={isConnectable}
            />
            </div>
            <div className={"relative text-right pr-5"}>False
                <Handle
                type="source"
                position={Position.Right}
                id="falseNext"

                isConnectable={isConnectable}
            />
            </div>











        </>
    );
}
