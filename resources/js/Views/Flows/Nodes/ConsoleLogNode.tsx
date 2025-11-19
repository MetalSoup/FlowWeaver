import NodeHeading from "@/Views/Flows/Nodes/NodeComponents/NodeHeading";
import InputWithOverride from "@/Views/Flows/Nodes/NodeComponents/InputWithOverride";
import NodeStartHandle from "@/Views/Flows/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Views/Flows/Nodes/NodeComponents/NodeBody";
import NodeEndHandle from '@/Views/Flows/Nodes/NodeComponents/NodeEndHandle';
import NodeSection from "@/Views/Flows/Nodes/NodeComponents/NodeSection";
import NodeInputHandle from "@/Views/Flows/Nodes/NodeComponents/NodeInputHandle";
import NodeOutputHandle from "@/Views/Flows/Nodes/NodeComponents/NodeOutputHandle";

export default function ConsoleLogNode({data}: { data: any }) {
     const nodeID: string = data.id;

    // local change handlers write directly into node.data so the flow serializes it
    const onChangeStaticValue = (event: { target: { value: any } }) => {
        data.staticValue = event.target.value;
    }

    return (
        <>
            <NodeBody>
                <NodeHeading onChange={(newHeading: string) => { data.heading = newHeading; }}>
                    {data.heading || "Console Log"}
                </NodeHeading>

                <NodeSection className={"flex"}>
                    <div className="flex-none w-14">
                        <NodeStartHandle id={"previous"} nodeID={nodeID} onConnect={(params:any)=>{}} />
                    </div>

                    <div className="flex-1 text-right">
                        <NodeEndHandle id={"next"} nodeID={nodeID} onConnect={(params:any)=>{}} />
                        <NodeOutputHandle id={nodeID + "-value"} nodeID={nodeID} dataType={"any"}>Output</NodeOutputHandle>
                    </div>
                </NodeSection>

                <NodeSection>
                    {/* Static value fallback when not overridden */}
                    <InputWithOverride
                        value={data.staticValue}
                        onChange={onChangeStaticValue}
                        handleID={"value-override"}
                        nodeID={nodeID}
                        dataType={"any"}
                        label={"Value to log (if no input connected)"}
                    />

                    {/* Allow connection into the value override */}
                    <NodeInputHandle nodeID={nodeID} handleID={"value-override"} dataType={"any"} />
                </NodeSection>
            </NodeBody>
        </>
    );
}
