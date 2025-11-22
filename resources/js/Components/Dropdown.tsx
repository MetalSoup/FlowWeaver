import { useState, createContext, useContext, PropsWithChildren, Dispatch, SetStateAction, useRef, useEffect } from 'react';
import { Link, InertiaLinkProps } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { createPortal } from 'react-dom';

const DropDownContext = createContext<{
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    toggleOpen: () => void;
    triggerRef: React.RefObject<HTMLElement> | null;
}>({
    open: false,
    setOpen: () => {},
    toggleOpen: () => {},
    triggerRef: null,
});

const Dropdown = ({ children }: PropsWithChildren) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLElement | null>(null);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen, triggerRef }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }: PropsWithChildren) => {
    const { open, setOpen, toggleOpen, triggerRef } = useContext(DropDownContext);

    return (
        <>
            <div ref={triggerRef as any} onClick={toggleOpen}>{children}</div>

            {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>}
        </>
    );
};

const Content = ({ align = 'right', width = '48', contentClasses = 'py-1 bg-white', children}: PropsWithChildren<{ align?: 'left'|'right', width?: '48', contentClasses?: string }>) => {
    const { open, setOpen, triggerRef } = useContext(DropDownContext);

    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else if (align === 'right') {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
    }

    let widthClasses = '';

    if (width === '48') {
        widthClasses = 'w-48';
    }

    // compute position based on trigger's bounding rect and render into body via portal
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        const compute = () => {
            const el = triggerRef?.current as HTMLElement | null;
            if (!el) return setPosition(null);
            const rect = el.getBoundingClientRect();
            // place dropdown top at rect.bottom, align left to rect.left by default
            let left = rect.left;
            if (align === 'right') {
                // for right align, align the right edge of the dropdown with trigger right
                left = rect.right;
            }
            setPosition({ top: rect.bottom + window.scrollY, left });
        };

        if (open) compute();

        window.addEventListener('resize', compute);
        window.addEventListener('scroll', compute, true);
        return () => {
            window.removeEventListener('resize', compute);
            window.removeEventListener('scroll', compute, true);
        };
    }, [open, triggerRef, align]);

    const content = (
        <Transition
            show={open}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
        >
            {position ? (
                <div
                    style={{ position: 'absolute', top: position.top + 'px', left: position.left + 'px', zIndex: 9999 }}
                    onClick={() => setOpen(false)}
                >
                    <div className={`rounded-md ring-1 ring-black ring-opacity-5 ` + contentClasses + ` ${widthClasses}`}>{children}</div>
                </div>
            ) : null}
        </Transition>
    );

    // render into document.body so ancestor overflow:hidden won't clip the popup
    if (typeof document !== 'undefined') {
        return createPortal(content, document.body) as any;
    }

    return null;
};

const DropdownLink = ({ className = '', children, ...props }: InertiaLinkProps) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
