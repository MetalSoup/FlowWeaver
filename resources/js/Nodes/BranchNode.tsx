import {Handle, Position} from '@xyflow/react';
import {useState} from "react";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import CheckBoxWithOverride from "@/Nodes/CheckBoxWithOverride";
import NodeBody from './NodeComponents/NodeBody';
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";


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


                <NodeHeading className={"dark:bg-red-500"}>
                    Branch
                </NodeHeading>
                <NodeStartHandle id={"previous"} nodeID={nodeID}
                                 onConnect={(params: any) => console.log('handle onConnect', params)}
                                 isConnectable={isConnectable}
                                 />
                <CheckBoxWithOverride isConnectable={isConnectable} onChange={onChangeBool} id={"boolean"}
                                      isTrue={isTrue} nodeID={nodeID}>Condition</CheckBoxWithOverride>


                <div className={"relative text-right pr-5"}>Is True
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="trueNext"

                        isConnectable={isConnectable}
                    />
                </div>
                <div className={"relative text-right pr-5"}>Is False
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="falseNext"

                        isConnectable={isConnectable}
                    />
                </div>
            </NodeBody>


        </>
    );
}
