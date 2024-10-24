import {Handle, Position, useStore} from "@xyflow/react";
import EditableText from "@/Nodes/NodeComponents/EditableText";

import Select, {SingleValue} from 'react-select'

export default function SelectWithoutOverride({onChange, id,isSearchable = true, value, style, label,options, className}: {
    onChange: any,
    id: string,
    value: SingleValue<any>,
    isSearchable?: boolean,
    children?: any
    style?: any
    label?: string
    options?:{ value: string; label: string }[];
    className?: string

}) {




    return (
        <>

            {label && <label className="block text-sm font-bold mb-1 px-5">{label}</label>}
            <div className={"relative mb-3"}>
                <div className={`px-5`}>

                    <Select
                        //onChange={(e) => console.log(e)}
                        className={className}
                        //onChange doesn't work for this component


                        onChange={onChange}
                        defaultValue={value}
                        /*value={}*/
                        //defaultInputValue={data.method || "GET"}
                        id={"method"}
                        isSearchable={isSearchable}


                        options={options}
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
