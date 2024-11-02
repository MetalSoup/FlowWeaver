import React, { useState, useEffect } from 'react';
import {PencilIcon} from "@heroicons/react/24/outline";

interface EditableTextProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    style?: React.CSSProperties;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
    type?: 'text' | 'select';
    options?: { value: string; label: string }[];
    textClassName?: string;
}

const EditableText: React.FC<EditableTextProps> = ({ id, value, onChange, style, disabled, className, textClassName, placeholder, type = 'text', options = [] }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentText, setCurrentText] = useState(value);

    useEffect(() => {
        setCurrentText(value);
    }, [value]);

    const handleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCurrentText(e.target.value);
        onChange(e.target.value);
    };

    const getLabelForValue = (value: string) => {
        const option = options.find(option => option.value === value);
        return option ? option.label : value;
    };

    return (
        <div onClick={handleClick}>
            {isEditing ? (
                type === 'text' ? (
                    <input
                        type="text"
                        defaultValue={currentText}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyUp={(e) => {
                            if (e.key === 'Enter') {
                                e.currentTarget.blur();
                            }
                        }}
                        autoFocus
                        style={{ ...style }}
                        disabled={disabled}
                        className={"nodrag text-gray-900 " +className}
                        placeholder={placeholder}
                        id={id}
                    />
                ) : (
                    <select
                        defaultValue={currentText}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoFocus
                        style={{ ...style }}
                        disabled={disabled}
                        className={"nodrag nowheel text-gray-900 " +className}
                        id={id}
                    >
                        {options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                )
            ) : (
                <span className={textClassName} style={{ ...style }}>
                    {type === 'select' ? getLabelForValue(currentText) : currentText || placeholder || "Enter Value"}
                </span>
            )}

        </div>
    );
};

export default EditableText;
