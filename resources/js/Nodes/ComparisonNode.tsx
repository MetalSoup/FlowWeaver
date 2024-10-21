import NodeHeading from "@/Nodes/NodeComponents/NodeHeading";
import InputWithOverride from "@/Nodes/NodeComponents/InputWithOverride";
import NodeBody from "@/Nodes/NodeComponents/NodeBody";
import SelectWithoutOverride from "@/Nodes/NodeComponents/SelectWithoutOverride";
import NodeOutputHandle from "@/Nodes/NodeComponents/NodeOutputHandle";


export default function ComparisonNode({data, isConnectable}: { data: any, isConnectable: any }) {
    // get current node id to include in handle ids
    const nodeID: string = data.id;
    // Set undefined values to default values
    if (!data.operator) {
        data.operator = "==";
    }
    if (!data.leftComparand) {
        data.leftComparand = "";
    }
    if (!data.rightComparand) {
        data.rightComparand = "";
    }


    const leftComparandChange = (event: { target: { value: any; }; }) => {


        data.leftComparand = event.target.value;


    }

    const rightComparandChange = (event: { target: { value: any; }; }) => {


        data.rightComparand = event.target.value;


    }

    const onChangeOperator = (event: { target: { value: any; }; }) => {
        data.operator = event.target.value;
    }


    return (
        <>
            <NodeBody>

                <NodeHeading>
                    Comparison
                </NodeHeading>
                <div className={"flex min-w-48 pb-5"}>
                    <div className="flex-1 text-right">
                    </div>
                    <NodeOutputHandle isConnectable={isConnectable}
                                      nodeID={nodeID}
                                      id={"boolOutput"}>
                    </NodeOutputHandle>
                </div>


                <InputWithOverride value={data.leftComparand} isConnectable={isConnectable}
                                   onChange={leftComparandChange}
                                   handleID={"leftComparand-override"}
                                   nodeID={nodeID}
                ></InputWithOverride>


                <SelectWithoutOverride
                    value={data.operator}
                    onChange={onChangeOperator}
                    options={[
                        { value: "==", label: "Equal to" },
                        { value: ">", label: "Greater than" },
                        { value: "<", label: "Less than" },
                        { value: "!=", label: "Not equal to" },
                        { value: "regex", label: "Matches Regular expression" }

                    ]}
                 id={nodeID+`_operator`}>
                </SelectWithoutOverride>
                <InputWithOverride value={data.rightComparand} isConnectable={isConnectable}
                                   onChange={rightComparandChange}
                                   handleID={"rightComparand-override"}
                                   nodeID={nodeID}
                ></InputWithOverride>


            </NodeBody>
        </>

    );
}
