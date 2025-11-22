<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SiteDomain;
use App\Models\Page;
use Inertia\Inertia;

class AdminSettingsController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        if (!$user || !$user->hasRole('super-admin')) {
            abort(403);
        }

        $main = config('app.main_domain');
        $siteDomain = SiteDomain::with('site')->where('domain', $main)->first();

        $pages = [];
        if ($siteDomain) {
            // get pages for the site so admin can choose defaults
            $pages = $siteDomain->site->pages()->select('id','name')->get();
        }

        return Inertia::render('Admin/Settings', [
            'siteDomain' => $siteDomain,
            'pages' => $pages,
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();
        if (!$user || !$user->hasRole('super-admin')) {
            abort(403);
        }

        $main = config('app.main_domain');
        $siteDomain = SiteDomain::where('domain', $main)->firstOrFail();

        $data = $request->validate([
            'domain' => ['required','string','max:255'],
            'default_page_id' => ['nullable','integer'],
            'not_found_page_id' => ['nullable','integer'],
        ]);

        // validate pages belong to the site
        if (!empty($data['default_page_id'])) {
            $p = Page::where('id', $data['default_page_id'])->where('site_id', $siteDomain->site_id)->first();
            if (!$p) return redirect()->back()->withErrors(['default_page_id' => 'Page must belong to the platform site.']);
        }
        if (!empty($data['not_found_page_id'])) {
            $p = Page::where('id', $data['not_found_page_id'])->where('site_id', $siteDomain->site_id)->first();
            if (!$p) return redirect()->back()->withErrors(['not_found_page_id' => 'Page must belong to the platform site.']);
        }

        $siteDomain->update([
            'domain' => strtolower(trim($data['domain'])),
            'default_page_id' => $data['default_page_id'] ?? null,
            'not_found_page_id' => $data['not_found_page_id'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Main domain settings updated.');
    }
}

