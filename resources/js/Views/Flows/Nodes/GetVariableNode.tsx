import NodeHeading from "@/Views/Flows/Nodes/NodeComponents/NodeHeading";
import NodeBody from "@/Views/Flows/Nodes/NodeComponents/NodeBody";
import SelectWithoutOverride from "@/Views/Flows/Nodes/NodeComponents/SelectWithoutOverride";
import NodeOutputHandle from "@/Views/Flows/Nodes/NodeComponents/NodeOutputHandle";
import NodeSection from "@/Views/Flows/Nodes/NodeComponents/NodeSection";
import { useStore } from "@xyflow/react";
import { usePage } from "@inertiajs/react";


export default function GetVariableNode({data}: { data: any}) {
    // get current node id to include in handle ids
    const nodeID: string = data.id;

    // system fields from server props
    const { fields }: any = usePage().props;

    // read all nodes from the react-flow store and collect any variable names set by SetVariable nodes
    const allNodes: any[] = useStore(store => store.nodes) ?? [];
    const setVarNodes = (Array.isArray(allNodes) ? allNodes : []).filter(n => n && (n.type === 'SetVariable' || n.type === 'Setvariable' || n.type === 'setvariable'));

    // Collect names (prefer variableLabel if set, otherwise variableName). Also capture field id if present.
    const collected: { value: string, label: string, fieldId?: any }[] = [];
    setVarNodes.forEach(n => {
        const vName = n.data?.variableName;
        if (!vName) return;
        const label = n.data?.variableLabel ?? vName;
        const fieldId = n.data?.variableFieldId ?? null;
        collected.push({ value: vName, label, fieldId });
    });

    // Deduplicate by value (keep first occurrence)
    const seen = new Set<string>();
    const variableOptions = collected.filter(item => {
        if (seen.has(item.value)) return false;
        seen.add(item.value);
        return true;
    }).map(item => ({ value: item.value, label: item.label }));

    // Build system field options and a map of value->fieldId for quick lookup
    const systemFieldOptions = (Array.isArray(fields) ? fields : []).map((f: any) => ({ value: f.name, label: f.label, fieldId: f.id }));
    const systemFieldMap = new Map<string, any>(systemFieldOptions.map((o: any) => [o.value, o.fieldId]));

    // When merging, prefer system field when duplicate names exist
    const groupedOptions: any[] = [];
    // Show custom variables first, then system fields
    if (variableOptions.length) {
        groupedOptions.push({ label: 'Custom variables', options: variableOptions });
    }
    if (systemFieldOptions.length) {
        groupedOptions.push({ label: 'System fields', options: systemFieldOptions.map((o: any) => ({ value: o.value, label: o.label })) });
    }

    const onVariableNameChange = (newValue: any) => {
        const val = newValue ? newValue.value : null;
        data.variableName = val;
        // If the selected value matches a system field, record its id, otherwise clear
        data.variableFieldId = val ? (systemFieldMap.get(val) ?? null) : null;
        // Also persist a label for display/consistency
        data.variableLabel = val ? (systemFieldMap.has(val) ? (systemFieldOptions.find((s: any) => s.value === val)?.label ?? val) : (variableOptions.find((v: any) => v.value === val)?.label ?? val)) : null;
    }


    return (
        <>
            <NodeBody>
                <NodeHeading onChange={(newHeading: string) => {
                    data.heading = newHeading;
                }}>
                    {data.heading || "Get Variable"}
                </NodeHeading>

                <NodeSection>

                    <div className="flex-1 text-right">
                    </div>
                    <NodeOutputHandle
                                      nodeID={nodeID}
                                      id={"value"}>
                    </NodeOutputHandle>

                </NodeSection>
                <NodeSection>

                <SelectWithoutOverride
                    value={
                        data.variableName == null
                            ? null
                            : (
                                // prefer system field match first
                                (systemFieldOptions.find((o: any) => o.value === data.variableName) ? { value: data.variableName, label: (systemFieldOptions.find((o: any) => o.value === data.variableName)?.label ?? data.variableName) } : (variableOptions.find((o: any) => o.value === data.variableName) ?? { value: data.variableName, label: data.variableName }))
                            )
                    }
                    onChange={onVariableNameChange}
                    isSearchable={true}
                    options={groupedOptions}
                    creatable={false}
                />
                 </NodeSection>


             </NodeBody>
         </>

    );
}
