import React  from "react";
import { Text } from "./Text";
import { Button } from "./Button";
import { Container, ContainerSettings } from "./Container";
import { Element, useNode } from "@craftjs/core";


export const CardTop = ({children}: {children:any}) => {
    const { connectors: {connect} } = useNode();

    const refCallback = (ref: HTMLDivElement | null) => {
        if (ref) {
            connect(ref);
        }
    };

    return (
        <div ref={refCallback} className="text-only">
            {children}
        </div>
    )
}

CardTop.craft = {
    rules: {
        // Only accept Text
        canMoveIn: (incomingNodes: any[]) => incomingNodes.every(incomingNode => incomingNode.data.type === Text)
    }
}


export const CardBottom = ({children}: {children:any}) => {
    const { connectors: {connect} } = useNode();

    const refCallback = (ref: HTMLDivElement | null) => {
        if (ref) {
            connect(ref);
        }
    };

    return (
        <div ref={refCallback}>
            {children}
        </div>
    )
}

CardBottom.craft = {
    rules: {
        // Only accept Buttons
        canMoveIn : (incomingNodes: any[]) => incomingNodes.every(incomingNode => incomingNode.data.type === Button)
    }
}


export const Card = ({className = "", padding = 20} : {
    className?:string,
    padding?:number
}) => {
    return (
        <Container className={"border "+className}>
            <Element is={CardTop} id={"text"} canvas>
                <Text text="Title" fontSize={20} />
                <Text text="Subtitle" fontSize={15} />
            </Element>

            <Element is={CardBottom} id={"buttons"} canvas>
                <Button className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"}>Learn more</Button>
            </Element>
        </Container>
    )
}

Card.craft = {
    related: {
        // Since Card has the same settings as Container, we'll just reuse ContainerSettings
        settings: ContainerSettings
    }
}
