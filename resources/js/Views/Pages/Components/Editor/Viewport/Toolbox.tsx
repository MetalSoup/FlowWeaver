import {Element, useEditor} from '@craftjs/core';
import React from 'react';
import {styled} from 'styled-components';
import {FileTextIcon, SquaresFourIcon, PlayIcon, SquareIcon, ImageIcon, FlowArrowIcon} from '@phosphor-icons/react';

import {Button} from '../../Selectors/Button/Button';
import {Container, Column, Text} from '@/Views/Pages/Components/Selectors';
import {Video} from '../../Selectors/Video/Video';
import {Flow} from '../../Selectors/Flow/Flow';
import {Image} from '../../Selectors/Image/Image';
import { Html } from '../../Selectors/Html/Html';
import {gridButtonStyle} from "@/Components/ui";

const ToolboxDiv = styled.div<{ $enabled: boolean }>`
    transition: 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    ${(props) => (!props.$enabled ? `width: 0;` : '')}
    ${(props) => (!props.$enabled ? `opacity: 0;` : '')}
`;

const Item = styled.a<{ $move?: boolean }>`




    ${(props) =>
        props.$move &&
        `
    cursor: move;
  `}
`;

export const Toolbox = () => {
    const {
        enabled,
        connectors: {create},
    } = useEditor((state) => ({
        enabled: state.options.enabled,
    }));

    const ItemStyle = gridButtonStyle;

    return (
        <ToolboxDiv
            $enabled={enabled && enabled}
            className="toolbox transition h-full w-full flex flex-col"
        >
            <div className="grid grid-cols-3 gap-2 p-2">
                <div
                    ref={(ref) => {
                        create(
                            ref,
                            <Element
                                canvas
                                is={Container}
                                background={{r: 255, g: 255, b: 255, a: 1}}
                                color={{r: 0, g: 0, b: 0, a: 1}}
                                height="auto"
                                width="100%"
                            ></Element>
                        );
                    }}
                >

                        <Item $move className={ItemStyle}>
                            <SquareIcon size={40} weight="duotone"/>
                            <div>Container</div>
                        </Item>


                </div>
                <div
                    ref={(ref) => {
                        create(
                            ref,
                            <Text fontSize="12" textAlign="left" text="Hi there"/>
                        );
                    }}
                >

                        <Item $move className={ItemStyle}>
                            <FileTextIcon size={40} weight="duotone"/>
                            <div>Text</div>
                        </Item>


                </div>
                <div
                    ref={(ref) => {
                        create(ref, <Button/>);
                    }}
                >

                        <Item $move className={ItemStyle}>
                            <SquareIcon size={40} weight="duotone"/>
                            <div>Button</div>
                        </Item>


                </div>
                <div
                    ref={(ref) => {
                        create(ref, <Video/>);
                    }}
                >

                        <Item $move className={ItemStyle}>
                            <PlayIcon size={40} weight="duotone"/>
                            <div>Video</div>
                        </Item>

                </div>
                <div
                    ref={(ref) => {
                        create(ref, <Flow/>);
                    }}
                >

                        <Item $move className={ItemStyle}>
                            <FlowArrowIcon size={40} weight="duotone"/>
                            <div>Flow</div>
                        </Item>

                </div>
                <div
                    ref={(ref) => {
                        create(
                            ref,
                            <Element
                                canvas
                                is={Column}
                                background={{r: 255, g: 255, b: 255, a: 0}}
                                height="auto"


                            >
                            </Element>
                        );
                    }}
                >

                        <Item $move className={ItemStyle}>
                            <SquaresFourIcon size={40} weight="duotone"/>
                            <div className={"text-sm"}>Column</div>
                        </Item>

                </div>
                <div
                    ref={(ref) => {
                        create(ref, <Image/>);
                    }}
                >

                        <Item $move className={ItemStyle}>
                            <ImageIcon size={40} weight="duotone"/>
                            <div className={"text-sm"}>Image</div>
                        </Item>

                </div>
                <div
                    ref={(ref) => {
                        create(ref, <Html />);
                    }}
                >

                        <Item $move className={ItemStyle}>
                            <FileTextIcon size={40} weight="duotone"/>
                            <div className={"text-sm"}>HTML</div>
                        </Item>

                </div>
            </div>


        </ToolboxDiv>
    );
};
