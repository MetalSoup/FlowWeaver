<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Models\SiteDomain;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SiteDomainController extends Controller
{
    public function index(Site $site)
    {
        $this->authorize('view', $site);

        $domains = $site->domains()->with(['defaultPage', 'notFoundPage'])->get();

        return Inertia::render('Sites/Domains', [
            'site' => $site,
            'domains' => $domains,
        ]);
    }

    public function store(Request $request, Site $site)
    {
        $this->authorize('update', $site);

        $data = $request->validate([
            'domain' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9.-]+$/i', Rule::unique('site_domains', 'domain')],
        ]);

        $domain = strtolower(trim($data['domain']));

        $sd = SiteDomain::create([
            'site_id' => $site->id,
            'domain' => $domain,
        ]);

        return redirect()->back();
    }

    public function update(Request $request, SiteDomain $domain)
    {
        // Only allow editing domain settings if the user can update the owning site
        $site = $domain->site;
        $this->authorize('update', $site);

        // If this domain is the APP_MAIN_DOMAIN, restrict to super-admins
        $main = config('app.main_domain');
        if ($main && strtolower($domain->domain) === strtolower($main)) {
            if (!auth()->user() || !auth()->user()->hasRole('super-admin')) {
                abort(403);
            }
        }

        $data = $request->validate([
            // domain is optional on updates (allow updating only default/404 without resending domain)
            'domain' => ['sometimes', 'required', 'string', 'max:255', 'regex:/^[a-z0-9.-]+$/i', Rule::unique('site_domains', 'domain')->ignore($domain->id)],
            'default_page_id' => ['nullable', 'integer'],
            'not_found_page_id' => ['nullable', 'integer'],
        ]);

        // Ensure provided page ids belong to the same site
        if (!empty($data['default_page_id'])) {
            $p = Page::where('id', $data['default_page_id'])->where('site_id', $site->id)->first();
            if (!$p) {
                return redirect()->back()->withErrors(['default_page_id' => 'Default page must belong to this site.']);
            }
        }
        if (!empty($data['not_found_page_id'])) {
            $p = Page::where('id', $data['not_found_page_id'])->where('site_id', $site->id)->first();
            if (!$p) {
                return redirect()->back()->withErrors(['not_found_page_id' => '404 page must belong to this site.']);
            }
        }

        // Prepare update payload conditionally so 'domain' is not required for partial updates
        $updates = [];
        if (array_key_exists('domain', $data)) {
            $updates['domain'] = strtolower(trim($data['domain']));
        }
        // Always allow explicitly provided null to unset defaults
        if (array_key_exists('default_page_id', $data)) {
            $updates['default_page_id'] = $data['default_page_id'] ?? null;
        }
        if (array_key_exists('not_found_page_id', $data)) {
            $updates['not_found_page_id'] = $data['not_found_page_id'] ?? null;
        }

        if (!empty($updates)) {
            $domain->update($updates);
        }

        return redirect()->back();
    }

    public function destroy(SiteDomain $domain)
    {
        $site = $domain->site;
        $this->authorize('update', $site);

        // Protect main domain deletion — only super-admin
        $main = config('app.main_domain');
        if ($main && strtolower($domain->domain) === strtolower($main)) {
            if (!auth()->user() || !auth()->user()->hasRole('super-admin')) {
                abort(403);
            }
        }

        $domain->delete();

        return redirect()->back();
    }
}
