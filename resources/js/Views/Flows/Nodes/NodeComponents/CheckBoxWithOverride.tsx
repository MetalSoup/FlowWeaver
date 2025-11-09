import { useStore } from "@xyflow/react";
import Checkbox from "@/Components/Checkbox";
import NodeInputHandle from "@/Views/Flows/Nodes/NodeComponents/NodeInputHandle";
import NodeOutputHandle from "@/Views/Flows/Nodes/NodeComponents/NodeOutputHandle";
import React from "react";

interface CheckBoxWithOverrideProps {
    onChange: (checked: boolean, id: string) => void;
    isTrue: boolean;
    id: string;
    label?: any;
    handleID: string;
    nodeID: string;
    onConnect?: any,
    title?: string
    dataType?: string
}



const CheckBoxWithOverride: React.FC<CheckBoxWithOverrideProps> = ({onConnect, onChange, id, isTrue, nodeID,label, handleID, title, dataType}) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked, id);
    };


    // look for any edge targeting either the plain or typed override handle (e.g. "boolean-override" or "boolean-override::boolean")
    const isConnected = useStore(store => store.edges.some(edge => (edge.targetHandle || '').includes(`${id}-override`)));


    return (
        <NodeInputHandle nodeID={nodeID} handleID={handleID} onConnect={onConnect} dataType={dataType} >
            <div className={"relative mb-3 flex items-center justify-between"}>


                {!isConnected && (
                    <>
                <label title={title} className={`inline-flex items-center cursor-pointer ${isConnected ? 'opacity-60' : ''}`}>

                    <Checkbox
                        className="sr-only peer"
                        id={id}
                        type="checkbox"
                        placeholder=""
                        onChange={handleChange}
                        checked={isTrue}
                        disabled={isConnected}

                    />
                    <div
                        className="nodrag mr-2 relative w-7 h-4 rounded-full peer bg-gray-200  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all border-gray-600 peer-checked:bg-green-500"></div>
                </label>
                {label && <label>{label}</label>}
                    </>
                )}

                {isConnected && <div className="ml-3 text-xs bg-white/60 px-2 py-0.5 rounded">Overridden</div>}
                {/* If a dataType is provided, expose an output handle so other nodes can read this value */}



            </div>
        </NodeInputHandle>
    );
}

export default CheckBoxWithOverride;
