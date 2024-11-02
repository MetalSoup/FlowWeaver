import {useState} from "react";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import CheckBoxWithOverride from "@/Nodes/NodeComponents/CheckBoxWithOverride";
import NodeBody from './NodeComponents/NodeBody';
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeEndHandle from "@/Nodes/NodeComponents/NodeEndHandle";
import NodeSection from "@/Nodes/NodeComponents/NodeSection";


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
                >

                </CheckBoxWithOverride>
                </NodeSection>


            </NodeBody>


        </>
    );
}
