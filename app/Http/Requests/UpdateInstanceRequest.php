<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Instance;

class UpdateInstanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only allow authenticated users who belong to this instance's organization to update it.
        $user = $this->user();
        if (!$user) return false;

        $instance = $this->route('instance');
        if (!$instance || !($instance instanceof Instance)) return false;

        $orgId = $instance->organization_id;
        if (!$orgId) return false;

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
            'organization_id' => ['nullable', 'exists:organizations,id'],
        ];
    }
}
