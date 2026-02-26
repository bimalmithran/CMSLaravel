<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCustomerRequest;
use App\Services\CustomerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function __construct(
        private readonly CustomerService $customerService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $customers = $this->customerService->getPaginatedCustomers($request->only('search'));

        return response()->json([
            'success' => true,
            'data' => $customers
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $customer = $this->customerService->getCustomerById($id);

        return response()->json([
            'success' => true,
            'data' => $customer
        ]);
    }

    public function update(UpdateCustomerRequest $request, int $id): JsonResponse
    {
        $customer = $this->customerService->updateCustomer($id, $request->validated());

        return response()->json([
            'success' => true,
            'data' => $customer
        ]);
    }
}
