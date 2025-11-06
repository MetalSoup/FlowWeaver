<?php

namespace App\Http\Middleware;

use App\DefaultFields;
use App\Models\Field;
use App\Models\Instance;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
        $user_preferences = $request->user() ? $request->user()->preferences : [];


        // Resolve selected instance and organization IDs exclusively from user preferences.
        $selectedId = null;
        $selectedOrgId = null;
        if ($user_preferences && isset($user_preferences['selected_instance_id'])) {
            $selectedId = $user_preferences['selected_instance_id'];
        }
        if ($user_preferences && isset($user_preferences['selected_organization_id'])) {
            $selectedOrgId = $user_preferences['selected_organization_id'];
        }

        // If no organization is selected but the user belongs to organizations, auto-select the first one.
         if (!$selectedOrgId && $request->user()) {
             $firstOrg = $request->user()->organizations()->select('id')->first();
             if ($firstOrg) {
                 $selectedOrgId = $firstOrg->id;

                // Persist to user record for longer-term persistence (preferences JSON).
                $user = $request->user();
                $prefs = $user->preferences ?? [];
                if (is_string($prefs)) {
                    $decoded = json_decode($prefs, true);
                    $prefs = is_array($decoded) ? $decoded : [];
                }
                $prefs['selected_organization_id'] = $selectedOrgId;
                $user->preferences = $prefs;
                $user->save();
             }
         }

         return [
             ...parent::share($request),
             'auth' => [
                 'user' => $request->user(),
             ],
             'ziggy' => fn() => [
                 ...(new Ziggy)->toArray(),
                 'location' => $request->url(),
             ],
             // Expose session flash data to Inertia front-end (e.g. submission_id)
             'flash' => fn() => [
                 'success' => $request->session()->get('success'),
                 'submission_id' => $request->session()->get('submission_id'),
                 'data' => $request->session()->get('data'),
             ],
// prepend default fields to 'fields' prop

            // fields depend on the resolved selected instance id
            'fields' => fn() => $this->getAdditionalFields($selectedId),
            // expose selected instance as an object with id and name, or null
            'selected_instance' => fn() => $selectedId ? optional(Instance::where('id', $selectedId)->select('id',
                'name')->first())->toArray() : null,
            // expose selected organization as an object with id and name, or null
            'selected_organization' => fn() => $selectedOrgId ? optional(Organization::where('id',
                $selectedOrgId)->select('id', 'name')->first())->toArray() : null,
            'flowID' => $request->route()->parameters['flow']['id'] ?? null,
            //'flows' => $request->user()->flows,
            // Read the latest saved preferences from the user at evaluation time
            'preferences' => fn() => $request->user() ? $request->user()->preferences : []


         ];
    }

    protected function getAdditionalFields($instanceId = null): array
    {

        $default_fields = DefaultFields::getFields()->toArray();
        $fields = array_merge($default_fields, Field::where('instance_id', $instanceId)->get()->toArray());
        return $fields;
    }
}
