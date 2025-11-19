import {useNode, useEditor} from '@craftjs/core';
import {ROOT_NODE, getRandomId} from '@craftjs/utils';
import * as React from 'react';
import ReactDOM from 'react-dom';
import {styled} from 'styled-components';

import {ArrowUpIcon, TrashIcon, DotsNineIcon, CopySimpleIcon} from '@phosphor-icons/react';

const IndicatorDiv = styled.div`
    height: 30px;
    margin-top: -29px;
    font-size: 12px;
    line-height: 12px;

    svg {
        fill: #fff;
        width: 15px;
        height: 15px;
    }
`;

const Btn = styled.a`
    padding: 0;
    opacity: 0.9;
    display: flex;
    align-items: center;

    > div {
        position: relative;
        top: -50%;
        left: -50%;
    }
`;

export const RenderNode: React.FC<{ render: React.ReactElement }> = ({render}) => {
    const {id} = useNode();
    const {actions, query, isActive} = useEditor((_, query) => ({
        isActive: query.getEvent('selected').contains(id),
    }));

    const {
        isHover,
        dom,
        name,
        moveable,
        deletable,
        connectors: {drag},
        parent,
    } = useNode((node) => ({
        isHover: node.events.hovered,
        dom: node.dom,
        name: node.data.custom.displayName || node.data.displayName,
        moveable: query.node(node.id).isDraggable(),
        deletable: query.node(node.id).isDeletable(),
        parent: node.data.parent,
        props: node.data.props,
    }));

    const currentRef = React.useRef<HTMLDivElement | null>(null);
    const menuContainerRef = React.useRef<HTMLDivElement | null>(null);
    const originalParentRef = React.useRef<HTMLElement | null>(null);
    const originalNextSiblingRef = React.useRef<ChildNode | null>(null);
    const movedMenuRef = React.useRef<HTMLElement | null>(null);

    React.useEffect(() => {
        if (dom) {

            if (isActive)
            {
                dom.classList.add('component-selected');
                dom.classList.remove('component-highlight');
            }
            else if (isHover && !isActive)
            {
                dom.classList.add('component-highlight');
            }
            else if (!isHover && !isActive){
                dom.classList.remove('component-highlight','component-selected');

            }

        }
    }, [dom, isActive, isHover]);

    // Move the existing .flow_top_menu element into the hover portal while hovered/selected.
    React.useEffect(() => {
        if (!dom || !menuContainerRef.current) return;

        const flowMenu = dom.querySelector('.flow_top_menu') as HTMLElement | null;

        // If we have a flow menu and it's not already moved, move it into the portal container.
        if ((isHover || isActive) && flowMenu && menuContainerRef.current && !menuContainerRef.current.contains(flowMenu)) {
            // store original parent and nextSibling so we can restore later
            originalParentRef.current = flowMenu.parentElement as HTMLElement;
            originalNextSiblingRef.current = flowMenu.nextSibling;
            movedMenuRef.current = flowMenu;
            try {
                menuContainerRef.current.appendChild(flowMenu);
            } catch (e) {
                // ignore DOM move errors
                console.error('Failed to move flow_top_menu into hover menu', e);
            }
        }

        // If we're no longer hovered/active but we previously moved the menu, restore it.
        if (!(isHover || isActive) && movedMenuRef.current) {
            const menu = movedMenuRef.current;
            const parent = originalParentRef.current;
            const next = originalNextSiblingRef.current;
            if (parent) {
                try {
                    parent.insertBefore(menu, next);
                } catch (e) {
                    // fallback: append back to parent
                    parent.appendChild(menu);
                }
            }
            // clear refs
            movedMenuRef.current = null;
            originalParentRef.current = null;
            originalNextSiblingRef.current = null;
        }

        // cleanup on unmount: restore if still moved
        return () => {
            if (movedMenuRef.current) {
                const menu = movedMenuRef.current;
                const parent = originalParentRef.current;
                const next = originalNextSiblingRef.current;
                if (parent) {
                    try { parent.insertBefore(menu, next); } catch (e) { parent.appendChild(menu); }
                }
                movedMenuRef.current = null;
                originalParentRef.current = null;
                originalNextSiblingRef.current = null;
            }
        };
    }, [dom, isHover, isActive]);

    const getPos = React.useCallback((dom: HTMLElement | null) => {
        const {top, left, bottom} = dom
            ? dom.getBoundingClientRect()
            : {top: 0, left: 0, bottom: 0};
        return {
            top: `${top > 0 ? top : bottom}px`,
            left: `${left}px`,
        };
    }, []);

    const scroll = React.useCallback(() => {
        const {current: currentDOM} = currentRef;

        if (!currentDOM) {
            return;
        }

        const {top, left} = getPos(dom);
        currentDOM.style.top = top;
        currentDOM.style.left = left;
    }, [dom, getPos]);

    React.useEffect(() => {
        const container = document.querySelector('.craftjs-renderer');
        if (container) {
            container.addEventListener('scroll', scroll);
        }

        return () => {
            if (container) container.removeEventListener('scroll', scroll);
        };
    }, [scroll]);

    return (
        <>
            {isHover || isActive
                ? ReactDOM.createPortal(
                    <IndicatorDiv
                        ref={currentRef}
                        className="px-2 py-2 text-white bg-primary fixed flex items-center"
                        style={{
                            left: getPos(dom).left,
                            top: getPos(dom).top,
                            zIndex: 9999,
                        }}
                    >
                        <h2 className="flex-1 mr-4">{name}</h2>
                        {moveable ? (
                            <Btn
                                className="mr-2 cursor-move"
                                ref={(el: HTMLAnchorElement | null) => {
                                    if (el) drag(el as HTMLElement);
                                }}
                            >
                                <DotsNineIcon size={16}/>
                            </Btn>
                        ) : null}
                        {/* container where we will move the existing .flow_top_menu into */}
                        <div ref={menuContainerRef} className="mr-2 flow_top_menu_portal" />
                        {deletable ? (
                            <Btn
                                className="cursor-pointer mr-2"
                                onMouseDown={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    actions.delete(id);
                                }}
                            >
                                <TrashIcon size={16}/>
                            </Btn>
                        ) : null}

                        {/* Duplicate button placed between delete and parent-select */}
                        <Btn
                            className="cursor-pointer mr-2"
                            onMouseDown={(e: React.MouseEvent) => {
                                e.stopPropagation();

                                try {
                                    // get the node tree for this node
                                    const tree = query.node(id).toNodeTree();

                                    // map old ids to new ids
                                    const idMap: Record<string, string> = {};
                                    Object.keys(tree.nodes).forEach((oldId) => {
                                        idMap[oldId] = getRandomId();
                                    });

                                    // build new nodes object with remapped ids and parent/child refs
                                    const newNodes = Object.keys(tree.nodes).reduce((acc: any, oldId) => {
                                        const oldNode = tree.nodes[oldId];
                                        const newId = idMap[oldId];

                                        const newNode = {
                                            ...oldNode,
                                            id: newId,
                                            data: {
                                                ...oldNode.data,
                                                parent: oldNode.data.parent ? idMap[oldNode.data.parent] : oldNode.data.parent,
                                                nodes: (oldNode.data.nodes || []).map((n: string) => idMap[n]),
                                                linkedNodes: Object.keys(oldNode.data.linkedNodes || {}).reduce((lnAcc: any, key) => {
                                                    const val = oldNode.data.linkedNodes[key];
                                                    lnAcc[key] = idMap[val] || val;
                                                    return lnAcc;
                                                }, {}),
                                            },
                                        };

                                        acc[newId] = newNode;
                                        return acc;
                                    }, {} as Record<string, any>);

                                    const newTree = {
                                        rootNodeId: idMap[tree.rootNodeId],
                                        nodes: newNodes,
                                    };

                                    // determine insertion parent and index (insert after original if possible)
                                    let targetParent = parent || ROOT_NODE;
                                    let index: number | undefined = undefined;

                                    try {
                                        const parentNode = query.node(targetParent).get();
                                        const idx = parentNode.data.nodes.indexOf(id);
                                        if (idx !== -1) {
                                            index = idx + 1;
                                        }
                                    } catch (err) {
                                        // ignore and append
                                    }

                                    actions.addNodeTree(newTree, targetParent as string, index);

                                    // select the newly duplicated node
                                    actions.selectNode(idMap[tree.rootNodeId]);
                                } catch (err) {
                                    // log any duplication errors
                                    // eslint-disable-next-line no-console
                                    console.error('Failed to duplicate node', err);
                                }
                            }}
                        >
                            <CopySimpleIcon size={16} />
                        </Btn>

                        {id !== ROOT_NODE && (
                            <Btn
                                className="mr-2 cursor-pointer"
                                onClick={() => {
                                    if (parent) actions.selectNode(parent as string);
                                }}
                            >
                                <ArrowUpIcon size={16}/>
                            </Btn>
                        )}
                     </IndicatorDiv>,
                     (document.querySelector('.page-container') as Element) || document.body
                 )
                 : null}
             {render}
         </>
     );
 };
