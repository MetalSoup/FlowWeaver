<?php

namespace App\Policies;

use App\Models\Site;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SitePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // allow viewing list if user belongs to at least one organization
        return $user->organizations()->exists();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Site $site): bool
    {
        $orgId = $site->organization_id;
        if (!$orgId) return false;

        return $user->organizations()->where('id', $orgId)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // allow create only if the user belongs to at least one organization
        return $user->organizations()->exists();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Site $site): bool
    {
        $orgId = $site->organization_id;
        if (!$orgId) return false;

        return $user->organizations()->where('id', $orgId)->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Site $site): bool
    {
        $orgId = $site->organization_id;
        if (!$orgId) return false;

        return $user->organizations()->where('id', $orgId)->exists();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Site $site): bool
    {
        return $this->delete($user, $site);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Site $site): bool
    {
        return $this->delete($user, $site);
    }
}
