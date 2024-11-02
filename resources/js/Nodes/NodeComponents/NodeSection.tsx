import "./NodeSection.css";
export default function NodeSection({children, className}: {
    children?: any
    className?: string
}) {
    return (
        <div className={"nodeSection min-w-48 " + className}>
            {children}
        </div>
    )

}
