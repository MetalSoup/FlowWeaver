import {Handle, Position} from '@xyflow/react';
import {Select} from "@headlessui/react";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import InputWithOverride from "@/Nodes/NodeComponents/InputWithOverride";
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Nodes/NodeComponents/NodeBody";
import SelectWithoutOverride from "@/Nodes/NodeComponents/SelectWithoutOverride";
import InputWithoutOverride from "@/Nodes/NodeComponents/InputWithoutOverride";
import NodeOutputHandle from "@/Nodes/NodeComponents/NodeOutputHandle";
import NodeSection from "@/Nodes/NodeComponents/NodeSection";


export default function GetVariableNode({data}: { data: any}) {
    // get current node id to include in handle ids
    const nodeID: string = data.id;


    const onVariableNameChange = (event: { target: { value: any; }; }) => {
        data.variableName = event.target.value;
    }


    return (
        <>
            <NodeBody>
                <NodeHeading onChange={(newHeading: string) => {
                    data.heading = newHeading;
                }}>
                    {data.heading || "Get Variable"}
                </NodeHeading>

                <NodeSection>

                    <div className="flex-1 text-right">
                    </div>
                    <NodeOutputHandle
                                      nodeID={nodeID}
                                      id={"value"}>
                    </NodeOutputHandle>

                </NodeSection>
                <NodeSection>

                <InputWithoutOverride value={data.variableName}
                                      onChange={onVariableNameChange}
                                      id={nodeID+"_variableName"}/>
                </NodeSection>


            </NodeBody>
        </>

    );
}
