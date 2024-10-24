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

        if($sequence = $flow->sequence){

            dump($sequence);


        $edges = $sequence['edges'];
        $edges = collect($edges);

        $nodes = collect($sequence['nodes']);
        $start_node = $nodes->where('type','input');
            dump($start_node);
        if($startNode){
            $start_node = $nodes->where('id',$startNode);
        }
        else
        {
            //find edge that starts on start node
            dump($start_node->first());
            $start_edge = $edges->where('source',$start_node->first()['id']);

            dump($start_edge->first());
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

       /* $attributes = [
            ['id' => 2, 'name' => 'firstname', 'type' => 'text'],
            ['id' => 3, 'name' => 'lastname', 'type' => 'text'],
            ['id' => 4, 'name' => 'email', 'type' => 'email'],
            ['id' => 5, 'name' => 'phone', 'type' => 'tel'],
            ['id' => 6, 'name' => 'address', 'type' => 'text'],
            ['id' => 7, 'name' => 'street', 'type' => 'text'],
            ['id' => 8, 'name' => 'city', 'type' => 'text'],
            ['id' => 9, 'name' => 'state', 'type' => 'text'],
            ['id' => 10, 'name' => 'zip', 'type' => 'text'],
            ['id' => 11, 'name' => 'country', 'type' => 'text'],
            ['id' => 12, 'name' => 'dob', 'type' => 'date'],
            ['id' => 13, 'name' => 'gender', 'type'=> 'radio']

        ];



        $getFields = Field::where('instance_id', $selectedInstanceId)->get();
        foreach($getFields as $field){
            $attributes[] = ['id' => $field->id, 'name' => $field->name, 'type' => $field->type];
        }*/





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
