<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MediaServeController extends Controller
{
    /**
     * Stream or return a file for the given media item, enforcing site scoping.
     */
    public function show(Media $media, Request $request)
    {
        $user = Auth::user();
        $selectedSite = null;
        if ($user && method_exists($user, 'selectedSite')) {
            $selectedSite = $user->selectedSite();
        }

        if (! $selectedSite) {
            abort(403);
        }

        // Ensure the media belongs to the selected site
        if ((int) $media->site_id !== (int) $selectedSite->id) {
            abort(403);
        }

        $disk = $media->disk ?? config('filesystems.default');

        // Build a list of candidate relative paths to try (best-effort)
        $candidates = [];

        // 1) canonical relative path if available
        try {
            if (method_exists($media, 'getPathRelativeToRoot')) {
                $p = $media->getPathRelativeToRoot();
                if ($p) $candidates[] = $p;
            }
        } catch (\Throwable $_) {
            // ignore
        }

        // 2) try getPath then strip storage prefix
        try {
            $full = $media->getPath();
            if ($full) {
                $storagePrefix = rtrim(str_replace('\\', '/', storage_path('app')), '/');
                $fullNorm = str_replace('\\', '/', $full);
                if (str_starts_with($fullNorm, $storagePrefix)) {
                    $rel = ltrim(substr($fullNorm, strlen($storagePrefix)), '/');
                    if ($rel) $candidates[] = $rel;
                } else {
                    $candidates[] = $fullNorm;
                }
            }
        } catch (\Throwable $_) {
            // ignore
        }

        // 3) common patterns: public/{id}/{file}, {id}/{file}, media/{id}/{file}, just filename
        $fileName = $media->file_name ?? '';
        $id = $media->id;
        if ($fileName) {
            $candidates[] = "public/{$id}/{$fileName}";
            $candidates[] = "{$id}/{$fileName}";
            $candidates[] = "media/{$id}/{$fileName}";
            $candidates[] = $fileName;
        }

        // Normalize candidates and remove empties
        $candidates = array_values(array_filter(array_map(function ($p) {
            return $p ? str_replace('\\', '/', ltrim($p, '/')) : null;
        }, $candidates)));

        $storage = Storage::disk($disk);

        $found = null;
        foreach ($candidates as $candidate) {
            try {
                if ($storage->exists($candidate)) {
                    $found = $candidate;
                    break;
                }
            } catch (\Throwable $e) {
                // log and continue
                Log::debug('MediaServeController exists check failed', ['candidate' => $candidate, 'error' => $e->getMessage()]);
            }
        }

        if (! $found) {
            // log all candidates tried
            Log::warning('MediaServeController: file not found; candidates tried', ['media_id' => $media->id, 'disk' => $disk, 'candidates' => $candidates]);
            abort(404);
        }

        // Stream the file with inline disposition so it can preview in-browser
        return $storage->response($found, 200, [
            'Content-Disposition' => 'inline; filename="' . ($media->file_name ?? basename($found)) . '"',
            // Allow public caching for 7 days (604800 seconds) so CDNs and browsers can cache
            'Cache-Control' => 'public, max-age=604800',
        ]);
    }

    /**
     * Debug helper: return the candidate paths that would be tried and whether they exist.
     */
    public function debug(Media $media)
    {
        $disk = $media->disk ?? config('filesystems.default');

        $candidates = [];

        try {
            if (method_exists($media, 'getPathRelativeToRoot')) {
                $p = $media->getPathRelativeToRoot();
                if ($p) $candidates[] = $p;
            }
        } catch (\Throwable $_) {}

        try {
            $full = $media->getPath();
            if ($full) {
                $storagePrefix = rtrim(str_replace('\\', '/', storage_path('app')), '/');
                $fullNorm = str_replace('\\', '/', $full);
                if (str_starts_with($fullNorm, $storagePrefix)) {
                    $rel = ltrim(substr($fullNorm, strlen($storagePrefix)), '/');
                    if ($rel) $candidates[] = $rel;
                } else {
                    $candidates[] = $fullNorm;
                }
            }
        } catch (\Throwable $_) {}

        $fileName = $media->file_name ?? '';
        $id = $media->id;
        if ($fileName) {
            $candidates[] = "public/{$id}/{$fileName}";
            $candidates[] = "{$id}/{$fileName}";
            $candidates[] = "media/{$id}/{$fileName}";
            $candidates[] = $fileName;
        }

        $candidates = array_values(array_filter(array_map(function ($p) {
            return $p ? str_replace('\\', '/', ltrim($p, '/')) : null;
        }, $candidates)));

        $storage = Storage::disk($disk);

        $results = [];
        foreach ($candidates as $candidate) {
            try {
                $exists = $storage->exists($candidate);
            } catch (\Throwable $e) {
                $exists = false;
            }
            $results[] = ['path' => $candidate, 'exists' => $exists];
        }

        return response()->json(['disk' => $disk, 'candidates' => $results]);
    }

    /**
     * Serve a media file publicly via a temporary signed URL.
     */
    public function public(Media $media, Request $request)
    {
        // Allow public access only if the URL is signed and valid
        if (! $request->hasValidSignature()) {
            abort(403);
        }

        // Serve the file using the same logic as `show` but without auth/site checks
        $disk = $media->disk ?? config('filesystems.default');

        $candidates = [];
        try {
            if (method_exists($media, 'getPathRelativeToRoot')) {
                $p = $media->getPathRelativeToRoot();
                if ($p) $candidates[] = $p;
            }
        } catch (\Throwable $_) {}

        try {
            $full = $media->getPath();
            if ($full) {
                $storagePrefix = rtrim(str_replace('\\', '/', storage_path('app')), '/');
                $fullNorm = str_replace('\\', '/', $full);
                if (str_starts_with($fullNorm, $storagePrefix)) {
                    $rel = ltrim(substr($fullNorm, strlen($storagePrefix)), '/');
                    if ($rel) $candidates[] = $rel;
                } else {
                    $candidates[] = $fullNorm;
                }
            }
        } catch (\Throwable $_) {}

        $fileName = $media->file_name ?? '';
        $id = $media->id;
        if ($fileName) {
            $candidates[] = "public/{$id}/{$fileName}";
            $candidates[] = "{$id}/{$fileName}";
            $candidates[] = "media/{$id}/{$fileName}";
            $candidates[] = $fileName;
        }

        $candidates = array_values(array_filter(array_map(function ($p) { return $p ? str_replace('\\', '/', ltrim($p, '/')) : null; }, $candidates)));

        $storage = Storage::disk($disk);
        $found = null;
        foreach ($candidates as $candidate) {
            try {
                if ($storage->exists($candidate)) { $found = $candidate; break; }
            } catch (\Throwable $e) { Log::debug('MediaServeController.public exists check failed', ['candidate' => $candidate, 'error' => $e->getMessage()]); }
        }

        if (! $found) {
            Log::warning('MediaServeController.public: file not found; candidates tried', ['media_id' => $media->id, 'disk' => $disk, 'candidates' => $candidates]);
            abort(404);
        }

        return $storage->response($found, 200, [
            'Content-Disposition' => 'inline; filename="' . ($media->file_name ?? basename($found)) . '"',
            'Cache-Control' => 'public, max-age=604800',
        ]);
    }
}
