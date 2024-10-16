import {Handle, Position, useStore} from "@xyflow/react";

export default function SelectWithOverride({isConnectable, onChange, id, value, nodeID, children, style, label}: {
    isConnectable: any,
    onChange: any,
    id: string,
    value: string,
    nodeID: string,
    children?: any
    style?: any
    label?: string

}) {

    const isConnected = useStore(store => store.edges.some(edge => edge.targetHandle === `${nodeID}${id}`));


    return (
        <>

            {label && <label className="block text-sm font-bold mb-1 px-5">{label}</label>}
            <div className={"relative mb-3"}>


                <Handle
                    type="target"
                    position={Position.Left}
                    id={nodeID + id}
                    className={`override ${isConnected ? 'connected' : ''}`}
                    isConnectable={isConnectable}
                />
                <div className={`px-5`}>
                    <select
                        className="nodrag appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        id={id}
                        style={{opacity: isConnected ? 0.2 : 1, minWidth: '200px' , ...style}}

                        onChange={onChange}
                        defaultValue={value}
                        disabled={isConnected}

                    >
                    {children}
                    </select>
                </div>
            </div>
        </>
    );
}
