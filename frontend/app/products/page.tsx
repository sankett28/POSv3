'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Plus, Edit, Trash2, Search, Coffee, Package, Tag, Eye, EyeOff } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  selling_price: number
  unit: 'pcs' | 'kg' | 'litre'
  is_active: boolean
  created_at: string
  image_url?: string
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showModal])

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

  const filteredProducts = products.filter((p) => {
    return p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#F5F3EE] p-4 pb-16 sm:p-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="bg-[#FAF7F2] rounded-2xl shadow-md p-6 mb-8 border border-border">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#3E2C24] rounded-xl flex items-center justify-center shadow-md">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#3E2C24]">Menu Items</h1>
                <p className="text-secondary-text">Manage your cafe products and inventory</p>
              </div>
            </div>
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
              className="bg-[#3E2C24] text-white px-6 py-4 rounded-xl font-medium hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] transition-all duration-200 ease-in-out flex items-center justify-center gap-3 text-base min-h-[52px]"
            >
              <Plus className="w-5 h-5" />
              Add New Item
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="rounded-2xl bg-white shadow-md mb-8 p-6 border border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-text w-5 h-5" />
              <input
                type="text"
                placeholder="Search menu items by name, SKU, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-text-dark placeholder-muted-text"
              />
            </div>
            <div className="flex items-center gap-2 text-secondary-text">
              <Tag className="w-5 h-5" />
              <span className="font-medium">{filteredProducts.length} items found</span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="rounded-2xl bg-white shadow-md p-12">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#3E2C24] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-secondary-text text-lg">Loading menu items...</p>
              </div>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (

          <div className="rounded-2xl bg-white shadow-md p-12 text-center text-secondary-text">No products found. Add a new item to get started!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl bg-white shadow-md border border-border overflow-hidden
                           transition-all duration-200 ease-in-out
                           hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl
                           active:scale-[0.98] cursor-pointer group"
                onClick={() => handleEdit(product)} // Make entire card clickable
              >
                {/* Product Image Placeholder */}
                <div className="h-24 w-full bg-linear-to-br from-accent-gold/30 to-accent-orange/30 flex items-center justify-center">
                  <span className="text-5xl">☕</span> {/* Cafe-friendly emoji fallback */}
                </div>
                
                {/* Product Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-text-dark leading-tight mb-1">{product.name}</h3>
                      <p className="text-secondary-text text-sm">SKU: {product.sku}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="text-3xl font-bold text-[#3E2C24]">
                      ₹{product.selling_price.toFixed(2)}
                    </div>
                    <div className="text-secondary-text text-sm">per {product.unit}</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => {e.stopPropagation(); handleEdit(product);}}
                      className="flex-1 bg-[#3E2C24] text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    {product.is_active && (
                      <button
                        onClick={(e) => {e.stopPropagation(); handleDeactivate(product.id);}}
                        className="px-4 py-3 bg-[#F4A261] text-white rounded-xl font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                        title="Deactivate product"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
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
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-accent-gold to-accent-orange rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#3E2C24]">
                  {editingProduct ? 'Edit Menu Item' : 'Add New Item'}
                </h2>
                <p className="text-secondary-text text-sm">
                  {editingProduct ? 'Update item details' : 'Create a new menu item'}
                </p>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                console.log('Form onSubmit triggered')
                handleSubmit(e)
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-semibold text-secondary-text mb-2">Item Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Espresso, Cappuccino, Croissant"
                  className="w-full px-4 py-4 border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-text-dark placeholder-muted-text"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-text mb-2">SKU Code *</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                  placeholder="e.g., ESP-001, CAP-002"
                  className="w-full px-4 py-4 border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-text-dark placeholder-muted-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Selling Price *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  required
                  className="w-full px-4 py-4 border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-text-dark placeholder-muted-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Unit *</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value as 'pcs' | 'kg' | 'litre' })}
                  required
                  className="w-full px-4 py-4 border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-text-dark"
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
                    className="w-4 h-4 border border-border rounded-sm focus:ring-2 focus:ring-[#C89B63]"
                  />
                  <span className="text-sm font-medium text-secondary-text">Active</span>
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
                  className="px-4 py-2 rounded-xl font-medium border border-[#3E2C24] text-[#3E2C24] hover:bg-[#3E2C24] hover:text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
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
                  className="px-4 py-2 bg-[#3E2C24] text-white rounded-xl font-medium hover:bg-[#2c1f19] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
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
  )
}
