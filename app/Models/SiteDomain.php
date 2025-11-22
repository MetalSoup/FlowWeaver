<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteDomain extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_id',
        'domain',
        'default_page_id',
        'not_found_page_id',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class, 'site_id');
    }

    public function defaultPage(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'default_page_id');
    }

    public function notFoundPage(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'not_found_page_id');
    }
}
