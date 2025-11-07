import NodeHeading from "@/Views/Flows/Nodes/NodeComponents/NodeHeading";
import InputWithOverride from "@/Views/Flows/Nodes/NodeComponents/InputWithOverride";
import NodeBody from "@/Views/Flows/Nodes/NodeComponents/NodeBody";
import SelectWithoutOverride from "@/Views/Flows/Nodes/NodeComponents/SelectWithoutOverride";
import NodeOutputHandle from "@/Views/Flows/Nodes/NodeComponents/NodeOutputHandle";
import NodeSection from "@/Views/Flows/Nodes/NodeComponents/NodeSection";
import {SingleValue} from "react-select";


export default function ComparisonNode({data}: { data: any}) {
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


    const onChangeOperator = (newValue: SingleValue<{ value: any; label: any }>) => {
        if (newValue) {
            data.operator = newValue.value;
        }
    };




    return (
        <>
            <NodeBody>
                <NodeHeading onChange={(newHeading: string) => {
                    data.heading = newHeading;
                }}>
                    {data.heading || "Comparison"}
                </NodeHeading>


                <NodeSection className={"flex"}>
                    <div className="flex-1 text-right">
                    </div>
                    <NodeOutputHandle
                                      nodeID={nodeID}
                                      id={"boolean-value"}>
                    </NodeOutputHandle>
                </NodeSection>
                <NodeSection>


                <InputWithOverride value={data.leftComparand}
                                   onChange={leftComparandChange}
                                   handleID={"leftComparand-override"}
                                   nodeID={nodeID}
                                   className={"mb-7"}
                                   placeholder={"Value 1"}
                ></InputWithOverride>


                <SelectWithoutOverride
                   // value={data.operator}
                    value={{value: data.operator || "GET", label: data.operator || "GET"}}
                    onChange={onChangeOperator}
                    options={[
                        { value: "==", label: "Equal to" },
                        { value: ">", label: "Greater than" },
                        { value: "<", label: "Less than" },
                        { value: "!=", label: "Not equal to" },
                        { value: "regex", label: "Matches Regular expression" }

                    ]}


                    className={"mb-7"}
                 >
                </SelectWithoutOverride>
                <InputWithOverride value={data.rightComparand}
                                   onChange={rightComparandChange}
                                   handleID={"rightComparand-override"}
                                   nodeID={nodeID}
                                   placeholder={"Value 2"}

                ></InputWithOverride>
                </NodeSection>


            </NodeBody>
        </>

    );
}
