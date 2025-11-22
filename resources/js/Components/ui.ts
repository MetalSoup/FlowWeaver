// Shared UI classnames for form controls and similar components
import Select from "react-select";
import React from "react";

export const inputBase = "w-full border border-gray-300 dark:border-gray-500 rounded px-2 py-1 dark:bg-gray-600" +
    " dark:placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 shadow-[0_0_5px_0_rgba(0,0,0,0.4)_inset]";

export const selectBase = [inputBase, "bg-none appearance-none pr-7"].filter(Boolean).join(" ");

export const textareaBase = inputBase;


export const gridButtonStyle = "page-component flex flex-col bg-gray-200 rounded justify-center gap-1 p-3 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-move justify-items-center items-center text-center text-sm transition" ;

export const reactSelectClassNames: any = {
    control: (state: any) => ((state.isFocused ? ' ring-2 !ring-indigo-500' : '') + ' !p-0 dark:bg-gray-600 dark:text-white shadow-[0_0_5px_0_rgba(0,0,0,0.4)_inset] border border-gray-300 dark:border-gray-500 !min-h-0 w-full '),
    valueContainer: () => 'flex m-0 items-center !p-0 ',
    singleValue: () => 'text-sm m-0 dark:text-white !px-2 ',
    dropdownIndicator: () => '!p-0 m-0 text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-300',
    placeholder: () => '!p-0 text-sm m-0 dark:text-white p-0',
    menu: () => '!p-0 z-50 m-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-lg mt-1 rounded',
    menuList: () => '!p-0 m-0',
    option: (state: any) => (state.isFocused ? 'bg-gray-100 dark:bg-gray-600 dark:text-white cursor-pointer' : ' dark:text-white cursor-pointer'),
    multiValue: () => '!p-0 rounded  p-0 m-0',
    indicatorsContainer: () => '!p-0 m-0',
    indicatorSeparator: () => 'hidden',
    input: () => '!px-2 !py-[2px] text-gray-700 dark:text-white ',
    container: () => 'w-full',

};
