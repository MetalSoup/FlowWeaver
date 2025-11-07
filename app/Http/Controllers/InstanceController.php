<?php

namespace App\Http\Controllers;

use App\Models\Instance;
use App\Http\Requests\StoreInstanceRequest;
use App\Http\Requests\UpdateInstanceRequest;
use App\Http\Resources\InstanceResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

/**
 * @method mixed authorize(string $ability, array|mixed $arguments = [])
 */
class InstanceController extends Controller
{

    public function select()
    {
        //dd('select');
        $user = auth()->user();
        if (!$user) abort(403);

        // Determine the selected organization id from the user's preferences helper
        $selectedOrgId = null;
        if (method_exists($user, 'selectedOrganization') && $user->selectedOrganization()) {
            $selectedOrgId = $user->selectedOrganization()->id;
        }

        // Determine org IDs the user belongs to
        $userOrgIds = $user->organizations()->pluck('id')->toArray();

        // If we have a selected organization (and the user belongs to it), show instances for that org.
        if ($selectedOrgId && in_array($selectedOrgId, $userOrgIds, true)) {
            $instances = Instance::where('organization_id', $selectedOrgId)->get();
        } else {
            // Show instances across all organizations the user belongs to
            $instances = Instance::whereIn('organization_id', $userOrgIds)->get();
        }

        // If there are no instances at all for the user's organizations, redirect to create.
        if ($instances->isEmpty()) {
            $hasAny = Instance::whereIn('organization_id', $userOrgIds)->exists();
            if (!$hasAny) {
                return redirect()->route('instances.create');
            }
            // otherwise $instances is already an empty collection; continue and render select with empty list
        }

        // Use InstanceResource for consistent formatting
        $instances = InstanceResource::collection($instances);

        return inertia('Instances/InstanceIndex', [
            'instances' => $instances,
        ]);
        //return view('instances.select', compact('instances'));
    }

    public function storeSelection(Request $request)
    {
       // $instance = Instance::find($request);

        //dd($request);
        $request->validate(['instance_id' => 'required|exists:instances,id']);
        $instanceId = $request->instance_id;

        // Persist selection into the user's `preferences` JSON column.
        // We no longer use the legacy `selected_instance` session key or the
        // `selected_instance_id` column on the users table.
        if ($request->user()) {
            $user = $request->user();

            $prefs = $user->preferences ?? [];
            if (is_string($prefs)) {
                $decoded = json_decode($prefs, true);
                $prefs = is_array($decoded) ? $decoded : [];
            }

            $prefs['selected_instance_id'] = $instanceId;
            $user->preferences = $prefs;
            $user->save();
        }

        return redirect()->route('dashboard');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Show instances belonging to organizations the user is a member of
        $user = auth()->user();
        if (!$user) {
            abort(403);
        }

        $orgIds = $user->organizations()->pluck('id')->toArray();

        // Build base query
        $query = Instance::whereIn('organization_id', $orgIds);

        // Optional search (q)
        $q = $request->input('q');
        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        // Sorting (whitelist to prevent SQL injection)
        $allowedSorts = ['id', 'name', 'created_at', 'updated_at'];
        $sort = $request->input('sort');
        $direction = strtolower($request->input('direction', 'desc')) === 'asc' ? 'asc' : 'desc';
        if ($sort && in_array($sort, $allowedSorts, true)) {
            $query = $query->orderBy($sort, $direction);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        // Paginate results (default 15 per page) and preserve query string for appends
        $instances = $query->paginate(15)->appends($request->only(['q', 'sort', 'direction']));

        // Transform paginator items with InstanceResource (keeps paginator meta intact)
        $raw = $instances->getCollection() ?? collect();
        $instances->setCollection(collect(InstanceResource::collection($raw)->resolve()));

        return Inertia::render('Instances/InstanceIndex', [
            'instances' => $instances,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Only allow creation if user belongs to at least one organization; provide organizations for selection
        $user = auth()->user();
        if (!$user) abort(403);

        $organizations = $user->organizations()->get();
        //dd($organizations);
        if ($organizations->isEmpty()) {
            abort(403, 'You must belong to an organization to create an instance.');
        }

        return Inertia::render('Instances/InstanceEdit', [
            'instance' => new Instance,
            'organizations' => $organizations,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInstanceRequest $request)
    {

        $user = auth()->user();
        if (!$user) {
            abort(403);
        }
        // Prefer selection from user's preferences helper which reads the preferences JSON
        $selectedOrganizationId = null;
        if (method_exists($user, 'selectedOrganization') && $user->selectedOrganization()) {
            $selectedOrganizationId = $user->selectedOrganization()->id;
        } elseif (isset($user->selected_organization_id)) {
            // fallback in case legacy column still exists
            $selectedOrganizationId = $user->selected_organization_id;
        }





        // validated and authorized by StoreInstanceRequest
        $data = $request->validated();
        // Ensure status has a value (DB migration requires it). Default to 'active'.
        $data['status'] = $request->input('status', $data['status'] ?? 'active');
        $data['organization_id'] = $selectedOrganizationId;

        // enforce that the organization belongs to the user (StoreInstanceRequest already checks this)
        $instance = Instance::create($data);
        // Only auto-select the newly created instance if no instance is currently selected in preferences.
        $currentSelected = null;
        if ($request->user()) {
            $user = $request->user();
            $prefs = $user->preferences ?? [];
            if (is_string($prefs)) {
                $decoded = json_decode($prefs, true);
                $prefs = is_array($decoded) ? $decoded : [];
            }
            $currentSelected = $prefs['selected_instance_id'] ?? null;
        }

        if (!$currentSelected && $request->user()) {
            $user = $request->user();
            $prefs = $user->preferences ?? [];
            if (is_string($prefs)) {
                $decoded = json_decode($prefs, true);
                $prefs = is_array($decoded) ? $decoded : [];
            }
            $prefs['selected_instance_id'] = $instance->id;
            $user->preferences = $prefs;
            $user->save();
        }

        return redirect()->route('instances.edit', $instance->id);
    }

    /**
     * Display the specified resource.
     */
    public function show(Instance $instance)
    {
        // authorize view
        $this->authorize('view', $instance);

        return Inertia::render('Instances/InstanceIndex', [
            'instance' => $instance,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Instance $instance)
    {
        // authorize
        $this->authorize('update', $instance);

        return Inertia::render('Instances/InstanceEdit', [
            'instance' => $instance,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInstanceRequest $request, Instance $instance)
    {
        // The UpdateInstanceRequest will authorize that the user belongs to the instance's organization.
        $instance->update($request->validated());

        return redirect()->route('instances.edit', $instance->id)->with('success', 'Instance updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Instance $instance)
    {
        // authorize
        $this->authorize('delete', $instance);

        $instance->delete();

        return redirect()->route('instances.index')->with('success', 'Instance deleted.');
    }
}
