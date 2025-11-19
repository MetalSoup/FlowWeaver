import NodeHeading from "@/Views/Flows/Nodes/NodeComponents/NodeHeading";
import NodeBody from "@/Views/Flows/Nodes/NodeComponents/NodeBody";
import NodeEndHandle from '@/Views/Flows/Nodes/NodeComponents/NodeEndHandle';
import NodeSection from "@/Views/Flows/Nodes/NodeComponents/NodeSection";
import {usePage} from "@inertiajs/react";
import NodeSectionContent from "@/Views/Flows/Nodes/NodeComponents/NodeSectionContent";


export default function EntryNode({data}: { data: any}) {
    // get current node id to include in handle ids
    const nodeID: string = data.id;
    data.isDeletable = false;
    // stray debug logging suppressed
    const {flowID}: any = usePage().props;






    return (
        <>
            <NodeBody>

                <NodeHeading onChange={(newHeading: string) => {
                    data.heading = newHeading;
                }}>
                    {data.heading || "Starting point"}
                </NodeHeading>
                <NodeSection className={"flex"}>




                    <div className="flex-1 text-right">
                        <NodeEndHandle

                            onConnect={(params: any) => { /* onConnect (logging suppressed) */ }}
                            id={"next"}
                            nodeID={nodeID}/>

                    </div>

                </NodeSection>
                <NodeSection>
                    {flowID && <NodeSectionContent>
                    <label className={"block"}>Entry URL: </label><input className={"text-gray-900 nodrag"} value={route('flows.show', {flow: flowID})} readOnly={true}></input>
                    </NodeSectionContent>
                    }
                </NodeSection>





            </NodeBody>
        </>

    );
}
