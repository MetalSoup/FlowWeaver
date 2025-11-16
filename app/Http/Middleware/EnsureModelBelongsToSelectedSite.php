<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EnsureModelBelongsToSelectedSite
{
    /**
     * Handle an incoming request.
     * Blocks access if a route-model's site_id does not match the user's selected site.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // Determine selected site id from preferences helper
        $selectedSiteId = null;
        if ($user && method_exists($user, 'selectedSite') && $user->selectedSite()) {
            $selectedSiteId = $user->selectedSite()->id;
        }

        // If no selected site, let CheckSiteSelectedMiddleware handle redirection earlier in the stack
        // but be defensive here.
        if (!$selectedSiteId) {
            return redirect()->route('sites.select');
        }

        $params = $request->route() ? $request->route()->parameters() : [];

        foreach ($params as $key => $value) {
            // If this is an Eloquent model site
            if (is_object($value)) {
                $class = get_class($value);
                $base = class_basename($class);

                // If it's an Site model, ensure it's the selected site
                if ($base === 'Site') {
                    if (property_exists($value, 'id') && ($value->id != $selectedSiteId)) {
                        abort(403);
                    }
                    continue;
                }

                // If model has site_id property, ensure it matches selected site
                if (property_exists($value, 'site_id')) {
                    if ($value->site_id != $selectedSiteId) {
                        abort(403);
                    }
                }

                // Also handle when model may expose getAttribute('site_id') without property
                if (method_exists($value, 'getAttribute')) {
                    $attr = $value->getAttribute('site_id');
                    if (!is_null($attr) && $attr != $selectedSiteId) {
                        abort(403);
                    }
                }
            }

            // If it's a scalar id and the route name indicates an Site resource, check it
            if (!is_object($value) && Str::endsWith($key, 'site')) {
                if ((int)$value !== (int)$selectedSiteId) {
                    abort(403);
                }
            }
        }

        return $next($request);
    }
}

