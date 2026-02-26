<?php

namespace App\Services;

use App\Models\AdminUser;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class AdminAuthService
{
    /**
     * Attempt to authenticate the admin and generate a token.
     *
     * @throws AuthenticationException
     * @throws AccessDeniedHttpException
     */
    public function login(array $credentials): array
    {
        $admin = AdminUser::where('email', $credentials['email'])->first();

        // Business Rule 1: Must exist and password must match
        if (!$admin || !Hash::check($credentials['password'], $admin->password)) {
            throw new AuthenticationException('Invalid credentials');
        }

        // Business Rule 2: Account must be active
        if (!$admin->is_active) {
            throw new AccessDeniedHttpException('Account is inactive');
        }

        // Update login timestamp
        $admin->forceFill(['last_login_at' => now()])->save();

        // Generate Sanctum token
        $token = $admin->createToken('admin-token', ['admin'])->plainTextToken;

        return [
            'admin' => $admin,
            'token' => $token,
        ];
    }

    /**
     * Revoke the current access token.
     */
    public function logout(?AdminUser $admin): void
    {
        if ($admin && $admin->currentAccessToken()) {
            /** @var \Laravel\Sanctum\PersonalAccessToken $token */
            $token = $admin->currentAccessToken();
            $token->delete();
        }
    }
}
