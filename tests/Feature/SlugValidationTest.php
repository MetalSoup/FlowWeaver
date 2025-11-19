<?php

namespace Tests\Feature;

/*use App\Models\Page;*/
use App\Models\Site;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SlugValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_slug_is_accepted()
    {
        $user = User::factory()->create();
        $site = Site::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/slug/validate', ['slug' => 'hello-world', 'site_id' => $site->id])
            ->assertStatus(200)
            ->assertJson(['valid' => true]);
    }

    public function test_invalid_format_rejected()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/slug/validate', ['slug' => 'Invalid Slug!'])
            ->assertStatus(422)
            ->assertJsonFragment(['message' => 'Slug may only contain lowercase letters, numbers and hyphens, and cannot start or end with a hyphen.']);
    }

    public function test_duplicate_slug_rejected_within_site()
    {
        $user = User::factory()->create();
        $site = Site::factory()->create();
        /*$page = Page::factory()->create(['site_id' => $site->id, 'slug' => 'existing-page']);*/

        $this->actingAs($user)
            ->postJson('/api/slug/validate', ['slug' => 'existing-page', 'site_id' => $site->id])
            ->assertStatus(422)
            ->assertJson(['valid' => false]);
    }

    public function test_reserved_slug_rejected()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/slug/validate', ['slug' => 'login'])
            ->assertStatus(422)
            ->assertJson(['valid' => false]);
    }
}

