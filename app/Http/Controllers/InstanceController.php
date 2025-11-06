<?php

namespace App\Http\Controllers;

use App\Models\Instance;
use App\Http\Requests\StoreInstanceRequest;
use App\Http\Requests\UpdateInstanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cookie;

/**
 * @method mixed authorize(string $ability, array|mixed $arguments = [])
 */
class InstanceController extends Controller
{

    public function select()
    {
        //dd('select');
        $instances = auth()->user()->instances;
        return inertia('Instances/InstanceSelect', [
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

        // set session
        $request->session()->put('selected_instance', $instanceId);

        // persist to user if logged in
        if ($request->user()) {
            $user = $request->user();
            $user->selected_instance_id = $instanceId;
            $user->save();
        }

        // set cookie for longer-term persistence (30 days)
        $secure = config('session.secure', false);
        $cookie = Cookie::make('selected_instance', $instanceId, 60 * 24 * 30, null, null, $secure, true, false, 'lax'); // minutes

        return Redirect::intended('/dashboard')->withCookie($cookie);
        //return redirect()->route('dashboard');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Show instances belonging to organizations the user is a member of
        $user = auth()->user();
        if (!$user) {
            abort(403);
        }

        $orgIds = $user->organizations()->pluck('id')->toArray();
        $instances = Instance::whereIn('organization_id', $orgIds)->get();

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
        $selectedOrganizationId = $user->selected_organization_id;







        // validated and authorized by StoreInstanceRequest
        $data = $request->validated();
        // Ensure status has a value (DB migration requires it). Default to 'active'.
        $data['status'] = $request->input('status', $data['status'] ?? 'active');
        $data['organization_id'] = $selectedOrganizationId;

        // enforce that the organization belongs to the user (StoreInstanceRequest already checks this)
        $instance = Instance::create($data);
        // Only auto-select the newly created instance if no instance is currently selected.
        // Determine existing selection from user, session, or cookie (consistent with HandleInertiaRequests).
        $currentSelected = null;
        if ($request->user() && isset($request->user()->selected_instance_id) && $request->user()->selected_instance_id) {
            $currentSelected = $request->user()->selected_instance_id;
        } elseif (session('selected_instance')) {
            $currentSelected = session('selected_instance');
        } elseif ($request->cookie('selected_instance')) {
            $currentSelected = $request->cookie('selected_instance');
        }

        $cookie = null;
        if (!$currentSelected) {
            // No instance selected yet — select and persist this new instance.
            $request->session()->put('selected_instance', $instance->id);

            if ($request->user()) {
                $user = $request->user();
                $user->selected_instance_id = $instance->id;
                $user->save();
            }

            // set cookie for longer-term persistence (30 days)
            $secure = config('session.secure', false);
            $cookie = Cookie::make('selected_instance', $instance->id, 60 * 24 * 30, null, null, $secure, true, false, 'lax'); // minutes
        }

        $response = redirect()->route('instances.edit', $instance->id);
        return $cookie ? $response->withCookie($cookie) : $response;
    }

    /**
     * Display the specified resource.
     */
    public function show(Instance $instance)
    {
        // authorize view
        $this->authorize('view', $instance);

        return Inertia::render('Instances/InstanceShow', [
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
