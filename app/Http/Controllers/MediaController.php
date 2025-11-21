<?php

namespace App\Http\Controllers;

use App\Helpers\SiteContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Site;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\URL;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $site = $user->selectedSite();

        if (! $site) {
            abort(403);
        }

        $host = $request->getSchemeAndHttpHost();

        $images = $site->getMedia('images')->map(function ($m) use ($host) {
            $publicUrl = URL::temporarySignedRoute('media.public', now()->addDays(7), ['media' => $m->id]);
            return [
                'id' => $m->id,
                'file_name' => $m->file_name,
                'mime_type' => $m->mime_type,
                // Ensure absolute URL for the secure endpoint
                'url' => $host . route('media.file', $m->id, false),
                'public_url' => $publicUrl,
                'size' => $m->size,
                'custom_properties' => $m->custom_properties,
            ];
        });

        $files = $site->getMedia('files')->map(function ($m) use ($host) {
            $publicUrl = URL::temporarySignedRoute('media.public', now()->addDays(7), ['media' => $m->id]);
            return [
                'id' => $m->id,
                'file_name' => $m->file_name,
                'mime_type' => $m->mime_type,
                'url' => $host . route('media.file', $m->id, false),
                'public_url' => $publicUrl,
                'size' => $m->size,
                'custom_properties' => $m->custom_properties,
            ];
        });

        return Inertia::render('Media/Index', [
            'images' => $images,
            'files' => $files,
        ]);
    }

    public function apiIndex(Request $request)
    {
        $user = Auth::user();
        $site = $user->selectedSite();

        if (! $site) {
            return response()->json(['error' => 'No selected site'], 403);
        }

        $host = $request->getSchemeAndHttpHost();

        $images = $site->getMedia('images')->map(function ($m) use ($host) {
            $publicUrl = URL::temporarySignedRoute('media.public', now()->addDays(7), ['media' => $m->id]);
            return [
                'id' => $m->id,
                'file_name' => $m->file_name,
                'mime_type' => $m->mime_type,
                'url' => $host . route('media.file', $m->id, false),
                'public_url' => $publicUrl,
                'size' => $m->size,
                'custom_properties' => $m->custom_properties,
            ];
        })->values();

        $files = $site->getMedia('files')->map(function ($m) use ($host) {
            $publicUrl = URL::temporarySignedRoute('media.public', now()->addDays(7), ['media' => $m->id]);
            return [
                'id' => $m->id,
                'file_name' => $m->file_name,
                'mime_type' => $m->mime_type,
                'url' => $host . route('media.file', $m->id, false),
                'public_url' => $publicUrl,
                'size' => $m->size,
                'custom_properties' => $m->custom_properties,
            ];
        })->values();

        return response()->json(['images' => $images, 'files' => $files]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $site = $user->selectedSite();


        if (! $site) {
            abort(403);
        }

        $collection = $request->input('collection', 'files');

        if ($collection === 'images') {
            $rules = ['file' => 'required|image|max:5120'];
        } else {
            $rules = ['file' => 'required|file|max:10240'];
        }

        $validated = $request->validate($rules);

        // ensure SiteContext is set for the duration of this request
        SiteContext::set($site->id);

        // Force use of the public disk so uploaded files are accessible via /storage
        // NOTE: ensure `php artisan storage:link` has been run so public/storage points to storage/app/public
        $diskToUse = 'public';

        $media = $site->addMediaFromRequest('file')
            ->withProperties(['site_id' => $site->id])
            ->toMediaCollection($collection, $diskToUse);

        // clear SiteContext
        SiteContext::clear();

        $publicUrl = URL::temporarySignedRoute('media.public', now()->addDays(7), ['media' => $media->id]);

        return back()->with(['success' => true, 'media' => [
            'id' => $media->id,
            'file_name' => $media->file_name,
            'mime_type' => $media->mime_type,
            'url' => $media->getFullUrl(),
            'public_url' => $publicUrl,
        ]]);
    }
}
