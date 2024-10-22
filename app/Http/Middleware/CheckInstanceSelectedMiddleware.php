<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckInstanceSelectedMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->session()->has('selected_instance')) {
            return redirect()->route('instances.select');
        }

        return $next($request);
    }
}
