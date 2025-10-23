<?php

namespace App\Http\Controllers;

use App\Http\Requests\PageRequest;
use App\Http\Resources\PageResource;
use App\Models\Flow;
use App\Models\Page;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PageController extends Controller
{
    public function index()
    {
        $selectedInstanceId = session('selected_instance');
        $pages = Page::where('instance_id',$selectedInstanceId)->get();
        //dd(PageResource::collection($pages));
        return inertia('Pages/Index',[
            'pages' => PageResource::collection($pages)
            ]);
        //return PageResource::collection(Page::all());
    }

    public function store(PageRequest $request)
    {
        $selectedInstanceId = session('selected_instance');
        $data = $request->validated();
        $data['instance_id'] = $selectedInstanceId;
        Log::info($data);

        // create using the merged data (including instance_id)
        $page = Page::create($data);
        return new PageResource($page);
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

    public function edit(Page $page)
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
        return inertia('Pages/EditorV2', [
            'page' => new PageResource($page),
            'forms' => $forms,
            'flows' => $flows
        ]);
    }

    // Show the editor for creating a new page
    public function create()
    {
        $selectedInstanceId = session('selected_instance');
        if (!$selectedInstanceId) {
            return redirect()->route('instances.select');
        }

        $flows = Flow::where('instance_id', $selectedInstanceId)->select("id", "name")->get();

        // Simple empty forms structure for create view
        $forms = [];

        return inertia('Pages/EditorV2', [
            'page' => null,
            'forms' => $forms,
            'flows' => $flows,
        ]);
    }

    // New editor route for the Craft.js editor (explicit)
    public function editV2(Page $page)
    {
        $selectedInstanceId = session('selected_instance');
        if ($page->instance_id != $selectedInstanceId) {
            abort(403);
        }

        $flows = Flow::where('instance_id', $selectedInstanceId)->select('id', 'name')->get();

        // prepare forms array similarly to edit()
        $page_flows = [["id"=>3, "start"=>'']];
        $forms = [];
        foreach ($page_flows as $flow) {
            $flow_id = $flow['id'];
            $nodes = collect(Flow::find($flow['id'])->sequence['nodes']);
            $forms[$flow_id] = $nodes->where('type', 'Form')->map(function ($n) {
                return [
                    'id' => data_get($n, 'id'),
                    'name' => data_get($n, 'name'),
                ];
            })->values()->toArray();
        }

        return inertia('Pages/EditorV2', [
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
        //dd($request);
        $data = $request->validated();

        $data['content'] = $request->input('content'); // Save the content
        $page->update($data);

        return new PageResource($page);
    }

    public function destroy(Page $page)
    {
        $selectedInstanceId = session('selected_instance');
        if($page->instance_id != $selectedInstanceId){
            abort(403);
        }
        $page->delete();

        return response()->json();
    }
}
