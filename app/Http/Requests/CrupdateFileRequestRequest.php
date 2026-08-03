<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CrupdateFileRequestRequest extends FormRequest
{
    public function messages(): array
    {
        return [
            'deadline.date' => 'This is not a valid date.',
        ];
    }

    public function rules(): array
    {
        $titleRules = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'title' => "$titleRules|string|max:250",
            'description' => 'nullable|string|max:2000',
            'folder_id' => 'nullable|integer|exists:file_entries,id',
            'password' => 'nullable|string',
            'deadline' => 'nullable|date',
            'allow_late_uploads' => 'nullable|boolean',
        ];
    }
}
