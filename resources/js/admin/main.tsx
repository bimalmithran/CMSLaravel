import '../../css/app.css'

import React from 'react'
import { createRoot } from 'react-dom/client'

import { AdminApp } from './src/AdminApp'

const el = document.getElementById('admin-root')
if (!el) {
  throw new Error('Missing #admin-root')
}

createRoot(el).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>,
)

