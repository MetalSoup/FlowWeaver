import {Handle, Position, useStore} from "@xyflow/react";
import { PlayIcon } from '@phosphor-icons/react';
import tooltip from './handleTooltip';


export default function NodeInputHandle ({ onConnect, children, nodeID, handleID, dataType }: {
    onConnect?: any,
    handleID: string,
    children?: any,
    nodeID: string,
    dataType?: string

}) {

    // allow callers to pass either already-typed handleIDs like "foo::boolean" or a base id + dataType
    const handleId = handleID.includes('::') ? handleID : (dataType ? `${handleID}::${dataType}` : handleID);
    const typeClass = dataType ? ` handle-type-${dataType}` : (handleID.includes('::') ? ` handle-type-${handleID.split('::').slice(1).join('::')}` : '');

    const isConnected = useStore(store => store.edges.some(edge => edge.targetHandle === handleId && edge.target === nodeID));
    // read node info and edges count from store for tooltip
    const nodeObj = useStore(store => (store.nodes || []).find((n: any) => n.id === nodeID));
    const nodeType = nodeObj?.type ?? '(unknown)';
    const edgesCount = useStore(store => (store.edges || []).filter((e: any) => e.source === nodeID || e.target === nodeID).length);

    const parseType = (hid: string) => {
        if (!hid) return undefined;
        const parts = hid.split('::');
        return parts.length > 1 ? parts.slice(1).join('::') : undefined;
    }

    const onEnter = (e: React.MouseEvent) => {
        const t = parseType(handleId);
        const text = `${handleId}${t ? ' (' + t + ')' : ''}\nNode: ${nodeID} (${nodeType})\nEdges: ${edgesCount}`;
        tooltip.show(text, e.clientX, e.clientY);
    }
    const onMove = (e: React.MouseEvent) => {
        tooltip.move(e.clientX, e.clientY);
    }
    const onLeave = () => { tooltip.hide(); };

    return (
        <>
            <div className={"relative node_input_handle " + typeClass } onMouseEnter={onEnter} onMouseMove={onMove} onMouseLeave={onLeave}>

                <Handle
                    type="target"
                    position={Position.Left}
                    className={`testing ${isConnected ? 'connected' : ''} z-10`}
                    onConnect={onConnect}
                    id={handleId}


                />
                <div className={"handle_icon absolute left-0 z-0 " + (isConnected ? 'connected' : '')} title={isConnected ? 'Connected (input)' : 'Connect input'}>
                    <PlayIcon size={24} weight={isConnected ? 'fill' : 'regular'} />
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
