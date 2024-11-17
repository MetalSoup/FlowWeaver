import { useEditor } from "@craftjs/core";
import React from "react";
export const TopBar = ({className = "",onSave} : {className?:string, onSave:any}) => {

    const { actions, query,enabled } = useEditor((state) => ({
        enabled: state.options.enabled
    }));

    return (
        <div className={className} >
            <div>
                <div>
                    <div>
                        label
                        <input type="checkbox" checked={enabled} onChange={(e: React.ChangeEvent<HTMLInputElement>) => actions.setOptions(options => options.enabled = e.target.checked)} />
                    </div>
                </div>
                <div>
                    <button onClick={() => onSave({content: query.serialize()})}>Save</button>
                </div>
            </div>
        </div>
    )
};
