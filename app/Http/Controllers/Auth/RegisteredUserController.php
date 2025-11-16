<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Organization;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),

        ]);

        event(new Registered($user));

        Auth::login($user);

        // Ensure any previously stored "intended" URL (from before registration/login)
        // is cleared so subsequent calls to redirect()->intended() do not send the
        // newly-logged-in user to some protected URL like sites.create.
        session()->forget('url.intended');
        session()->forget('_previous');

        // Automatically create a personal organization for the new user, select it,
        // and redirect to the site creation page.
        if (! $user->organizations()->exists()) {
            $orgName = $user->name . "'s Organization";
            $organization = Organization::create(['name' => $orgName]);
            // attach the user to the new organization
            $organization->users()->attach($user->id);

            // Persist selection into the user's `preferences` JSON column.
            $prefs = $user->preferences ?? [];
            if (is_string($prefs)) {
                $decoded = json_decode($prefs, true);
                $prefs = is_array($decoded) ? $decoded : [];
            }
            $prefs['selected_organization_id'] = $organization->id;
            // clear any selected site
            if (array_key_exists('selected_site_id', $prefs)) {
                unset($prefs['selected_site_id']);
            }
            $user->preferences = $prefs;
            $user->save();

            // Now redirect the user to create a site for their organization
            return redirect()->route('sites.create');
        }

        return redirect()->route('dashboard');
    }
}
