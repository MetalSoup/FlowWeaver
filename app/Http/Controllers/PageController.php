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
        //get logged in user
        $user = auth()->user();
        $pages = Page::where('user_id',$user->id)->get();
        //dd(PageResource::collection($pages));
        return inertia('Pages/Index',[
            'pages' => PageResource::collection($pages)
            ]);
        //return PageResource::collection(Page::all());
    }

    public function store(PageRequest $request)
    {
        return new PageResource(Page::create($request->validated()));
    }

    public function show(Page $page)
    {
        return new PageResource($page);
    }

    public function edit(Page $page)
    {
        return inertia('Pages/Edit', [
            'page' => new PageResource($page)
        ]);
    }

    public function update(PageRequest $request, Page $page)
    {
        $page->update($request->validated());

        return new PageResource($page);
    }

    public function destroy(Page $page)
    {
        $page->delete();

        return response()->json();
    }
}
