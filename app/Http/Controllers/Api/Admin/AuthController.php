<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginAdminRequest;
use App\Services\AdminAuthService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class AuthController extends Controller
{
    public function __construct(
        private readonly AdminAuthService $authService
    ) {}

    public function login(LoginAdminRequest $request): JsonResponse
    {
        try {
            $authData = $this->authService->login($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => $authData,
            ]);

        } catch (AuthenticationException $e) {
            // 401: Valid request, but authentication failed (bad password/email)
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 401);

        } catch (AccessDeniedHttpException $e) {
            // 403: Authenticated/Known user, but they are not allowed to proceed (inactive)
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    public function me(Request $request): JsonResponse
    {
        // This relies purely on Laravel's auth middleware, so it stays simple
        return response()->json([
            'success' => true,
            'data' => $request->user('admin-api'),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user('admin-api'));

        return response()->json([
            'success' => true,
            'message' => 'Logout successful',
        ]);
    }
}