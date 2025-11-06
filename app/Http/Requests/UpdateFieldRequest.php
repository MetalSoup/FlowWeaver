<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFieldRequest extends FormRequest
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
        $instanceId = $this->session()->get('selected_instance');
        // If route model binding provided a field, get its id for ignoring uniqueness
        $fieldId = $this->route('field') ? $this->route('field')->id : null;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[A-Za-z][A-Za-z0-9_-]*$/',
                Rule::unique('fields')->ignore($fieldId)->where(function ($query) use ($instanceId) {
                    return $query->where('instance_id', $instanceId);
                }),
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
            'options' => ['nullable', 'array'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
