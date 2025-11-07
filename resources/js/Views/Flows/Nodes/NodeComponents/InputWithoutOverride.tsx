export default function InputWithoutOverride({onChange, id, value, placeholder, className = '', style, label}: {
    onChange: any,
    id: string,
    value: string,
    className?: string,

    placeholder?: string
    children?: any
    style?: any
    label?: string

}) {




    return (
        <>

            {label && <label className="block text-sm font-bold mb-1 px-5">{label}</label>}
            <div className={"relative"}>


                <div className={`px-7`}>
                    <input
                        className={"appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 " + (className ?? '')}
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
