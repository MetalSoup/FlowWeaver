import {useCallback, useEffect, useState} from "react";
import {DndContext, closestCenter} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import NodeHeading from "@/Views/Flows/Nodes/NodeComponents/NodeHeading";
import NodeStartHandle from "@/Views/Flows/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Views/Flows/Nodes/NodeComponents/NodeBody";
import NodeEndHandle from "@/Views/Flows/Nodes/NodeComponents/NodeEndHandle";
import NodeSection from "@/Views/Flows/Nodes/NodeComponents/NodeSection";
import NodeSectionContent from "@/Views/Flows/Nodes/NodeComponents/NodeSectionContent";
import SelectWithoutOverride from "@/Views/Flows/Nodes/NodeComponents/SelectWithoutOverride";
import CheckBoxWithOverride from "@/Views/Flows/Nodes/NodeComponents/CheckBoxWithOverride";
import {SortableItem} from "@/Views/Flows/Nodes/NodeComponents/SortableItem";
import {v4 as uuidv4} from 'uuid';
import { PlusCircleIcon } from '@phosphor-icons/react';
import {useReactFlow, useUpdateNodeInternals, useStore} from "@xyflow/react";
import {SingleValue} from 'react-select';
import {usePage} from "@inertiajs/react";
import NodeInputHandle from "@/Views/Flows/Nodes/NodeComponents/NodeInputHandle";
import { TrashIcon } from '@phosphor-icons/react';
import HtmlEditor from "@/Views/Flows/Nodes/NodeComponents/HtmlEditor";



