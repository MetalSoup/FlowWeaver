import React from 'react';
import Checkbox from "@/Components/Checkbox";

interface CheckBoxWithoutOverrideProps {
    onChange: (checked: boolean, id: string) => void;
    isTrue: boolean;
    id: string;
    label?: any;
}

const CheckBoxWithoutOverride: React.FC<CheckBoxWithoutOverrideProps> = ({ onChange, isTrue, id , label}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked, id);
    };

    return (
        <>

        <label className="inline-flex items-center cursor-pointer">

            <Checkbox
                className="sr-only peer"
                id={id}
                type="checkbox"
                placeholder=""
                onChange={handleChange}
                checked={isTrue}

            />
            <div
                className="nodrag mr-2 relative w-7 h-4 rounded-full peer bg-gray-200  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all border-gray-600 peer-checked:bg-green-500"></div>
        </label>
            { label && <label>{label}</label> }

        </>
)
    ;
};

export default CheckBoxWithoutOverride;
