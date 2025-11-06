<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EnsureModelBelongsToSelectedInstance
{
    /**
     * Handle an incoming request.
     * Blocks access if a route-model's instance_id does not match the user's selected instance.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // Determine selected instance id from preferences helper
        $selectedInstanceId = null;
        if ($user && method_exists($user, 'selectedInstance') && $user->selectedInstance()) {
            $selectedInstanceId = $user->selectedInstance()->id;
        }

        // If no selected instance, let CheckInstanceSelectedMiddleware handle redirection earlier in the stack
        // but be defensive here.
        if (!$selectedInstanceId) {
            return redirect()->route('instances.select');
        }

        $params = $request->route() ? $request->route()->parameters() : [];

        foreach ($params as $key => $value) {
            // If this is an Eloquent model instance
            if (is_object($value)) {
                $class = get_class($value);
                $base = class_basename($class);

                // If it's an Instance model, ensure it's the selected instance
                if ($base === 'Instance') {
                    if (property_exists($value, 'id') && ($value->id != $selectedInstanceId)) {
                        abort(403);
                    }
                    continue;
                }

                // If model has instance_id property, ensure it matches selected instance
                if (property_exists($value, 'instance_id')) {
                    if ($value->instance_id != $selectedInstanceId) {
                        abort(403);
                    }
                }

                // Also handle when model may expose getAttribute('instance_id') without property
                if (method_exists($value, 'getAttribute')) {
                    $attr = $value->getAttribute('instance_id');
                    if (!is_null($attr) && $attr != $selectedInstanceId) {
                        abort(403);
                    }
                }
            }

            // If it's a scalar id and the route name indicates an Instance resource, check it
            if (!is_object($value) && Str::endsWith($key, 'instance')) {
                if ((int)$value !== (int)$selectedInstanceId) {
                    abort(403);
                }
            }
        }

        return $next($request);
    }
}

