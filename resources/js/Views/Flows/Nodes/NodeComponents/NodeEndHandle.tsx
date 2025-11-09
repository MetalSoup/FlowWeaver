import {Handle, Position, useStore} from "@xyflow/react";
import { PlayIcon } from '@phosphor-icons/react';
import tooltip from './handleTooltip';


export default function NodeEndHandle ({ onConnect, id, children, nodeID, dataType }: {

    onConnect: any,
    id: string,
    children?: string,
    nodeID: string,
    dataType?: string

}) {

    const typeClass = dataType ? ` handle-type-${dataType}` : '';
    const handleId = dataType ? `${id}::${dataType}` : id;
    const isConnected = useStore(store => store.edges.some(edge => (edge.source === nodeID) && ((edge.sourceHandle || '') === handleId || (edge.sourceHandle || '') === id)));

    const nodeObj = useStore(store => (store.nodes || []).find((n: any) => n.id === nodeID));
    const nodeType = nodeObj?.type ?? '(unknown)';
    const edgesCount = useStore(store => (store.edges || []).filter((e: any) => e.source === nodeID || e.target === nodeID).length);

    const parseType = (hid: string) => { if (!hid) return undefined; const parts = hid.split('::'); return parts.length > 1 ? parts.slice(1).join('::') : undefined; }
    const onEnter = (e: React.MouseEvent) => { const t = parseType(handleId); const text = `${handleId}${t ? ' ('+t+')' : ''}\nNode: ${nodeID} (${nodeType})\nEdges: ${edgesCount}`; tooltip.show(text, e.clientX, e.clientY); }
    const onMove = (e: React.MouseEvent) => { tooltip.move(e.clientX, e.clientY); }
    const onLeave = () => tooltip.hide();

    return (
        <>
            <div className={"relative node_end_handle" + typeClass} onMouseEnter={onEnter} onMouseMove={onMove} onMouseLeave={onLeave}>

                <Handle
                    type="source"
                    position={Position.Right}
                    className={`testing ${isConnected ? 'connected' : ''} z-10`}
                    onConnect={onConnect}
                    id={handleId}


                />
                <div className={"handle_icon absolute right-0 z-0 " + (isConnected ? 'connected' : '')} title={isConnected ? 'Connected (next)' : 'Connect next node'}>
                    <PlayIcon size={28} weight={isConnected ? 'fill' : 'regular'} />
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
