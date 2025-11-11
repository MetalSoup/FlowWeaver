<?php

namespace App\Http\Controllers;

use App\Models\Flow;
use App\Models\Submission;
use App\Http\Requests\StoreSubmissionRequest;
use App\Http\Requests\UpdateSubmissionRequest;
use App\RunFlow;
use Redirect;
use Inertia\Inertia;
use function Laravel\Prompts\pause;

class SubmissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSubmissionRequest $request)
    {
        list($submission, $returnData, $compiled) = $this->saveData($request);
        return Redirect::back()->with(['success' => true, 'submission_id' => $submission->id, 'data' => $returnData, 'flow' => $compiled]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Submission $submission)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Submission $submission)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSubmissionRequest $request, Submission $submission)
    {

        list($submission, $returnData, $compiled) = $this->saveData($request,$submission);
        return Redirect::back()->with(['success' => true, 'submission_id' => $submission->id, 'data' => $returnData, 'flow' => $compiled]);

        sleep(1);

        $validated = $request->validated();


        $node = $request->step;
        $flow_id = $request->flow_id;


        $flow = Flow::find($flow_id);
        $sequence = $flow->sequence;
        $edges = $sequence['edges'];
        $edges = collect($edges);
        $nodes = collect($sequence['nodes']);
        $start_node = $nodes->where('id',$node);


        $data['submission'] = $submission;
        $data['request'] = $validated;

        $data = collect($data);


        $runFlow = new RunFlow($start_node, $edges, $nodes, $data);

        // capture return data from the flow execution
        $returnData = $runFlow->run();

        // If this is an XHR/fetch request (not an Inertia request), return JSON so the frontend
        // Inertia/JS code can handle the response without following a redirect back to the editor.
        $isInertia = (bool) request()->header('X-Inertia');
        if ((request()->wantsJson() || request()->ajax() || request()->header('X-Requested-With') === 'XMLHttpRequest') && ! $isInertia) {
            return response()->json([
                'success' => true,
                'submission_id' => $submission->id,
                'data' => $returnData,
            ]);
        }

        if ($isInertia) {
            // flash submission data to session so Inertia page props include it
            session()->flash('submission_id', $submission->id);
            session()->flash('data', ['form' => $returnData]);

            $compiled = null;
            try {
                if ($flow && $flow->sequence) {
                    $compiled = (new \App\FlowCompiler(json_encode($flow->sequence)))->compile();
                }
            } catch (\Exception $e) {
                // ignore compile errors
            }

            return Inertia::render('Flows/Show', [
                'flow_id' => $flow_id,
                'flow' => $compiled,
            ]);
        }


        return Redirect::back()->with(['success' => true, 'submission_id' => $submission->id, 'data' => $returnData]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Submission $submission)
    {
        //
    }

    /**
     * @param    $request
     * @return array
     * @throws \Exception
     */
    public function saveData($request, $submission = null): array
    {
        $validated = $request->validated();

        $node = $request->step;
        $flow_id = $request->flow_id;

        $flow = Flow::find($flow_id);
        $sequence = $flow->sequence;
        $edges = $sequence['edges'];
        $edges = collect($edges);
        $nodes = collect($sequence['nodes']);
        $start_node = $nodes->where('id', $node);
        if(!$submission) {
            $submission = new Submission();
        }


        $data['submission'] = $submission;
        $data['request'] = $validated;

        $data = collect($data);

        $runFlow = new RunFlow($start_node, $edges, $nodes, $data);

        $returnData = $runFlow->run();

        session()->flash('submission_id', $submission->id);
        session()->flash('data', ['form' => $returnData]);

        $flowCompiler = new \App\FlowCompiler(json_encode($flow->sequence));
        $compiled = $flowCompiler->compile();
        /*session()->flash('flow', $compiled);*/
        return array($submission, $returnData, $compiled);
    }
}
