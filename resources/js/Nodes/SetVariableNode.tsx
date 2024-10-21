import {Handle, Position} from '@xyflow/react';
import {Select} from "@headlessui/react";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import InputWithOverride from "@/Nodes/NodeComponents/InputWithOverride";
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Nodes/NodeComponents/NodeBody";
import SelectWithoutOverride from "@/Nodes/NodeComponents/SelectWithoutOverride";
import InputWithoutOverride from "@/Nodes/NodeComponents/InputWithoutOverride";
import NodeEndHandle from './NodeComponents/NodeEndHandle';


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
                            nodeID={nodeID}/>

                    </div>
                </div>


                <InputWithoutOverride
                    value={data.variableName}
                    onChange={onVariableNameChange}
                    id={"variableName"}/>

                <InputWithOverride
                    value={data.variableValue} isConnectable={isConnectable}
                    onChange={onVariableValueChange}
                    handleID={"variableValue-override"}
                    nodeID={nodeID}
                />


            </NodeBody>
        </>

    );
}
