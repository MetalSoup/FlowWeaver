import { DragEvent } from "react";
import WebhookNode from "@/Nodes/WebhookNode";
import ColorSelectorNode from "@/Nodes/ColorSelectorNode";


export default ({className = ''}) => {
    const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className={className}>
            <div className="description">You can drag these nodes to the pane on the right.</div>
            <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'input')} draggable>
                Input Node
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'default')} draggable>
                Default Node
            </div>
            <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'output')} draggable>
                Output Node
            </div>
            <div className="dndnode webhook dark:bg-gray-700 p-1 dark:text-white rounded-md cursor-grab"
                 onDragStart={(event) => onDragStart(event, 'WebHook')} draggable>
                Webhook
            </div>
            <div className="dndnode comparison dark:bg-gray-700 p-1 dark:text-white rounded-md cursor-grab"
                 onDragStart={(event) => onDragStart(event, 'Comparison')} draggable>
                Comparison
            </div>
            <div className="dndnode branch dark:bg-gray-700 p-1 dark:text-white rounded-md cursor-grab"
                 onDragStart={(event) => onDragStart(event, 'Branch')} draggable>
                Branch
            </div>
        </aside>
    );
};
