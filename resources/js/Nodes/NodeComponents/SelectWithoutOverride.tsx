import Select, {SingleValue} from 'react-select'
import CreatableSelect from "react-select/creatable";

export default function SelectWithoutOverride({onChange, isSearchable = true, value, style, label,options, className,creatable = false}: {
    onChange: any,
    value: SingleValue<any>,
    isSearchable?: boolean,
    style?: any
    label?: string
    options?:{ value: string; label: string }[];
    className?: string
    creatable?: boolean

}) {



    // if the value matches any of the options, set the value to the option
    if (options && value) {
        let option = options.find(option => option.value === value.value);
        if (option) {
            value = option;
        }
    }



    return (
        <>

            {label && <label className="px-7">{label}</label>}
            <div className={"relative nodrag text-gray-700"}>
                <div className={`px-7`}>

                    {!creatable &&

                    <Select
                        className={"r-select nowheel "+className}
                        onChange={onChange}
                        defaultValue={value}
                        id={"method"}
                        isSearchable={isSearchable}
                        options={options}
                    />
                        }
                    {creatable &&
                        <CreatableSelect
                            className={"r-select nowheel "+className}
                            onChange={onChange}
                            defaultValue={value}
                            id={"method"}
                            isSearchable={isSearchable}
                            options={options}

                            />
                    }


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
