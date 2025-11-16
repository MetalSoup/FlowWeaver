import DashboardLayout from '@/Layouts/DashboardLayout';
import {Head, router} from '@inertiajs/react';
import {
    addEdge,
    Background, BackgroundVariant,
    Controls,
    MiniMap, Panel,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState, useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {useCallback, useState, useEffect} from "react";
import FlowSideBar from "@/Views/Flows/FlowSideBar";


function FlowEditor({ auth, selected_site } : { auth: any, selected_site?: number | null }) {

    // If there's no selected site, send the user to select one.
    useEffect(() => {
        if (!selected_site) {
            router.get(route('sites.select'));
        }
    }, [selected_site]);

   // console.log(initialFlow);


    const initialNodes = [

        { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
        { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
    ];
    const initialNodeCount = initialNodes.length;
    const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }

    ];

    let id = initialNodeCount;
    const getId = () => `dnd_node_${id++}`;

    /*    const initialViewport= [
    ...initialFlow.viewport
    ]*/


    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { screenToFlowPosition } = useReactFlow();
    const onConnect = useCallback(
        (params:any) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: any) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event:any) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            // project was renamed to screenToFlowPosition
            // and you don't need to subtract the reactFlowBounds.left/top anymore
            // details: https://reactflow.dev/whats-new/2023-11-10
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            const newNode = {
                id: getId(),
                type,
                position,
                data: { label: `${type} node` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition],
    );
    const [rfSite, setRfSite] = useState<any | null>(null);
    const onSave = useCallback(() => {

        if (rfSite) {
            // @ts-ignore
            const thisFlow = rfSite.toObject();
            let sequence = JSON.stringify(thisFlow);

            // use FlowController update to save the sequence; attach selected site
            // If no site is selected, redirect to selection instead of posting a null site
            if (!selected_site) {
                router.get(route('sites.select'));
                return;
            }

            router.post(route('flows.store'), {name: "new_flow", sequence: sequence, site_id: selected_site});



        }
    }, [rfSite]);

    // initialize react-flow site into state (typed any to avoid TS mismatch with setState signature)
    const handleInit = (site: any) => {
        setRfSite(site);
    };


    // @ts-ignore
    return (
        <DashboardLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Create new flow</h2>}
        >
            <Head title={"New Flow"} />
            <div className={"flex flex-col md:flex-row h-full"}>
            <FlowSideBar className={"relative bg-sidebar h-screen w-64 hidden sm:block shadow-xl dark:bg-gray-200"} />
            <div className={"w-full h-full"}>



                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onInit={handleInit}
                        fitView

                    >
                        <Panel position="top-right">
                                <button onClick={onSave}>save</button>
                                {/*
                                    <button onClick={onRestore}>restore</button>
                                    <button onClick={onAdd}>add node</button>
                                */}
                            </Panel>

                        <Background variant={BackgroundVariant.Lines} gap={12} size={1} />
                        <Controls />
                        <MiniMap zoomable pannable />
                    </ReactFlow>







            </div>
            </div>

        </DashboardLayout>
    );
}


export default ({ auth, selected_site } : { auth: any, selected_site?: number | null }) => (
    <ReactFlowProvider>
        <FlowEditor auth={auth} selected_site={selected_site} />
    </ReactFlowProvider>
)
