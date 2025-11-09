export function LegendPanel() {
    return (
        <div>
            <h3>Legend</h3>
            {/*list of datatypes and their colors*/}
            <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-500"></div>
                    <span className="text-sm text-white">any</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500"></div>
                    <span className="text-sm text-white">text</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500"></div>
                    <span className="text-sm text-white">number</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500"></div>
                    <span className="text-sm text-white">boolean</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500"></div>
                    <span className="text-sm text-white">object</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500"></div>
                    <span className="text-sm text-white">array</span>
                </div>
            </div>
        </div>
    );
}
