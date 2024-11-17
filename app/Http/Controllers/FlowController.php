<?php


namespace App\Http\Controllers;

use App\Http\Requests\FlowRequest;
use App\Http\Resources\FlowResource;
use App\Models\Field;
use App\Models\Flow;
use App\RunFlow;
use Illuminate\Support\Facades\Log;

class FlowController extends Controller
{




    public function index()
    {
        $selectedInstanceId = session('selected_instance');
        $flows = Flow::where('instance_id', $selectedInstanceId)->get();

        return inertia('Flows/Index', [
            'flows' => FlowResource::collection($flows),
        ]);
    }

    public function create()
    {
        $selectedInstanceId = session('selected_instance');
        return inertia('Flows/Edit', [
            'flow' => new FlowResource(new Flow(['instance_id' => $selectedInstanceId])),
        ]);
    }

    public function store(FlowRequest $request)
    {


        $selectedInstanceId = session('selected_instance');
        $data = $request->validated();
        $data['instance_id'] = $selectedInstanceId;

        $flow = Flow::create($data);

        return redirect()->route('flows.edit', $flow->id);
    }

    public function show(Flow $flow, $startNode = null)
    {
        //dd($flow->sequence);
        return inertia('Flows/Show', [
            'flow' => new FlowResource($flow),
        ]);

       /* if($sequence = $flow->sequence){

            //dump($sequence);


        $edges = $sequence['edges'];
        $edges = collect($edges);

        $nodes = collect($sequence['nodes']);
        $start_node = $nodes->where('type','Entry');
            //dump($start_node);
        if($startNode){
            $start_node = $nodes->where('id',$startNode);
        }
        else
        {
            //find edge that starts on start node
            //dump($start_node->first());
            $start_edge = $edges->where('source',$start_node->first()['id']);

            //dump($start_edge->first());
            $start_node = $nodes->where('id',$start_edge->first()['target']);
        }


        // run first node function
        $runFlow = new RunFlow($start_node,$edges,$nodes);
        //Flow::runNodeFunction($first_node,$edges,$nodes);
        }
        else {
            Log::info('No sequence found for flow: '.$flow->id);
        }*/






    }

    public function edit(Flow $flow)
    {

        $selectedInstanceId = session('selected_instance');
        if($flow->instance_id != $selectedInstanceId){
            abort(403);
        }

        return inertia('Flows/Edit', [
            'flow' => new FlowResource($flow),
        ]);
    }


    public function update(FlowRequest $request, Flow $flow)
    {
        $selectedInstanceId = session('selected_instance');
        if($flow->instance_id != $selectedInstanceId){
            abort(403);
        }

        $flow->update($request->validated());

    }

    public function destroy(Flow $flow)
    {
        $selectedInstanceId = session('selected_instance');
        if($flow->instance_id != $selectedInstanceId){
            abort(403);
        }
        $flow->delete();

        return response()->json();
    }
}
