export default function NodeHeading({children,className}:{children:any, className?:string}) {

    return (
        <div className={`relative bg-gray-300 dark:bg-gray-500 dark:text-white p-2 mb-1 rounded rounded-l ` + className}>

            <h2>{children}</h2>

        </div>
    );
}
