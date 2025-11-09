import DashboardLayout from '@/Layouts/DashboardLayout';
import {Head, router} from '@inertiajs/react';
import {useEffect, useCallback, useState, useRef} from 'react';
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
import FlowSideBar from "@/Views/Flows/FlowSideBar";
import WebhookNode from "@/Views/Flows/Nodes/WebhookNode";
import ComparisonNode from "@/Views/Flows/Nodes/ComparisonNode";
import BranchNode from "@/Views/Flows/Nodes/BranchNode";
import SetVariableNode from "@/Views/Flows/Nodes/SetVariableNode";
import GetVariableNode from "@/Views/Flows/Nodes/GetVariableNode";
import RawHtmlNode from "@/Views/Flows/Nodes/RawHtmlNode";
import EditableText from "@/Views/Flows/Nodes/NodeComponents/EditableText";
import FormNode from "@/Views/Flows/Nodes/FormNode";
import EntryNode from "@/Views/Flows/Nodes/EntryNode";
import {LegendPanel} from "@/Views/Flows/Nodes/EditorComponents/LegendPanel";
import PrimaryButton from "@/Components/PrimaryButton";


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


function FlowEditor({auth, flow, selected_instance}: { auth: any, flow: any, selected_instance?: number | null }) {

    // If there's no selected instance in the session/shared props, send the user to select one.
    useEffect(() => {
        if (!selected_instance) {
            // navigate to instance selection page
            router.get(route('instances.select'));
        }
    }, [selected_instance]);

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
    // toast state + timer ref (shows Saved/Copied/Pasted/etc.)
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const toastTimerRef = useRef<number | null>(null);
    const showToast = useCallback((msg: string, duration = 1500) => {
        setToastMsg(msg);
        if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = window.setTimeout(() => setToastMsg(null), duration);
    }, []);
    // cleanup toast timer
    useEffect(() => () => { if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current); }, []);
     const [flowName, setFlowName] = useState(flow.data.name ? flow.data.name : "Untitled Flow");
     const onChangeName = (newName:any) => {
         setFlowName(newName);
         flow.data.name = newName;

     }
    // Copy/paste clipboard (stores nodes+edges of last copy). Persist to localStorage and OS clipboard when possible.
    const clipboardRef = useRef<{nodes: any[]; edges: any[], createdAt?: number} | null>(null);
    const pasteCountRef = useRef(0);
    // last screen mouse position for paste-at-mouse
    const lastMouseScreenRef = useRef<{x: number; y: number} | null>(null);

    // history for undo/redo (simple stack of snapshots)
    const historyRef = useRef<{nodes: any[]; edges: any[]}[]>([]);
    const historyIndexRef = useRef(-1);
    const pushHistory = useCallback((snap?: {nodes:any[]; edges:any[]}) => {
        const snapshot = snap ? snap : {nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges))};
        // truncate any redo history
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        historyRef.current.push(snapshot);
        historyIndexRef.current = historyRef.current.length - 1;
    }, [nodes, edges]);

    const undo = useCallback(() => {
        if (historyIndexRef.current <= 0) return;
        historyIndexRef.current -= 1;
        const snap = historyRef.current[historyIndexRef.current];
        setNodes(JSON.parse(JSON.stringify(snap.nodes)));
        setEdges(JSON.parse(JSON.stringify(snap.edges)));
        showToast('Undo', 900);
    }, [setNodes, setEdges, showToast]);

    const redo = useCallback(() => {
        if (historyIndexRef.current >= historyRef.current.length - 1) return;
        historyIndexRef.current += 1;
        const snap = historyRef.current[historyIndexRef.current];
        setNodes(JSON.parse(JSON.stringify(snap.nodes)));
        setEdges(JSON.parse(JSON.stringify(snap.edges)));
        showToast('Redo', 900);
    }, [setNodes, setEdges, showToast]);

    // listen for mouse movements to capture last screen position
    useEffect(() => {
        const m = (ev: MouseEvent) => { lastMouseScreenRef.current = {x: ev.clientX, y: ev.clientY}; };
        window.addEventListener('mousemove', m);
        return () => window.removeEventListener('mousemove', m);
    }, []);

    // load clipboard from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem('flow_clipboard');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.nodes) clipboardRef.current = parsed;
            }
        } catch (err) {
            // ignore
        }
        // push initial history snapshot
        pushHistory({nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges))});
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const copySelection = useCallback(async () => {
        const selectedNodes = nodes.filter(n => n.selected);
        if (!selectedNodes.length) return;
        const selectedIds = new Set(selectedNodes.map(n => n.id));
        const relatedEdges = edges.filter(e => selectedIds.has(e.source) && selectedIds.has(e.target));
        const payload = {nodes: selectedNodes.map(n => JSON.parse(JSON.stringify(n))), edges: relatedEdges.map(e => JSON.parse(JSON.stringify(e))), createdAt: Date.now()};
        clipboardRef.current = payload;
        pasteCountRef.current = 0;
        // persist to localStorage
        try { localStorage.setItem('flow_clipboard', JSON.stringify(payload)); } catch (err) {}
        // try to write to OS clipboard (best-effort)
        try { await navigator.clipboard.writeText(JSON.stringify(payload)); } catch (err) {}
        showToast('Copied', 800);
    }, [nodes, edges, showToast]);

    const pasteClipboard = useCallback((opts?: {pasteAtMouse?: boolean, autoSelect?: boolean}) => {
        if (!clipboardRef.current) return;
        const {nodes: copiedNodes, edges: copiedEdges} = clipboardRef.current;
        pasteCountRef.current += 1;
        const offset = 20 * pasteCountRef.current;
        const idMap = new Map<string, string>();

        // compute base offset if pasting at mouse
        let basePos: {x:number,y:number} | null = null;
        if (opts?.pasteAtMouse && lastMouseScreenRef.current) {
            try {
                basePos = screenToFlowPosition({x: lastMouseScreenRef.current.x, y: lastMouseScreenRef.current.y});
            } catch (e) {
                basePos = null;
            }
        }

        // if we have basePos, compute centroid of copied nodes to center them at mouse
        let centroid = {x:0,y:0};
        if (basePos) {
            const count = copiedNodes.length || 1;
            centroid = copiedNodes.reduce((acc, n) => ({x: acc.x + (n.position?.x || 0), y: acc.y + (n.position?.y || 0)}), {x:0,y:0});
            centroid.x /= count; centroid.y /= count;
        }

        const newNodes = copiedNodes.map((n) => {
            const newId = getId(n.type || 'node');
            idMap.set(n.id, newId);
            const dataClone = JSON.parse(JSON.stringify(n.data || {}));
            if (dataClone && typeof dataClone === 'object') dataClone.id = newId;
            let newPos = {x: (n.position?.x || 0) + offset + 10, y: (n.position?.y || 0) + offset + 10};
            if (basePos) {
                newPos = {x: basePos.x + ((n.position?.x || 0) - centroid.x) + 10, y: basePos.y + ((n.position?.y || 0) - centroid.y) + 10};
            }
            return {
                ...n,
                id: newId,
                position: newPos,
                selected: !!opts?.autoSelect,
                data: dataClone,
            };
        });

        const newEdges = copiedEdges.map((e) => {
            const newSource = idMap.get(e.source) || e.source;
            const newTarget = idMap.get(e.target) || e.target;
            return {
                ...e,
                id: getId('edge'),
                source: newSource,
                target: newTarget,
            };
        });

        // push history before change so undo can restore
        pushHistory();

        setNodes((nds) => nds.concat(newNodes));
        setEdges((eds) => eds.concat(newEdges));

        // flash/select behavior
        if (opts?.autoSelect) {
            // unselect after a short timeout so user sees the pasted selection
            window.setTimeout(() => {
                setNodes((nds) => nds.map(n => ({...n, selected: false})));
            }, 700);
        }

        showToast('Pasted', 1000);
    }, [setNodes, setEdges, pushHistory, screenToFlowPosition, showToast]);

    // keyboard listeners: copy/paste, undo/redo, delete snapshot capture. Avoid when focused in input/textarea/contenteditable
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const activeEl = document.activeElement as HTMLElement | null;
            const activeTag = activeEl ? (activeEl.tagName || '').toLowerCase() : '';
            const isEditable = !!activeEl && (activeEl.isContentEditable || activeTag === 'input' || activeTag === 'textarea' || activeEl.getAttribute('role') === 'textbox');
            const isMod = e.ctrlKey || e.metaKey;
            if (isEditable && !((e.key || '').toLowerCase() === 'z' && isMod)) {
                // allow normal copy/paste/typing in inputs except allow global undo
                return;
            }

            // Ctrl/Cmd + C
            if (isMod && e.key.toLowerCase() === 'c') {
                e.preventDefault();
                copySelection();
                return;
            }

            // Ctrl/Cmd + V
            if (isMod && e.key.toLowerCase() === 'v') {
                e.preventDefault();
                pasteClipboard({pasteAtMouse: true, autoSelect: true});
                return;
            }

            // Ctrl/Cmd + Z -> undo
            if (isMod && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                undo();
                return;
            }

            // Ctrl/Cmd + Y -> redo
            if (isMod && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo();
                return;
            }

            // Delete / Backspace -> capture snapshot before deletion if there are selected nodes
            if ((e.key === 'Delete' || e.key === 'Backspace')) {
                const selectedNodes = nodes.filter(n => n.selected);
                if (selectedNodes.length) {
                    pushHistory();
                }
                return; // allow deletion to proceed
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [copySelection, pasteClipboard, undo, redo, nodes, pushHistory]);

    const onSave = useCallback(() => {
        if (!rfInstance) return;
        const thisFlow = rfInstance.toObject();
        // if it's a new flow, create it, otherwise update it
        if (!flow.data.id) {
            router.post(route('flows.store'), {name: flowName, sequence: thisFlow, instance_id: selected_instance}, {
                onSuccess: () => {
                    showToast('Saved', 3000);
                }
            });
        } else {
            router.put(route('flows.update', flow.data.id), {name: flow.data.name, sequence: thisFlow, instance_id: selected_instance}, {
                onSuccess: () => {
                    showToast('Saved', 3000);
                }
            });
        }
    }, [rfInstance, flow, flowName, selected_instance, showToast]);

    const handleInit: OnInit<any, any> = (instance: ReactFlowInstance<any, any>) => {
        setRfInstance(instance);
    };


    const defaultViewport = initialFlow.viewport ? initialFlow.viewport : {x: 0, y: 0, zoom: 1};


    // helper to parse a handle id like "value::boolean" into {base, type}
    const parseHandle = (handle?: string) => {
        if (!handle) return { base: undefined as string | undefined, type: undefined as string | undefined };
        const parts = handle.split('::');
        if (parts.length === 1) return { base: parts[0], type: undefined };
        const type = parts.slice(1).join('::'); // in case `::` appears in base for any reason
        return { base: parts[0], type };
    };

    // simple compatibility map. "any" is compatible with everything. Add more rules here later.
    const areTypesCompatible = (sourceType?: string, targetType?: string) => {
        if (!sourceType || !targetType) return false;
        if (sourceType === targetType) return true;
        if (sourceType === 'any' || targetType === 'any') return true;
        // allow text <- number implicitly by converting number to text (optional)
        if ((sourceType === 'number' && targetType === 'text') || (sourceType === 'text' && targetType === 'number')) return false;
        return false;
    };

    // @ts-ignore
    const isValidConnection: IsValidConnection = (connection: Connection) => {
        // preserve existing special-case behavior but enforce types for override
        if (connection.targetHandle?.includes('previous')) {
            return connection.sourceHandle?.toLowerCase().includes('next') || false;
        } else if (connection.targetHandle?.includes('override')) {
            // must come from a 'value' source
            if (!connection.sourceHandle?.includes('value')) return false;
            // parse types from source/target handles using the ::delimiter
            const src = parseHandle(connection.sourceHandle);
            const tgt = parseHandle(connection.targetHandle);
            // if either side declares a type, require compatibility
            if (src.type || tgt.type) {
                return areTypesCompatible(src.type, tgt.type);
            }
            // otherwise allow override (legacy fallback)
            return true;
        }

        // parse types from source/target handles using the ::delimiter
        const src = parseHandle(connection.sourceHandle);
        const tgt = parseHandle(connection.targetHandle);

        // if either handle has a declared type, require both to have types and be compatible
        if (src.type || tgt.type) {
            return areTypesCompatible(src.type, tgt.type);
        }

        // default: disallow (keeps previous behavior where only explicit named handles are allowed)
        return false;

    }

    return (
        <DashboardLayout
            user={auth.user}
            /*header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Flow - {flow.data.name}</h2>}*/
            containerClassName={"h-screen"}
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

                        {/* Saved toast */}
                        {toastMsg && (
                            <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg">
                                {toastMsg}
                            </div>
                        )}

                        <Panel position="top-right" >
                            <PrimaryButton onClick={onSave}>Save</PrimaryButton>
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
                        <Panel position="bottom-right">
                            <LegendPanel />
                        </Panel>
                        <Background variant={BackgroundVariant.Lines} color={"rgba(0,0,0,0.3)"} gap={20}
                                    size={1}/>
                        <Controls className={"text-black"}/>
                        {/*<MiniMap zoomable pannable/>*/}
                    </ReactFlow>


                </div>
            </div>

        </DashboardLayout>
    );
}


export default ({auth, flow, selected_instance}: { auth: any, flow: any, selected_instance?: number | null }) => (
    <ReactFlowProvider>
        <FlowEditor auth={auth} flow={flow} selected_instance={selected_instance} />
    </ReactFlowProvider>
)
