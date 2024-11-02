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
import {PlusCircleIcon} from '@heroicons/react/20/solid';
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

    const fieldOptions = fields.map((field: any) => ({
        value: field.id,
        label: field.label,
    }));
    const {getEdges, setEdges} = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();

    if (!Array.isArray(data.formFields)) {
        data.formFields = [];
    }

    const nodeID: string = data.id;

    const [formFields, setFormFields] = useState(data.formFields.map((field: any) => ({...field, id: field.id || uuidv4()})));





    useEffect(() => {
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
            const newFields = [...prevFields, {active: true, value: '', id: uuidv4()}];
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
        setFormFields((prevFields: any[]) => {
            if (newValue) {
                return prevFields.map((field: any) =>
                    field.id === id ? {...field, value: newValue.value} : field
                );
            }
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
                                            <SelectWithoutOverride
                                                onChange={(newValue: SingleValue<{
                                                    value: any;
                                                    label: any;
                                                }>) => onChangeFieldValue(field.id, newValue)}
                                                value={{value: field.value, label: field.value}}
                                                className={"w-[600px]"}
                                                isSearchable={true}
                                                options={fieldOptions}
                                                creatable={false}
                                            />
                                        </div>
                                </SortableItem>
                                ))}
                        </SortableContext>
                        <div
                            className="addButton block py-1 text-center w-full"
                            onClick={addField}
                        >
                            <PlusCircleIcon className="h-6 w-6 mx-auto"/>
                        </div>
                    </NodeSection>

                </DndContext>

            </NodeBody>
        </>
    );
}
