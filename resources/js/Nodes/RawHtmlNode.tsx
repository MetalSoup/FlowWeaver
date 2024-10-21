import NodeBody from './NodeComponents/NodeBody';
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeEndHandle from "@/Nodes/NodeComponents/NodeEndHandle";
import InputWithOverride from "@/Nodes/NodeComponents/InputWithOverride";
import {useState} from "react";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";

export default function RawHtmlNode({data, isConnectable}: { data: any, isConnectable: any }) {
    const nodeID: string = data.id;

    const [html, setHtml] = useState(data.html || '');

    const onHtml = (event: { target: { value: any; }; }) => {
        data.html = event.target.value
        setHtml(event.target.value);
    }

    return (
        <>
            <NodeBody>
                <NodeHeading>
                    Output HTML
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
                            nodeID={nodeID}>
                        </NodeEndHandle>
                    </div>
                </div>
                <InputWithOverride
                    label={"HTML"}
                    isConnectable={isConnectable}
                    onChange={onHtml}
                    handleID={"html-override"}
                    value={html}
                    nodeID={nodeID}
                />
            </NodeBody>
        </>
    );
}
