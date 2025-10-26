<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubmissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Allow public submissions for now; adjust authorization if needed.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'flow_id' => ['nullable', 'integer'],
            'step' => ['nullable', 'string'],
            'data' => ['nullable', 'array'],
            'data.*' => ['nullable'],
            // Optional contact fields
            'email' => ['nullable', 'string', 'email'],
            'phone' => ['nullable', 'string'],
        ];
    }
}
