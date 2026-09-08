<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $code
 * @property string $purpose
 * @property \Carbon\Carbon $expires_at
 * @property \Carbon\Carbon|null $used_at
 */
class Otp extends Model

{
    protected $table = 'otp_codes';

    use HasFactory;

    public const PURPOSE_REGISTER = 'register';

    public const PURPOSE_PASSWORD_RESET = 'password_reset';

    public const PURPOSE_CHANGE_PASSWORD = 'change_password';

    protected $fillable = [
        'user_id',
        'code',
        'purpose',
        'expires_at',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only unused, unexpired codes.
     */
    public function scopeValid(Builder $query): Builder
    {
        return $query->whereNull('used_at')->where('expires_at', '>', now());
    }
}
