<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Pagination\LengthAwarePaginator;

class CustomerService
{
    public function getPaginatedCustomers(array $filters): LengthAwarePaginator
    {
        $query = Customer::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('id', 'desc')->paginate(20);
    }

    public function getCustomerById(int $id): Customer
    {
        // Eager load the orders when viewing a specific customer
        return Customer::with('orders')->findOrFail($id);
    }

    public function updateCustomer(int $id, array $data): Customer
    {
        // We don't need to eager load orders just to update the profile
        $customer = Customer::findOrFail($id);
        
        $customer->update($data);

        return $customer->fresh();
    }
}
