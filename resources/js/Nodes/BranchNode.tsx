import {Handle, Position} from '@xyflow/react';
import {useState} from "react";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import CheckBoxWithOverride from "@/Nodes/CheckBoxWithOverride";
import NodeBody from './NodeComponents/NodeBody';
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeEndHandle from "@/Nodes/NodeComponents/NodeEndHandle";


export default function BranchNode({data, isConnectable}: { data: any, isConnectable: any }) {

    if (!data.details) {
        data.details = {fields: []};
    } else if (!Array.isArray(data.details.fields)) {
        data.details.fields = [];
    }
    if (!data.isTrue) {
        data.isTrue = false;
    }


    const [isTrue, setIsTrue] = useState(data.isTrue || false);


    const onChangeBool = (event: { target: { checked: boolean; }; }) => {
        setIsTrue(event.target.checked);
        data.isTrue = event.target.checked;
    }


    const nodeID: string = data.id;


    return (
        <>
            <NodeBody>





                <NodeHeading className={"dark:bg-green-800"}>
                    Branch
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
                            id={"trueNext"}
                            nodeID={nodeID}>
                            True
                        </NodeEndHandle>
                        <NodeEndHandle
                            isConnectable={isConnectable}
                            onConnect={(params: any) => console.log('handle onConnect', params)}
                            id={"falseNext"}
                            nodeID={nodeID}>
                            False
                        </NodeEndHandle>

                    </div>
                </div>

                <CheckBoxWithOverride isConnectable={isConnectable} onChange={onChangeBool} id={"boolean"}
                                      isTrue={isTrue} nodeID={nodeID}>Condition</CheckBoxWithOverride>


            </NodeBody>


        </>
    );
}
