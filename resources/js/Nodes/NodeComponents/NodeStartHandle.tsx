import {Handle, Position, useStore} from "@xyflow/react";
import {PlayIcon} from "@heroicons/react/24/outline";
import {PlayIcon as PlayIconSolid} from "@heroicons/react/24/solid";


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
                        {isConnected ?
                            <PlayIconSolid className={"h-6 w-6"}/>
                            :
                            <PlayIcon className={"h-6 w-6"}/>
                        }
                    </div>
                    <div className={"pl-6"}>
                        {children ? children : "\u00A0"}
                    </div>
                </div>
            </>
            );
            }

