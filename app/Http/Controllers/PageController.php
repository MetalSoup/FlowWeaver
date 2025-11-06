<?php

namespace App\Http\Controllers;

use App\Http\Requests\PageRequest;
use App\Http\Resources\PageResource;
use App\Models\Flow;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
        // Resolve selected instance id from the authenticated user's preferences.
        $selectedInstanceId = null;
        if ($request->user() && method_exists($request->user(), 'selectedInstance') && $request->user()->selectedInstance()) {
            $selectedInstanceId = $request->user()->selectedInstance()->id;
        }

        // If no instance is selected, return an empty paginator (avoids accidental cross-instance data leakage).
        if (!$selectedInstanceId) {
            $empty = Page::whereRaw('0 = 1')->paginate(10);
            return inertia('Pages/PageIndex', [
                'pages' => $empty,
            ]);
        }

        // Build base query
        $query = Page::where('instance_id', $selectedInstanceId);

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
        $selectedInstanceId = null;
        if ($request->user() && method_exists($request->user(), 'selectedInstance') && $request->user()->selectedInstance()) {
            $selectedInstanceId = $request->user()->selectedInstance()->id;
        }

        // If no instance is selected, send the user to instance selection (always Inertia)
        if (!$selectedInstanceId) {
            return redirect()->route('instances.select');
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
        $data['instance_id'] = $selectedInstanceId;

        // Ensure content is preserved even when validation omits it (nullable)
        $data['content'] = $rawContent;

        // Ensure we have an authenticated user because pages.user_id is required
        if (!auth()->check()) {
            abort(403, 'Authentication required to create pages');
        }
        $data['user_id'] = auth()->id();

        // Ensure a valid non-empty name is present — generate a unique default if not
        $this->ensurePageName($data, $selectedInstanceId);

        Log::info($data);

        // create using the merged data (including instance_id and name)
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
        if ($this->isInertiaRequest($request)) {
            // prepare flows and forms similar to edit()
            $flows = Flow::where('instance_id', $selectedInstanceId)->select('id', 'name', 'sequence')->get();
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

            return inertia('Pages/PageEditor', [
                'page' => new PageResource($page),
                'forms' => $forms,
                'flows' => $flows,
            ]);
        }

        // Non-Inertia fallback: regular redirect
        return redirect()->route('pages.edit', $page->id);
    }

    public function show(Page $page)
    {
        //dd($page);
        $page_content = $page->content;
        // replace all instances of the string '[ki-path:1]' with 'ki-path-1'
        //$page_content = str_replace('[ki-path:1]', 'ki-path-1', $page_content);
        //dd($page_content);

        return inertia('Pages/PageShow', [
            'page' => $page
        ]);
    }

/*    public function edit(Page $page)
    {

        $selectedInstanceId = session('selected_instance');
        if($page->instance_id != $selectedInstanceId){
            abort(403);
        }

        // we need to also send a list of all the flows, and all the fields
        $flows = Flow::where('instance_id',$selectedInstanceId)->select("id","name")->get();
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
        $selectedInstanceId = null;
        if (auth()->user() && method_exists(auth()->user(), 'selectedInstance') && auth()->user()->selectedInstance()) {
            $selectedInstanceId = auth()->user()->selectedInstance()->id;
        }
        if (!$selectedInstanceId) {
            return redirect()->route('instances.select');
        }

        $flows = Flow::where('instance_id', $selectedInstanceId)->select("id", "name")->get();

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
        $selectedInstanceId = null;
        if (auth()->user() && method_exists(auth()->user(), 'selectedInstance') && auth()->user()->selectedInstance()) {
            $selectedInstanceId = auth()->user()->selectedInstance()->id;
        }
        if ($page->instance_id != $selectedInstanceId) {
            abort(403);
        }

        // load id, name and sequence so we can safely access sequence without extra queries
        $flows = Flow::where('instance_id', $selectedInstanceId)->select('id', 'name', 'sequence')->get();

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
        $selectedInstanceId = session('selected_instance');
        if($page->instance_id != $selectedInstanceId){
            abort(403);
        }
        $page->update($request->validated());

        return new PageResource($page);
    }*/
    public function update(PageRequest $request, Page $page)
    {

        $selectedInstanceId = null;
        if ($request->user() && method_exists($request->user(), 'selectedInstance') && $request->user()->selectedInstance()) {
            $selectedInstanceId = $request->user()->selectedInstance()->id;
        }
        if ($page->instance_id != $selectedInstanceId) {
            abort(403);
        }


        $data = $request->validated();

        // Save the content explicitly (validated may not include content if empty/null)
        //$data['content'] = $request->input('content', '');

        // Ensure a valid non-empty name is present — generate a unique default if not
        $this->ensurePageName($data, $selectedInstanceId);

        $page->update($data);

        // If the request came from an Inertia client, return the edit page payload (200) so the client
        // can replace the response without a forced 409/location full reload. For non-Inertia requests
        // keep the normal redirect.
        if ($this->isInertiaRequest($request)) {
            // prepare flows and forms similar to edit()
            $flows = Flow::where('instance_id', $selectedInstanceId)->select('id', 'name', 'sequence')->get();
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

            //should return redirect back with the updated page
            return redirect()->back()->with([
                'page' => new PageResource($page),
                'forms' => $forms,
                'flows' => $flows,
                'status' => 'Page updated successfully!'
            ]);

           /* return inertia('Pages/Editor', [
                'page' => new PageResource($page),
                'forms' => $forms,
                'flows' => $flows,
            ]);*/
        }

        // Non-Inertia fallback: regular redirect
        return redirect()->route('pages.edit', $page->id);
    }

    public function destroy(Request $request, Page $page)
    {
        $selectedInstanceId = null;
        if ($request->user() && method_exists($request->user(), 'selectedInstance') && $request->user()->selectedInstance()) {
            $selectedInstanceId = $request->user()->selectedInstance()->id;
        }
        if ($page->instance_id != $selectedInstanceId) {
            abort(403);
        }
        $page->delete();

        // Always return an Inertia location to navigate back to the pages list
        return redirect()->route('pages.index');
    }

    /**
     * Ensure $data contains a non-empty 'name' — generate a unique one within the instance when missing.
     * Modifies $data by reference.
     */
    protected function ensurePageName(array &$data, $selectedInstanceId)
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
        } while (Page::where('instance_id', $selectedInstanceId)->where('name', $name)->exists());

        $data['name'] = $name;
    }
}
