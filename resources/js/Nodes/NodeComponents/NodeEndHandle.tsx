import {Handle, Position, useStore} from "@xyflow/react";
import './NodeEndHandle.css';


export default function NodeEndHandle ({ isConnectable, onConnect, id, children, nodeID }: {
    isConnectable: any,
    onConnect: any,
    id: string,
    children?: string,
    nodeID: string

}) {

    const isConnected = useStore(store => store.edges.some(edge => edge.sourceHandle === `${nodeID}-${id}`));
    return (
        <>
            <div className={"relative node_end_handle"}>
                <Handle
                    type="source"
                    position={Position.Right}
                    className={`${isConnected ? 'connected' : ''}`}

                    onConnect={onConnect}
                    isConnectable={isConnectable}
                    id={nodeID + "-" + id}
                />
                <div className={"pr-6"}>
                    {children ? children : "\u00A0"}
                </div>
            </div>
        </>
    );
}
