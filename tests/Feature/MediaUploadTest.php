<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use App\Models\User;
use App\Models\Site;

class MediaUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_upload_file_and_media_is_scoped_to_site()
    {
        Storage::fake(config('medialibrary.disk_name'));

        // create user, organization, and site
        $user = User::factory()->create();
        $site = Site::factory()->create(['organization_id' => $user->selectedOrganization()->id ?? 1]);

        // persist user's selected site preference if method exists
        if (method_exists($user, 'storeSelectedSite')) {
            $user->storeSelectedSite($site->id);
        } else {
            // fallback: assume selectedSite returns the first site
        }

        $this->actingAs($user);

        $file = UploadedFile::fake()->create('document.pdf', 100);

        $response = $this->post(route('media.store'), ['file' => $file, 'collection' => 'files']);

        $response->assertStatus(302);

        // Assert a media record exists and is associated with the site
        $this->assertDatabaseHas('media', [
            'file_name' => 'document.pdf',
            'collection_name' => 'files',
            'site_id' => $site->id,
        ]);

        // Assert file stored
        Storage::disk(config('medialibrary.disk_name'))->assertExists('media');
    }
}

