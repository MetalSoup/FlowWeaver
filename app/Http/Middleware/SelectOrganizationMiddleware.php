<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SelectOrganizationMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Only use the persisted preferences on the user to determine selection.
        // The app has removed legacy session/cookie behavior — preferences are the
        // single source of truth.
        if (!$request->user() || !method_exists($request->user(), 'selectedOrganization') || !$request->user()->selectedOrganization()) {
            return redirect()->route('organizations.select');
        }


        return $next($request);

    }
}
