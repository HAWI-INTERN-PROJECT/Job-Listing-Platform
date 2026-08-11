<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    //

    protected $fillable = ['employer_id', 'title', 'description', 'location', 'status'];
    protected $table = 'job_posts';
    public function employer()
    {
        return $this->belongsTo(Employer::class,);
    }
    public function applications()
    {
        return $this->hasMany(Application::class);
    }
}
