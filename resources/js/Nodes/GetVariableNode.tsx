import {Handle, Position} from '@xyflow/react';
import {Select} from "@headlessui/react";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import InputWithOverride from "@/Nodes/NodeComponents/InputWithOverride";
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Nodes/NodeComponents/NodeBody";
import SelectWithoutOverride from "@/Nodes/NodeComponents/SelectWithoutOverride";
import InputWithoutOverride from "@/Nodes/NodeComponents/InputWithoutOverride";
import NodeOutputHandle from "@/Nodes/NodeComponents/NodeOutputHandle";


export default function GetVariableNode({data, isConnectable}: { data: any, isConnectable: any }) {
    // get current node id to include in handle ids
    const nodeID: string = data.id;


    const onVariableNameChange = (event: { target: { value: any; }; }) => {
        data.variableName = event.target.value;
    }


    return (
        <>
            <NodeBody>

                <NodeHeading>
                    Get Variable
                </NodeHeading>
                <div className={"flex min-w-48 pb-5"}>
                    <div className="flex-1 text-right">
                    </div>
                    <NodeOutputHandle isConnectable={isConnectable}
                                      nodeID={nodeID}
                                      id={"variableValue"}>
                    </NodeOutputHandle>
                </div>

                <InputWithoutOverride value={data.variableName} isConnectable={isConnectable}
                                      onChange={onVariableNameChange} nodeID={nodeID}
                                      id={"variableName"}></InputWithoutOverride>


            </NodeBody>
        </>

    );
}
