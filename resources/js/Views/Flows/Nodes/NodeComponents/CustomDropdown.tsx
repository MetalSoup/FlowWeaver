import React, { useState, useEffect } from 'react';

interface CustomDropdownProps {
    value: string;
    onChange: any;
    options: string[];
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ value, onChange, options }) => {
    const [inputValue, setInputValue] = useState(value);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        onChange(event.target.value);
    };

    const handleOptionClick = (option: string) => {
        setInputValue(option);
        onChange(option);
        setIsDropdownVisible(false);
    };

    return (
        <div className="relative">
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsDropdownVisible(true)}
                onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
                className="input-class border border-gray-300 rounded-md text-gray-900 p-2"
            />
            {isDropdownVisible && (
                <ul className="dropdown-class">
                    {options.map((option, index) => (
                        <li key={index} onClick={() => handleOptionClick(option)}>
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomDropdown;
