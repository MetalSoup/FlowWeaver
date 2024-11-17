import { useEditor } from "@craftjs/core";
import React from "react";

export const SettingsPanel = ({className = ""}) => {
    const { actions, selected } = useEditor((state,query) => {
        const [currentNodeId] = state.events.selected;
        let selected;

        if ( currentNodeId ) {
            selected = {
                id: currentNodeId,
                name: state.nodes[currentNodeId].data.name,
                settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
                isDeletable: query.node(currentNodeId).isDeletable()
            };
        }

        return {
            selected
        }
    });
    return selected ? (
        <div className={className} >
            <div >
                <div >
                    <div>
                        <div>
                            <div><p>Selected</p></div>
                            <div><div color="primary"/></div>
                        </div>
                    </div>
                </div>
                {
                    selected.settings && React.createElement(selected.settings)
                }

                {
                    selected.isDeletable ? (
                        <button

                            onClick={() => {
                                actions.delete(selected.id);
                            }}
                        >
                            Delete
                        </button>
                    ) : null
                }

            </div>
        </div>
    ) : null;
}
