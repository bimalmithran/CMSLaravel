<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    /**
     * Verify a Google ID token and sign in / register the customer.
     *
     * The frontend obtains `credential` from Google Identity Services JS SDK,
     * then POSTs it here as `id_token`.
     */
    public function googleLogin(Request $request): JsonResponse
    {
        $request->validate(['id_token' => ['required', 'string']]);

        $googleUser = $this->verifyGoogleToken($request->input('id_token'));

        if (! $googleUser) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired Google token.',
            ], 401);
        }

        $email = $googleUser['email'] ?? null;
        if (! $email) {
            return response()->json([
                'success' => false,
                'message' => 'Google account does not have a verified email.',
            ], 422);
        }

        $customer = Customer::firstOrCreate(
            ['email' => $email],
            [
                'first_name' => $googleUser['given_name']  ?? Str::before($email, '@'),
                'last_name'  => $googleUser['family_name'] ?? '',
                'email'      => $email,
                'password'   => Hash::make(Str::random(32)),
                'is_active'  => true,
            ]
        );

        if (! $customer->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is inactive. Please contact support.',
            ], 403);
        }

        $token = $customer->createToken('customer-token', ['customer'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data'    => [
                'customer' => $customer,
                'token'    => $token,
            ],
        ]);
    }

    /**
     * Verify the Google ID token via Google's tokeninfo endpoint.
     * Returns the decoded payload array on success, or null on failure.
     */
    private function verifyGoogleToken(string $idToken): ?array
    {
        $clientId = config('services.google.client_id');

        $ch = curl_init('https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($idToken));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || ! $response) {
            return null;
        }

        $data = json_decode($response, true);
        if (! is_array($data)) {
            return null;
        }

        // Validate audience (aud) matches our configured client ID
        if ($clientId && isset($data['aud']) && $data['aud'] !== $clientId) {
            return null;
        }

        // Require a verified email
        if (empty($data['email']) || ($data['email_verified'] ?? 'false') === 'false') {
            return null;
        }

        return $data;
    }
}
