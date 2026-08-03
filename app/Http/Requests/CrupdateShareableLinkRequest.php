<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CrupdateShareableLinkRequest extends FormRequest
{
    public function messages(): array
    {
        return [
            'expires_at.date' => 'This is not a valid date.',
        ];
    }

    public function rules(): array
    {
        return [
            'allow_download' => 'boolean',
            'allow_direct' => 'boolean',
            'allow_edit' => 'boolean',
            'expires_at' => 'nullable|date',
            'password' => 'nullable|string',
        ];
    }
}
