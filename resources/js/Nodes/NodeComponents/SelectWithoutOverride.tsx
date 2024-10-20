import {Handle, Position, useStore} from "@xyflow/react";
import EditableText from "@/Nodes/NodeComponents/EditableText";

export default function SelectWithoutOverride({onChange, id, value, children, style, label,options}: {
    onChange: any,
    id: string,
    value: string,
    children?: any
    style?: any
    label?: string
    options?:{ value: string; label: string }[];

}) {




    return (
        <>

            {label && <label className="block text-sm font-bold mb-1 px-5">{label}</label>}
            <div className={"relative mb-3"}>
                <div className={`px-5`}>

                    <EditableText
                        onChange={onChange}
                        style={{minWidth: '200px'}}
                        className="nodrag appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        id={id}
                        value={value}
                        type={"select"}
                        options={options}
                        textClassName={"appearance-none block w-full bg-gray-800 text-gray-200 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"}

                    />
{/*                    <select
                        className="nodrag appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        id={id}
                        style={{minWidth: '200px' , ...style}}

                        onChange={onChange}
                        defaultValue={value}

                    >
                    {children}
                    </select>*/}
                </div>
            </div>
        </>
    );
}
