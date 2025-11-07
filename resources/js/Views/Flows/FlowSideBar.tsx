import { DragEvent } from "react";
import SideBarNodeButton from "@/Components/SideBarNodeButton";




export default ({className = ''}) => {
    const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };



    return (
        <aside className={className}>
            <SideBarNodeButton onDragStart={onDragStart} nodeType={'Entry'}>
                Start Node
            </SideBarNodeButton>
            <SideBarNodeButton onDragStart={onDragStart} nodeType={'Form'}>
                Form
            </SideBarNodeButton>
            <SideBarNodeButton onDragStart={onDragStart} nodeType={'input'} >
                Input Node
            </SideBarNodeButton>

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
