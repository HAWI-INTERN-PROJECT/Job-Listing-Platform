<?php

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_populates_expected_tables(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseHas('users', [
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);

        $this->assertDatabaseCount('job_categories', 8);
        $this->assertDatabaseCount('employers', 5);
        $this->assertDatabaseCount('jobs', 15);
        $this->assertDatabaseCount('job_seekers', 10);
    }
}
