<?php

namespace App\Services;

use App\Models\AdminUser;
use DomainException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class AdminUserService
{
    public function getPaginatedUsers(array $filters): LengthAwarePaginator
    {
        $query = AdminUser::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('name')->paginate(20);
    }

    public function createUser(array $data): AdminUser
    {
        $data['password'] = Hash::make($data['password']);
        $data['is_active'] = $data['is_active'] ?? true;

        return AdminUser::create($data);
    }

    public function getUserById(int $id): AdminUser
    {
        return AdminUser::findOrFail($id);
    }

    public function updateUser(int $id, array $data): AdminUser
    {
        $user = $this->getUserById($id);

        if (array_key_exists('password', $data)) {
            if ($data['password']) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']); // Don't overwrite with null if they left it blank
            }
        }

        $user->update($data);

        return $user->fresh();
    }

    public function deleteUser(int $id): void
    {
        $user = $this->getUserById($id);

        // This is a business rule, so it belongs in the Service.
        // We throw a DomainException which the Controller will gracefully catch.
        if ($user->isSuperAdmin()) {
            throw new DomainException('Cannot delete super admin');
        }

        $user->delete();
    }
}
