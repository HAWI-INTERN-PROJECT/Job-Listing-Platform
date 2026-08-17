<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'username' => fake()->unique()->userName(),
            'role' => \App\Enums\UserRole::EMPLOYEE,
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * State for Admin user.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => \App\Enums\UserRole::ADMIN,
        ]);
    }

    /**
     * State for Employer user.
     */
    public function employer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => \App\Enums\UserRole::EMPLOYER,
        ]);
    }

    /**
     * State for Employee user.
     */
    public function employee(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => \App\Enums\UserRole::EMPLOYEE,
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
