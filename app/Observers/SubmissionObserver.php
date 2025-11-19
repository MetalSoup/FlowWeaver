<?php

namespace App\Observers;

use App\Models\Submission;
use App\Models\Contact;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class SubmissionObserver
{
    /**
     * Handle the Submission "saved" event.
     */
    public function saved(Submission $submission): void
    {
        $email = $submission->normalizedEmail();
        if (empty($email)) {
            // nothing to do
            return;
        }

        $payload = $submission->data ?? [];

        $data = [
            'email' => $email,
            'phone' => $submission->normalizedPhone(),
            'data' => $payload,
            'first_name' => $payload['first_name'] ?? $payload['firstName'] ?? $payload['firstname'] ?? null,
            'last_name' => $payload['last_name'] ?? $payload['lastName'] ?? $payload['lastname'] ?? null,
            'address' => $payload['address'] ?? null,
            'street' => $payload['street'] ?? null,
            'city' => $payload['city'] ?? null,
            'state' => $payload['state'] ?? null,
            'zip' => $payload['zip'] ?? null,
            'country' => $payload['country'] ?? null,
            'company' => $payload['company'] ?? null,
            'title' => $payload['title'] ?? null,
            'website' => $payload['website'] ?? null,
            'dob' => $payload['dob'] ?? null,
            'site_id' => $payload['site_id'] ?? $submission->flow_id ?? null,
            'source' => $payload['source'] ?? null,
        ];

        // Attempt to find or create/update contact in a transaction with retry for races
        try {
            DB::transaction(function () use ($submission, $email, $data) {
                // Try to lock existing contact row for update if present
                $contact = Contact::where('email', $email)->lockForUpdate()->first();

                if ($contact) {
                    $contact->updateFromSubmission($data);
                    $contact->save();
                } else {
                    $contact = Contact::create(array_filter([
                        'email' => $email,
                        'phone' => $data['phone'] ?? null,
                        'first_name' => $data['first_name'] ?? null,
                        'last_name' => $data['last_name'] ?? null,
                        'address' => $data['address'] ?? null,
                        'street' => $data['street'] ?? null,
                        'city' => $data['city'] ?? null,
                        'state' => $data['state'] ?? null,
                        'zip' => $data['zip'] ?? null,
                        'country' => $data['country'] ?? null,
                        'company' => $data['company'] ?? null,
                        'title' => $data['title'] ?? null,
                        'website' => $data['website'] ?? null,
                        'dob' => $data['dob'] ?? null,
                        'site_id' => $data['site_id'] ?? null,
                        'source' => $data['source'] ?? null,
                        'custom_fields' => $data['data'] ?? null,
                    ], function ($v) {
                        return $v !== null && $v !== '';
                    }));
                }

                // Associate submission if not already linked
                if ($submission->contact_id !== $contact->id) {
                    $submission->contact_id = $contact->id;
                    // avoid infinite loops by saving quietly
                    $submission->saveQuietly();
                }
            });
        } catch (QueryException $e) {
            // Handle rare race where a concurrent insert created the contact with same email
            // Retry once: find the contact and link
            $contact = Contact::where('email', $email)->first();
            if ($contact) {
                $contact->updateFromSubmission($data);
                $contact->save();

                if ($submission->contact_id !== $contact->id) {
                    $submission->contact_id = $contact->id;
                    $submission->saveQuietly();
                }
            } else {
                // give up silently; could log
            }
        }
    }
}
