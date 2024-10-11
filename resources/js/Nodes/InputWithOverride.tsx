import { Handle, Position, useStore } from "@xyflow/react";

export default function InputWithOverride({ isConnectable, onChange, id, value, nodeID }: {
    isConnectable: any,
    onChange: any,
    id: string,
    value: string,
    nodeID: string

}) {

    const isConnected = useStore(store => store.edges.some(edge => edge.targetHandle === `${nodeID}${id}`));


    return (
        <div className={"relative mb-3"}>

            <Handle
                type="target"
                position={Position.Left}
                id={nodeID + id}
                className={`override ${isConnected ? 'connected' : ''}`}
                isConnectable={isConnectable}
            />
            <div className={`pl-5 ${isConnected ? 'hidden' : ''}`}>
                <input
                    className="nodrag appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id={id}
                    type="text"
                    placeholder=""
                    onChange={onChange}
                    defaultValue={value}
                />
            </div>
        </div>
    );
}
