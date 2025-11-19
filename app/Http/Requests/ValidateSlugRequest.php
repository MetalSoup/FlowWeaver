<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidateSlugRequest extends FormRequest
{
    /**
     * Prepare the data for validation.
     * Normalize slug: lowercase, trim, convert spaces to hyphens, collapse multiple separators
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('slug')) {
            $s = strtolower(trim((string) $this->input('slug')));
            // convert any whitespace to hyphen
            $s = preg_replace('/\s+/', '-', $s);
            // replace disallowed characters with hyphen (allow a-z, 0-9, hyphen, underscore)
            $s = preg_replace('/[^a-z0-9\-_]+/', '-', $s);
            // collapse multiple hyphens or underscores
            $s = preg_replace('/-+/', '-', $s);
            $s = preg_replace('/_+/', '_', $s);
            // trim leading/trailing hyphens/underscores
            $s = preg_replace('/(^[-_]+|[-_]+$)/', '', $s);

            $this->merge(['slug' => $s]);
        }
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     * We accept a candidate slug and optional site_id and page_id.
     */
    public function rules(): array
    {
        return [
            // allow lowercase letters, numbers, hyphens and underscores, no leading/trailing separators
            'slug' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/'],
            'site_id' => ['nullable', 'integer', 'exists:sites,id'],
            'page_id' => ['nullable', 'integer', 'exists:pages,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'slug.required' => 'A slug is required.',
            'slug.string' => 'Slug must be a string.',
            'slug.max' => 'Slug must not exceed :max characters.',
            'slug.regex' => 'Slug may only contain lowercase letters, numbers, hyphens and underscores, and cannot start or end with a hyphen or underscore.',
            'site_id.exists' => 'Site not found.',
            'page_id.exists' => 'Page not found.',
        ];
    }
}
