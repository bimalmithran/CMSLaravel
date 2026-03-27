<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\NewsletterSubscribeRequest;
use App\Services\NewsletterService;
use Illuminate\Http\JsonResponse;

class NewsletterController extends Controller
{
    public function __construct(
        private readonly NewsletterService $newsletterService
    ) {}

    public function subscribe(NewsletterSubscribeRequest $request): JsonResponse
    {
        $result = $this->newsletterService->subscribe($request->validated('email'));

        return response()->json([
            'success' => true,
            'message' => $result['already_subscribed']
                ? 'You are already subscribed.'
                : 'Thank you for subscribing!',
            'already_subscribed' => $result['already_subscribed'],
        ]);
    }
}
