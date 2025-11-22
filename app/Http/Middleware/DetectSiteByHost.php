<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\SiteDomain;
use App\Helpers\SiteContext;

class DetectSiteByHost
{
    public function handle(Request $request, Closure $next)
    {
        // Prefer X-Forwarded-Host for proxy setups
        $host = $request->headers->get('x-forwarded-host') ?: $request->getHost();
        $host = strtolower($host);

        // strip port if present
        if (strpos($host, ':') !== false) {
            $host = preg_replace('/:\\d+$/', '', $host);
        }

        // canonicalize www -> apex if apex exists
        if (str_starts_with($host, 'www.')) {
            $apex = preg_replace('/^www\\./', '', $host);
            $apexDomain = SiteDomain::where('domain', $apex)->first();
            if ($apexDomain) {
                // preserve path and query
                $uri = $request->getRequestUri();
                $scheme = $request->getScheme();
                $url = $scheme . '://' . $apex . $uri;
                return redirect()->to($url, 301);
            }
        }

        $siteDomain = SiteDomain::with('site')->where('domain', $host)->first();

        if ($siteDomain) {
            SiteContext::set($siteDomain->site->id);
            $request->attributes->set('detected_site_domain', $siteDomain);
        } else {
            SiteContext::clear();
        }

        return $next($request);
    }
}
