import React, { useState, useEffect } from 'react';

interface EditableTextProps {
    id?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
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
        onChange(e);
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
                        autoFocus
                        style={{ ...style }}
                        disabled={disabled}
                        className={className}
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
                        className={className}
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
