<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PageRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['nullable'],
            'content' => ['nullable'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
