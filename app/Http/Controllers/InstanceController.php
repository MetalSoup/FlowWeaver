<?php

namespace App\Http\Controllers;

use App\Models\Instance;
use App\Http\Requests\StoreInstanceRequest;
use App\Http\Requests\UpdateInstanceRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InstanceController extends Controller
{


    public function select()
    {
        //dd('select');
        $instances = auth()->user()->instances;
        return inertia('Instances/Select', [
            'instances' => $instances,
        ]);
        //return view('instances.select', compact('instances'));
    }

    public function storeSelection(Request $request)
    {
       // $instance = Instance::find($request);

        //dd($request);
        $request->validate(['instance_id' => 'required|exists:instances,id']);
        $request->session()->put('selected_instance', $request->instance_id);
        return redirect()->route('dashboard');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $instances = Instance::all();
        return Inertia::render('Instances/Index', [
            'instances' => $instances,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        return Inertia::render('Instances/Edit', [
            'instance' => new Instance,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInstanceRequest $request)
    {
        //
        $instance = Instance::create($request->validated());
        return redirect()->route('instances.edit', $instance->id);
    }

    /**
     * Display the specified resource.
     */
    public function show(Instance $instance)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Instance $instance)
    {
        //
        return Inertia::render('Instances/Edit', [
            'instance' => $instance,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInstanceRequest $request, Instance $instance)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Instance $instance)
    {
        //
    }
}
