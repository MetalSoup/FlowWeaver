<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInstanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only allow authenticated users who belong to the target organization to create an instance for it.
        $user = $this->user();
        if (!$user) return false;

        // Prefer an explicit organization_id supplied in the request, but fall back to the user's
        // currently selected organization. The controller sets organization_id from the user's
        // selected_organization_id, however the FormRequest's authorize runs before the controller
        // so we must accept the selected organization here to avoid an unauthorized 403.
        $orgId = $this->input('organization_id') ?: ($user->selected_organization_id ?? null);
        if (!$orgId) return false;

        // Check membership
        return $user->organizations()->where('id', $orgId)->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],

        ];
    }
}
