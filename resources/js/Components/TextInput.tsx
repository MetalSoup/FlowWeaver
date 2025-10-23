import { forwardRef, useEffect, useImperativeHandle, useRef, InputHTMLAttributes, CSSProperties } from 'react';

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
    isFocused?: boolean;
    textClassName?: string;
    fontSize?: string | number;
    fontWeight?: CSSProperties['fontWeight'];
    lineHeight?: CSSProperties['lineHeight'];
    fontFamily?: string;
    textStyle?: CSSProperties;
};

export default forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        textClassName = '',
        isFocused = false,
        fontSize,
        fontWeight,
        lineHeight,
        fontFamily,
        textStyle,
        style, // incoming style from props
        ...props
    }: TextInputProps,
    ref
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    // Merge styles with clear precedence:
    // 1) incoming `style` (lowest),
    // 2) explicit props (fontSize, fontWeight, lineHeight, fontFamily),
    // 3) `textStyle` (highest priority)
    const mergedStyle: CSSProperties = {
        ...(style || {}),
        ...(fontSize !== undefined ? { fontSize } : {}),
        ...(fontWeight !== undefined ? { fontWeight } : {}),
        ...(lineHeight !== undefined ? { lineHeight } : {}),
        ...(fontFamily !== undefined ? { fontFamily } : {}),
        ...(textStyle || {}),
    };

    const finalClassName = [
        'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm',
        className,
        textClassName,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <input
            {...props}
            type={type}
            className={finalClassName}
            style={mergedStyle}
            ref={localRef}
        />
    );
});
