import './NodeHeading.css';
import EditableText from "@/Views/Flows/Nodes/NodeComponents/EditableText";
export default function NodeHeading({children,className = '',onChange, icon}:{children:any, className?:string, onChange:(value:string) => void, icon?:any}) {

    return (
        <div className={`nodeHeading ` + (className ?? '')}>

            <h2 className={"flex flex-row gap-4 items-center"}>{icon} <EditableText value={children} onChange={onChange}/></h2>

        </div>
    );
}
