<?php

namespace App\Http\Controllers;

use App\Http\Requests\PageRequest;
use App\Http\Resources\PageResource;
use App\Models\Flow;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class PageController extends Controller
{
    /**
     * Helper to determine if the request is from Inertia.
     */
    protected function isInertiaRequest(Request $request): bool
    {
        return (bool) $request->header('X-Inertia');
    }

    public function index(Request $request)
    {
        // Resolve selected site id from the authenticated user's preferences.
        $selectedSiteId = null;
        if ($request->user() && method_exists($request->user(), 'selectedSite') && $request->user()->selectedSite()) {
            $selectedSiteId = $request->user()->selectedSite()->id;
        }

        // If no site is selected, return an empty paginator (avoids accidental cross-site data leakage).
        if (!$selectedSiteId) {
            $empty = Page::whereRaw('0 = 1')->paginate(10);
            return inertia('Pages/PageIndex', [
                'pages' => $empty,
            ]);
        }

        // Build base query
        $query = Page::where('site_id', $selectedSiteId);

        // Optional search (q)
        $q = $request->input('q');
        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('content', 'like', "%{$q}%");
            });
        }

        // Sorting (whitelist)
        $allowedSorts = ['id', 'name', 'created_at', 'updated_at'];
        $sort = $request->input('sort');
        $direction = strtolower($request->input('direction', 'desc')) === 'asc' ? 'asc' : 'desc';
        if ($sort && in_array($sort, $allowedSorts, true)) {
            $query = $query->orderBy($sort, $direction);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        // Paginate and append relevant query params
        $pages = $query->paginate(10)->appends($request->only(['q', 'sort', 'direction']));

        // Transform paginator items using PageResource while preserving paginator meta/links
        $rawPages = $pages->getCollection() ?? collect();
        $pages->setCollection(collect(PageResource::collection($rawPages)->resolve()));

        return inertia('Pages/PageIndex', [
            'pages' => $pages,
        ]);
    }

    public function store(PageRequest $request)
    {
        $selectedSiteId = null;
        if ($request->user() && method_exists($request->user(), 'selectedSite') && $request->user()->selectedSite()) {
            $selectedSiteId = $request->user()->selectedSite()->id;
        }

        // If no site is selected, send the user to site selection (always Inertia)
        if (!$selectedSiteId) {
            return redirect()->route('sites.select');
        }

        // Debug: log entire parsed request and raw body/headers for diagnosis
        Log::debug('PageController::store - $request->all() -> ' . json_encode($request->all()));
        try {
            $raw = file_get_contents('php://input');
            Log::debug('PageController::store - php://input length: ' . strlen($raw));
            Log::debug('PageController::store - php://input preview: ' . substr($raw, 0, 1000));
        } catch (\Throwable $e) {
            Log::debug('PageController::store - php://input read error: ' . $e->getMessage());
        }
        Log::debug('PageController::store - request headers: ' . json_encode($request->headers->all()));

        // Log raw incoming request for debugging content issues
        $rawContent = $request->input('content', '');
        Log::debug('PageController::store - raw request content length: ' . strlen($rawContent));
        Log::debug('PageController::store - raw request content preview: ' . substr($rawContent, 0, 200));

        // Fallback: if $rawContent is empty, try to parse php://input as JSON and extract content
        if (empty($rawContent)) {
            try {
                $rawBody = file_get_contents('php://input');
                if (!empty($rawBody)) {
                    $decoded = json_decode($rawBody, true);
                    if (json_last_error() === JSON_ERROR_NONE && isset($decoded['content'])) {
                        $rawContent = is_string($decoded['content']) ? $decoded['content'] : json_encode($decoded['content']);
                        Log::debug('PageController::store - extracted content from raw JSON body');
                    }
                }
            } catch (\Throwable $e) {
                Log::debug('PageController::store - fallback parse php://input error: ' . $e->getMessage());
            }
        }

        $data = $request->validated();

        $data['site_id'] = $selectedSiteId;

        // Ensure content is preserved even when validation omits it (nullable)
        $data['content'] = $rawContent;

        // Ensure we have an authenticated user because pages.user_id is required
        if (!auth()->check()) {
            abort(403, 'Authentication required to create pages');
        }
        $data['user_id'] = auth()->id();

        // Ensure a valid non-empty name is present — generate a unique default if not
        $this->ensurePageName($data, $selectedSiteId);

        Log::info($data);

        // create using the merged data (including site_id and name)
        $page = Page::create($data);

        // Defensive persistence: ensure content was saved (some request parsing edge cases
        // could cause content to be empty even though we provided it). If the created
        // model doesn't reflect the expected content, overwrite and save.
        if (($page->content ?? '') !== ($data['content'] ?? '')) {
            $page->content = $data['content'] ?? null;
            $page->save();
            Log::debug('PageController::store - forced save of content after create');
        }

        // If the request came from an Inertia client, return the edit page payload (200) so the client
        // can replace the response without a forced 409/location full reload. For non-Inertia requests
        // keep the normal redirect.
        // Treat requests from Inertia, XHR, or JSON-capable clients as Inertia-like so the client receives a 200 payload
        if ($request->header('X-Inertia') || $request->header('X-Requested-With') === 'XMLHttpRequest' || $request->ajax() || $request->wantsJson() || $request->expectsJson()) {
            // prepare flows and forms similar to edit()
            $flows = Flow::where('site_id', $selectedSiteId)->select('id', 'name', 'sequence')->get();
            $forms = [];
            foreach ($flows as $flowModel) {
                $flow_id = $flowModel->id;

                $sequence = $flowModel->sequence ?? [];
                if (is_string($sequence)) {
                    $decoded = json_decode($sequence, true);
                    $sequence = $decoded === null ? [] : $decoded;
                }

                $nodes = collect(data_get($sequence, 'nodes', []));

                $forms[$flow_id] = $nodes->where('type', 'Form')->map(function ($n) {
                    return [
                        'id' => data_get($n, 'id'),
                        'name' => data_get($n, 'name'),
                    ];
                })->values()->toArray();
            }


            return Redirect::route('pages.edit', $page->id);/*, [
                'page' => new PageResource($page),
                'forms' => $forms,
                'flows' => $flows,
            ])->toResponse($request);*/
        }

        // Non-Inertia fallback: regular redirect
        return redirect()->route('pages.edit', $page->id);
    }


    /*Seperate function to show page based on slug*/

    public function showPage($slug)
    {
        $page = Page::where('slug', $slug)->firstOrFail();
        return inertia('Pages/PageShow', [
            'page' => $page
        ]);

    }

    public function show(Page $page)
    {
        //dd($page);
        $page_content = $page->content;
        // replace all sites of the string '[ki-path:1]' with 'ki-path-1'
        //$page_content = str_replace('[ki-path:1]', 'ki-path-1', $page_content);
        //dd($page_content);

        return inertia('Pages/PageShow', [
            'page' => $page
        ]);
    }

