<?php

namespace App\Http\Controllers;

use App\Http\Requests\FlowRequest;
use App\Http\Resources\FlowResource;
use App\Models\Flow;
use Illuminate\Support\Facades\Log;

class FlowController extends Controller
{
    public function index()
    {

        return inertia('Flows/Index', [
            'flows' => FlowResource::collection(Flow::all()),
        ]);
    }

    public function store(FlowRequest $request)
    {
        return new FlowResource(Flow::create($request->validated()));
    }

    public function show(Flow $flow)
    {
        return new FlowResource($flow);
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
