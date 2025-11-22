<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureAdminHost
{
    public function handle(Request $request, Closure $next)
    {
        $main = config('app.main_domain');
        if (!$main) {
            return $next($request);
        }

        $host = $request->headers->get('x-forwarded-host') ?: $request->getHost();
        $host = strtolower($host);
        if (strpos($host, ':') !== false) {
            $host = preg_replace('/:\\d+$/', '', $host);
        }

        if ($host !== strtolower($main)) {
            // Redirect to main domain preserving path and query
            $uri = $request->getRequestUri();
            $scheme = $request->getScheme();
            $url = $scheme . '://' . $main . $uri;
            return redirect()->to($url);
        }

        return $next($request);
    }
}
