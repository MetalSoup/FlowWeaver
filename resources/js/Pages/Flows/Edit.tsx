import DashboardLayout from '@/Layouts/DashboardLayout';
import {Head, router} from '@inertiajs/react';
import {SingleFlowProps} from "@/types";
import {
    addEdge,
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    Panel,
    ReactFlow,
    ReactFlowInstance,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
    OnInit
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {SetStateAction, useCallback, useState} from "react";
import FlowSideBar from "@/Pages/Flows/FlowSideBar";
import WebhookNode from "@/Nodes/WebhookNode";
import ComparisonNode from "@/Nodes/ComparisonNode";
import BranchNode from "@/Nodes/BranchNode";
import SetVariableNode from "@/Nodes/SetVariableNode";
import GetVariableNode from "@/Nodes/GetVariableNode";
import RawHtmlNode from "@/Nodes/RawHtmlNode";
import EditableText from "@/Nodes/NodeComponents/EditableText";


const nodeTypes = {
    WebHook: WebhookNode,
    Comparison: ComparisonNode,
    Branch: BranchNode,
    SetVariable: SetVariableNode,
    GetVariable: GetVariableNode,
    RawHtml: RawHtmlNode


};


function FlowEditor({auth, flow}: SingleFlowProps) {


    const sequence = flow.data.sequence;
    const initialFlow = JSON.parse(sequence) ? JSON.parse(sequence) : {};


    // check if the flow nodes is defined otherwise set it to an empty array
    initialFlow.nodes = initialFlow.nodes ? initialFlow.nodes : [];
    const initialNodes = [...initialFlow.nodes];

    initialFlow.edges = initialFlow.edges ? initialFlow.edges : [];
    const initialEdges = [...initialFlow.edges];


    //Generate a unique id for the node including node type and random string
    const getId = (node_type: string) => `${node_type.toLowerCase()}_${Math.random().toString(36).substring(2, 9)}`;

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const {screenToFlowPosition} = useReactFlow();
    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: any) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: any) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const nodeID = getId(type);

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: nodeID,
                type,
                position,
                data: {label: `${type} node`, id: nodeID},
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition],
    );
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance<any, any> | null>(null);
    const onSave = useCallback(() => {

        if (rfInstance) {

            const thisFlow = rfInstance.toObject();
            let sequence = JSON.stringify(thisFlow);
            // use FlowController update to save the sequence
            router.put(route('flows.update', flow.data.id), {name: flow.data.name, sequence: sequence});


        }
    }, [rfInstance]);


    const handleInit: OnInit<any, any> = (instance: ReactFlowInstance<any, any>) => {
        setRfInstance(instance);
    };


    const defaultViewport = initialFlow.viewport ? initialFlow.viewport : {x: 0, y: 0, zoom: 1};

    const [flowName, setFlowName] = useState(flow.data.name);
    const onChangeName = (event: { target: { value: SetStateAction<string>; }; }) => {
        setFlowName(event.target.value ? event.target.value : "Untitled Flow");
        flow.data.name = flowName;

    }

    return (
        <DashboardLayout
            user={auth.user}
            /*header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Flow - {flow.data.name}</h2>}*/
        >
            <Head title={"Edit Flow - " + flow.data.name}/>
            <div className={"flex flex-col md:flex-row h-full"}>

                <div className={"w-full h-full bg-gray-100 dark:bg-gray-800"}>


                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        onInit={handleInit}
                        deleteKeyCode={['Backspace', 'Delete']}
                        minZoom={0.1}
                        defaultViewport={defaultViewport}
                        snapToGrid={true}
                        snapGrid={[20,20]}





                    >

                        <Panel position="top-right">
                            <button className={"dark:text-white"} onClick={onSave}>save</button>
                            {/*<button onClick={onRestore}>restore</button>
                            <button onClick={onAdd}>add node</button>*/}
                        </Panel>
                        <Panel position="top-left">
                            <EditableText value={flow.data.name} onChange={onChangeName} textClassName={"text-2xl font-bold text-white"}/>
                            <FlowSideBar
                                className={"relative bg-sidebar p-3 w-64 sm:block shadow-xl dark:bg-gray-800/80"}/>
                        </Panel>

                        <Background variant={BackgroundVariant.Lines} color={"rgba(255,255,255,0.1)"} gap={20} size={1}/>
                        <Controls/>
                        <MiniMap zoomable pannable/>
                    </ReactFlow>


                </div>
            </div>

        </DashboardLayout>
    );
}


export default ({auth, flow}: SingleFlowProps) => (
    <ReactFlowProvider>
        <FlowEditor auth={auth} flow={flow}/>
    </ReactFlowProvider>
)
