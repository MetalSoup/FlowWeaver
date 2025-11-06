<?php

namespace App\Http\Controllers;

use App\Http\Resources\FieldResource;
use App\Models\Field;
use App\Http\Requests\StoreFieldRequest;
use App\Http\Requests\UpdateFieldRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FieldController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Resolve selected instance id from the authenticated user's preferences.
        $selectedInstanceId = null;
        if ($request->user() && method_exists($request->user(), 'selectedInstance') && $request->user()->selectedInstance()) {
            $selectedInstanceId = $request->user()->selectedInstance()->id;
        }

        if (!$selectedInstanceId) {
            // no instance selected - return empty paginator
            $empty = Field::whereRaw('0 = 1')->paginate(15);
            return Inertia::render('Fields/FieldIndex', [
                'fields' => $empty,
            ]);
        }

        // Base query scoped to selected instance
        $query = Field::where('instance_id', $selectedInstanceId);

        // Optional search (q) - search by name or type
        $q = $request->input('q');
        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('type', 'like', "%{$q}%");
            });
        }

        // Sorting (whitelist)
        $allowedSorts = ['id', 'name', 'type', 'created_at', 'updated_at'];
        $sort = $request->input('sort');
        $direction = strtolower($request->input('direction', 'desc')) === 'asc' ? 'asc' : 'desc';
        if ($sort && in_array($sort, $allowedSorts, true)) {
            $query = $query->orderBy($sort, $direction);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        // Paginate and preserve query string
        $fields = $query->paginate(15)->appends($request->only(['q', 'sort', 'direction']));

        // Transform items with FieldResource while keeping paginator meta
        $raw = $fields->getCollection() ?? collect();
        $fields->setCollection(collect(FieldResource::collection($raw)->resolve()));

        return Inertia::render('Fields/FieldIndex', [
            'fields' => $fields,
        ]);

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $selectedInstanceId = null;
        if (auth()->user() && method_exists(auth()->user(), 'selectedInstance') && auth()->user()->selectedInstance()) {
            $selectedInstanceId = auth()->user()->selectedInstance()->id;
        }
        return inertia('Fields/FieldCreate', [
            'field' => new FieldResource(new Field(['instance_id' => $selectedInstanceId])),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFieldRequest $request)
    {
        Log::info('store field');
        $selectedInstanceId = null;
        if ($request->user() && method_exists($request->user(), 'selectedInstance') && $request->user()->selectedInstance()) {
            $selectedInstanceId = $request->user()->selectedInstance()->id;
        }

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
        $selectedInstanceId = null;
        if ($request->user() && method_exists($request->user(), 'selectedInstance') && $request->user()->selectedInstance()) {
            $selectedInstanceId = $request->user()->selectedInstance()->id;
        }
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
