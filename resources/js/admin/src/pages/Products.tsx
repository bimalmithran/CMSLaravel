import type { ColumnDef, SortingState } from '@tanstack/react-table'
import {
  ArrowUpDown,
  DeleteIcon,
  EllipsisVerticalIcon,
} from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { DataTable } from '../components/DataTable'
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

  // pagination & sorting state
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [sorting, setSorting] = useState<SortingState>([])

  const loadProducts = React.useCallback(async (page: number = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append('page', String(page))
      if (search) params.append('search', search)

      if (sorting.length > 0) {
        const activeSort = sorting[0]
        params.append('sort_by', activeSort.id)
        params.append('sort_dir', activeSort.desc ? 'desc' : 'asc')
      }

      const res = await apiFetch<Paginated<Product>>(
        '/api/v1/admin/products?' + params.toString()
      )

      if (!res.success) {
        setError(res.message || 'Failed to load products')
        return
      }

      setItems(res.data.data)
      setCurrentPage(res.data.current_page)
      setLastPage(res.data.last_page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [search, sorting])

  const loadCategories = React.useCallback(async () => {
    try {
      const res = await apiFetch<Category[]>('/api/v1/categories')
      if (res.success) {
        setCategories(res.data)
      }
    } catch (err) {
      console.error('Failed to load categories', err)
    }
  }, [])

  useEffect(() => {
    loadProducts().catch(console.error)
    loadCategories().catch(console.error)
  }, [loadProducts, loadCategories])

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
    await loadProducts()
  }

  async function deleteProduct(id: number) {
    if (!confirm('Delete this product?')) return
    const res = await apiFetch<unknown>(`/api/v1/admin/products/${id}`, { method: 'DELETE' })
    if (!res.success) {
      alert(res.message || 'Delete failed')
      return
    }
    await loadProducts(currentPage)
  }

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: 'index',
        header: '#',
        enableHiding: false,
        cell: ({ row, table }) => {
          const meta = table.options.meta as { currentPage: number }
          return (meta.currentPage - 1) * 10 + row.index + 1
        },
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4 cursor-pointer"
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        id: 'sku',
        accessorKey: 'sku',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4 cursor-pointer"
            >
              SKU
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.sku}</span>,
      },
      {
        id: 'category',
        accessorKey: 'category_id',
        header: 'Category',
        cell: ({ row }) => {
          const cat = categories.find((c) => c.id === row.original.category_id)
          return cat ? cat.name : `#${row.original.category_id}`
        },
      },
      {
        id: 'price',
        accessorKey: 'price',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4 cursor-pointer"
            >
              Price
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        id: 'stock',
        accessorKey: 'stock',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4 cursor-pointer"
            >
              Stock
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        id: 'active',
        accessorKey: 'is_active',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4 cursor-pointer"
            >
              Active
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (row.original.is_active ? 'Yes' : 'No'),
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                    <span className="sr-only">Open menu</span>
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer text-destructive"
                    onClick={() => deleteProduct(item.id)}
                  >
                    <DeleteIcon className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [currentPage, categories] // Include categories so names map correctly
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold">Products</div>
          <div className="text-sm text-muted-foreground">Manage products.</div>
        </div>

        <div className="flex gap-2">
          {/* Note: Removed the isolated search Input because it's built into the DataTable now */}
          <CreateProductDialog categories={categories} onCreate={createProduct} />
        </div>
      </div>

      <DataTable<Product, unknown>
        data={items}
        columns={columns}
        currentPage={currentPage}
        lastPage={lastPage}
        search={search}
        onSearch={setSearch}
        onPageChange={(page) => void loadProducts(page)}
        sorting={sorting}
        onSortingChange={setSorting}
        loading={loading}
        emptyMessage="No products."
        error={error}
        title="List"
      />
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
        <Button className="cursor-pointer">Create</Button>
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
            <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving} className="cursor-pointer">
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}