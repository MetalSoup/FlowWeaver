import React, {DragEvent} from "react";
import SideBarNodeButton from "@/Components/SideBarNodeButton";
import {
    ClipboardTextIcon, CodeIcon, DownloadSimpleIcon, ExportIcon, FileHtmlIcon,
    GreaterThanOrEqualIcon, LogIcon,
    SquareIcon,
    TreeStructureIcon,
    WebhooksLogoIcon
} from "@phosphor-icons/react";


export default ({className = ''}) => {
    const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };


    return (
        <div className={"grid grid-cols-3 gap-2 p-2 " + className}>
            <SideBarNodeButton onDragStart={onDragStart} nodeType={'Form'}>
                <ClipboardTextIcon size={40} weight="duotone"/>
                <div className={"text-sm"}>Form</div>
            </SideBarNodeButton>

            <SideBarNodeButton onDragStart={onDragStart} nodeType={'WebHook'}>
                <WebhooksLogoIcon size={40} weight="duotone"/>
                <div>Webhook</div>
            </SideBarNodeButton>

            <SideBarNodeButton onDragStart={onDragStart} nodeType={'Branch'}>
                <TreeStructureIcon size={40} weight="duotone"/>
                <div>Branch</div>
            </SideBarNodeButton>

            <SideBarNodeButton onDragStart={onDragStart} nodeType={'Comparison'}>
                <GreaterThanOrEqualIcon size={40} weight="regular"/>
                <div>Comparison</div>
            </SideBarNodeButton>

            <SideBarNodeButton onDragStart={onDragStart} nodeType={'SetVariable'}>
                <ExportIcon size={40} weight="duotone"/>
                <div>Set Variable</div>
            </SideBarNodeButton>

            <SideBarNodeButton onDragStart={onDragStart} nodeType={'GetVariable'}>
                <DownloadSimpleIcon size={40} weight="duotone"/>
                <div>Get Variable</div>
            </SideBarNodeButton>

            <SideBarNodeButton onDragStart={onDragStart} nodeType={'RawHtml'}>
                <CodeIcon size={40} weight="regular"/>
                HTML
            </SideBarNodeButton>

            <SideBarNodeButton onDragStart={onDragStart} nodeType={'ConsoleLog'}>
                <LogIcon size={40} weight="duotone" />
                Log Value
            </SideBarNodeButton>

        </div>
    );
};
