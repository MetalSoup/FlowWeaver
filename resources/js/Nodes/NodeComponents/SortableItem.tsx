import React from "react";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import { Trash } from 'phosphor-react';

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
        <div className={"sortableItem relative flex py-2 mb-3 " + (className ?? '')} ref={setNodeRef} style={style}>


            <div className={"flex"}>
                {children}
            </div>
            {onDeleteField && field && (
                <button
                    className="bg-transparent text-gray-200 hover:text-red-500 flex-col px-2"
                    onClick={() => onDeleteField(field.id)}
                >
                    <Trash size={20} />
                </button>
            )
            }

            <button {...attributes} {...listeners} className={"flex-col px-2"}>
                ⣿
            </button>
        </div>
    );
}
