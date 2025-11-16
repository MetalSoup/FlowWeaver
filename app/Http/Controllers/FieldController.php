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
use App\DefaultFields;

class FieldController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Resolve selected site id from the authenticated user's preferences.
        $selectedSite = null;
        if ($request->user() && method_exists($request->user(), 'selectedSite') && $request->user()->selectedSite()) {
            $selectedSiteId = $request->user()->selectedSite()->id;
        }

        // Always include the application's default fields (read-only, displayed without edit links)
        $defaultFields = DefaultFields::getFields()->map(function ($f) {
            return [
                'id' => $f['id'] ?? null,
                'name' => $f['name'] ?? '',
                'label' => $f['label'] ?? ($f['name'] ?? ''),
                'type' => $f['type'] ?? '',
                'site_id' => null,
                'options' => null,
                'created_at' => '',
                'updated_at' => '',
                'is_default' => true,
            ];
        })->toArray();

        if (!$selectedSiteId) {
            // no site selected - show only default fields (read-only)
            return Inertia::render('Fields/FieldIndex', [
                'fields' => $defaultFields,
            ]);
        }

        // Base query scoped to selected site
        $query = Field::where('site_id', $selectedSiteId);

        // Optional search (q) - search by name or type
        $q = $request->input('q');
        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('type', 'like', "%{$q}%")
                    ->orWhere('label', 'like', "%{$q}%");
            });
        }

        // Sorting (whitelist)
        $allowedSorts = ['id', 'name', 'label', 'type', 'created_at', 'updated_at'];
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
        // Add an `is_default` flag to DB fields (false) and merge default fields so the UI
        // can render defaults (read-only) alongside site fields.
        $dbFields = collect(FieldResource::collection($raw)->resolve())->map(function ($row) {
            $row['is_default'] = false;
            return $row;
        });

        // Prepend default fields so they appear first in the list
        $combined = collect($defaultFields)->merge($dbFields);
        $fields->setCollection($combined);

        return Inertia::render('Fields/FieldIndex', [
            'fields' => $fields,
        ]);

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $selectedSiteId = null;
        if (auth()->user() && method_exists(auth()->user(), 'selectedSite') && auth()->user()->selectedSite()) {
            $selectedSiteId = auth()->user()->selectedSite()->id;
        }
        return inertia('Fields/FieldCreate', [
            'field' => new FieldResource(new Field(['site_id' => $selectedSiteId])),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFieldRequest $request)
    {
        Log::info('store field');
        $selectedSiteId = null;
        if ($request->user() && method_exists($request->user(), 'selectedSite') && $request->user()->selectedSite()) {
            $selectedSiteId = $request->user()->selectedSite()->id;
        }

        // validated data comes from the StoreFieldRequest
        $validated = $request->validated();
        $validated['site_id'] = $selectedSiteId;

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
        $selectedSiteId = null;
        if ($request->user() && method_exists($request->user(), 'selectedSite') && $request->user()->selectedSite()) {
            $selectedSiteId = $request->user()->selectedSite()->id;
        }
        $validated = $request->validated();

        $validated['site_id'] = $selectedSiteId;
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
