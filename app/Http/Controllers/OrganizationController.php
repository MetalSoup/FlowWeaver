<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrganizationRequest;
use App\Http\Requests\UpdateOrganizationRequest;
use App\Models\Site;
use App\Models\Organization;
use App\Http\Resources\OrganizationResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cookie;

class OrganizationController extends Controller
{

    public function index()
    {
        //
        $organizations = auth()->user() ? (auth()->user()->organizations ?? collect()) : collect();

        return inertia('Organizations/OrganizationIndex', [
            'organizations' => OrganizationResource::collection($organizations),
        ]);
    }

    public function select()
    {
        $organizations = auth()->user() ? (auth()->user()->organizations ?? collect()) : collect();

        //if there are no organizations, redirect to create organization page
        if ($organizations->isEmpty()) {
            return redirect()->route('organizations.create');
        }

        // Use OrganizationResource collection for consistent formatting
        return inertia('Organizations/OrganizationIndex', [
            'organizations' => OrganizationResource::collection($organizations),
        ]);
    }

    public function storeSelection(Request $request)
    {


        //dd($request);
        $request->validate(['organization_id' => 'required|exists:organizations,id']);
        $organizationId = $request->organization_id;

        // Persist selection into the user's `preferences` JSON column.
        // We no longer use the legacy `selected_organization` session key or the
        // `selected_organization_id` column on the users table.
        if ($request->user()) {
            $user = $request->user();

            $prefs = $user->preferences ?? [];
            if (is_string($prefs)) {
                $decoded = json_decode($prefs, true);
                $prefs = is_array($decoded) ? $decoded : [];
            }

            $prefs['selected_organization_id'] = $organizationId;
            // When organization changes we must clear any previously selected site
            // since sites are scoped to organizations. This forces the frontend to
            // prompt the user to re-select a site that belongs to the new org.
            if (array_key_exists('selected_site_id', $prefs)) {
                unset($prefs['selected_site_id']);
            }
            $user->preferences = $prefs;
            $user->save();
        }

        // Note: we intentionally do not set a session key or cookie named
        // `selected_organization` here; the application now prefers the
        // `preferences` JSON column on the user for persisted selections.
        return Redirect::intended('/dashboard');
    }



    public function create()
    {
        //
        // Provide an empty OrganizationResource for consistency
        return Inertia::render('Organizations/OrganizationEdit', [
            'organization' => OrganizationResource::make(new Organization),
        ]);
    }


    public function edit(Organization $organization)
    {
        //
        return Inertia::render('Organizations/OrganizationEdit', [
            'organization' => OrganizationResource::make($organization),
        ]);
    }



    public function store(StoreOrganizationRequest $request)
    {
        //
        $user = auth()->user();

        $organization = Organization::create($request->validated());
        $organization->users()->attach($user->id);

        // persist selection if user logged in
        // Persist selection into the user's preferences JSON column instead of
        // using the legacy selected_organization_id column or a cookie.
        if ($user) {
            $prefs = $user->preferences ?? [];
            if (is_string($prefs)) {
                $decoded = json_decode($prefs, true);
                $prefs = is_array($decoded) ? $decoded : [];
            }
            $prefs['selected_organization_id'] = $organization->id;
            // Clear any selected_site when a new organization is created and selected
            if (array_key_exists('selected_site_id', $prefs)) {
                unset($prefs['selected_site_id']);
            }
            $user->preferences = $prefs;
            $user->save();
        }

        return redirect()->route('organizations.select');
    }

    public function update(UpdateOrganizationRequest $request, Site $site)
    {
        //
    }



}
