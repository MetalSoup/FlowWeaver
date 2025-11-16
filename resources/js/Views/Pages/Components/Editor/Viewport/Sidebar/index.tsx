import { useEditor } from '@craftjs/core';
import { Layers } from '@craftjs/layers';
import React, { useState } from 'react';
import { styled } from 'styled-components';
import {GearIcon, PenIcon, PlusIcon, StackIcon} from '@phosphor-icons/react';
import { Toolbox } from '../Toolbox'

import { SidebarItem } from './SidebarItem';

import { Toolbar } from '../../Toolbar';
import Tooltip from "@/Components/Tooltip";
import TabSection from "@/Components/TabSection";
import PageSettings from "@/Views/Pages/Components/Editor/Toolbar/PageSettings";

export const SidebarDiv = styled.div<{ $enabled: boolean }>`
  width: 280px;
  opacity: ${(props) => (props.$enabled ? 1 : 0)};
  background: #fff;
  margin-right: ${(props) => (props.$enabled ? 0 : -280)}px;
`;

export const Sidebar = () => {
  const [layersVisible, setLayerVisible] = useState(true);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <SidebarDiv $enabled={enabled} className="sidebar h-screen transition bg-black w-2 text-black">
        <TabSection
            tabs={[
                {
                    label: (<Tooltip content={"Page Settings"}><GearIcon size={16} className="inline mb-0.5 mr-1"/></Tooltip>),
                    content: (
                        <PageSettings />
                    ),
                },
                {
                    label: (<Tooltip content={"Customize"}><PenIcon size={16} className="inline mb-0.5 mr-1"/></Tooltip>),
                    content: (
                        <div className="flex flex-col h-full">

                            <Toolbar />

                        </div>
                    )
                },
                {
                    label: (<Tooltip content={"Add Elements"}><PlusIcon size={16} className="inline mb-0.5 mr-1"/></Tooltip>),
                    content: (
                        <Toolbox />
                    )
                },
            ]}


        />
        <SidebarItem
            icon={StackIcon}
            title="Layers"
            height={!toolbarVisible ? 'full' : '45%'}
            visible={layersVisible}
            onChange={(val) => setLayerVisible(val)}
        >
            <div className="">
                {typeof window !== 'undefined' && (window as any).__CRAFT_TEMP_DISABLE_LAYERS ? null : (
                    <Layers expandRootOnLoad={true} />
                )}
            </div>
        </SidebarItem>

    </SidebarDiv>
  );
};
