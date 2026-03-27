<?php

namespace App\Services;

use App\Models\NewsletterSubscriber;
use Illuminate\Database\UniqueConstraintViolationException;

class NewsletterService
{
    public function subscribe(string $email): array
    {
        try {
            NewsletterSubscriber::create(['email' => strtolower(trim($email))]);

            return ['subscribed' => true, 'already_subscribed' => false];
        } catch (UniqueConstraintViolationException) {
            return ['subscribed' => true, 'already_subscribed' => true];
        }
    }
}
