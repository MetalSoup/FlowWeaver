import {useCallback, useEffect, useState} from "react";
import {DndContext, closestCenter} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import NodeStartHandle from "@/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Nodes/NodeComponents/NodeBody";
import NodeEndHandle from "@/Nodes/NodeComponents/NodeEndHandle";
import {v4 as uuidv4} from 'uuid';
import { PlusCircleIcon } from '@phosphor-icons/react';
import {useReactFlow, useUpdateNodeInternals} from "@xyflow/react";
import {SingleValue} from 'react-select';
import {usePage} from "@inertiajs/react";
import {SortableItem} from "@/Nodes/NodeComponents/SortableItem";
import NodeSection from "@/Nodes/NodeComponents/NodeSection";
import NodeSectionContent from "@/Nodes/NodeComponents/NodeSectionContent";
import SelectWithoutOverride from "@/Nodes/NodeComponents/SelectWithoutOverride";
import CheckBoxWithOverride from "./NodeComponents/CheckBoxWithOverride";

export default function FormNode({data}: { data: any }) {
    const {fields}: any = usePage().props;

    // Use the field's `name` as the stored value (unique identifier), but show the human label.
    const fieldOptions = fields.map((field: any) => ({
        value: field.name,
        label: field.label,
    }));
    const {getEdges, setEdges} = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();

    if (!Array.isArray(data.formFields)) {
        data.formFields = [];
    }

    const nodeID: string = data.id;

    // helper to create a nice fallback label from a name
    const humanize = (name: string | null) => {
        if (!name) return '';
        return name.split('_').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }

    // Store fields as { id, name, active, label, field_id }
    const [formFields, setFormFields] = useState(
        data.formFields.map((f: any) => {
            // Support legacy `value` key: prefer f.name, fallback to f.value
            const name = f.name ?? f.value ?? null;
            const matched = fields.find((fld: any) => fld.name === name);
            return {
                ...f,
                id: f.id || uuidv4(),
                name: name,
                active: f.active ?? true,
                label: matched?.label ?? f.label ?? humanize(name),
                field_id: matched?.id ?? f.field_id ?? null,
            };
        })
    );

    useEffect(() => {
        // persist the structured formFields
        data.formFields = formFields;

        updateNodeInternals(nodeID);
    }, [formFields, updateNodeInternals, nodeID]);

    const removeConnectedEdges = useCallback((handleIds: any | any[]) => {
        const edges = getEdges();
        const handleIdArray = Array.isArray(handleIds) ? handleIds : [handleIds];
        const updatedEdges = edges.filter(edge =>
            !handleIdArray.includes(edge.sourceHandle) && !handleIdArray.includes(edge.targetHandle)
        );
        setEdges(updatedEdges);
    }, [getEdges, setEdges]);

    const addField = () => {
        setFormFields((prevFields: any) => {
            // New fields start with null selection but have active true
            const newFields = [...prevFields, {id: uuidv4(), name: null, label: '', field_id: null, active: true}];
            updateNodeInternals(nodeID);
            return newFields;
        });
    };

    const onDeleteField = (id: string) => {
        removeConnectedEdges([id+"-field-active-override"]);
        setFormFields((prevFields: any[]) => {
            const updatedFields = prevFields.filter((field: any) => field.id !== id);
            updateNodeInternals(nodeID);
            return updatedFields;
        });
    };

    const onChangeFieldValue = (id: string, newValue: SingleValue<{ value: any; label: any }>) => {
        // newValue.value is the selected field.name. When changed, also set label and field_id from fields list.
        setFormFields((prevFields: any[]) => {
            return prevFields.map((field: any) => {
                if (field.id !== id) return field;

                const selectedName = newValue ? newValue.value : null;
                const matched = fields.find((f: any) => f.name === selectedName);

                return {
                    ...field,
                    name: selectedName,
                    label: matched?.label ?? (selectedName ? humanize(selectedName) : ''),
                    field_id: matched?.id ?? null,
                };
            });
        });
    };

    const onChangeFieldActive = (checked: boolean, id: string) => {
        setFormFields((prevFields: any[]) => {
            return prevFields.map((field: any) =>
                field.id === id ? { ...field, active: checked } : field
            );
        });
    };

    const onDragEnd = (event: any) => {
        const {active, over} = event;

        if (active.id !== over.id) {
            setFormFields((items: any[]) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });


        }
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

                        <SortableContext items={formFields} strategy={verticalListSortingStrategy}>
                            {formFields.map((field: any) => (
                                <SortableItem key={field.id} id={field.id} onDeleteField={onDeleteField} field={field}>
                                    <div className={"flex-col"}>
                                        <CheckBoxWithOverride
                                            id={field.id}
                                            onChange={onChangeFieldActive}
                                            isTrue={field.active} handleID={field.id+"-field-active-override"}
                                            nodeID={nodeID}
                                            title={"Show"}>


                                        </CheckBoxWithOverride>
                                    </div>

                                        <div className={"flex-col"}>
                                            {/* Compute selected option by matching the name (we store field.name in name) */}
                                            {(() => {
                                                const selectedOption = field.name == null
                                                    ? null
                                                    : (fieldOptions.find((o: any) => o.value === field.name) ?? { value: field.name, label: field.label ?? field.name });

                                                return (
                                                    <SelectWithoutOverride
                                                        onChange={(newValue: SingleValue<{
                                                            value: any;
                                                            label: any;
                                                        }>) => onChangeFieldValue(field.id, newValue)}
                                                        value={selectedOption}
                                                        className={"w-[600px]"}
                                                        isSearchable={true}
                                                        options={fieldOptions}
                                                        creatable={false}
                                                    />
                                                );
                                            })()}
                                        </div>
                                </SortableItem>
                                ))}
                        </SortableContext>
                        <div
                            className="addButton block py-1 text-center w-full"
                            onClick={addField}
                        >
                            <PlusCircleIcon size={24} />
                        </div>
                    </NodeSection>

                </DndContext>

            </NodeBody>
        </>
    );
}
