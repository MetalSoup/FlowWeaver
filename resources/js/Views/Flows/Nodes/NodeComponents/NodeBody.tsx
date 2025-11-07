import './NodeBody.css';
export default function NodeBody({  children, className = '' }: { children?: any, className?: string }) {
    return (

        <div className={"nodeBody " + (className ?? '')}>
            {children}
        </div>
    );
}
