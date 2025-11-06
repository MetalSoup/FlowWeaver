<?php

namespace App\Http\Controllers;

use App\Http\Resources\FieldResource;
use App\Models\Field;
use App\Http\Requests\StoreFieldRequest;
use App\Http\Requests\UpdateFieldRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;

class FieldController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $selectedInstanceId = session('selected_instance');
        $fields = Field::where('instance_id', $selectedInstanceId)->get();

        return inertia('Fields/FieldIndex', [
            'fields' => FieldResource::collection($fields),
        ]);

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        $selectedInstanceId = session('selected_instance');
        return inertia('Fields/FieldCreate', [
            'field' => new FieldResource(new Field(['instance_id' => $selectedInstanceId])),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFieldRequest $request)
    {
        //
        Log::info('store field');
        $selectedInstanceId = session('selected_instance');

        // validated data comes from the StoreFieldRequest
        $validated = $request->validated();
        $validated['instance_id'] = $selectedInstanceId;

        Field::create($validated);

        return redirect()->route('fields.index');

    }

    /**
     * Display the specified resource.
     */
    public function show(Field $field)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Field $field)
    {
        //
        return inertia('Fields/FieldEdit', [
            'field' => $field,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFieldRequest $request, Field $field)
    {
        //
        $selectedInstanceId = session('selected_instance');
        $validated = $request->validated();

        $validated['instance_id'] = $selectedInstanceId;
        if ($field) $field->update($validated);
        else $field = Field::create($validated);
        return Redirect::route('fields.edit', ['field' => $field->id])->with('success', 'Field updated successfully.');


    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Field $field)
    {
        //
    }
}
