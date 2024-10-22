<?php

namespace App\Http\Controllers;

use App\Http\Requests\PageRequest;
use App\Http\Resources\PageResource;
use App\Models\Page;
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

        return new PageResource(Page::create($request->validated()));
    }

    public function show(Page $page)
    {
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
        return inertia('Pages/Edit', [
            'page' => new PageResource($page)
        ]);
    }

    public function update(PageRequest $request, Page $page)
    {
        $selectedInstanceId = session('selected_instance');
        if($page->instance_id != $selectedInstanceId){
            abort(403);
        }
        $page->update($request->validated());

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
