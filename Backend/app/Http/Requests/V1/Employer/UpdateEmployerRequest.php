<?php

namespace App\Http\Requests\V1\Employer;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployerRequest extends FormRequest
{
    public function authorize(): bool
    {
        $employer = $this->route('employer');

        return $this->user() !== null && $this->user()->id === $employer->user_id;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'company_name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'website' => ['nullable', 'url'],
            'location' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
