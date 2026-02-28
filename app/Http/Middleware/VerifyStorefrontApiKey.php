<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyStorefrontApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $configuredKey = config('services.storefront.key');
        $providedKey = $request->header('X-Storefront-Key');

        // Check if either key is missing, or if they don't match securely
        if (empty($configuredKey) || empty($providedKey) || !hash_equals($configuredKey, $providedKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Missing or invalid Storefront API Key.'
            ], 401);
        }

        return $next($request);
    }
}
