'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Plus, Edit, Trash2, Search, X, Settings } from 'lucide-react'
import MenuTable from '@/components/ui/MenuTable'

export interface Category {
  id: string
  name: string
  is_active: boolean
  display_order: number
}

export interface Product {
  id: string
  name: string
  selling_price: number
  tax_rate?: number
  category_id?: string
  category_name?: string
  unit?: string
  is_active: boolean
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [itemFormData, setItemFormData] = useState({ 
    name: '', 
    selling_price: '', 
    tax_rate: '0',
    category_id: '',
    unit: '',
    is_active: true
  })
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    is_active: true,
    display_order: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ])
      
      // Enrich products with category names
      const enrichedProducts = productsData.map((p: any) => {
        const category = categoriesData.find((c: Category) => c.id === p.category_id)
        return {
          ...p,
          category_name: category?.name
        }
      })
      
      setProducts(enrichedProducts)
      setCategories(categoriesData.filter((c: Category) => c.is_active))
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const productData: any = {
        name: itemFormData.name,
        selling_price: parseFloat(itemFormData.selling_price),
        tax_rate: parseFloat(itemFormData.tax_rate) || 0,
        is_active: itemFormData.is_active,
      }

      if (itemFormData.category_id) {
        productData.category_id = itemFormData.category_id
      }
      if (itemFormData.unit) {
        productData.unit = itemFormData.unit
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData)
      } else {
        await api.createProduct(productData)
      }
      
      setShowItemModal(false)
      setEditingProduct(null)
      resetItemForm()
      loadData()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Unknown error occurred'
      alert(`Failed to save menu item: ${errorMessage}`)
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, categoryFormData)
      } else {
        await api.createCategory(categoryFormData)
      }
      
      setShowCategoryModal(false)
      setEditingCategory(null)
      resetCategoryForm()
      loadData()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Unknown error occurred'
      alert(`Failed to save category: ${errorMessage}`)
    }
  }

  const resetItemForm = () => {
    setItemFormData({ 
      name: '', 
      selling_price: '', 
      tax_rate: '0',
      category_id: '',
      unit: '',
      is_active: true
    })
  }

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      is_active: true,
      display_order: 0
    })
  }

  const handleEditItem = (product: Product) => {
    setEditingProduct(product)
    setItemFormData({
      name: product.name,
      selling_price: product.selling_price.toString(),
      tax_rate: (product.tax_rate || 0).toString(),
      category_id: product.category_id || '',
      unit: product.unit || '',
      is_active: product.is_active,
    })
    setShowItemModal(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      is_active: category.is_active,
      display_order: category.display_order
    })
    setShowCategoryModal(true)
  }

  const handleDeactivateItem = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this menu item?')) return
    try {
      await api.deleteProduct(id)
      loadData()
    } catch (error) {
      alert('Failed to deactivate menu item')
    }
  }

  const handleDeactivateCategory = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this category?')) return
    try {
      await api.deleteCategory(id)
      loadData()
    } catch (error) {
      alert('Failed to deactivate category')
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const productsByCategory = categories.reduce((acc, cat) => {
    acc[cat.id] = filteredProducts.filter(p => p.category_id === cat.id)
    return acc
  }, {} as Record<string, Product[]>)

  const uncategorizedProducts = filteredProducts.filter(p => !p.category_id)

  if (loading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-500 py-8">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 bg-[#F5F3EE] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#3E2C24]">Menu</h1>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditingCategory(null)
                resetCategoryForm()
                setShowCategoryModal(true)
              }}
              className="bg-[#C89B63] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 text-base"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
            <button
              onClick={() => {
                setEditingProduct(null)
                resetItemForm()
                setShowItemModal(true)
              }}
              className="bg-[#3E2C24] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 text-base"
            >
              <Plus className="w-5 h-5" />
              Add Menu Item
            </button>
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-2xl shadow-md mb-6 p-6 border border-[#E5E7EB]">
          <h2 className="text-xl font-bold text-[#3E2C24] mb-4">Categories</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring outline-none ${
                selectedCategory === null
                  ? 'bg-[#3E2C24] text-white shadow-md'
                  : 'bg-[#FAF7F2] text-[#3E2C24] hover:bg-[#C89B63]/10'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring outline-none flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-[#3E2C24] text-white shadow-md'
                    : 'bg-[#FAF7F2] text-[#3E2C24] hover:bg-[#C89B63]/10'
                }`}
              >
                {category.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditCategory(category)
                  }}
                  className="p-1 rounded-full text-[#6B6B6B] hover:bg-[#E5E7EB] transition-all duration-200 ease-in-out active:scale-[0.9]"
                >
                  <Edit className="w-3 h-3" />
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-md mb-6 p-6 border border-[#E5E7EB]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-[#1F1F1F] placeholder-[#9CA3AF]"
            />
          </div>
        </div>

        {/* Menu Items by Category */}
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryProducts = filteredProducts.filter(p => p.category_id === category.id)
            if (categoryProducts.length === 0 && !selectedCategory) return null

            return (
              <MenuTable
                key={category.id}
                categoryName={category.name}
                products={categoryProducts}
                handleEditItem={handleEditItem}
                handleDeactivateItem={handleDeactivateItem}
                categories={categories}
              />
            )
          })}

          {/* Uncategorized Items */}
          {(!selectedCategory || selectedCategory === null) && uncategorizedProducts.length > 0 && (
            <MenuTable
              categoryName="Uncategorized"
              products={uncategorizedProducts}
              handleEditItem={handleEditItem}
              handleDeactivateItem={handleDeactivateItem}
              categories={categories}
            />
          )}
        </div>

        {/* Menu Item Modal */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in animate-scale-in">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E7EB]">
                <h2 className="text-2xl font-bold text-[#3E2C24]">
                  {editingProduct ? 'Edit Menu Item' : 'Add Menu Item'}
                </h2>
                <button
                  onClick={() => {
                    setShowItemModal(false)
                    setEditingProduct(null)
                    resetItemForm()
                  }}
                  className="text-[#6B6B6B] hover:text-[#3E2C24] transition-all duration-200 ease-in-out active:scale-[0.9] p-2 rounded-full hover:bg-[#FAF7F2]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleItemSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#6B6B6B] mb-2">Name *</label>
                  <input
                    type="text"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-[#1F1F1F] placeholder-[#9CA3AF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#6B6B6B] mb-2">Category</label>
                  <select
                    value={itemFormData.category_id}
                    onChange={(e) => setItemFormData({ ...itemFormData, category_id: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-[#1F1F1F]"
                  >
                    <option value="">No Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#6B6B6B] mb-2">Selling Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={itemFormData.selling_price}
                    onChange={(e) => setItemFormData({ ...itemFormData, selling_price: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-[#1F1F1F] placeholder-[#9CA3AF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#6B6B6B] mb-2">Tax Rate (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={itemFormData.tax_rate}
                    onChange={(e) => setItemFormData({ ...itemFormData, tax_rate: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-[#1F1F1F] placeholder-[#9CA3AF]"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={itemFormData.is_active}
                      onChange={(e) => setItemFormData({ ...itemFormData, is_active: e.target.checked })}
                      className="w-5 h-5 border border-[#E5E7EB] rounded focus:ring-2 focus:ring-[#C89B63] accent-[#3E2C24]"
                    />
                    <span className="text-sm font-semibold text-[#6B6B6B]">Active</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-[#6B6B6B] hover:text-[#3E2C24] flex items-center gap-1 transition-all duration-200 ease-in-out active:scale-[0.95] focus-visible:ring outline-none"
                >
                  <Settings className="w-4 h-4" />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                </button>
                {showAdvanced && (
                  <div>
                    <label className="block text-sm font-semibold text-[#6B6B6B] mb-2">Unit (optional)</label>
                    <select
                      value={itemFormData.unit}
                      onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-[#1F1F1F]"
                    >
                      <option value="">No Unit</option>
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="litre">Litre</option>
                      <option value="cup">Cup</option>
                      <option value="plate">Plate</option>
                      <option value="bowl">Bowl</option>
                      <option value="serving">Serving</option>
                      <option value="piece">Piece</option>
                      <option value="bottle">Bottle</option>
                      <option value="can">Can</option>
                    </select>
                  </div>
                )}
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemModal(false)
                      setEditingProduct(null)
                      resetItemForm()
                    }}
                    className="px-6 py-3 rounded-xl font-medium border border-[#3E2C24] text-[#3E2C24] hover:bg-[#3E2C24] hover:text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#3E2C24] text-white rounded-xl font-medium hover:bg-[#2c1f19] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  >
                    {editingProduct ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full animate-fade-in animate-scale-in">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E7EB]">
                <h2 className="text-2xl font-bold text-[#3E2C24]">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h2>
                <button
                  onClick={() => {
                    setShowCategoryModal(false)
                    setEditingCategory(null)
                    resetCategoryForm()
                  }}
                  className="text-[#6B6B6B] hover:text-[#3E2C24] transition-all duration-200 ease-in-out active:scale-[0.9] p-2 rounded-full hover:bg-[#FAF7F2]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCategorySubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#6B6B6B] mb-2">Name *</label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-[#1F1F1F] placeholder-[#9CA3AF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#6B6B6B] mb-2">Display Order</label>
                  <input
                    type="number"
                    value={categoryFormData.display_order}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-[#1F1F1F] placeholder-[#9CA3AF]"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={categoryFormData.is_active}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, is_active: e.target.checked })}
                      className="w-5 h-5 border border-[#E5E7EB] rounded focus:ring-2 focus:ring-[#C89B63] accent-[#3E2C24]"
                    />
                    <span className="text-sm font-semibold text-[#6B6B6B]">Active</span>
                  </label>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false)
                      setEditingCategory(null)
                      resetCategoryForm()
                    }}
                    className="px-6 py-3 rounded-xl font-medium border border-[#3E2C24] text-[#3E2C24] hover:bg-[#3E2C24] hover:text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#3E2C24] text-white rounded-xl font-medium hover:bg-[#2c1f19] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  >
                    {editingCategory ? 'Update' : 'Create'}
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
