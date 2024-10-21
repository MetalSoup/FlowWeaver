import {Handle, Position, useStore} from "@xyflow/react";
import EditableText from "@/Nodes/NodeComponents/EditableText";

export default function InputWithOverride({isConnectable,nodeID, onChange, handleID, value, placeholder, children, style, label}: {
    isConnectable: any,
    nodeID: string,
    onChange: any,
    handleID: string,
    value: string,
    placeholder?: string,
    children?: any,
    style?: any,
    label?: string,


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
                    <EditableText
                        value={value}
                        onChange={onChange}
                        style={{opacity: isConnected ? 0.2 : 1, minWidth: '200px'}}
                        className="nodrag appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        placeholder={placeholder}
                        textClassName={"appearance-none block w-full bg-gray-800 text-gray-200 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"}
                    />
                    {/*<input

                        id={id}
                        style={{opacity: isConnected ? 0.2 : 1, minWidth: '200px' , ...style}}
                        type="text"
                        placeholder={placeholder}
                        onChange={onChange}
                        defaultValue={value}
                        disabled={isConnected}


                    />*/}
                </div>
            </div>
        </>
    );
}
