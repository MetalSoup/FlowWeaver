import Select, {SingleValue} from "react-select";
import CreatableSelect from "react-select/creatable";
import NodeInputHandle from "@/Views/Flows/Nodes/NodeComponents/NodeInputHandle";

export default function SelectWithOverride({className = '',isSearchable, options, onChange, handleID, value, nodeID, label,creatable = false, id}: {

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
    creatable?: boolean
    id?: string

}) {

    if (options && value) {
        let option = options.find(option => option.value === value.value);
        if (option) {
            value = option;
        }
    }

    return (
        <>

            {label && <label className="block text-sm font-bold mb-1 px-5">{label}</label>}
            <div className={"relative"}>


                <NodeInputHandle nodeID={nodeID} handleID={handleID}>


                        {!creatable &&

                            <Select
                                className={"r-select w-[300px] nowheel " + (className ?? '')}
                                onChange={onChange}
                                defaultValue={value}
                                id={id}
                                isSearchable={isSearchable}
                                options={options}
                            />
                        }
                        {creatable &&
                            <CreatableSelect
                                className={"r-select w-[300px] nowheel " + (className ?? '')}
                                onChange={onChange}
                                defaultValue={value}
                                id={id}
                                isSearchable={isSearchable}
                                options={options}

                            />
                        }



                </NodeInputHandle>

{/*                <Handle
                    type="target"
                    position={Position.Left}
                    id={handleID}
                    className={`override ${isConnected ? 'connected' : ''}`}
                    isConnectable={isConnectable}
                />*/}

            </div>
        </>
    );
}
