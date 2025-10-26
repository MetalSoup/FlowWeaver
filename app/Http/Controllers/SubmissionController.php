<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use App\Http\Requests\StoreSubmissionRequest;
use App\Http\Requests\UpdateSubmissionRequest;
use Redirect;
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
        // Use validated data; request allows flow_id, step, data
        $validated = $request->validated();

        // Accept email/phone either at top-level or inside data (frontend may send them nested)
        $email = $validated['email'] ?? ($validated['data']['email'] ?? null);
        $phone = $validated['phone'] ?? ($validated['data']['phone'] ?? null);

        $submission = Submission::create([
            'flow_id' => $validated['flow_id'] ?? null,
            'step' => $validated['step'] ?? null,
            'email' => $email,
            'phone' => $phone,
            'data' => $validated['data'] ?? null,
        ]);

        sleep(5);

        // Persist the created submission id into session so guest visitors can
        // perform subsequent updates that are validated by UpdateSubmissionRequest
        // (which checks session('submission_id')).
        session()->put('submission_id', $submission->id);

        // Return a redirect submission_id
        return redirect()->back()->with(['success' => true, 'submission_id' => $submission->id]);
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

        sleep(5);
        $validated = $request->validated();

        // Merge existing data with incoming data (incoming keys override existing)
        $existing = $submission->data ?? [];
        $incoming = $validated['data'] ?? [];
        if (!is_array($existing)) $existing = [];
        if (!is_array($incoming)) $incoming = [];

        $merged = array_merge($existing, $incoming);

        $submission->data = $merged;
        if (isset($validated['step'])) {
            $submission->step = $validated['step'];
        }
        if (isset($validated['flow_id'])) {
            $submission->flow_id = $validated['flow_id'];
        }
        // If email/phone provided at top-level or inside data, update them on the submission.
        $upEmail = $validated['email'] ?? ($validated['data']['email'] ?? null);
        $upPhone = $validated['phone'] ?? ($validated['data']['phone'] ?? null);
        if ($upEmail !== null) {
            $submission->email = $upEmail;
        }
        if ($upPhone !== null) {
            $submission->phone = $upPhone;
        }
        $submission->save();

        // Refresh session submission_id in case it wasn't already present or to extend its life
        session()->put('submission_id', $submission->id);

        // Return redirect with flash for Inertia-consistent handling
        return Redirect::back()->with(['success' => true, 'submission_id' => $submission->id]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Submission $submission)
    {
        //
    }
}
