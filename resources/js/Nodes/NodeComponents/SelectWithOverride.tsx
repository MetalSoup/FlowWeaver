import {Handle, Position, useStore} from "@xyflow/react";
import Select, {SingleValue} from "react-select";

export default function SelectWithOverride({isConnectable,className,isSearchable, options, onChange, handleID, value, nodeID, children, style, label}: {
    isConnectable: any,
    onChange: any,
    handleID: string,
    value: SingleValue<any>,
    nodeID: string,
    children?: any
    style?: any
    label?: string
    className?: string
    isSearchable?: boolean
    options?:{ value: string; label: string }[];

}) {

    const isConnected = useStore(store => store.edges.some(edge => edge.targetHandle === handleID && edge.target === nodeID));

    return (
        <>

            {label && <label className="block text-sm font-bold mb-1 px-5">{label}</label>}
            <div className={"relative mb-3"}>


                <Handle
                    type="target"
                    position={Position.Left}
                    id={handleID}
                    className={`override ${isConnected ? 'connected' : ''}`}
                    isConnectable={isConnectable}
                />
                <div className={`px-5`}>
                    <Select
                        className={className + " min-w-[200px]"}
                        onChange={onChange}
                        defaultValue={value}
                        id={"method"}
                        isSearchable={isSearchable}
                        options={options}
                    />

                </div>
            </div>
        </>
    );
}
