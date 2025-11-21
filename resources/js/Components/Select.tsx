import React from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { selectBase } from "./ui";

export default function Select({ className = "", isFocused, children, inputSize = "normal", ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { isFocused?: boolean, inputSize?: "small" | "normal" | "large" }
) {
    const combined = [selectBase, className].filter(Boolean).join(" ");

    return (
        <div className="relative">
            <select className={combined} autoFocus={!!isFocused} {...rest}>
                {children}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <CaretDownIcon weight={"duotone"}/>
            </div>
        </div>
    );
}