/*    public function edit(Page $page)
    {

        $selectedSiteId = session('selected_site');
        if($page->site_id != $selectedSiteId){
            abort(403);
        }

        // we need to also send a list of all the flows, and all the fields
        $flows = Flow::where('site_id',$selectedSiteId)->select("id","name")->get();
        //I don't need fields because I can get them through inertia middleware in the component. Should I do the same for flows?




        $page_flows = [["id"=>3, "start"=>'']];

        foreach ($page_flows as $flow) {
            $flow_id = $flow['id'];

            $nodes = collect(Flow::find($flow['id'])->sequence['nodes']);

            //dump($nodes->where('type','Form'));
            // Normalize forms to a simple array of id/name objects so the frontend
            // always receives predictable array shapes (avoids JS runtime errors).
            $forms[$flow_id] = $nodes->where('type', 'Form')->map(function ($n) {
                // $n may be an array or object; use data_get to safely access properties
                return [
                    'id' => data_get($n, 'id'),
                    'name' => data_get($n, 'name'),
                ];
            })->values()->toArray();
        }


        // Default to the new craft.js based editor
        return inertia('Pages/Editor', [
            'page' => new PageResource($page),
            'forms' => $forms,
            'flows' => $flows
        ]);
    }
 */
    // Show the editor for creating a new page
    public function create()
    {
        $selectedSiteId = null;
        if (auth()->user() && method_exists(auth()->user(), 'selectedSite') && auth()->user()->selectedSite()) {
            $selectedSiteId = auth()->user()->selectedSite()->id;
        }
        if (!$selectedSiteId) {
            return redirect()->route('sites.select');
        }

        $flows = Flow::where('site_id', $selectedSiteId)->select("id", "name")->get();

        // Simple empty forms structure for create view
        $forms = [];


        return inertia('Pages/PageEditor', [
            'page' => null,
            'forms' => $forms,
            'flows' => $flows,
        ]);
    }

    // New editor route for the Craft.js editor (explicit)
    public function edit(Page $page)
    {
        $selectedSiteId = null;
        if (auth()->user() && method_exists(auth()->user(), 'selectedSite') && auth()->user()->selectedSite()) {
            $selectedSiteId = auth()->user()->selectedSite()->id;
        }
        if ($page->site_id != $selectedSiteId) {
            abort(403);
        }

        // load id, name and sequence so we can safely access sequence without extra queries
        $flows = Flow::where('site_id', $selectedSiteId)->select('id', 'name', 'sequence')->get();

        // prepare forms array by iterating actual Flow models
        $forms = [];
        foreach ($flows as $flowModel) {
            $flow_id = $flowModel->id;

            // Ensure sequence is an array (it might be stored as JSON or array). Use empty array fallback.
            $sequence = $flowModel->sequence ?? [];
            if (is_string($sequence)) {
                $decoded = json_decode($sequence, true);
                $sequence = $decoded === null ? [] : $decoded;
            }

            // Collect nodes safely (default to empty array when missing)
            $nodes = collect(data_get($sequence, 'nodes', []));

            $forms[$flow_id] = $nodes->where('type', 'Form')->map(function ($n) {
                return [
                    'id' => data_get($n, 'id'),
                    'name' => data_get($n, 'name'),
                ];
            })->values()->toArray();
        }

        return inertia('Pages/PageEditor', [
            'page' => new PageResource($page),
            'forms' => $forms,
            'flows' => $flows,
        ]);
    }

