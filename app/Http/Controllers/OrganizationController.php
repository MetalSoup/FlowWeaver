<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrganizationRequest;
use App\Http\Requests\UpdateOrganizationRequest;
use App\Models\Instance;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cookie;

class OrganizationController extends Controller
{
    public function select()
    {
        $organizations = auth()->user()->organizations;

        //if there are no organizations, redirect to create organization page
        if ($organizations->isEmpty()) {
            return redirect()->route('organizations.create');
        }

        return inertia('Organizations/OrganizationSelect', [
            'organizations' => $organizations,
        ]);
    }

    public function storeSelection(Request $request)
    {
        // $instance = Instance::find($request);

        //dd($request);
        $request->validate(['organization_id' => 'required|exists:organizations,id']);
        $organizationId = $request->organization_id;

        // set session
        $request->session()->put('selected_organization', $organizationId);

        // persist to user if logged in
        if ($request->user()) {
            $user = $request->user();
            $user->selected_organization_id = $organizationId;
            $user->save();
        }

        // set cookie for longer-term persistence (30 days)
        $secure = config('session.secure', false);
        $cookie = Cookie::make('selected_organization', $organizationId, 60 * 24 * 30, null, null, $secure, true, false, 'lax'); // minutes

        return Redirect::intended('/dashboard')->withCookie($cookie);
        //return redirect()->route('dashboard');
    }



    public function create()
    {
        //
        return Inertia::render('Organizations/OrganizationEdit', [
            'organization' => new Organization,
        ]);
    }


    public function edit(Organization $organization)
    {
        //
        return Inertia::render('Organizations/OrganizationEdit', [
            'organization' => $organization,
        ]);
    }



    public function store(StoreOrganizationRequest $request)
    {
        //
        $user = auth()->user();

        $organization = Organization::create($request->validated());
        $organization->users()->attach($user->id);

        // persist selection if user logged in
        if ($user) {
            $user->selected_organization_id = $organization->id;
            $user->save();
        }

        // set cookie for longer-term persistence (30 days)
        $secure = config('session.secure', false);
        $cookie = Cookie::make('selected_organization', $organization->id, 60 * 24 * 30, null, null, $secure, true, false, 'lax'); // minutes

        return redirect()->route('organizations.select')->withCookie($cookie);
    }

    public function update(UpdateOrganizationRequest $request, Instance $instance)
    {
        //
    }



}
