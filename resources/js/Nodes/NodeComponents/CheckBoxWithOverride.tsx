import { Handle, Position, useStore } from "@xyflow/react";
import Checkbox from "@/Components/Checkbox";

export default function CheckBoxWithOverride({ isConnectable, onChange, id, isTrue, nodeID,children }: {
    isConnectable: any,
    onChange: any,
    id: string,
    isTrue: boolean,
    nodeID: string
    children: any


}) {

    const isConnected = useStore(store => store.edges.some(edge => edge.targetHandle === `${id}-override`));


    return (
        <div className={"relative mb-3"}>
            <Handle
                type="target"
                position={Position.Left}
                id={id+"-override"}
                className={`override ${isConnected ? 'connected' : ''}`}
                isConnectable={isConnectable}
            />
            <div className={`pl-5 ${isConnected ? 'hidden' : ''}`}>
                <label>{children}</label>
                <label className="inline-flex items-center cursor-pointer">

                    <Checkbox
                        className="sr-only peer"
                        id={id}
                        type="checkbox"
                        placeholder=""
                        onChange={onChange}
                        checked={isTrue}

                    />
                    <div
                        className="nodrag relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                </label>

            </div>
        </div>
    );
}
