import NodeHeading from "@/Views/Flows/Nodes/NodeComponents/NodeHeading";
import NodeBody from "@/Views/Flows/Nodes/NodeComponents/NodeBody";
import NodeEndHandle from '@/Views/Flows/Nodes/NodeComponents/NodeEndHandle';
import NodeSection from "@/Views/Flows/Nodes/NodeComponents/NodeSection";
import {usePage} from "@inertiajs/react";
import NodeSectionContent from "@/Views/Flows/Nodes/NodeComponents/NodeSectionContent";
import Input from "@/Components/Input";
import {FlowArrowIcon} from "@phosphor-icons/react";


export default function EntryNode({data, id}: { data: any, id?: string}) {
    // get current node id to include in handle ids — prefer the React Flow node `id`, fall back to data.id for legacy saved flows
    const nodeID: string = id || data.id;
    // ensure the entry node is not deletable (legacy flag kept in data)
    data.isDeletable = false;
    // stray debug logging suppressed
    const {flowID}: any = usePage().props;






    return (
        <>
            <NodeBody>

                <NodeHeading  icon={(<FlowArrowIcon size={50}/>)} onChange={(newHeading: string) => {
                    data.heading = newHeading;
                }}>
                    {data.heading || "Starting point"}
                </NodeHeading>
                <NodeSection className={"flex"}>




                    <div className="flex-1 text-right">
                        <NodeEndHandle

                            onConnect={(params: any) => console.log('handle onConnect', params)}
                            id={"next"}
                            nodeID={nodeID}/>


                    </div>

                </NodeSection>
                <NodeSection>
                    {flowID && <NodeSectionContent>
                    <label className={"block"}>Entry URL: </label><Input className={"nodrag"} value={route('flows.show', {flow: flowID})} readOnly={true}></Input>
                    </NodeSectionContent>
                    }
                </NodeSection>





            </NodeBody>
        </>

    );
}
