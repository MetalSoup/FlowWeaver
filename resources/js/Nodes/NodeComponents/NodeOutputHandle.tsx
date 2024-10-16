import {Handle, Position, useStore} from "@xyflow/react";
import './NodeOutputHandle.css';


export default function NodeOutputHandle ({ isConnectable, onConnect, id, children, nodeID }: {
    isConnectable: any,
    onConnect?: any,
    id: string,
    children?: string,
    nodeID: string

}) {

    const isConnected = useStore(store => store.edges.some(edge => edge.sourceHandle === `${nodeID}-${id}`));
    return (
        <>
            <div className={"relative node_output_handle"}>
                <Handle
                    type="source"
                    position={Position.Right}
                    className={`${isConnected ? 'connected' : ''}`}
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
