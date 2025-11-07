import NodeHeading from "@/Views/Flows/Nodes/NodeComponents/NodeHeading";
import InputWithOverride from "@/Views/Flows/Nodes/NodeComponents/InputWithOverride";
import NodeStartHandle from "@/Views/Flows/Nodes/NodeComponents/NodeStartHandle";
import NodeBody from "@/Views/Flows/Nodes/NodeComponents/NodeBody";
import SelectWithOverride from "@/Views/Flows/Nodes/NodeComponents/SelectWithOverride";
import NodeEndHandle from '@/Views/Flows/Nodes/NodeComponents/NodeEndHandle';
import NodeSection from "@/Views/Flows/Nodes/NodeComponents/NodeSection";
import {usePage} from "@inertiajs/react";


export default function SetVariableNode({data}: { data: any }) {
    const {fields}: any = usePage().props;
    // get current node id to include in handle ids
    const nodeID: string = data.id;


    // build select options from fields (use field.name as value, field.label as label)
    const fieldOptions = (Array.isArray(fields) ? fields : []).map((field: any) => ({
        value: field.name,
        label: field.label,
    }));

    // select change handler (react-select SingleValue)
    const onVariableNameChange = (newValue: any) => {
        const selectedName = newValue ? newValue.value : null;
        const matched = (Array.isArray(fields) ? fields : []).find((f: any) => f.name === selectedName || f.id === selectedName);
        data.variableName = selectedName;
        data.variableLabel = matched?.label ?? selectedName;
        data.variableFieldId = matched?.id ?? null;
    }

    const onVariableValueChange = (event: { target: { value: any; }; }) => {
        data.variableValue = event.target.value;
    }


    return (
        <>
            <NodeBody>

                <NodeHeading onChange={(newHeading: string) => {
                    data.heading = newHeading;
                }}>
                    {data.heading || "Set Variable"}
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
                            nodeID={nodeID}/>

                    </div>

                </NodeSection>
                <NodeSection>


                    {/* Variable name select (choose from existing fields). Allows override/connection. */}
                    <SelectWithOverride
                        value={
                            data.variableName == null
                                ? null
                                : (fieldOptions.find((o: any) => o.value === data.variableName) ?? {value: data.variableName, label: data.variableName})
                        }
                        onChange={onVariableNameChange}
                        handleID={"variableName-override"}
                        nodeID={nodeID}
                        className={"mb-7 nodrag text-gray-700"}
                        isSearchable={true}
                        options={fieldOptions}
                        creatable={true}
                    />


                    <InputWithOverride
                        value={data.variableValue}
                        onConnect={(params: any) => console.log('handle onConnect', params)}
                        onChange={onVariableValueChange}
                        handleID={"variableValue-override"}
                        nodeID={nodeID}
                    />
                </NodeSection>


            </NodeBody>
        </>

    );
}
