import './NodeSectionContent.css';
export default function NodeSectionContent({children,className}:{children:any, className?:string}) {

    return (
        <div className={`nodeSectionContent ` + className}>

            {children}

        </div>
    );
}
