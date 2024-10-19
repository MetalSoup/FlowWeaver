export default function SideBarNodeButton({nodeType, children, onDragStart} : {nodeType: string, children: any, onDragStart:any}) {
    return (
        <div
        className="dark:bg-gray-500 py-1 px-3 dark:text-white rounded-md cursor-grab mb-3 shadow-[0px_0px_5px_0px_rgba(0,0,0,0.5)]"
        onDragStart={(event) => onDragStart(event, nodeType)} draggable>
        {children}
    </div>
    );
}
