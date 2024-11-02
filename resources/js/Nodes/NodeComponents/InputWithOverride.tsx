import {Handle, Position, useStore} from "@xyflow/react";
import EditableText from "@/Nodes/NodeComponents/EditableText";
import NodeInputHandle from "@/Nodes/NodeComponents/NodeInputHandle";

export default function InputWithOverride({

                                              nodeID,
                                              onChange,
                                              handleID,
                                              value,
                                              placeholder,
                                              onConnect,
                                              style,
                                              label,
                                              className = ""

                                          }: {

    nodeID: string,
    onChange: any,
    handleID: string,
    value: string,
    placeholder?: string,
    children?: any,
    onConnect?: any,
    style?: any,
    label?: string,
    className?: string


}) {

    const isConnected = useStore(store => store.edges.some(edge => edge.targetHandle === handleID && edge.target === nodeID));


    return (
        <>

            {label && <label className="px-7">{label}</label>}
            <div className={"relative " +className}>

                <NodeInputHandle nodeID={nodeID} handleID={handleID} onConnect={onConnect}>



                        <input
                            style={{opacity: isConnected ? 0.2 : 1, minWidth: '200px', ...style}}
                            type="text"
                            placeholder={placeholder}
                            onChange={onChange}
                            defaultValue={value}
                            disabled={isConnected}
                            className={"appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"}


                        />

                </NodeInputHandle>
            </div>
        </>
    );
}
