/*this function should be able to accept all the standard settings an textarea can have plus some other settings and pass it to the <input>*/
import React from "react";
import { textareaBase } from "./ui";

export default function TextArea({ className = "", isFocused, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { isFocused?: boolean }
) {
    const combined = [textareaBase, className].filter(Boolean).join(" ");

    return <textarea className={combined} autoFocus={!!isFocused} {...rest} />;
}
