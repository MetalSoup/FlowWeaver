<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PageRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string'],
            'content' => ['nullable'],
            'slug' => ['nullable', 'string'],
            'options' => ['nullable', 'array'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
