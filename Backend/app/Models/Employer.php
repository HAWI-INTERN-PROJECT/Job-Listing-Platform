<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employer extends Model
{
    //

    protected $fillable = [
        'user_id',
        'company_name',
        'company_logo',
        'description',
        'location',
        'status',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function jobs()
    {
        return $this->hasMany(Job::class);
    }
}