/*    public function update(PageRequest $request, Page $page)
    {
        $selectedSiteId = session('selected_site');
        if($page->site_id != $selectedSiteId){
            abort(403);
        }
        $page->update($request->validated());

        return new PageResource($page);
    }*/
    public function update(PageRequest $request, Page $page)
    {

        $selectedSiteId = null;
        if ($request->user() && method_exists($request->user(), 'selectedSite') && $request->user()->selectedSite()) {
            $selectedSiteId = $request->user()->selectedSite()->id;
        }
        if ($page->site_id != $selectedSiteId) {
            abort(403);
        }



        $data = $request->validated();

        // Defensive: move any top-level custom_css into options so we don't attempt to write a non-existent column
        if (array_key_exists('custom_css', $data)) {
            $data['options'] = is_array($data['options'] ?? null) ? $data['options'] : [];
            $data['options']['custom_css'] = $data['custom_css'];
            unset($data['custom_css']);
        }

        // Debug incoming options payload for diagnosis
        try {
            Log::debug('PageController::update - incoming validated data keys: ' . json_encode(array_keys($data)));
            if (isset($data['options'])) {
                Log::debug('PageController::update - incoming options payload: ' . json_encode($data['options']));
            }
        } catch (\Throwable $e) {
            Log::debug('PageController::update - logging failed: ' . $e->getMessage());
        }

        // Merge incoming options with existing options to avoid clobbering unrelated option keys
        if (isset($data['options']) && is_array($data['options'])) {
            $existing = is_array($page->options) ? $page->options : (is_null($page->options) ? [] : (array) $page->options);
            $data['options'] = array_merge($existing, $data['options']);
            try {
                Log::debug('PageController::update - merged options: ' . json_encode($data['options']));
            } catch (\Throwable $e) {
                // ignore
            }
        }

        // Save the content explicitly (validated may not include content if empty/null)
        //$data['content'] = $request->input('content', '');

        // If the client sent an explicit empty name, treat it as "no change" on update
        if (array_key_exists('name', $data) && trim((string) ($data['name'] ?? '')) === '') {
            unset($data['name']);
            Log::debug('PageController::update - client sent empty name, preserving existing');
        }

        // Ensure a valid non-empty name is present — generate a unique default if not (create path or when omitted)
        $this->ensurePageName($data, $selectedSiteId);

        // Use fill + save + refresh to ensure casts are applied and DB reflects the changes
        $page->fill($data);
        $page->save();
        $page->refresh();
        try {
            Log::debug('PageController::update - saved page attributes: ' . json_encode($page->getAttributes()));
            Log::debug('PageController::update - saved page.options (casted): ' . json_encode($page->options));
        } catch (\Throwable $e) {
            // ignore logging errors
        }

        // If the request came from an Inertia client, return the edit page payload (200) so the client
        // can replace the response without a forced 409/location full reload. For non-Inertia requests
        // keep the normal redirect.
        // Treat requests from Inertia, XHR, or JSON-capable clients as Inertia-like so the client receives a 200 payload
        if ($request->header('X-Inertia') || $request->header('X-Requested-With') === 'XMLHttpRequest' || $request->ajax() || $request->wantsJson() || $request->expectsJson()) {
            // prepare flows and forms similar to edit()
            $flows = Flow::where('site_id', $selectedSiteId)->select('id', 'name', 'sequence')->get();
            $forms = [];
            foreach ($flows as $flowModel) {
                $flow_id = $flowModel->id;

                $sequence = $flowModel->sequence ?? [];
                if (is_string($sequence)) {
                    $decoded = json_decode($sequence, true);
                    $sequence = $decoded === null ? [] : $decoded;
                }

                $nodes = collect(data_get($sequence, 'nodes', []));

                $forms[$flow_id] = $nodes->where('type', 'Form')->map(function ($n) {
                    return [
                        'id' => data_get($n, 'id'),
                        'name' => data_get($n, 'name'),
                    ];
                })->values()->toArray();
            }
            //dd("inertia update");

            // Return the editor payload (same shape as `store`) so Inertia clients receive updated props
            return redirect()->route('pages.edit', $page->id);
            /*return Inertia::render('Pages/PageEditor', [
                'page' => new PageResource($page),
                'forms' => $forms,
                'flows' => $flows,
            ])->toResponse($request);*/
        }

        // Non-Inertia fallback: regular redirect
        return redirect()->route('pages.edit', $page->id);
    }

    public function destroy(Request $request, Page $page)
    {
        $selectedSiteId = null;
        if ($request->user() && method_exists($request->user(), 'selectedSite') && $request->user()->selectedSite()) {
            $selectedSiteId = $request->user()->selectedSite()->id;
        }
        if ($page->site_id != $selectedSiteId) {
            abort(403);
        }
        $page->delete();

        // Always return an Inertia location to navigate back to the pages list
        return redirect()->route('pages.index');
    }

    /**
     * Ensure $data contains a non-empty 'name' — generate a unique one within the site when missing.
     * Modifies $data by reference.
     */
    protected function ensurePageName(array &$data, $selectedSiteId)
    {
        if (!empty(trim((string) ($data['name'] ?? '')))) {
            // name is present and non-empty
            return;
        }

        $base = 'Untitled Page';
        $n = 0;
        do {
            $n++;
            $name = $n === 1 ? $base : $base . ' #' . $n;
        } while (Page::where('site_id', $selectedSiteId)->where('name', $name)->exists());

        $data['name'] = $name;
    }
}
