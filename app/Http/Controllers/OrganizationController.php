<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrganizationRequest;
use App\Http\Requests\UpdateOrganizationRequest;
use App\Models\Instance;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    public function select()
    {
        $organizations = auth()->user()->organizations;

        //if there are no organizations, redirect to create organization page
        if ($organizations->isEmpty()) {
            return redirect()->route('organizations.create');
        }

        return inertia('Organizations/Select', [
            'organizations' => $organizations,
        ]);
    }

    public function storeSelection(Request $request)
    {
        // $instance = Instance::find($request);

        //dd($request);
        $request->validate(['organization_id' => 'required|exists:organizations,id']);
        $request->session()->put('selected_organization', $request->organization_id);
        return Redirect::intended('/dashboard');
        //return redirect()->route('dashboard');
    }


    public function create()
    {
        //
        return Inertia::render('Organizations/Edit', [
            'organization' => new Organization,
        ]);
    }


    public function edit(Organization $organization)
    {
        //
        return Inertia::render('Organizations/Edit', [
            'organization' => $organization,
        ]);
    }



    public function store(StoreOrganizationRequest $request)
    {
        //
        $user = auth()->user();

        $organization = Organization::create($request->validated());
        $organization->users()->attach($user->id);

        return redirect()->route('organizations.select');
    }

    public function update(UpdateOrganizationRequest $request, Instance $instance)
    {
        //
    }




}
