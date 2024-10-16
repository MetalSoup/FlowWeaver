import {Handle, Position} from '@xyflow/react';
import {Select} from "@headlessui/react";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import InputWithOverride from "@/Nodes/NodeComponents/InputWithOverride";
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Nodes/NodeComponents/NodeBody";
import SelectWithoutOverride from "@/Nodes/NodeComponents/SelectWithoutOverride";
import NodeOutputHandle from "@/Nodes/NodeComponents/NodeOutputHandle";


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
                <div className={"flex min-w-48 pb-5"}>
                    <div className="flex-1 text-right">
                    </div>
                    <NodeOutputHandle isConnectable={isConnectable}
                                      nodeID={nodeID}
                                      id={"boolOutput"}>
                    </NodeOutputHandle>
                </div>


                <InputWithOverride value={data.leftComparand} isConnectable={isConnectable}
                                   onChange={leftComparandChange} nodeID={nodeID}
                                   id={"leftComparand"}></InputWithOverride>
                <SelectWithoutOverride value={data.operator} onChange={onChangeOperator}>
                    <option value={"=="}>Equal to</option>
                    <option value={">"}>Greater than</option>
                    <option value={"<"}>Less than</option>
                    <option value={"!="}>Not equal to</option>
                    <option value={"regex"}>Matches Regular expression</option>
                </SelectWithoutOverride>
                <InputWithOverride value={data.rightComparand} isConnectable={isConnectable}
                                   onChange={rightComparandChange} nodeID={nodeID}
                                   id={"rightComparand"}></InputWithOverride>


            </NodeBody>
        </>

    );
}
