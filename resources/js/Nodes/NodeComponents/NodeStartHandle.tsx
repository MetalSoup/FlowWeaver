import {Handle, Position, useStore} from "@xyflow/react";
import { Play } from 'phosphor-react';


export default function NodeStartHandle ({ onConnect, id, children, nodeID }: {
    onConnect: any,
    id: string,
    children?: string,
    nodeID: string

}) {

    const isConnected = useStore(store => store.edges.some(edge => edge.targetHandle === id  && edge.target === nodeID));
    return (
        <>
            <div className={"relative node_start_handle"}>

                    <Handle
                        type="target"
                        position={Position.Left}
                        className={`testing ${isConnected ? 'connected' : ''} z-10`}
                        onConnect={onConnect}
                        id={id}

                    />
                    <div className={"handle_icon absolute left-0 z-0"}>
                        <Play size={24} weight={isConnected ? 'fill' : 'regular'} />
                     </div>
                     <div className={"pl-6"}>
                         {children ? children : "\u00A0"}
                     </div>
                 </div>
             </>
             );
             }
