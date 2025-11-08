<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckInstanceSelectedMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Use only the user's persisted preferences to resolve the selected instance.
        // Legacy session/cookie/column behavior has been removed.
        $user = $request->user();

        // If the user does not have a selected organization, send them to organization selection first.
        // This prevents the instance-selection middleware from redirecting users to instance flows
        // when they don't yet belong to an organization (which previously led to /instances/create -> 403).
        if ($user && (! method_exists($user, 'selectedOrganization') || ! $user->selectedOrganization())) {
            return redirect()->route('organizations.select');
        }

        $selectedId = null;
        if ($user && method_exists($user, 'selectedInstance') && $user->selectedInstance()) {
            $selectedId = $user->selectedInstance()->id;
        }

        if (! $selectedId) {
            return redirect()->route('instances.select');
        }

        return $next($request);
    }
}
