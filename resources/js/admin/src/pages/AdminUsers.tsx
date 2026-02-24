import React, { useEffect, useMemo, useState } from 'react'

import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { apiFetch } from '../lib/api'

type AdminUser = {
  id: number
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'moderator' | 'staff'
  is_active: boolean
  permissions: string[] | null
}

type Paginated<T> = {
  data: T[]
  current_page: number
  last_page: number
  total: number
}

export function AdminUsersPage() {
  const [items, setItems] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }, [items, search])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch<Paginated<AdminUser>>('/api/v1/admin/admin-users')
      if (!res.success) {
        setError(res.message || 'Failed to load admin users')
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

  async function createUser(payload: {
    name: string
    email: string
    password: string
    role: AdminUser['role']
    is_active?: boolean
    permissions?: string[]
  }) {
    const res = await apiFetch<AdminUser>('/api/v1/admin/admin-users', { method: 'POST', json: payload })
    if (!res.success) throw new Error(res.message || 'Create failed')
    await load()
  }

  async function toggleActive(user: AdminUser) {
    const res = await apiFetch<AdminUser>(`/api/v1/admin/admin-users/${user.id}`, {
      method: 'PUT',
      json: { is_active: !user.is_active },
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
          <div className="text-lg font-semibold">Admin Users</div>
          <div className="text-sm text-muted-foreground">Manage backend users and permissions.</div>
        </div>

        <div className="flex gap-2">
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <CreateAdminUserDialog onCreate={createUser} />
        </div>
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
            <div className="text-sm text-muted-foreground">No admin users.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium">Name</th>
                    <th className="py-2 text-left font-medium">Email</th>
                    <th className="py-2 text-left font-medium">Role</th>
                    <th className="py-2 text-left font-medium">Active</th>
                    <th className="py-2 text-left font-medium">Permissions</th>
                    <th className="py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="py-2">{u.name}</td>
                      <td className="py-2">{u.email}</td>
                      <td className="py-2">{u.role}</td>
                      <td className="py-2">{u.is_active ? 'Yes' : 'No'}</td>
                      <td className="py-2 text-xs">
                        {(u.permissions || []).length ? (u.permissions || []).join(', ') : '—'}
                      </td>
                      <td className="py-2 text-right">
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => toggleActive(u)}>
                          {u.is_active ? 'Disable' : 'Enable'}
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

function CreateAdminUserDialog({
  onCreate,
}: {
  onCreate: (payload: {
    name: string
    email: string
    password: string
    role: AdminUser['role']
    is_active?: boolean
    permissions?: string[]
  }) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<AdminUser['role']>('admin')
  const [permissions, setPermissions] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErr(null)
    try {
      await onCreate({
        name,
        email,
        password,
        role,
        is_active: isActive,
        permissions: permissions
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean),
      })
      setOpen(false)
      setName('')
      setEmail('')
      setPassword('')
      setPermissions('')
      setRole('admin')
      setIsActive(true)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Admin User</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="admin-name">Name</Label>
            <Input id="admin-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="admin-role">Role</Label>
              <select
                id="admin-role"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={role}
                onChange={(e) => setRole(e.target.value as AdminUser['role'])}
              >
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-active">Active (1/0)</Label>
              <Input
                id="admin-active"
                type="number"
                value={isActive ? '1' : '0'}
                onChange={(e) => setIsActive(e.target.value !== '0')}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-perms">Permissions (comma separated)</Label>
            <Input
              id="admin-perms"
              placeholder="products.view,products.create,categories.*"
              value={permissions}
              onChange={(e) => setPermissions(e.target.value)}
            />
          </div>

          {err ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {err}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

