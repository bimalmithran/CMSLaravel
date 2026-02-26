import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './layout/AdminLayout'
import { AdminUsersPage } from './pages/AdminUsers/AdminUsersPage'
import { BrandsPage } from './pages/Brands/BrandsPage'
import { CategoriesPage } from './pages/Categories/CategoriesPage'
import { CustomersPage } from './pages/Customers/CustomersPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { LoginPage } from './pages/Login/LoginPage'
import { MediaPage } from './pages/Media/MediaPage'
import { MenusPage } from './pages/Menus/MenusPage'
import { OrdersPage } from './pages/Orders/OrdersPage'
import { ProductsPage } from './pages/Products/ProductsPage'
import { SettingsPage } from './pages/Settings/SettingsPage'
import { SizesPage } from './pages/Sizes/SizesPage'

export function AdminApp() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path='/menus' element={<MenusPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/sizes" element={<SizesPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/admin-users" element={<AdminUsersPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

