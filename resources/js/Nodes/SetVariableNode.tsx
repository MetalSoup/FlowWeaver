import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import InputWithOverride from "@/Nodes/NodeComponents/InputWithOverride";
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Nodes/NodeComponents/NodeBody";
import InputWithoutOverride from "@/Nodes/NodeComponents/InputWithoutOverride";
import NodeEndHandle from './NodeComponents/NodeEndHandle';
import NodeSection from "@/Nodes/NodeComponents/NodeSection";


export default function SetVariableNode({data}: { data: any }) {
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

                <NodeHeading onChange={(newHeading: string) => {
                    data.heading = newHeading;
                }}>
                    {data.heading || "Set Variable"}
                </NodeHeading>
                <NodeSection className={"flex"}>

                    <div className="flex-none w-14">
                        <NodeStartHandle
                            id={"previous"} nodeID={nodeID}
                            onConnect={(params: any) => console.log('handle onConnect', params)}

                        />
                    </div>

                    <div className="flex-1 text-right">
                        <NodeEndHandle

                            onConnect={(params: any) => console.log('handle onConnect', params)}
                            id={"next"}
                            nodeID={nodeID}/>

                    </div>

                </NodeSection>
                <NodeSection>


                    <InputWithoutOverride
                        value={data.variableName}
                        onChange={onVariableNameChange}
                        id={"variableName"}
                        className={"mb-7"}
                    />


                    <InputWithOverride
                        value={data.variableValue}
                        onConnect={(params: any) => console.log('handle onConnect', params)}
                        onChange={onVariableValueChange}
                        handleID={"variableValue-override"}
                        nodeID={nodeID}
                    />
                </NodeSection>


            </NodeBody>
        </>

    );
}