export default function FormNode({data}: { data: any }) {
    const {fields}: any = usePage().props;

    // react-flow helpers and node id (declare early so effects can use them)
    const {getEdges, setEdges} = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();
    const nodeID: string = data.id;
    const storeEdges = useStore(store => store.edges);

    // build select options from fields
    const fieldOptions = (Array.isArray(fields) ? fields : []).map((field: any) => ({ value: field.name, label: field.label }));

    // helper to create a nice fallback label from a name
    const humanize = (name: string | null) => {
        if (!name) return '';
        return name.split('_').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }

    // Use unified ordered `items` array stored in `data.formFields` (each item must include a `type`)
    const buildInitialItems = () => {
        if (!Array.isArray(data.formFields)) return [];
        return data.formFields.map((it: any) => ({ ...it, id: it.id || uuidv4() }));
    };

    const [items, setItems] = useState<any[]>(buildInitialItems());

    // persist items back to data.formFields whenever they change
    useEffect(() => {
        // Persist the unified ordered items under data.formFields
        data.formFields = items.map(it => ({ ...it }));
         updateNodeInternals(nodeID);
     }, [items, updateNodeInternals, nodeID]);

    const removeConnectedEdges = useCallback((handleIds: any | any[]) => {
        const edges = getEdges();
        const handleIdArray = Array.isArray(handleIds) ? handleIds : [handleIds];
        const updatedEdges = edges.filter(edge =>
            !handleIdArray.includes(edge.sourceHandle) && !handleIdArray.includes(edge.targetHandle)
        );
        setEdges(updatedEdges);
    }, [getEdges, setEdges]);

    const addField = () => {
        const newField = { type: 'field', id: uuidv4(), name: null, label: '', field_id: null, active: true };
        setItems(prev => { const next = [...prev, newField]; updateNodeInternals(nodeID); return next; });
    };

    const onDeleteField = (id: string) => {
        // remove any connected edges for both possible handle types
        removeConnectedEdges([id + "-field-active-override", id + '-section-override']);
        setItems(prev => {
            const next = prev.filter(i => i.id !== id);
            updateNodeInternals(nodeID);
            return next;
        });
    };

    const onChangeFieldValue = (id: string, newValue: SingleValue<{ value: any; label: any }>) => {
        const selectedName = newValue ? newValue.value : null;
        const matched = fields.find((f: any) => f.name === selectedName);
        setItems(prev => prev.map(i => i.id === id ? { ...i, name: selectedName, label: matched?.label ?? (selectedName ? humanize(selectedName) : ''), field_id: matched?.id ?? null } : i));
    };

    const onChangeFieldActive = (checked: boolean, id: string) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, active: checked } : i));
    };

    const onDragEnd = (event: any) => {
        const {active, over} = event;
        if (!active || !over) return;
        if (active.id === over.id) return;

        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const newOrdered = arrayMove(items, oldIndex, newIndex);
        setItems(newOrdered.map(i => ({ ...i })));
        updateNodeInternals(nodeID);
    };

    const addSectionAt = () => {
        // position param is ignored; append to end and user can drag into place
        const newSection = { type: 'html', id: uuidv4(), html: '<p>New section</p>' };
        setItems(prev => { const next = [...prev, newSection]; updateNodeInternals(nodeID); return next; });
    };

    const updateSectionHtml = (id: string, html: string) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, html } : i));
    };

    const deleteItem = (id: string) => {
        // remove connected edges for both potential handles
        removeConnectedEdges([id + '-section-override', id + '-field-active-override']);
        setItems(prev => {
            const next = prev.filter(i => i.id !== id);
            updateNodeInternals(nodeID);
            return next;
        });
    };

    return (
        <>
            <NodeBody className={"formNode"}>
                <NodeHeading onChange={(newHeading: string) => {
                    data.heading = newHeading;
                }}>
                    {data.heading || "Show Form"}
                </NodeHeading>


                <NodeSection className={"flex"}>
                    <div className="flex-none w-14">
                        <NodeStartHandle
                            id={"previous"} nodeID={nodeID}
                            onConnect={(params: any) => console.log('handle onConnect', params)}
                        />
                    </div>

                    <div className="flex-1 text-right">
                        <NodeEndHandle
                            onConnect={(params: any) => console.log('handle onConnect', params)}
                            id={"next"}
                            nodeID={nodeID}>

                        </NodeEndHandle>

                    </div>
                </NodeSection>



                <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <NodeSection className={"relative nodrag"}>
                        <NodeSectionContent>

                            <h2 className={"font-bold"}>

                                Fields
                            </h2>
                        </NodeSectionContent>

                        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            {items.map((item) => (
                                <SortableItem key={item.id} id={item.id} onDeleteField={item.type === 'field' ? onDeleteField : undefined} field={item.type === 'field' ? item : undefined}>
                                    {item.type === 'html' ? (
                                        (() => {
                                            const s = item;
                                            const handleId = s.id + '-section-override';
                                            const isConnected = storeEdges.some(edge => edge.targetHandle === handleId && edge.target === nodeID);
                                            return (
                                                <div className={"mb-3  bg-gray-500/20 relative nodrag w-full"}>
                                                    <NodeInputHandle nodeID={nodeID} handleID={handleId}>
                                                        <HtmlEditor
                                                            value={s.html}
                                                            onChange={(html: string) => updateSectionHtml(s.id, html)}
                                                            disabled={isConnected}
                                                        />
                                                    </NodeInputHandle>
                                                    <button className={"absolute top-2 right-2 text-red-600"} onClick={() => deleteItem(s.id)} title="Delete section">
                                                        <TrashIcon size={16} />
                                                    </button>
                                                    {isConnected && <div className="absolute left-3 top-3 text-xs bg-white/60 px-2 py-0.5 rounded">Overridden</div>}
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        (() => {
                                            const f = item;
                                            const selectedOption = f.name == null
                                                ? null
                                                : (fieldOptions.find((o: any) => o.value === f.name) ?? { value: f.name, label: f.label ?? f.name });
                                            return (
                                                <div className={"flex items-center gap-3 w-full"}>
                                                    <div className={"flex-col"}>
                                                        <CheckBoxWithOverride
                                                            id={f.id}
                                                            onChange={onChangeFieldActive}
                                                            isTrue={f.active} handleID={f.id+"-field-active-override"}
                                                            nodeID={nodeID}
                                                            title={"Show"}
                                                        />
                                                    </div>
                                                    <div className={"flex-col"}>
                                                        <SelectWithoutOverride
                                                            onChange={(newValue: SingleValue<{ value: any; label: any }>) => onChangeFieldValue(f.id, newValue)}
                                                            value={selectedOption}
                                                            className={"w-[600px]"}
                                                            isSearchable={true}
                                                            options={fieldOptions}
                                                            creatable={false}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    )}
                                </SortableItem>
                            ))}
                        </SortableContext>

                        {/* Footer actions: add field and add section buttons */}
                        <div className="flex items-center justify-center gap-4 mt-3 w-full">
                            <button onClick={addField} className="flex items-center gap-2 px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-white">
                                <PlusCircleIcon size={18} />
                                <span>Add Field</span>
                            </button>
                            <button onClick={() => addSectionAt()} className="flex items-center gap-2 px-3 py-2 rounded border border-gray-300 hover:bg-gray-50">
                                <PlusCircleIcon size={16} />
                                <span className="text-sm text-gray-700">Add Section</span>
                            </button>
                        </div>
                    </NodeSection>

                 </DndContext>

             </NodeBody>
         </>
     );
 }
