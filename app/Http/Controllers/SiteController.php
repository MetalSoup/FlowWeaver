<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Http\Requests\StoreSiteRequest;
use App\Http\Requests\UpdateSiteRequest;
use App\Http\Resources\SiteResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

/**
 * @method mixed authorize(string $ability, array|mixed $arguments = [])
 */
class SiteController extends Controller
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

        // If the user doesn't belong to any organizations, send them to create one first.
        if (empty($userOrgIds)) {
            return redirect()->route('organizations.create');
        }

        // If we have a selected organization (and the user belongs to it), show sites for that org.
        if ($selectedOrgId && in_array($selectedOrgId, $userOrgIds, true)) {
            $sites = Site::where('organization_id', $selectedOrgId)->get();
        } else {
            // Show sites across all organizations the user belongs to
            $sites = Site::whereIn('organization_id', $userOrgIds)->get();
        }

        // If there are no sites at all for the user's organizations, redirect to create.
        if ($sites->isEmpty()) {
            $hasAny = Site::whereIn('organization_id', $userOrgIds)->exists();
            if (!$hasAny) {
                return redirect()->route('sites.create');
            }
            // otherwise $sites is already an empty collection; continue and render select with empty list
        }

        // Use SiteResource for consistent formatting
        $sites = SiteResource::collection($sites);

        return inertia('Sites/SiteIndex', [
            'sites' => $sites,
        ]);
        //return view('sites.select', compact('sites'));
    }

    public function storeSelection(Request $request)
    {
       // $site = Site::find($request);

        //dd($request);
        $request->validate(['site_id' => 'required|exists:sites,id']);
        $siteId = $request->site_id;

        // Persist selection into the user's `preferences` JSON column.
        // We no longer use the legacy `selected_site` session key or the
        // `selected_site_id` column on the users table.
        if ($request->user()) {
            $user = $request->user();

            $prefs = $user->preferences ?? [];
            if (is_string($prefs)) {
                $decoded = json_decode($prefs, true);
                $prefs = is_array($decoded) ? $decoded : [];
            }

            $prefs['selected_site_id'] = $siteId;
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
        // Show sites belonging to organizations the user is a member of
        $user = auth()->user();
        if (!$user) {
            abort(403);
        }

        $orgIds = $user->organizations()->pluck('id')->toArray();

        // Build base query
        $query = Site::whereIn('organization_id', $orgIds);

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
        $sites = $query->paginate(15)->appends($request->only(['q', 'sort', 'direction']));

        // Transform paginator items with SiteResource (keeps paginator meta intact)
        $raw = $sites->getCollection() ?? collect();
        $sites->setCollection(collect(SiteResource::collection($raw)->resolve()));

        return Inertia::render('Sites/SiteIndex', [
            'sites' => $sites,
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
            abort(403, 'You must belong to an organization to create an site.');
        }

        return Inertia::render('Sites/SiteEdit', [
            'site' => new Site,
            'organizations' => $organizations,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSiteRequest $request)
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





        // validated and authorized by StoreSiteRequest
        $data = $request->validated();
        // Ensure status has a value (DB migration requires it). Default to 'active'.
        $data['status'] = $request->input('status', $data['status'] ?? 'active');
        $data['organization_id'] = $selectedOrganizationId;

        // enforce that the organization belongs to the user (StoreSiteRequest already checks this)
        $site = Site::create($data);
        // Only auto-select the newly created site if no site is currently selected in preferences.
        $currentSelected = null;
        if ($request->user()) {
            $user = $request->user();
            $prefs = $user->preferences ?? [];
            if (is_string($prefs)) {
                $decoded = json_decode($prefs, true);
                $prefs = is_array($decoded) ? $decoded : [];
            }
            $currentSelected = $prefs['selected_site_id'] ?? null;
        }

        if (!$currentSelected && $request->user()) {
            $user = $request->user();
            $prefs = $user->preferences ?? [];
            if (is_string($prefs)) {
                $decoded = json_decode($prefs, true);
                $prefs = is_array($decoded) ? $decoded : [];
            }
            $prefs['selected_site_id'] = $site->id;
            $user->preferences = $prefs;
            $user->save();
        }

        return redirect()->route('sites.edit', $site->id);
    }

    /**
     * Display the specified resource.
     */
    public function show(Site $site)
    {
        // authorize view
        $this->authorize('view', $site);

        return Inertia::render('Sites/SiteIndex', [
            'site' => $site,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Site $site)
    {
        // authorize
        $this->authorize('update', $site);

        return Inertia::render('Sites/SiteEdit', [
            'site' => $site,
            'domains' => $site->domains()->with(['defaultPage','notFoundPage'])->get(),
            'pages' => $site->pages()->select('id','name')->get(),
            'isSuperAdmin' => auth()->check() ? auth()->user()->hasRole('super-admin') : false,
            'main_domain' => config('app.main_domain'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSiteRequest $request, Site $site)
    {
        // The UpdateSiteRequest will authorize that the user belongs to the site's organization.
        $site->update($request->validated());

        return redirect()->route('sites.edit', $site->id)->with('success', 'Site updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Site $site)
    {
        // authorize
        $this->authorize('delete', $site);

        $site->delete();

        return redirect()->route('sites.index')->with('success', 'Site deleted.');
    }
}
