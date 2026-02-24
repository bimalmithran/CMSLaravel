import React, { useEffect, useMemo, useState } from 'react'

import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { apiFetch } from '../lib/api'

type Customer = {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string | null
  is_active: boolean
}

type Paginated<T> = {
  data: T[]
  current_page: number
  last_page: number
  total: number
}

export function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (c) =>
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    )
  }, [items, search])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch<Paginated<Customer>>('/api/v1/admin/customers')
      if (!res.success) {
        setError(res.message || 'Failed to load customers')
        return
      }
      setItems(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function toggleActive(customer: Customer) {
    const res = await apiFetch<Customer>(`/api/v1/admin/customers/${customer.id}`, {
      method: 'PUT',
      json: { is_active: !customer.is_active },
    })
    if (!res.success) {
      alert(res.message || 'Update failed')
      return
    }
    await load()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold">Customers</div>
          <div className="text-sm text-muted-foreground">Website customers.</div>
        </div>
        <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No customers.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium">Name</th>
                    <th className="py-2 text-left font-medium">Email</th>
                    <th className="py-2 text-left font-medium">Phone</th>
                    <th className="py-2 text-left font-medium">Active</th>
                    <th className="py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2">
                        {c.first_name} {c.last_name}
                      </td>
                      <td className="py-2">{c.email}</td>
                      <td className="py-2">{c.phone || '—'}</td>
                      <td className="py-2">{c.is_active ? 'Yes' : 'No'}</td>
                      <td className="py-2 text-right">
                        <Button variant="outline" size="sm" onClick={() => toggleActive(c)}>
                          {c.is_active ? 'Disable' : 'Enable'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

