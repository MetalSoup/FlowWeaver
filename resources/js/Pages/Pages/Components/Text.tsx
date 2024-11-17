import {useNode} from "@craftjs/core";
import ContentEditable from 'react-contenteditable'
import React, {useEffect, useState} from "react";

export const Text = ({text, fontSize}: { text: string, fontSize: any }) => {


    const {connectors: {connect, drag}, hasSelectedNode, hasDraggedNode, actions: {setProp}} = useNode((state) => ({
        hasSelectedNode: state.events.selected,
        hasDraggedNode: state.events.dragged
    }));

    const [editable, setEditable] = useState(false);

    useEffect(() => {
        !hasSelectedNode && setEditable(false)
    }, [hasSelectedNode]);


    return (
        <div
            className={hasSelectedNode && "outline" || ""}
            ref={ref => ref && connect(drag(ref))}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => setEditable(true)}
        >
            <ContentEditable
                disabled={!editable}
                html={text}
                onChange={e =>
                    setProp((props: { text: string; }) =>
                        props.text = e.target.value.replace(/<\/?[^>]+(>|$)/g, "")
                    )
                }
                tagName="p"
                style={{fontSize: `${fontSize}px`}}
            />

        </div>
    )
}

const TextSettings = () => {
    const {actions: {setProp}, fontSize} = useNode((node) => ({
        fontSize: node.data.props.fontSize
    }));

    return (
        <>

            <input
                type={"range"}
                defaultValue={fontSize}
                step={1}
                min={10}
                max={100}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setProp((props: { fontSize: any; }) => props.fontSize = e.target.value);
                }}
            />

        </>
    )
}

Text.craft = {

    related:
        {
            settings: TextSettings
        }
}
