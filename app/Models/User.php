<?php

namespace App\Models;



use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use App\Models\Site;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasRoles;
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        // migrated into `preferences` JSON
        'preferences',
        // note: selected_site_id and selected_organization_id were removed in favor of `preferences`
     ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(Organization::class, 'organization_user', 'user_id', 'organization_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'preferences' => 'array',
        ];
    }


    /**
     * Convenience helpers to fetch the related Site/Organization models from `preferences`.
     * Note: these return model sites (or null), not Eloquent relation objects.
     */
    public function selectedSite()
    {
        $prefs = $this->preferences ?? null;
        if (is_string($prefs)) {
            $prefs = json_decode($prefs, true);
        }
        $id = is_array($prefs) && array_key_exists('selected_site_id', $prefs) ? $prefs['selected_site_id'] : null;
        return $id ? Site::find($id) : null;
    }

    public function selectedOrganization()
    {
        $prefs = $this->preferences ?? null;
        if (is_string($prefs)) {
            $prefs = json_decode($prefs, true);
        }
        $id = is_array($prefs) && array_key_exists('selected_organization_id', $prefs) ? $prefs['selected_organization_id'] : null;
        return $id ? Organization::find($id) : null;
    }

}
