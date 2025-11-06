<?php

namespace App\Http\Middleware;

use App\DefaultFields;
use App\Models\Field;
use App\Models\Instance;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cookie;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Resolve selected instance id in order: user's saved value, session, cookie
        $selectedId = null;
        if ($request->user() && isset($request->user()->selected_instance_id) && $request->user()->selected_instance_id) {
            $selectedId = $request->user()->selected_instance_id;
        } elseif (session('selected_instance')) {
            $selectedId = session('selected_instance');
        } elseif ($request->cookie('selected_instance')) {
            $selectedId = $request->cookie('selected_instance');
        }

        // Resolve selected organization id in order: user's saved value, session, cookie
        $selectedOrgId = null;
        if ($request->user() && isset($request->user()->selected_organization_id) && $request->user()->selected_organization_id) {
            $selectedOrgId = $request->user()->selected_organization_id;
        } elseif (session('selected_organization')) {
            $selectedOrgId = session('selected_organization');
        } elseif ($request->cookie('selected_organization')) {
            $selectedOrgId = $request->cookie('selected_organization');
        }

        // If no organization is selected but the user belongs to organizations, auto-select the first one.
        if (!$selectedOrgId && $request->user()) {
            $firstOrg = $request->user()->organizations()->select('id')->first();
            if ($firstOrg) {
                $selectedOrgId = $firstOrg->id;

                // Persist selection to session so subsequent requests see it
                $request->session()->put('selected_organization', $selectedOrgId);

                // Persist to user record for longer-term persistence
                $user = $request->user();
                $user->selected_organization_id = $selectedOrgId;
                $user->save();

                // Also persist as a cookie for longer-term client-side persistence (30 days)
                $secure = config('session.secure', false);
                $cookie = Cookie::make('selected_organization', $selectedOrgId, 60 * 24 * 30, null, null, $secure, true, false, 'lax');
                Cookie::queue($cookie);
             }
         }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            // Expose session flash data to Inertia front-end (e.g. submission_id)
            'flash' => fn () => [
                'success' => $request->session()->get('success'),
                'submission_id' => $request->session()->get('submission_id'),
                'data' => $request->session()->get('data'),
            ],
// prepend default fields to 'fields' prop

            // fields depend on the resolved selected instance id
            'fields' => fn() => $this->getAdditionalFields($selectedId),
            // expose selected instance as an object with id and name, or null
            'selected_instance' => fn () => $selectedId ? optional(Instance::where('id', $selectedId)->select('id', 'name')->first())->toArray() : null,
            // expose selected organization as an object with id and name, or null
            'selected_organization' => fn () => $selectedOrgId ? optional(Organization::where('id', $selectedOrgId)->select('id', 'name')->first())->toArray() : null,
            'flowID' => $request->route()->parameters['flow']['id'] ?? null,
            //'flows' => $request->user()->flows,



        ];
    }

    protected function getAdditionalFields($instanceId = null): array
    {

        $default_fields = DefaultFields::getFields()->toArray();
        $fields = array_merge($default_fields, Field::where('instance_id', $instanceId)->get()->toArray());
        return $fields;
    }
}
