import {Handle, Position, useStore} from "@xyflow/react";
import { PlayIcon } from '@phosphor-icons/react';


export default function NodeOutputHandle ({ onConnect, id, children, nodeID }: {

    onConnect?: any,
    id: string,
    children?: string,
    nodeID: string

}) {

    const isConnected = useStore(store => store.edges.some(edge => edge.sourceHandle === id && edge.source === nodeID));
    return (
        <>
            <div className={"relative node_output_handle"}>

                <Handle
                    type="source"
                    position={Position.Right}
                    className={`testing ${isConnected ? 'connected' : ''} z-10`}
                    onConnect={onConnect}
                    id={id}


                />
                <div className={"handle_icon absolute right-0 z-0 " + (isConnected ? 'connected' : '')} title={isConnected ? 'Connected (output)' : 'Connect output'}>
                    <PlayIcon size={24} weight={isConnected ? 'fill' : 'regular'} />
                </div>

                <div className={"pr-7"}>
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
