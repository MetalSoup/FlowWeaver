import { DragEvent } from "react";
import SideBarNodeButton from "@/Components/SideBarNodeButton";




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

            <SideBarNodeButton onDragStart={onDragStart} nodeType={'WebHook'}>
                Webhook
            </SideBarNodeButton>

            <SideBarNodeButton onDragStart={onDragStart} nodeType={'Branch'}>
                Branch
            </SideBarNodeButton>
            <SideBarNodeButton onDragStart={onDragStart} nodeType={'Comparison'}>
                Comparison
            </SideBarNodeButton>
            <SideBarNodeButton onDragStart={onDragStart} nodeType={'SetVariable'}>
                Set Variable
            </SideBarNodeButton>
            <SideBarNodeButton onDragStart={onDragStart} nodeType={'GetVariable'}>
                Get Variable
            </SideBarNodeButton>
            <SideBarNodeButton onDragStart={onDragStart} nodeType={'RawHtml'}>
                Output HTML
            </SideBarNodeButton>

        </aside>
    );
};
