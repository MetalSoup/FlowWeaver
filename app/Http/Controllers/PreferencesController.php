<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class PreferencesController extends Controller
{
    /**
     * Update user preferences (partial merge).
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'preferences' => ['required', 'array'],
        ]);

        $user = $request->user();

        $existing = $user->preferences ?? [];
        if (is_string($existing)) {
            $decoded = json_decode($existing, true);
            $existing = is_array($decoded) ? $decoded : [];
        }

        $new = array_merge($existing, $validated['preferences']);

        $user->preferences = $new;
        $user->save();

        // ALWAYS return inertia response.
       return Redirect::back()->with('preferences', $new);

    }
}
