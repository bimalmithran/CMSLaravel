<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdminUserRequest;
use App\Http\Requests\UpdateAdminUserRequest;
use App\Services\AdminUserService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function __construct(
        private readonly AdminUserService $adminUserService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $users = $this->adminUserService->getPaginatedUsers($request->only('search'));

        return response()->json(['success' => true, 'data' => $users]);
    }

    public function store(StoreAdminUserRequest $request): JsonResponse
    {
        $user = $this->adminUserService->createUser($request->validated());

        return response()->json(['success' => true, 'data' => $user], 201);
    }

    public function show(int $id): JsonResponse
    {
        $user = $this->adminUserService->getUserById($id);

        return response()->json(['success' => true, 'data' => $user]);
    }

    public function update(UpdateAdminUserRequest $request, int $id): JsonResponse
    {
        $user = $this->adminUserService->updateUser($id, $request->validated());

        return response()->json(['success' => true, 'data' => $user]);
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminUserService->deleteUser($id);

            return response()->json(['success' => true]);
        } catch (DomainException $e) {
            // Catch the business rule violation and return a clean HTTP 422
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
