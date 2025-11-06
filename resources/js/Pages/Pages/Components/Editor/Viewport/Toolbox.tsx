import { Element, useEditor } from '@craftjs/core';
import { Tooltip } from '@mui/material';
import React from 'react';
import { styled } from 'styled-components';
import { FileText, SquaresFour, Play, Square } from 'phosphor-react';

import { Button } from '../../Selectors/Button/Button';
import { Container, Column, Text } from '@/Pages/Pages/Components/Selectors';
import { Video } from '../../Selectors/Video/Video';
import { Flow } from '../../Selectors/Flow/Flow';

const ToolboxDiv = styled.div<{ $enabled: boolean }>`
  transition: 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  ${(props) => (!props.$enabled ? `width: 0;` : '')}
  ${(props) => (!props.$enabled ? `opacity: 0;` : '')}
`;

const Item = styled.a<{ $move?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  svg {
    width: 28px;
    height: 28px;
    fill: #707070;
  }
  ${(props) =>
    props.$move &&
    `
    cursor: move;
  `}
`;

export const Toolbox = () => {
  const {
    enabled,
    connectors: { create },
  } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <ToolboxDiv
      $enabled={enabled && enabled}
      className="toolbox transition w-12 h-full flex flex-col bg-white"
    >
      <div className="flex flex-1 flex-col items-center pt-3 gap-3">
        <div
          ref={(ref) => {
            create(
              ref,
              <Element
                canvas
                is={Container}
                background={{ r: 255, g: 255, b: 255, a: 1 }}
                color={{ r: 0, g: 0, b: 0, a: 1 }}
                height="auto"
                width="100%"
              ><Column/></Element>
            );
          }}
        >
          <Tooltip title="Container" placement="right">
            <Item $move>
              <Square size={28} />
            </Item>
          </Tooltip>
        </div>
        <div
          ref={(ref) => {
            create(
              ref,
              <Text fontSize="12" textAlign="left" text="Hi there" />
            );
          }}
        >
          <Tooltip title="Text" placement="right">
            <Item $move>
              <FileText size={28} />
            </Item>
          </Tooltip>
        </div>
        <div
          ref={(ref) => {
            create(ref, <Button />);
          }}
        >
          <Tooltip title="Button" placement="right">
            <Item $move>
              <Square size={28} />
            </Item>
          </Tooltip>
        </div>
        <div
          ref={(ref) => {
            create(ref, <Video />);
          }}
        >
          <Tooltip title="Video" placement="right">
            <Item $move>
              <Play size={28} />
            </Item>
          </Tooltip>
        </div>
        <div
          ref={(ref) => {
              create(ref, <Flow />);
          }}
        >
          <Tooltip title="Form" placement="right">
              <Item $move>
                  <FileText size={28} />
              </Item>
          </Tooltip>
        </div>
        <div
          ref={(ref) => {
            create(
              ref,
              <Element
                canvas
                is={Column}
                background={{ r: 255, g: 255, b: 255, a: 0 }}
                height="auto"


              >
              </Element>
            );
          }}
        >
          <Tooltip title="Column" placement="right">
            <Item $move>
              <SquaresFour size={28} />
            </Item>
          </Tooltip>
        </div>
      </div>




    </ToolboxDiv>
  );
};
