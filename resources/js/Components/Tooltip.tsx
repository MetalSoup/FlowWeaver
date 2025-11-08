import React, {PropsWithChildren} from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

// Simple accessible Tooltip wrapper around Tippy
// Usage: <Tooltip content="..." placement="top"><button>Hover</button></Tooltip>
export default function Tooltip({ children, content, placement = 'top' }: PropsWithChildren<{ content: string, placement?: string }>) {
    const child = React.Children.only(children) as React.ReactElement;

    // Ensure the trigger is focusable for keyboard users
    const trigger = React.cloneElement(child, { tabIndex: child.props?.tabIndex ?? 0 });

    return (
        <Tippy content={content} placement={placement as any} interactive={false} delay={[50, 0]} arrow={true} role="tooltip">
            {trigger}
        </Tippy>
    );
}
