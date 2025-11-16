<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckSiteSelectedMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Use only the user's persisted preferences to resolve the selected site.
        // Legacy session/cookie/column behavior has been removed.
        $user = $request->user();

        // If the user does not have a selected organization, send them to organization selection first.
        // This prevents the site-selection middleware from redirecting users to site flows
        // when they don't yet belong to an organization (which previously led to /sites/create -> 403).
        if ($user && (! method_exists($user, 'selectedOrganization') || ! $user->selectedOrganization())) {
            return redirect()->route('organizations.select');
        }

        $selectedId = null;
        if ($user && method_exists($user, 'selectedSite') && $user->selectedSite()) {
            $selectedId = $user->selectedSite()->id;
        }

        if (! $selectedId) {
            return redirect()->route('sites.select');
        }

        return $next($request);
    }
}
