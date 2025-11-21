import { useEditor } from '@craftjs/core';
import { Layers } from '@craftjs/layers';
import React, { useMemo, useState } from 'react';
import { styled } from 'styled-components';
import {GearIcon, PenIcon, PlusIcon, StackIcon} from '@phosphor-icons/react';
import { Toolbox } from '../Toolbox'

import { SidebarItem } from './SidebarItem';

import { Toolbar } from '../../Toolbar';
import Tooltip from "@/Components/Tooltip";
import TabSection from "@/Components/TabSection";
import PageSettings from "@/Views/Pages/Components/Editor/Toolbar/PageSettings";

export const SidebarDiv = styled.div<{ $enabled: boolean }>`
  opacity: ${(props) => (props.$enabled ? 1 : 0)};
  margin-right: ${(props) => (props.$enabled ? 0 : -280)}px;
`;

export const Sidebar = () => {
  const [layersVisible, setLayerVisible] = useState(true);
  const [toolbarVisible] = useState(true);
  const { enabled, selectedIds: rawSelectedIds, query } = useEditor((state) => ({
    enabled: state.options.enabled,
    selectedIds: Array.from((state.events.selected as any) || []),
  }));

  const selectedIds: string[] = (rawSelectedIds as unknown as string[]) ?? [];

  const activeTab = (selectedIds && selectedIds.length > 0) ? 1 : 0;
  const forceActiveToken = activeTab === 1 ? selectedIds.join('|') : undefined;

  const selectionHeader = useMemo(() => {
    try {
      if (!selectedIds || selectedIds.length === 0) return null;
      if (selectedIds.length > 1) {
        return (
          <div className="px-3 py-2 border-b bg-gray-50 text-xs text-gray-700">
            {selectedIds.length} components selected
          </div>
        );
      }
      const id: string = selectedIds[0];
      let resolvedType: string | null = null;
      let displayName: string | null = null;
      try {
        const node = query.node(id).get();
        const typeRaw: any = node?.data?.type;
        // prefer resolvedName if present (from Craft serialization)
        if (typeRaw && typeof typeRaw === 'object' && 'resolvedName' in typeRaw) {
          resolvedType = String((typeRaw as any).resolvedName);
        }
        // prefer custom.displayName if set by component
        if (!displayName) {
          const customName = node?.data?.custom?.displayName;
          if (customName) displayName = String(customName);
        }
        // fallback to craft.displayName or React component displayName
        if (!resolvedType && typeRaw && typeof typeRaw === 'function') {
          const craftName = (typeRaw as any)?.craft?.displayName ?? (typeRaw as any)?.displayName;
          if (craftName) resolvedType = String(craftName);
        }
        // as a last resort, if type is a plain string
        if (!resolvedType && typeof typeRaw === 'string') {
          resolvedType = typeRaw;
        }
        // final display name fallback
        if (!displayName) displayName = resolvedType || (id === 'ROOT' ? 'Root' : 'Component');
      } catch (e) {}

      const typeLabel = (() => {
        // only show type label when it's a short, clean string different from displayName
        if (!resolvedType) return null;
        if (displayName && resolvedType.toLowerCase() === displayName.toLowerCase()) return null;
        const str = String(resolvedType).trim();
        if (!str) return null;
        // avoid function bodies or arrow function strings
        if (/function\s|=>|\{/.test(str) || str.length > 60) return null;
        return str;
      })();

      return (
        <div className="px-3 py-2 border-b text-xs">
          <span className="font-semibold">{displayName || 'Component'}</span>
          {typeLabel ? <span className="ml-1">· {typeLabel}</span> : null}
          <span className="ml-2 text-gray-500">id: {id}</span>
        </div>
      );
    } catch (e) {
      return null;
    }
  }, [selectedIds, query]);

  return (
    <SidebarDiv $enabled={!!enabled} className="h-screen transition w-full ">
        <TabSection
            tabs={[
                {
                    label: (<Tooltip content={"Page Settings"}><GearIcon size={20} /></Tooltip>),
                    content: (
                        <PageSettings />
                    ),
                },
                {
                    label: (<Tooltip content={"Customize"}><PenIcon size={20} /></Tooltip>),
                    content: (
                        <div className="flex flex-col h-full">
                            {selectionHeader}
                            <Toolbar />
                        </div>
                    )
                },
                {
                    label: (<Tooltip content={"Add Elements"}><PlusIcon size={20} /></Tooltip>),
                    content: (
                        <Toolbox />
                    )
                },

            ]}
            activeTab={activeTab}
            forceActiveToken={forceActiveToken}
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
