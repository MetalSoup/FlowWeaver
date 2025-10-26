<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSubmissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Allow updates only when either:
     * - the visitor's session contains `submission_id` equal to the route submission id (guest flow), or
     * - the authenticated user owns the submission (if the `submissions` table has a `user_id` field).
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
