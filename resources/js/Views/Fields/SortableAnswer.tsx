import { memo, useEffect, useRef } from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// SortableAnswer is a small, memoized draggable item used by AnswersList.
export default memo(function SortableAnswer({ id, label: initialLabel, value: initialValue, selected: initialSelected, onChangeLabel, onChangeValue, onToggleSelected, onRemove }: { id: string, label: string, value: string, selected: boolean, onChangeLabel: (id:string, v:string)=>void, onChangeValue:(id:string,v:string)=>void, onToggleSelected:(id:string)=>void, onRemove:(id:string)=>void }) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id});
    const style: any = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    const labelRef = useRef<HTMLInputElement | null>(null);
    const valueRef = useRef<HTMLInputElement | null>(null);
    const checkboxRef = useRef<HTMLInputElement | null>(null);

    // Sync incoming prop changes into uncontrolled inputs when not focused
    useEffect(() => {
        if (labelRef.current && document.activeElement !== labelRef.current) {
            const newVal = initialLabel || '';
            if (labelRef.current.value !== newVal) labelRef.current.value = newVal;
        }
        if (valueRef.current && document.activeElement !== valueRef.current) {
            const newVal = initialValue || '';
            if (valueRef.current.value !== newVal) valueRef.current.value = newVal;
        }
        if (checkboxRef.current && document.activeElement !== checkboxRef.current) {
            const newChecked = !!initialSelected;
            if (checkboxRef.current.checked !== newChecked) checkboxRef.current.checked = newChecked;
        }
    }, [initialLabel, initialValue, initialSelected]);

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-3 border rounded p-2">
            <div {...listeners} {...attributes} className="cursor-move px-2 text-gray-600">≡</div>
            <input
                ref={labelRef}
                type="text"
                name={`option_label_${id}`}
                defaultValue={initialLabel}
                onBlur={() => { if (labelRef.current) onChangeLabel(id, labelRef.current.value); }}
                placeholder="Label"
                className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
            />
            <input
                ref={valueRef}
                type="text"
                name={`option_value_${id}`}
                defaultValue={initialValue}
                onBlur={() => { if (valueRef.current) onChangeValue(id, valueRef.current.value); }}
                placeholder="Value"
                className="w-48 shadow appearance-none border rounded py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
            />
            <label className="flex items-center gap-2 text-sm">
                <span className="text-sm">Selected:</span>
                <input ref={checkboxRef} type="checkbox" defaultChecked={!!initialSelected} onChange={() => onToggleSelected(id)} />
            </label>
            <button type="button" onClick={() => onRemove(id)} className="text-red-600 px-2">×</button>
        </div>
    );
});
