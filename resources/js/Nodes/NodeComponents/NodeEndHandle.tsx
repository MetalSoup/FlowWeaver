import {Handle, Position, useStore} from "@xyflow/react";
import { Play } from 'phosphor-react';


export default function NodeEndHandle ({ onConnect, id, children, nodeID }: {

    onConnect: any,
    id: string,
    children?: string,
    nodeID: string

}) {

    const isConnected = useStore(store => store.edges.some(edge => edge.sourceHandle === id && edge.source === nodeID));
    return (
        <>
            <div className={"relative node_end_handle"}>

                <Handle
                    type="source"
                    position={Position.Right}
                    className={`testing ${isConnected ? 'connected' : ''} z-10`}
                    onConnect={onConnect}
                    id={id}


                />
                <div className={"handle_icon absolute right-0 z-0"}>
                    <Play size={24} weight={isConnected ? 'fill' : 'regular'} />
                    {/* phosphor: using weight 'fill' for connected state to show visual difference */}
                </div>


{/*
                <Handle
                    type="source"
                    position={Position.Right}
                    className={`${isConnected ? 'connected' : ''}`}

                    onConnect={onConnect}
                    isConnectable={isConnectable}
                    id={nodeID + "-" + id}
                    >
                    {isConnected ?
                        <PlayIconSolid className={"h-5 w-5"} />

                        :
                        <PlayIcon className={"h-5 w-5"} />

                    }
                </Handle>*/}
                <div className={"pr-7"}>
                    {children ? children : "\u00A0"}
                </div>
            </div>
        </>
    );
}
