import {Handle, Position} from '@xyflow/react';
import {Select} from "@headlessui/react";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import InputWithOverride from "@/Nodes/InputWithOverride";
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Nodes/NodeComponents/NodeBody";


export default function ComparisonNode({data, isConnectable}: { data: any, isConnectable: any }) {
    // get current node id to include in handle ids
    const nodeID: string = data.id;
    // Set undefined values to default values
    if (!data.operator) {
        data.operator = "==";
    }
    if (!data.leftComparand) {
        data.leftComparand = "";
    }
    if (!data.rightComparand) {
        data.rightComparand = "";
    }


    const leftComparandChange = (event: { target: { value: any; }; }) => {


        data.leftComparand = event.target.value;


    }

    const rightComparandChange = (event: { target: { value: any; }; }) => {


        data.rightComparand = event.target.value;


    }

    const onChangeOperator = (event: { target: { value: any; }; }) => {
        data.operator = event.target.value;
    }


    return (
        <>
            <NodeBody>

                <NodeHeading>
                    Comparison
                </NodeHeading>


                <InputWithOverride value={data.leftComparand} isConnectable={isConnectable}
                                   onChange={leftComparandChange} nodeID={nodeID}
                                   id={"leftComparand"}></InputWithOverride>
                <Select defaultValue={data.operator} onChange={onChangeOperator}
                        className={"nodrag appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"}>
                    <option value={"=="}>Equal to</option>
                    <option value={">"}>Greater than</option>
                    <option value={"<"}>Less than</option>
                    <option value={"!="}>Not equal to</option>
                    <option value={"regex"}>Matches Regular expression</option>
                </Select>
                <InputWithOverride value={data.rightComparand} isConnectable={isConnectable}
                                   onChange={rightComparandChange} nodeID={nodeID}
                                   id={"rightComparand"}></InputWithOverride>

                <div className={"relative mb-4"}>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="boolOutput"
                        isConnectable={isConnectable}
                    />
                </div>
            </NodeBody>
        </>

    );
}
