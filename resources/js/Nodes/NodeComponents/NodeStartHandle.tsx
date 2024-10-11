import {Handle, Position, useStore} from "@xyflow/react";
import './NodeStartHandle.css';
import {PropsWithChildren} from "react";


export default function NodeStartHandle ({ isConnectable, onConnect, id, children, nodeID }: {
    isConnectable: any,
    onConnect: any,
    id: string,
    children?: string,
    nodeID: string

}) {

    const isConnected = useStore(store => store.edges.some(edge => edge.targetHandle === `${nodeID}-${id}`));
    return (
        <>
            <div className={"relative node_start_handle"}>
                <Handle
                    type="target"
                    position={Position.Left}
                    className={`testing ${isConnected ? 'connected' : ''}`}

                    onConnect={onConnect}
                    isConnectable={isConnectable}
                    id={nodeID + "-" + id}
                />
                <div className={"pl-4"}>
                    {children ? children : "\u00A0"}
                </div>
            </div>
        </>
    );
    }

