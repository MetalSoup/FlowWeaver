import NodeHeading from "@/Views/Flows/Nodes/NodeComponents/NodeHeading";
import InputWithOverride from "@/Views/Flows/Nodes/NodeComponents/InputWithOverride";
import NodeBody from "@/Views/Flows/Nodes/NodeComponents/NodeBody";
import SelectWithoutOverride from "@/Views/Flows/Nodes/NodeComponents/SelectWithoutOverride";
import NodeOutputHandle from "@/Views/Flows/Nodes/NodeComponents/NodeOutputHandle";
import NodeSection from "@/Views/Flows/Nodes/NodeComponents/NodeSection";
import {SingleValue} from "react-select";
import {
    EqualsIcon,
    GreaterThanIcon,
    GreaterThanOrEqualIcon,
    LessThanIcon,
    LessThanOrEqualIcon,
    NotEqualsIcon
} from "@phosphor-icons/react";
import {useEffect, useState} from "react";


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

    const [icon, setIcon] = useState(<EqualsIcon size={50}/>);

    const updateIcon = (operator: string) => {
        switch (operator) {
            case "==":
                setIcon(<EqualsIcon size={50}/>);
                break;
            case "!=":
                setIcon(<NotEqualsIcon size={50}/>); // Replace with NotEqualsIcon
                break;
            case ">":
                setIcon(<GreaterThanIcon size={50}/>); // Replace with GreaterThanIcon
                break;
            case "<":
                setIcon(<LessThanIcon size={50}/>); // Replace with LessThanIcon
                break;
            case ">=":
                setIcon(<GreaterThanOrEqualIcon size={50}/>); // Replace with GreaterThanOrEqualIcon
                break;
            case "<=":
                setIcon(<LessThanOrEqualIcon size={50}/>); // Replace with LessThanOrEqualIcon
                break;
            case "regex":
                setIcon(<EqualsIcon size={50}/>); // Replace with RegexMatchIcon
                break;
            default:
                setIcon(<EqualsIcon size={50}/>);
        }
    }

    useEffect(() => {
        updateIcon(data.operator ?? "==");
    }, [data.operator]);


    const onChangeOperator = (newValue: SingleValue<{ value: any; label: any }>) => {
        if (newValue) {
            data.operator = newValue.value;
            updateIcon(newValue.value);
        }
    };







    return (
        <>
            <NodeBody>
                <NodeHeading icon={icon} onChange={(newHeading: string) => {
                    data.heading = newHeading;
                }}>
                    {data.heading || "Comparison"}
                </NodeHeading>


                <NodeSection className={"flex"}>
                    <div className="flex-1 text-right">
                    </div>
                    <NodeOutputHandle
                                      nodeID={nodeID}
                                      id={"boolean-value"}
                                      dataType={"boolean"}
                    >

                    </NodeOutputHandle>
                </NodeSection>
                <NodeSection>


                <InputWithOverride value={data.leftComparand}
                                   onChange={leftComparandChange}
                                   handleID={"leftComparand-override"}
                                   nodeID={nodeID}
                                   className={"mb-7"}
                                   placeholder={"Value 1"}
                                   dataType={"text"}
                ></InputWithOverride>


                <SelectWithoutOverride
                   // value={data.operator}
                    value={{value: data.operator || "GET", label: data.operator || "GET"}}
                    onChange={onChangeOperator}
                    options={[
                        { value: "==", label: "Equal to" },
                        { value: ">", label: "Greater than" },
                        { value: ">=", label: "Greater than or equal" },
                        { value: "<", label: "Less than" },
                        { value: "<=", label: "Less than or equal" },
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
                                   dataType={"text"}


                ></InputWithOverride>
                </NodeSection>


            </NodeBody>
        </>

    );
}
