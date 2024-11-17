import React from "react";
import {useNode} from "@craftjs/core";

export const Container = ({
                              className = "",
                              children = "",
                              padding = 20,

} : {
    className?:string,

    children?:React.ReactNode
    padding?:any

}) => {
    const { connectors: {connect, drag} } = useNode();

    return (
        <div className={className} ref={ref => ref && connect(drag(ref))} style={{padding:padding+"px"}}>
            {children}kj
        </div>
    )
}

export const ContainerSettings = () => {
    const { actions: {setProp}, padding } = useNode((node) => ({
        padding: node.data.props.fontsize,

    }));
    return (
        <div>
            Container Settings
            <input
                type={"range"}
                defaultValue={padding}
                step={1}
                min={10}
                max={100}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setProp((props: { padding: any; }) => props.padding = e.target.value);
                }}
            />


        </div>
    )
};


Container.craft = {
    related: {
        settings: ContainerSettings
    }
}
