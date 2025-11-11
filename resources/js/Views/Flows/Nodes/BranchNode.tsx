import {useState} from "react";
import NodeHeading from "@/Views/Flows/Nodes/NodeComponents/NodeHeading";
import CheckBoxWithOverride from "@/Views/Flows/Nodes/NodeComponents/CheckBoxWithOverride";
import NodeBody from './NodeComponents/NodeBody';
import NodeStartHandle from "@/Views/Flows/Nodes/NodeComponents/NodeStartHandle";
import NodeEndHandle from "@/Views/Flows/Nodes/NodeComponents/NodeEndHandle";
import NodeSection from "@/Views/Flows/Nodes/NodeComponents/NodeSection";


export default function BranchNode({data}: { data: any }) {

    if (!data.details) {
        data.details = {fields: []};
    } else if (!Array.isArray(data.details.fields)) {
        data.details.fields = [];
    }




    const [isTrue, setIsTrue] = useState(data.isTrue ?? true);


    const onChangeBool = (isChecked: boolean) => {
        setIsTrue(isChecked);
        data.isTrue = isChecked;
    }


    const nodeID: string = data.id;


    return (
        <>
            <NodeBody>

                <NodeHeading onChange={(newHeading: string) => {
                    data.heading = newHeading;
                }}>
                    {data.heading || "Branch"}
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
                            id={"trueNext"}
                            nodeID={nodeID}>
                            True
                        </NodeEndHandle>
                        <NodeEndHandle

                            onConnect={(params: any) => console.log('handle onConnect', params)}
                            id={"falseNext"}
                            nodeID={nodeID}>
                            False
                        </NodeEndHandle>

                    </div>
                </NodeSection>
                <NodeSection>

                <CheckBoxWithOverride
                    onChange={onChangeBool}
                    onConnect={(params: any) => console.log('handle onConnect', params)}
                    id={"boolean"}
                    handleID={"boolean-override"}
                    isTrue={isTrue}
                    nodeID={nodeID}
                    label={"Condition"}
                    dataType={"boolean"}
                >

                </CheckBoxWithOverride>
                </NodeSection>


            </NodeBody>


        </>
    );
}
