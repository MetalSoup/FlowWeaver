import {Handle, Position, useStore} from "@xyflow/react";
import { Play } from 'phosphor-react';


export default function NodeInputHandle ({ onConnect, children, nodeID, handleID }: {
    onConnect?: any,
    handleID: string,
    children?: any,
    nodeID: string

}) {

    const isConnected = useStore(store => store.edges.some(edge => edge.targetHandle === handleID && edge.target === nodeID));
    return (
        <>
            <div className={"relative node_input_handle "}>

                <Handle
                    type="target"
                    position={Position.Left}
                    className={`testing ${isConnected ? 'connected' : ''} z-10`}
                    onConnect={onConnect}
                    id={handleID}


                />
                <div className={"handle_icon absolute left-0 z-0"}>
                    <Play size={24} weight={isConnected ? 'fill' : 'regular'} />
                </div>

                <div className={"px-7"}>
                    {children ? children : "\u00A0"}
                </div>
            </div>
           {/* <div className={"relative node_output_handle"}>
                <Handle
                    type="source"
                    position={Position.Right}
                    className={`${isConnected ? 'connected' : ''}`}
                    isConnectable={isConnectable}
                    id={id}
                />
                <div className={"pr-6"}>
                    {children ? children : "\u00A0"}
                </div>
            </div>*/}
        </>
    );
}
