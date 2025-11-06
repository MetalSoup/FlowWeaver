<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckInstanceSelectedMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Resolve selected instance id in order: user's saved value, session, cookie
        $selectedId = null;
        if ($request->user() && isset($request->user()->selected_instance_id) && $request->user()->selected_instance_id) {
            $selectedId = $request->user()->selected_instance_id;
        } elseif ($request->session()->has('selected_instance')) {
            $selectedId = $request->session()->get('selected_instance');
        } elseif ($request->cookie('selected_instance')) {
            $selectedId = $request->cookie('selected_instance');
        }

        if (!$selectedId) {
            return redirect()->route('instances.select');
        }

        // Ensure session is populated for downstream code that relies on it
        $request->session()->put('selected_instance', $selectedId);

        return $next($request);
    }
}
