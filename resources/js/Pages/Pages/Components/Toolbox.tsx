import React from "react";
import {useEditor} from "@craftjs/core";
import {Button} from "./Button";
import {Text} from "./Text";
import {Container} from "./Container";
import {Element} from "@craftjs/core";
import {Card} from "./Card";
import {FlowForm} from "@/Pages/Pages/Components/FlowForm";

export const Toolbox = ({className="",forms="", flowID = 0}) => {
    const { connectors,query } = useEditor()
    return (
        <div className={className}>
            <div>
                <div className={"bg-green-800 p-3"}>
                    <p>Drag to add</p>
                </div>
                <div>
                    <button ref={ref => ref && connectors.create(ref, <Button>Click Me</Button>)}>Button</button>
                </div>
                <div>
                    <button
                        ref={ref => ref && connectors.create(ref, <Text text={"Hello World"} fontSize={20}/>)}>Text
                    </button>
                </div>
                <div>
                    <button ref={ref => ref && connectors.create(ref, <Element is={Container} canvas/>)}>Container
                    </button>
                </div>
                <div>
                    <button ref={ref => ref && connectors.create(ref, <Card/>)}>Card</button>
                </div>
                <div>
                    <button ref={ref => ref && connectors.create(ref, <FlowForm forms={forms} flow_id={3}/>)}>Flow</button>
                </div>
            </div>
        </div>
    )
};
