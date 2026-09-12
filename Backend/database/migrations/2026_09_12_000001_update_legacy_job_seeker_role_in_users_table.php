<?php

declare(strict_types=1);

use App\Enums\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'role')) {
            DB::table('users')
                ->where('role', 'job_seeker')
                ->update(['role' => UserRole::EMPLOYEE->value]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Legacy role string does not need to be restored.
    }
};
