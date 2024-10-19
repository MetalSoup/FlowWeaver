import {Handle, Position, useStore} from "@xyflow/react";

export default function InputWithoutOverride({onChange, id, value, placeholder, children, style, label}: {
    onChange: any,
    id: string,
    value: string,

    placeholder?: string
    children?: any
    style?: any
    label?: string

}) {




    return (
        <>

            {label && <label className="block text-sm font-bold mb-1 px-5">{label}</label>}
            <div className={"relative mb-3"}>


                <div className={`px-5`}>
                    <input
                        className="nodrag appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        id={id}
                        style={{minWidth: '200px' , ...style}}
                        type="text"
                        placeholder={placeholder}
                        onChange={onChange}
                        defaultValue={value}


                    />
                </div>
            </div>
        </>
    );
}
