<?php

namespace App\Helpers;

use Illuminate\Support\Facades\URL;
use App\Models\Media;

class MediaRenderer
{
    /**
     * Replace media references in a Craft.js serialized JSON structure with fresh signed URLs.
     * It will walk the nodes map and for nodes that include a media_id prop, it will add/replace
     * the `public_url` value with a temporary signed URL.
     *
     * @param array|string $content
     * @return string JSON-encoded content ready to be sent to the client
     */
    public static function replaceMediaIdsWithSignedUrls($content)
    {
        if (!$content) return $content;

        // If content is a JSON string, decode it
        $parsed = is_string($content) ? json_decode($content, true) : $content;
        if (json_last_error() !== JSON_ERROR_NONE) {
            // Not JSON — return as-is
            return $content;
        }

        // Craft serialized shapes often have `nodes` map and a `rootNode` key
        $nodes = $parsed['nodes'] ?? ($parsed['state']['nodes'] ?? null);
        if (!is_array($nodes)) {
            // Also handle node-map style (top-level keys are nodes)
            $looksLikeNodeMap = collect($parsed)->filter(function ($v, $k) { return is_array($v) && (isset($v['props']) || isset($v['type'])); })->count() > 0;
            if ($looksLikeNodeMap) {
                $nodes = $parsed;
            } else {
                // nothing to do
                return is_string($content) ? json_encode($parsed) : $parsed;
            }
        }

        foreach ($nodes as $nodeId => $node) {
            try {
                $props = $node['props'] ?? $node['data']['props'] ?? null;
                if (!is_array($props)) continue;
                // If node references media by id, e.g. `media_id` or `media` prop, handle it
                $mediaId = $props['media_id'] ?? $props['media'] ?? null;
                if ($mediaId) {
                    $media = Media::find($mediaId);
                    if ($media) {
                        $signed = URL::temporarySignedRoute('media.public', now()->addDays(7), ['media' => $media->id]);
                        // Place signed URL into props.public_url so front-end can use it directly
                        if (isset($node['props'])) {
                            $node['props']['public_url'] = $signed;
                        } else if (isset($node['data']['props'])) {
                            $node['data']['props']['public_url'] = $signed;
                        }
                        // Also set file_name for convenience
                        if (isset($node['props'])) {
                            $node['props']['file_name'] = $media->file_name;
                        } else if (isset($node['data']['props'])) {
                            $node['data']['props']['file_name'] = $media->file_name;
                        }
                        // Persist back
                        $nodes[$nodeId] = $node;
                    }
                }
            } catch (\Throwable $e) {
                // ignore per-node failures
                continue;
            }
        }

        // Re-insert modified nodes into parsed structure
        if (isset($parsed['nodes'])) {
            $parsed['nodes'] = $nodes;
        } elseif (isset($parsed['state']['nodes'])) {
            $parsed['state']['nodes'] = $nodes;
        } else {
            // node map style: replace with nodes map
            foreach ($nodes as $k => $v) $parsed[$k] = $v;
        }

        return json_encode($parsed);
    }
}

