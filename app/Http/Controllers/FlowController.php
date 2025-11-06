<?php

namespace App\Http\Controllers;

use App\Http\Requests\FlowRequest;
use App\Http\Resources\FlowResource;
use App\Models\Field;
use App\Models\Flow;
use App\RunFlow;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class FlowController extends Controller
{
    protected function resolveSelectedInstanceId()
    {
        $sel = session('selected_instance') ?? null;

        // If session holds an object/array with id, extract it
        if (is_array($sel) && isset($sel['id'])) {
            return (int) $sel['id'];
        }

        if (is_object($sel) && isset($sel->id)) {
            return (int) $sel->id;
        }

        // If it's a scalar (already an id)
        if (is_numeric($sel)) {
            return (int) $sel;
        }

        return null;
    }

    public function index()
    {
        $selectedInstanceId = $this->resolveSelectedInstanceId();
        $flows = Flow::where('instance_id', $selectedInstanceId)->get();

        return inertia('Flows/FlowIndex', [
            'flows' => FlowResource::collection($flows),
        ]);
    }

    public function create()
    {
        $selectedInstanceId = $this->resolveSelectedInstanceId();
        return inertia('Flows/FlowEdit', [
            'flow' => new FlowResource(new Flow(['instance_id' => $selectedInstanceId])),
        ]);
    }

    public function store(FlowRequest $request)
    {
        // Prefer the session selected instance; fall back to an instance_id supplied in the request.
        $selectedInstanceId = $this->resolveSelectedInstanceId() ?? $request->input('instance_id');

        // If we still don't have an instance id, redirect the user to select one before creating flows.
        if (!$selectedInstanceId) {
            return Redirect::route('instances.select')->with('error', 'Please select an instance before creating a flow.');
        }

        $data = $request->validated();
        $data['instance_id'] = (int) $selectedInstanceId;

        $flow = Flow::create($data);

        return redirect()->route('flows.edit', $flow->id);
    }

    public function show(Flow $flow, $startNode = null)
    {
        $compiledSteps = $this->compileFlow($flow);

        //dd($compiledSteps);

        return Inertia::render('Flows/TestFlowShow', [
            'flow_id' => $flow->id,
            'flow' => $compiledSteps,
        ]);
    }

    public function edit(Flow $flow)
    {
        $selectedInstanceId = $this->resolveSelectedInstanceId();
        if ($flow->instance_id != $selectedInstanceId) {
            abort(403);
        }

        return inertia('Flows/FlowEdit', [
            'flow' => new FlowResource($flow),
        ]);
    }

    public function update(FlowRequest $request, Flow $flow)
    {
        $selectedInstanceId = $this->resolveSelectedInstanceId();
        if ($flow->instance_id != $selectedInstanceId) {
            abort(403);
        }

        $data = $request->validated();
        // Ensure the instance_id being saved is an integer and matches resolved instance
        if (isset($data['instance_id'])) {
            $data['instance_id'] = (int) $data['instance_id'];
        } else {
            $data['instance_id'] = (int) $selectedInstanceId;
        }

        $flow->update($data);
    }

    public function destroy(Flow $flow)
    {
        $selectedInstanceId = $this->resolveSelectedInstanceId();
        if ($flow->instance_id != $selectedInstanceId) {
            abort(403);
        }
        $flow->delete();

        return response()->json();
    }

    public function compile(Flow $flow)
    {
        $selectedInstanceId = $this->resolveSelectedInstanceId();
        /*        if($flow->instance_id != $selectedInstanceId){
                    abort(403);
                }*/

        $compiledSteps = $this->compileFlow($flow);

        return Inertia::render('Flows/FlowShow', [
            'flow_id' => $flow->id,
            'flow' => $compiledSteps,
        ]);
    }

    /**
     * Return compiled flow array (pure data) so callers can reuse it.
     */
    protected function compileFlow(Flow $flow)
    {
        $flowCompiler = new \App\FlowCompiler(json_encode($flow->sequence));
        return $flowCompiler->compile();
    }

    public function getFlow(Flow $flow)
    {
        // Compile the flow data and return it as an Inertia response so the
        // frontend's Inertia.get(route('get_flow', id)) call receives it in
        // `page.props.flow`.
        $compiled = $this->compileFlow($flow);

        // If the client expects JSON (XHR/fetch) and this is NOT an Inertia
        // request, return a JSON payload. Inertia requests include the
        // `X-Inertia` header — they must receive an Inertia response.
        $isInertia = (bool) request()->header('X-Inertia');
        if ((request()->wantsJson() || request()->ajax() || request()->header('X-Requested-With') === 'XMLHttpRequest') && !$isInertia) {
            return response()->json([
                'flow_id' => $flow->id,
                'flow' => $compiled,
            ]);
        }

        // Otherwise return a full Inertia page so Inertia.get/onSuccess can
        // also extract the flow from page props if needed.
        return Inertia::render('Flows/FlowShow', [
            'flow_id' => $flow->id,
            'flow' => $compiled,
        ]);
    }
}
