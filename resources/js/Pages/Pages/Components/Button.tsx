import React from "react";
import {useNode} from "@craftjs/core";

export const Button = ({className="", children}:{
    className?:string,

    children:any
}) => {
    const { connectors: {connect, drag} } = useNode();
    return (
        <button className={className} ref={ref => ref && connect(drag(ref))}>
            {children}
        </button>
    )
}

const ButtonSettings = () => {
    const { actions: {setProp}, props } = useNode((node) => ({
        props: node.data.props
    }));
    return (
        <div>
            Button Settings
        </div>
    )
};


Button.craft = {
    related: {
        settings: ButtonSettings
    }
}
