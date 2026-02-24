import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { Button } from '../../../components/ui/button'
import { clearAdminToken } from '../lib/auth'
import { apiFetch } from '../lib/api'

const linkBase =
  'block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted'
const linkActive = 'bg-muted font-medium'

export function AdminLayout() {
  const navigate = useNavigate()

  async function logout() {
    await apiFetch('/api/v1/admin/auth/logout', { method: 'POST' })
    clearAdminToken()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-14 items-center justify-between border-b px-4">
        <div className="font-semibold">TT Admin</div>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 px-4 py-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <nav className="space-y-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ''}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ''}`
              }
            >
              Categories
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ''}`
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ''}`
              }
            >
              Orders
            </NavLink>
            <NavLink
              to="/admin-users"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ''}`
              }
            >
              Admin Users
            </NavLink>
            <NavLink
              to="/customers"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ''}`
              }
            >
              Customers
            </NavLink>
          </nav>
        </aside>

        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

