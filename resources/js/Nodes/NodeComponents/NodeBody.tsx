import './NodeBody.css';
export default function NodeBody({  children, className }: { children?: any, className?: string }) {
    return (

        <div className={"nodeBody bg-gray-400 text-gray-900 dark:bg-gray-400 dark:text-white" + className}>
            {children}
        </div>
    );
}
