# TT Shopping Cart Backend (Laravel 12 + MySQL)

This folder contains the Laravel 12 backend API (MySQL) and a React-based Admin SPA served at `/admin`.

## Quick start (local)

### 1) Configure env

```bash
cp .env.example .env
```

Edit `.env` and set your MySQL credentials:

- `DB_CONNECTION=mysql`
- `DB_HOST=...`
- `DB_PORT=3306`
- `DB_DATABASE=ttshoppingcart`
- `DB_USERNAME=...`
- `DB_PASSWORD=...`

Optional CORS for separate frontends:

- `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000`

### 2) Install dependencies

```bash
composer install
npm install
```

### 3) App key + migrations + seed

```bash
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan wayfinder:generate --with-form
```

### 4) Run

```bash
composer run dev
```

## Admin panel

- **URL**: `/admin`
- **Seeded login**: `admin@ttjewelry.local` / `password123`

The admin panel uses these APIs:

- `POST /api/v1/admin/auth/login`
- `GET /api/v1/admin/categories` (CRUD)
- `GET /api/v1/admin/products` (CRUD)
- `GET /api/v1/admin/orders` (read + status updates)

## Storefront APIs (v1)

- **Catalog**
  - `GET /api/v1/categories`
  - `GET /api/v1/products`
  - `GET /api/v1/products/{id}`
  - `GET /api/v1/products/search?q=...`
- **Cart (guest or customer token)**
  - `GET /api/v1/cart?session_id=...`
  - `POST /api/v1/cart/add`
  - `PUT /api/v1/cart/update`
  - `DELETE /api/v1/cart/remove`
  - `DELETE /api/v1/cart/clear`
- **Checkout / Orders**
  - `POST /api/v1/orders` (creates an order from cart)

