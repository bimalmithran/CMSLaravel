<?php

use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\MenuController as MenuController;
use App\Http\Controllers\Api\AuthController as CustomerAuthController;
use App\Http\Controllers\Api\Admin\MediaController as MediaController;
use App\Http\Controllers\Api\Admin\SettingController as SettingController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn() => response()->json(['status' => 'ok']));

Route::prefix('v1')->group(function () {
    // Catalog (public)
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/search', [ProductController::class, 'search']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::get('/products/{id}/related', [ProductController::class, 'related']);

    // Customer auth (token-based)
    Route::post('/auth/register', [CustomerAuthController::class, 'register']);
    Route::post('/auth/login', [CustomerAuthController::class, 'login']);

    Route::middleware('auth:customer')->group(function () {
        Route::get('/auth/me', [CustomerAuthController::class, 'me']);
        Route::post('/auth/logout', [CustomerAuthController::class, 'logout']);
        Route::put('/auth/profile', [CustomerAuthController::class, 'updateProfile']);
    });

    // Cart (guest or logged-in; uses session_id or customer token)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'addItem']);
    Route::put('/cart/update', [CartController::class, 'updateItem']);
    Route::delete('/cart/remove', [CartController::class, 'removeItem']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);
    Route::post('/cart/discount', [CartController::class, 'applyDiscount']);

    // Wishlist (guest or logged-in; uses session_id or customer token)
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/add', [WishlistController::class, 'add']);
    Route::delete('/wishlist/remove', [WishlistController::class, 'remove']);

    // Orders (create order from cart; optionally attach to customer)
    Route::post('/orders', [OrderController::class, 'store']);

    Route::middleware('auth:customer')->group(function () {
        Route::get('/orders', [OrderController::class, 'myOrders']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
    });

    // Admin auth + Admin APIs
    Route::prefix('admin')->group(function () {
        Route::post('/auth/login', [AdminAuthController::class, 'login']);

        Route::middleware('auth:admin-api')->group(function () {
            Route::get('/auth/me', [AdminAuthController::class, 'me']);
            Route::post('/auth/logout', [AdminAuthController::class, 'logout']);

            // Admin catalog CRUD
            Route::get('/categories/list', [AdminCategoryController::class, 'list']);
            Route::apiResource('categories', AdminCategoryController::class);
            Route::apiResource('products', AdminProductController::class);
            Route::get('/menus/list', [MenuController::class, 'list']);
            Route::apiResource('menus', MenuController::class);

            // Admin users & customers
            Route::apiResource('admin-users', AdminUserController::class)->except(['edit', 'create']);
            Route::apiResource('customers', AdminCustomerController::class)->only(['index', 'show', 'update']);

            // Admin orders
            Route::get('/orders', [AdminOrderController::class, 'index']);
            Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
            Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
            Route::put('/orders/{id}/payment-status', [AdminOrderController::class, 'updatePaymentStatus']);

            // Admin media upload
            Route::apiResource('media', MediaController::class)->only(['index', 'store', 'destroy']);

            // Admin settings
            Route::get('/settings', [SettingController::class, 'index']);
            Route::put('/settings/bulk', [SettingController::class, 'bulkUpdate']);
        });
    });
});
