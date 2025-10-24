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

    public function index()
    {
        $selectedInstanceId = session('selected_instance');
        // Paginate pages belonging to the selected instance
        $pages = Page::where('instance_id', $selectedInstanceId)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Return Inertia page with a paginated resource collection. The frontend
        // should expect `pages.data` for rows and `pages.meta`/`pages.links` for
        // pagination controls.
        return inertia('Pages/Index', [
            'pages' => PageResource::collection($pages),
        ]);
    }

    public function store(PageRequest $request)
    {
        $selectedInstanceId = session('selected_instance');

        // If no instance is selected, send the user to instance selection (always Inertia)
        if (!$selectedInstanceId) {
            return Inertia::location(route('instances.select'));
        }

        $data = $request->validated();
        $data['instance_id'] = $selectedInstanceId;

        // Ensure we have an authenticated user because pages.user_id is required
        if (!auth()->check()) {
            abort(403, 'Authentication required to create pages');
        }
        $data['user_id'] = auth()->id();

        // If no name provided, generate a unique default name within the instance.
        if (empty(trim((string) ($data['name'] ?? '')))) {
            $base = 'Untitled Page';
            $n = 0;
            do {
                $n++;
                $name = $n === 1 ? $base : $base . ' #' . $n;
            } while (Page::where('instance_id', $selectedInstanceId)->where('name', $name)->exists());
            $data['name'] = $name;
        }

        Log::info($data);

        // create using the merged data (including instance_id and name)
        $page = Page::create($data);

        // Always use Inertia to navigate to the edit page
        return Inertia::location(route('pages.edit', $page->id));
    }

    public function show(Page $page)
    {
        //dd($page);
        $page_content = $page->content;
        // replace all instances of the string '[ki-path:1]' with 'ki-path-1'
        //$page_content = str_replace('[ki-path:1]', 'ki-path-1', $page_content);
        //dd($page_content);

        return inertia('Pages/Show', [
            'page' => new PageResource($page)
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
 }*/
    // Show the editor for creating a new page
    public function create()
    {
        $selectedInstanceId = session('selected_instance');
        if (!$selectedInstanceId) {
            return Inertia::location(route('instances.select'));
        }

        $flows = Flow::where('instance_id', $selectedInstanceId)->select("id", "name")->get();

        // Simple empty forms structure for create view
        $forms = [];


        return inertia('Pages/Editor', [
            'page' => null,
            'forms' => $forms,
            'flows' => $flows,
        ]);
    }

    // New editor route for the Craft.js editor (explicit)
    public function edit(Page $page)
    {
        $selectedInstanceId = session('selected_instance');
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

        return inertia('Pages/Editor', [
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
        $selectedInstanceId = session('selected_instance');
        if ($page->instance_id != $selectedInstanceId) {
            abort(403);
        }
        Log::info($request);
        $data = $request->validated();

        $data['content'] = $request->input('content'); // Save the content
        $page->update($data);

        // Always use Inertia to navigate to the edit page after update
        return Inertia::location(route('pages.edit', $page->id));
    }

    public function destroy(Request $request, Page $page)
    {
        $selectedInstanceId = session('selected_instance');
        if($page->instance_id != $selectedInstanceId){
            abort(403);
        }
        $page->delete();

        // Always return an Inertia location to navigate back to the pages list
        return Inertia::location(route('pages.index'));
    }
}
