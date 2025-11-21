// Shared UI classnames for form controls and similar components
export const inputBase = "w-full border border-gray-300 dark:border-gray-500 rounded px-2 py-1 dark:bg-gray-600" +
    " dark:placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 shadow-[0_0_5px_0_rgba(0,0,0,0.4)_inset]";

export const selectBase = [inputBase, "bg-none appearance-none pr-7"].filter(Boolean).join(" ");

export const textareaBase = inputBase;

