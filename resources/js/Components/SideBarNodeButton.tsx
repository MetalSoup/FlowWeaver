import {gridButtonStyle} from "@/Components/ui";

export default function SideBarNodeButton({nodeType, children, onDragStart, className} : {nodeType: string, children: any, onDragStart:any, className?: string}) {
    return (
        <div
        className={gridButtonStyle + " " + className}
        onDragStart={(event) => onDragStart(event, nodeType)} draggable>
        {children}
    </div>
    );
}
