<?php

namespace App\Http\Controllers;

use App\Http\Resources\FieldResource;
use App\Models\Field;
use App\Http\Requests\StoreFieldRequest;
use App\Http\Requests\UpdateFieldRequest;
use Illuminate\Support\Facades\Log;

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

        return inertia('Fields/Index', [
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
        return inertia('Fields/Create', [
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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'label' => 'required|string|max:255',
            'type' => 'required|string|max:255',
        ]);
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
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFieldRequest $request, Field $field)
    {
        //
        //dd('test');
        $selectedInstanceId = session('selected_instance');
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'label' => 'required|string|max:255',
            'type' => 'required|string|max:255',
        ]);
        $validated['instance_id'] = $selectedInstanceId;
        if ($field) $field->update($validated);
        else $field = Field::create($validated);
        return inertia('Fields/Edit', [
            'field' => new FieldResource($field),
        ]);


    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Field $field)
    {
        //
    }
}
