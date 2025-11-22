import React from "react";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {CaretUpDown, CaretUpDownIcon, DotsSixVerticalIcon, ListIcon, TrashIcon} from '@phosphor-icons/react';

export function SortableItem({id, children, onDeleteField, field, className = ''}: {
    id: string,
    children: any,
    onDeleteField?: any,
    field?: any
    className?: string
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({id: id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <div className={"sortableItem w-full relative flex flex-row gap-3 items-center py-2 mb-3 " + (className ?? '')} ref={setNodeRef} style={style}>



                {children}

            {/*{onDeleteField && field && (*/}
                <button
                    className="bg-transparent text-gray-200 hover:text-red-500"
                    onClick={() => onDeleteField(field.id)}
                >
                    <TrashIcon size={20} />
                </button>
     {/*       )
            }*/}

            <button {...attributes} {...listeners} className={"p-2 cursor-move"}>
                <ListIcon size={20} weight={"duotone"}/>
            </button>
        </div>
    );
}
