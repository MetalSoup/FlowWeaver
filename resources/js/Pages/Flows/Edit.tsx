import DashboardLayout from '@/Layouts/DashboardLayout';
import {Head, router} from '@inertiajs/react';
import {
    addEdge,
    Background,
    BackgroundVariant,
    Controls,
    Panel,
    ReactFlow,
    ReactFlowInstance,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
    OnInit,
    Connection,
    IsValidConnection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {useCallback, useState} from "react";
import FlowSideBar from "@/Pages/Flows/FlowSideBar";
import WebhookNode from "@/Nodes/WebhookNode";
import ComparisonNode from "@/Nodes/ComparisonNode";
import BranchNode from "@/Nodes/BranchNode";
import SetVariableNode from "@/Nodes/SetVariableNode";
import GetVariableNode from "@/Nodes/GetVariableNode";
import RawHtmlNode from "@/Nodes/RawHtmlNode";
import EditableText from "@/Nodes/NodeComponents/EditableText";
import FormNode from "@/Nodes/FormNode";
import EntryNode from "@/Nodes/EntryNode";


const nodeTypes = {
    WebHook: WebhookNode,
    Comparison: ComparisonNode,
    Branch: BranchNode,
    SetVariable: SetVariableNode,
    GetVariable: GetVariableNode,
    RawHtml: RawHtmlNode,
    Form: FormNode,
    Entry: EntryNode


};


function FlowEditor({auth, flow}: { auth: any, flow: any }) {

    const sequence = flow.data.sequence;
    //load the Entry node if the flow is empty
    const initialFlow: any = sequence ? sequence : {nodes: [{"id": "entry_1", "type": "Entry", "data": {"id": "entry", "label": "Starting point node"}, "position": {"x": 250, "y": 100}, "selected": false, "deletable": false}], edges: []};


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

            //if it's a new flow, create it, otherwise update it

            if (!flow.data.id) {
                router.post(route('flows.store'), {name: flowName, sequence: thisFlow});
            } else {
                router.put(route('flows.update', flow.data.id), {name: flow.data.name, sequence: thisFlow});
            }


        }
    }, [rfInstance]);


    const handleInit: OnInit<any, any> = (instance: ReactFlowInstance<any, any>) => {
        setRfInstance(instance);
    };


    const defaultViewport = initialFlow.viewport ? initialFlow.viewport : {x: 0, y: 0, zoom: 1};

    const [flowName, setFlowName] = useState(flow.data.name ? flow.data.name : "Untitled Flow");
    const onChangeName = (newName:any) => {
        //let newFlowName = event.target.value ? event.target.value : "Untitled Flow";
        setFlowName(newName);
        flow.data.name = newName;

    }

    // @ts-ignore
    const isValidConnection: IsValidConnection = (connection: Connection) => {
        //console.log(connection)
        if (connection.targetHandle?.includes('previous'))
        {
            return connection.sourceHandle?.toLowerCase().includes('next') || false;
        }
        else if (connection.targetHandle?.includes('override'))
        {
            return connection.sourceHandle?.includes('value') || false;
        }

        return false;

    }

    return (
        <DashboardLayout
            user={auth.user}
            /*header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Flow - {flow.data.name}</h2>}*/
        >
            <Head title={"Edit Flow - " + flow.data.name}/>
            <div className={"flex flex-col md:flex-row h-full"}>

                <div className={"w-full h-full "} style={{'background':'#141a2f'}}>


                    <ReactFlow
                        nodes={nodes}
                        isValidConnection={isValidConnection}
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
                        snapGrid={[20, 20]}


                    >

                        <Panel position="top-right">
                            <button className={"dark:text-white"} onClick={onSave}>save</button>
                            {/*<button onClick={onRestore}>restore</button>
                            <button onClick={onAdd}>add node</button>*/}
                        </Panel>
                        <Panel position="top-left">

                            <FlowSideBar
                                className={"relative bg-sidebar p-3 sm:block shadow-xl dark:bg-gray-600/80"}/>
                        </Panel>
                        <Panel position={"top-center"}>
                            <EditableText value={flowName} onChange={onChangeName}
                                          textClassName={"text-2xl font-bold text-white"}/>
                        </Panel>
                        <Background variant={BackgroundVariant.Lines} color={"rgba(0,0,0,0.3)"} gap={20}
                                    size={1}/>
                        <Controls/>
                        {/*<MiniMap zoomable pannable/>*/}
                    </ReactFlow>


                </div>
            </div>

        </DashboardLayout>
    );
}


export default ({auth, flow}: { auth: any, flow: any }) => (
    <ReactFlowProvider>
        <FlowEditor auth={auth} flow={flow}/>
    </ReactFlowProvider>
)
