import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({ className = '', disabled, active = false, children, ...props }: any ) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center px-4 py-2 bg-indigo-500 border border-transparent rounded-md font-semibold text-white tracking-widest hover:bg-indigo-300 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150
                ${
                    disabled && 'opacity-25'
                }
                 ${active && 'bg-indigo-800'}` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
