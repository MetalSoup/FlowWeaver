import {Handle, Position} from '@xyflow/react';
import {Select} from "@headlessui/react";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import InputWithOverride from "@/Nodes/InputWithOverride";
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Nodes/NodeComponents/NodeBody";
import SelectWithoutOverride from "@/Nodes/SelectWithoutOverride";
import InputWithoutOverride from "@/Nodes/InputWithoutOverride";


export default function SetVariableNode({data, isConnectable}: { data: any, isConnectable: any }) {
    // get current node id to include in handle ids
    const nodeID: string = data.id;


    const onVariableNameChange = (event: { target: { value: any; }; }) => {
        data.variableName = event.target.value;
    }

    const onVariableValueChange = (event: { target: { value: any; }; }) => {
        data.variableValue = event.target.value;
    }


    return (
        <>
            <NodeBody>

                <NodeHeading>
                    Set Variable
                </NodeHeading>


                <InputWithoutOverride value={data.variableName} isConnectable={isConnectable}
                                   onChange={onVariableNameChange} nodeID={nodeID}
                                   id={"variableName"}></InputWithoutOverride>

                <InputWithOverride value={data.variableValue} isConnectable={isConnectable}
                                   onChange={onVariableValueChange} nodeID={nodeID}
                                   id={"variableValue"}></InputWithOverride>


            </NodeBody>
        </>

    );
}
