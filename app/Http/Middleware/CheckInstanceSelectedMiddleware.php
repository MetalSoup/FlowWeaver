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
        $selectedId = null;
        if ($request->user() && method_exists($request->user(), 'selectedInstance') && $request->user()->selectedInstance()) {
            $selectedId = $request->user()->selectedInstance()->id;
        }

        if (!$selectedId) {
            return redirect()->route('instances.select');
        }

        return $next($request);
    }
}
