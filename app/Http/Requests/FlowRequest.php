<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FlowRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required'],
            'site_id' => ['nullable'],
            'sequence' => ['nullable'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
