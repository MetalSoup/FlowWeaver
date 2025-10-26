<?php

namespace App\Http\Middleware;

use App\DefaultFields;
use App\Models\Field;
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
            ],
// prepend default fields to 'fields' prop

            'fields' => fn() => $this->getAdditionalFields(),
            'selected_instance' => fn () => session('selected_instance'),
            'flowID' => $request->route()->parameters['flow']['id'] ?? null,
            //'flows' => $request->user()->flows,



        ];
    }

    protected function getAdditionalFields(): array
    {

        $default_fields = DefaultFields::getFields()->toArray();
        $fields = array_merge($default_fields, Field::where('instance_id', session('selected_instance'))->get()->toArray());
        return $fields;
    }
}
