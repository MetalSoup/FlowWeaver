import './NodeHeading.css';
import EditableText from "@/Views/Flows/Nodes/NodeComponents/EditableText";
export default function NodeHeading({children,className = '',onChange}:{children:any, className?:string, onChange:(value:string) => void}) {

    return (
        <div className={`nodeHeading ` + (className ?? '')}>

            <h2><EditableText value={children} onChange={onChange}/></h2>

        </div>
    );
}
