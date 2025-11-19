<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ValidateSlugRequest;
use App\Models\Page;
/*use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;*/
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Redirect;
/*use Illuminate\Support\Str;*/
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
/*use Illuminate\Http\Response as HttpResponse;*/

class SlugValidationController extends Controller
{
    /**
     * Validate a candidate slug for format, reserved conflicts, and uniqueness within a site.
     */
    public function validateSlug(ValidateSlugRequest $request)
    {
        $slug = (string) $request->input('slug');
        // normalize: lowercase, trim, spaces -> hyphen, remove disallowed chars except - and _
        $slug = strtolower(trim($slug));
        $slug = preg_replace('/\s+/', '-', $slug);
        $slug = preg_replace('/[^a-z0-9\-_]+/', '-', $slug);
        // collapse separators
        $slug = preg_replace('/-+/', '-', $slug);
        $slug = preg_replace('/_+/', '_', $slug);
        // trim separators
        $slug = preg_replace('/(^[-_]+|[-_]+$)/', '', $slug);
        $siteId = $request->input('site_id');
        $pageId = $request->input('page_id');

        // Reserved paths: read from config
        $reserved = Config::get('slugs.reserved', []);

        if (in_array($slug, $reserved, true)) {
            throw ValidationException::withMessages(['slug' => 'This slug is reserved and cannot be used.']);
        }

        // Check uniqueness within site when site_id provided, otherwise require globally unique
        $query = Page::query();
        if ($siteId) {
            $query->where('site_id', $siteId);
        }
        $query->where('slug', $slug);
        if ($pageId) {
            $query->where('id', '!=', $pageId);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages(['slug' => 'This slug is already used for this site.']);
        }

        // If the client provided the current Inertia component and props, return a proper Inertia response
        $component = $request->input('_component');
        $pageProps = $request->input('_pageProps');
        if ($component && is_array($pageProps)) {
            // Return an Inertia response using the same component and props so the Inertia client
            // receives a correctly structured Inertia payload (headers + body).
            return Redirect::back()->with(['valid' => true]);
        }

        return Redirect::back()->with(['valid' => true]);
    }
}
