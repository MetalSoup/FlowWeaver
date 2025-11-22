import {Handle, Position, useStore} from "@xyflow/react";
import NodeInputHandle from "@/Views/Flows/Nodes/NodeComponents/NodeInputHandle";
import Input from "@/Components/Input";

export default function InputWithOverride(
    {

        nodeID,
        onChange,
        handleID,
        value,
        placeholder,
        onConnect,
        style,
        label,
        className = "",
        dataType

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
        dataType?: string


    }) {

    const isConnected = useStore(store => store.edges.some(edge => edge.targetHandle === handleID && edge.target === nodeID));


    return (
        <>

            {label && <label className="px-7">{label}</label>}
            <div className={"relative " + className}>

                <NodeInputHandle nodeID={nodeID} handleID={handleID} onConnect={onConnect} dataType={dataType} >


                    <Input
                        style={{opacity: isConnected ? 0.2 : 1, minWidth: '200px', ...style}}
                        type="text"
                        placeholder={placeholder}
                        onChange={onChange}
                        defaultValue={value}
                        disabled={isConnected}



                    />

                </NodeInputHandle>
            </div>
        </>
    );
}
