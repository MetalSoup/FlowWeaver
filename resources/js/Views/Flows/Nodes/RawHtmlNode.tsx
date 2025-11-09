import {useState} from "react";

import NodeBody from '@/Views/Flows/Nodes/NodeComponents/NodeBody';
import NodeStartHandle from "@/Views/Flows/Nodes/NodeComponents/NodeStartHandle";
import NodeEndHandle from "@/Views/Flows/Nodes/NodeComponents/NodeEndHandle";
import InputWithOverride from "@/Views/Flows/Nodes/NodeComponents/InputWithOverride";
import NodeHeading from "@/Views/Flows/Nodes/NodeComponents/NodeHeading";

export default function RawHtmlNode({data}: { data: any }) {
    const nodeID: string = data.id;

    const [html, setHtml] = useState(data.html || '');

    const onHtml = (event: { target: { value: any; }; }) => {
        data.html = event.target.value
        setHtml(event.target.value);
    }

    return (
        <>
            <NodeBody>
                <NodeHeading onChange={(newHeading: string) => {
                    data.heading = newHeading;
                }}>
                    {data.heading || "Output HTML"}


                </NodeHeading>
                <div className={"flex min-w-48 pb-5"}>
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
                            nodeID={nodeID}>
                        </NodeEndHandle>
                    </div>
                </div>
                <InputWithOverride
                    label={"HTML"}
                    onChange={onHtml}
                    handleID={"html-override"}
                    value={html}
                    nodeID={nodeID}
                    dataType={"html"}

                />
            </NodeBody>
        </>
    );
}
