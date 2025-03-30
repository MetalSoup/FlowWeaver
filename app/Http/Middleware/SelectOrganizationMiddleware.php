<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SelectOrganizationMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->session()->has('selected_organization')) {
            return redirect()->route('organizations.select');

        }


        return $next($request);

    }
}
