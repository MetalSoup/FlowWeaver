<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFieldRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Instance is stored in session
        $instanceId = $this->session()->get('selected_instance');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                // start with a letter, then letters, numbers, underscore or hyphen
                'regex:/^[A-Za-z][A-Za-z0-9_-]*$/',
                // unique per instance
                Rule::unique('fields')->where(function ($query) use ($instanceId) {
                    return $query->where('instance_id', $instanceId);
                }),
                // must not collide with predefined default fields
                function ($attribute, $value, $fail) {
                    if (method_exists(\App\DefaultFields::class, 'getFields')) {
                        $defaults = \App\DefaultFields::getFields()->pluck('name')->all();
                        if (in_array($value, $defaults, true)) {
                            $fail('The ' . $attribute . ' conflicts with a predefined field name. Please choose a different one.');
                        }
                    }
                },
            ],
            'label' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:255'],
            'instance_id' => ['nullable'],
            'options' => ['nullable', 'array'],
        ];
    }
}
