import React, { useEffect, useMemo, useState } from 'react'

import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { apiFetch } from '../lib/api'

type Category = { id: number; name: string }

type Product = {
  id: number
  category_id: number
  name: string
  slug: string
  sku: string
  price: string
  discount_price: string | null
  stock: number
  is_active: boolean
}

type Paginated<T> = {
  data: T[]
  current_page: number
  last_page: number
  total: number
}

export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  }, [items, search])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiFetch<Paginated<Product>>('/api/v1/admin/products'),
        apiFetch<Category[]>('/api/v1/categories'),
      ])

      if (!productsRes.success) {
        setError(productsRes.message || 'Failed to load products')
        return
      }
      if (categoriesRes.success) {
        setCategories(categoriesRes.data)
      }

      setItems(productsRes.data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function createProduct(payload: {
    category_id: number
    name: string
    price: number
    sku: string
    stock?: number
    is_active?: boolean
  }) {
    const res = await apiFetch<Product>('/api/v1/admin/products', { method: 'POST', json: payload })
    if (!res.success) throw new Error(res.message || 'Create failed')
    await load()
  }

  async function deleteProduct(id: number) {
    if (!confirm('Delete this product?')) return
    const res = await apiFetch<unknown>(`/api/v1/admin/products/${id}`, { method: 'DELETE' })
    if (!res.success) {
      alert(res.message || 'Delete failed')
      return
    }
    await load()
  }

  function categoryName(categoryId: number) {
    return categories.find((c) => c.id === categoryId)?.name ?? `#${categoryId}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold">Products</div>
          <div className="text-sm text-muted-foreground">Manage products.</div>
        </div>

        <div className="flex gap-2">
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <CreateProductDialog categories={categories} onCreate={createProduct} />
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
            <div className="text-sm text-muted-foreground">No products.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium">Name</th>
                    <th className="py-2 text-left font-medium">SKU</th>
                    <th className="py-2 text-left font-medium">Category</th>
                    <th className="py-2 text-left font-medium">Price</th>
                    <th className="py-2 text-left font-medium">Stock</th>
                    <th className="py-2 text-left font-medium">Active</th>
                    <th className="py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="py-2">{p.name}</td>
                      <td className="py-2 font-mono text-xs">{p.sku}</td>
                      <td className="py-2">{categoryName(p.category_id)}</td>
                      <td className="py-2">{p.price}</td>
                      <td className="py-2">{p.stock}</td>
                      <td className="py-2">{p.is_active ? 'Yes' : 'No'}</td>
                      <td className="py-2 text-right">
                        <Button variant="destructive" size="sm" onClick={() => deleteProduct(p.id)}>
                          Delete
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

function CreateProductDialog({
  categories,
  onCreate,
}: {
  categories: Category[]
  onCreate: (payload: {
    category_id: number
    name: string
    price: number
    sku: string
    stock?: number
    is_active?: boolean
  }) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [stock, setStock] = useState<number>(0)
  const [categoryId, setCategoryId] = useState<number>(() => categories[0]?.id ?? 0)
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!categoryId && categories.length) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErr(null)
    try {
      await onCreate({
        category_id: categoryId,
        name,
        sku,
        price,
        stock,
        is_active: isActive,
      })
      setOpen(false)
      setName('')
      setSku('')
      setPrice(0)
      setStock(0)
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
          <DialogTitle>Create Product</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="prod-name">Name</Label>
            <Input id="prod-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prod-sku">SKU</Label>
            <Input id="prod-sku" value={sku} onChange={(e) => setSku(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="prod-price">Price</Label>
              <Input
                id="prod-price"
                type="number"
                step="0.01"
                value={String(price)}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-stock">Stock</Label>
              <Input
                id="prod-stock"
                type="number"
                value={String(stock)}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="prod-category">Category</Label>
              <select
                id="prod-category"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={categoryId ? String(categoryId) : ''}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                required
              >
                <option value="" disabled>
                  Select a category…
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-active">Active (1/0)</Label>
              <Input
                id="prod-active"
                type="number"
                value={isActive ? '1' : '0'}
                onChange={(e) => setIsActive(e.target.value !== '0')}
              />
            </div>
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

