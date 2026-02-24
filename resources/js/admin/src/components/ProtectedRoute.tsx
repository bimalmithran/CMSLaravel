import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { getAdminToken } from '../lib/auth'

export function ProtectedRoute() {
  const token = getAdminToken()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

