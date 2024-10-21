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

        return inertia('Flows/Index', [
            'flows' => FlowResource::collection(Flow::all()),
        ]);
    }

    public function create()
    {
        return inertia('Flows/Create');
    }

    public function store(FlowRequest $request)
    {
        $flow = new FlowResource(Flow::create($request->validated()));
        return inertia('Flows/Edit', [
            'flow' => new FlowResource($flow),
        ]);
    }

    public function show(Flow $flow)
    {

        if($sequence = json_decode($flow->sequence,true)){


        $edges = collect($sequence['edges']);
        $nodes = collect($sequence['nodes']);
        $start_node = $nodes->where('type','input');

        //find edge that starts on start node
        $start_edge = $edges->where('source',$start_node->first()['id']);


        $first_node = $nodes->where('id',$start_edge->first()['target']);
        // run first node function
        $runFlow = new RunFlow($first_node,$edges,$nodes);
        //Flow::runNodeFunction($first_node,$edges,$nodes);
        }
        else {
            Log::info('No sequence found for flow: '.$flow->id);
        }




    }

    public function edit(Flow $flow)
    {

        return inertia('Flows/Edit', [
            'flow' => new FlowResource($flow),
        ]);
    }

    public function update(FlowRequest $request, Flow $flow)
    {


        $flow->update($request->validated());
//dd($flow);
        //return new FlowResource($flow);
    }

    public function destroy(Flow $flow)
    {
        $flow->delete();

        return response()->json();
    }
}
