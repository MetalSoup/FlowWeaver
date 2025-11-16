<?php

namespace Tests\Feature;

use App\Models\Site;
use App\Models\Page;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_requires_authentication()
    {
        $response = $this->post('/pages', ['content' => json_encode(['ROOT' => []])]);

        // Guest requests are redirected to the login page (302)
        $response->assertStatus(302);
    }

    public function test_store_returns_inertia_location_and_creates_page()
    {
        $user = User::factory()->create();
        $instance = Site::factory()->create();

        $response = $this->actingAs($user)
            ->withHeader('X-Inertia', 'true')
            ->withSession(['selected_instance' => $instance->id])
            ->post('/pages', ['content' => json_encode(['ROOT' => []])]);

        // Accept either Inertia::location (409) or a normal redirect (302)
        $this->assertTrue(in_array($response->getStatusCode(), [302, 409]), 'Expected 302 or 409 response status');

        $loc = $response->headers->get('X-Inertia-Location') ?? $response->headers->get('Location');
        $this->assertNotEmpty($loc);

        // The location should point to the pages edit route with a numeric id (allow optional /dashboard prefix)
        $path = parse_url($loc, PHP_URL_PATH);
        $this->assertMatchesRegularExpression('#(?:/dashboard)?/pages/\d+/edit$#', $path);

        // Verify a page was actually created in the DB for the selected instance
        $this->assertDatabaseHas('pages', ['instance_id' => $instance->id]);
    }

    public function test_update_returns_inertia_location()
    {
        $user = User::factory()->create();
        $instance = Site::factory()->create();

        $page = Page::factory()->create([
            'instance_id' => $instance->id,
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($user)
            ->withHeader('X-Inertia', 'true')
            ->withSession(['selected_instance' => $instance->id])
            ->put("/pages/{$page->id}", ['content' => json_encode(['ROOT' => ['updated' => true]])]);

        // Accept either Inertia::location (409) or a normal redirect (302)
        $this->assertTrue(in_array($response->getStatusCode(), [302, 409]), 'Expected 302 or 409 response status');
        $loc = $response->headers->get('X-Inertia-Location') ?? $response->headers->get('Location');
        $this->assertNotEmpty($loc);

        $path = parse_url($loc, PHP_URL_PATH);
        // Allow optional /dashboard prefix
        $this->assertMatchesRegularExpression('#(?:/dashboard)?/pages/' . $page->id . '/edit$#', $path);
    }

    public function test_destroy_returns_inertia_location()
    {
        $user = User::factory()->create();
        $instance = Site::factory()->create();

        $page = Page::factory()->create([
            'instance_id' => $instance->id,
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($user)
            ->withHeader('X-Inertia', 'true')
            ->withSession(['selected_instance' => $instance->id])
            ->delete("/dashboard/pages/{$page->id}");

        // Accept either 302 or 409, but primarily ensure we have a redirect header
        $this->assertTrue(in_array($response->getStatusCode(), [302, 409, 200]), 'Expected 302, 409, or 200 response status');
        $loc = $response->headers->get('X-Inertia-Location') ?? $response->headers->get('Location');
        $this->assertNotEmpty($loc);

        $path = parse_url($loc, PHP_URL_PATH);
        // Allow optional /dashboard prefix and optional trailing slash
        $this->assertMatchesRegularExpression('#(?:/dashboard)?/pages/?$#', $path);

        // Ensure the page is soft-deleted
        $this->assertSoftDeleted('pages', ['id' => $page->id]);
    }
}
