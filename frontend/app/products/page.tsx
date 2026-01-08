'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Plus, Edit, Trash2, Search } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  selling_price: number
  unit: 'pcs' | 'kg' | 'litre'
  is_active: boolean
  created_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({ 
    name: '', 
    sku: '', 
    barcode: '', 
    selling_price: '', 
    unit: 'pcs' as 'pcs' | 'kg' | 'litre',
    is_active: true
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await api.getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted!', formData)
    try {
      if (editingProduct) {
        console.log('Updating product:', editingProduct.id)
        await api.updateProduct(editingProduct.id, {
          name: formData.name,
          sku: formData.sku,
          barcode: formData.barcode || undefined,
          selling_price: parseFloat(formData.selling_price),
          unit: formData.unit,
          is_active: formData.is_active,
        })
      } else {
        console.log('Creating product with data:', {
          name: formData.name,
          sku: formData.sku,
          barcode: formData.barcode || undefined,
          selling_price: parseFloat(formData.selling_price),
          unit: formData.unit,
          is_active: formData.is_active,
        })
        const result = await api.createProduct({
          name: formData.name,
          sku: formData.sku,
          barcode: formData.barcode || undefined,
          selling_price: parseFloat(formData.selling_price),
          unit: formData.unit,
          is_active: formData.is_active,
        })
        console.log('Product created successfully:', result)
      }
      setShowModal(false)
      setEditingProduct(null)
      setFormData({ 
        name: '', 
        sku: '', 
        barcode: '', 
        selling_price: '', 
        unit: 'pcs',
        is_active: true
      })
      loadProducts()
    } catch (error: any) {
      console.error('Error saving product:', error)
      console.error('Error details:', error)
      console.error('Error response:', error?.response)
      console.error('Error response data:', error?.response?.data)
      const errorMessage = error?.response?.data?.detail || error?.message || 'Unknown error occurred'
      alert(`Failed to save product: ${errorMessage}`)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || '',
      selling_price: product.selling_price.toString(),
      unit: product.unit,
      is_active: product.is_active,
    })
    setShowModal(true)
  }

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this product?')) return
    try {
      await api.deleteProduct(id)
      loadProducts()
    } catch (error) {
      console.error('Error deactivating product:', error)
      alert('Failed to deactivate product')
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-16 sm:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-4 sm:mb-0">Products</h1>
            <button
            onClick={() => {
              setEditingProduct(null)
              setFormData({ 
                name: '', 
                sku: '', 
                barcode: '', 
                selling_price: '', 
                unit: 'pcs',
                is_active: true
              })
              setShowModal(true)
            }}
            className="w-full sm:w-auto bg-black text-white px-4 py-3 rounded-md font-semibold hover:bg-gray-800 flex items-center justify-center gap-2 text-base min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black min-h-[44px]"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Barcode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-gray-600">{product.sku}</td>
                    <td className="px-4 py-3 text-gray-600">{product.barcode || '-'}</td>
                    <td className="px-4 py-3 text-gray-900">₹{product.selling_price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{product.unit}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-gray-600 hover:text-black"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {product.is_active && (
                          <button
                            onClick={() => handleDeactivate(product.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Deactivate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-black mb-4">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <form 
                onSubmit={(e) => {
                  console.log('Form onSubmit triggered')
                  handleSubmit(e)
                }} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode (optional)</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as 'pcs' | 'kg' | 'litre' })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="litre">Litre</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-black"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingProduct(null)
                      setFormData({ 
                        name: '', 
                        sku: '', 
                        barcode: '', 
                        selling_price: '', 
                        unit: 'pcs',
                        is_active: true
                      })
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Button clicked directly!', formData)
                      // Validate required fields
                      if (!formData.name || !formData.sku || !formData.selling_price) {
                        alert('Please fill in all required fields (Name, SKU, Selling Price)')
                        return
                      }
                      // Call handleSubmit manually
                      const fakeEvent = {
                        preventDefault: () => {},
                      } as React.FormEvent
                      await handleSubmit(fakeEvent)
                    }}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!formData.name || !formData.sku || !formData.selling_price}
                  >
                    {editingProduct ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

