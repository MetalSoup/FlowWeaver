<?php


namespace App\Http\Controllers;

use App\Http\Requests\FlowRequest;
use App\Http\Resources\FlowResource;
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

        if($sequence = json_decode($flow->sequence,true)){


        $edges = collect($sequence['edges']);
        $nodes = collect($sequence['nodes']);
        $start_node = $nodes->where('type','input');
        if($startNode){
            $start_node = $nodes->where('id',$startNode);
        }
        else
        {
            //find edge that starts on start node
            $start_edge = $edges->where('source',$start_node->first()['id']);


            $start_node = $nodes->where('id',$start_edge->first()['target']);
        }


        // run first node function
        $runFlow = new RunFlow($start_node,$edges,$nodes);
        //Flow::runNodeFunction($first_node,$edges,$nodes);
        }
        else {
            Log::info('No sequence found for flow: '.$flow->id);
        }




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
//dd($flow);
        //return new FlowResource($flow);
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
