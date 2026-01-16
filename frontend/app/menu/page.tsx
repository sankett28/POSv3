'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Plus, Edit, Trash2, Search, X, Settings, CheckCircle, AlertCircle, Upload, FileText } from 'lucide-react'

export interface Category {
  id: string
  name: string
  is_active: boolean
  display_order: number
}

interface TaxGroup {
  id: string
  name: string
  total_rate: number
  split_type: 'GST_50_50' | 'NO_SPLIT'
  is_tax_inclusive: boolean
  is_active: boolean
}

export interface Product {
  id: string
  name: string
  selling_price: number
  tax_group_id?: string
  tax_group?: TaxGroup // Add this line
  category_id?: string
  category_name?: string
  tax_rate?: number
  unit?: string
  is_active: boolean
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [taxGroups, setTaxGroups] = useState<TaxGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showBulkTaxModal, setShowBulkTaxModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedCategoryForBulk, setSelectedCategoryForBulk] = useState<Category | null>(null)
  const [bulkTaxGroupId, setBulkTaxGroupId] = useState('')
  const [showTaxConfirmation, setShowTaxConfirmation] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [itemFormData, setItemFormData] = useState({ 
    name: '', 
    selling_price: '', 
    tax_group_id: '',
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

  // Prevent body scroll when any modal is open
  useEffect(() => {
    if (showItemModal || showCategoryModal || showBulkTaxModal || showImportModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showItemModal, showCategoryModal, showBulkTaxModal, showImportModal])

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
  }

  const loadData = async () => {
    try {
      const [productsData, categoriesData, taxGroupsData] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getActiveTaxGroups()
      ])
      
      // Enrich products with category names and tax rates
      const enrichedProducts = productsData.map((p: any) => {
        const category = categoriesData.find((c: Category) => c.id === p.category_id)
        const taxGroup = taxGroupsData.find((tg: TaxGroup) => tg.id === p.tax_group_id)
        return {
          ...p,
          category_name: category?.name,
          tax_group: taxGroup, // Assign the whole taxGroup object
        }
      })
      
      setProducts(enrichedProducts)
      setCategories(categoriesData.filter((c: Category) => c.is_active))
      setTaxGroups(taxGroupsData.filter((tg: TaxGroup) => tg.is_active))
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!itemFormData.tax_group_id) {
        showToast('Please select a tax group', 'error')
        return
      }

      const productData: any = {
        name: itemFormData.name,
        selling_price: parseFloat(itemFormData.selling_price),
        tax_group_id: itemFormData.tax_group_id,
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
        showToast('Menu item updated successfully', 'success')
      } else {
        await api.createProduct(productData)
        showToast('Menu item created successfully', 'success')
      }
      
      setShowItemModal(false)
      setEditingProduct(null)
      resetItemForm()
      loadData()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Unknown error occurred'
      showToast(`Failed to save menu item: ${errorMessage}`, 'error')
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, categoryFormData)
        showToast('Category updated successfully', 'success')
      } else {
        await api.createCategory(categoryFormData)
        showToast('Category created successfully', 'success')
      }
      
      setShowCategoryModal(false)
      setEditingCategory(null)
      resetCategoryForm()
      loadData()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Unknown error occurred'
      showToast(`Failed to save category: ${errorMessage}`, 'error')
    }
  }

  const resetItemForm = () => {
    setItemFormData({ 
      name: '', 
      selling_price: '', 
      tax_group_id: '',
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
      tax_group_id: product.tax_group_id || '',
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
      showToast('Menu item deactivated successfully', 'success')
      loadData()
    } catch (error) {
      showToast('Failed to deactivate menu item', 'error')
    }
  }

  const handleDeactivateCategory = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this category?')) return
    try {
      await api.deleteCategory(id)
      showToast('Category deactivated successfully', 'success')
      loadData()
    } catch (error) {
      showToast('Failed to deactivate category', 'error')
    }
  }

  const handleBulkTaxGroupAssign = (category: Category) => {
    setSelectedCategoryForBulk(category)
    setBulkTaxGroupId('')
    setShowBulkTaxModal(true)
  }

  const handleBulkTaxSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategoryForBulk || !bulkTaxGroupId) {
      showToast('Please select a tax group', 'error')
      return
    }

    // Show custom confirmation instead of browser alert
    setShowTaxConfirmation(true)
  }

  const handleConfirmTaxAssignment = async () => {
    if (!selectedCategoryForBulk || !bulkTaxGroupId) {
      return
    }

    try {
      const result = await api.bulkUpdateProductsByCategory(selectedCategoryForBulk.id, bulkTaxGroupId)
      showToast(`Successfully updated ${result.updated_count} products`, 'success')
      setShowBulkTaxModal(false)
      setSelectedCategoryForBulk(null)
      setBulkTaxGroupId('')
      setShowTaxConfirmation(false)
      loadData()
    } catch (error: any) {
      console.error('Bulk update error:', error)
      // FastAPI 422 errors have a specific structure
      let errorMessage = 'Unknown error occurred'
      if (error?.response?.data) {
        const errorData = error.response.data
        // Handle FastAPI validation errors (422)
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const validationErrors = errorData.detail.map((err: any) => 
            `${err.loc?.join('.')}: ${err.msg}`
          ).join(', ')
          errorMessage = `Validation error: ${validationErrors}`
        } else if (errorData.detail) {
          errorMessage = errorData.detail
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        }
      } else if (error?.message) {
        errorMessage = error.message
      }
      showToast(`Failed to update products: ${errorMessage}`, 'error')
      setShowTaxConfirmation(false)
    }
  }

  const handleCancelTaxConfirmation = () => {
    setShowTaxConfirmation(false)
  }

  const handleImportFile = async () => {
    if (!importFile) return
    
    setIsImporting(true)
    setImportErrors([])
    
    try {
      const result = await api.importMenu(importFile)
      
      if (result.status === "success") {
        showToast(
          `Successfully imported ${result.inserted_items} items and created ${result.inserted_categories} categories`,
          'success'
        )
        setShowImportModal(false)
        setImportFile(null)
        setImportErrors([])
        loadData()
      } else {
        setImportErrors(result.errors || ["Import failed"])
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Unknown error occurred'
      const errorData = error?.response?.data
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setImportErrors(errorData.errors)
      } else {
        setImportErrors([`Upload failed: ${errorMessage}`])
      }
    } finally {
      setIsImporting(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
        setImportFile(file)
      } else {
        showToast('Only CSV or XLSX files are allowed', 'error')
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
        setImportFile(file)
      } else {
        showToast('Only CSV or XLSX files are allowed', 'error')
      }
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
    <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">Menu</h1>
            <p className="text-sm text-primary/60">Manage categories, items, and tax groups.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditingCategory(null)
                resetCategoryForm()
                setShowCategoryModal(true)
              }}
              className="btn-primary px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 text-base"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
            <button
              onClick={() => {
                setShowImportModal(true)
                setImportFile(null)
                setImportErrors([])
              }}
              className="bg-primary text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 text-base"
            >
              <Upload className="w-5 h-5" />
              Import Menu
            </button>
            <button
              onClick={() => {
                setEditingProduct(null)
                resetItemForm()
                setShowItemModal(true)
              }}
              className="btn-primary px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 text-base"
            >
              <Plus className="w-5 h-5" />
              Add Menu Item
            </button>
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-2xl shadow-md mb-6 p-6 border border-[#E5E7EB]">
          <h2 className="text-xl font-bold text-[#610027] mb-4">Categories</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring-3 outline-hidden ${
                selectedCategory === null
                  ? 'bg-[#610027] text-white shadow-md'
                  : 'bg-white text-[#610027] hover:bg-[#B45A69]/10 border border-[#E5E7EB]'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-2"
              >
                <button
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring-3 outline-hidden ${
                    selectedCategory === category.id
                      ? 'bg-[#610027] text-white shadow-md'
                      : 'bg-white text-[#610027] hover:bg-[#B45A69]/10 border border-[#E5E7EB]'
                  }`}
                >
                  {category.name}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditCategory(category)
                  }}
                  className="p-1 rounded-full text-[#6B6B6B] hover:bg-[#E5E7EB] transition-all duration-200 ease-in-out active:scale-[0.9]"
                  title="Edit category"
                >
                  <Edit className="w-3 h-3" />
                </button>
              </div>
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
              className="w-full pl-12 pr-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 transition-all duration-200 text-[#610027] placeholder-[#9CA3AF]"
            />
          </div>
        </div>

        {/* Menu Items by Category */}
        <div className="space-y-6">
          {categories.map((category) => {
            if (selectedCategory && selectedCategory !== category.id) return null
            const categoryProducts = filteredProducts.filter(p => p.category_id === category.id)
            if (categoryProducts.length === 0 && !selectedCategory) return null

            return (
              <div key={category.id} className="bg-white rounded-2xl shadow-md border border-[#E5E7EB]">
                <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-center">
                  <h3 className="text-xl font-bold text-[#610027]">{category.name}</h3>
                  <button
                    onClick={() => handleBulkTaxGroupAssign(category)}
                    className="px-4 py-2 bg-[#912B48] text-white rounded-xl font-medium text-sm hover:bg-[#B45A69]
                             transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg 
                             active:scale-[0.98] flex items-center gap-2"
                    title="Assign tax group to all products in this category"
                  >
                    <Settings className="w-4 h-4" />
                    Assign Tax Group
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full leading-normal">
                    <thead className="bg-linear-to-r from-[#B45A69]/25 to-[#B45A69]/15 border-b-2 border-[#B45A69]/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-extrabold text-[#610027] uppercase tracking-wider">Item</th>
                        <th className="px-6 py-4 text-left text-xs font-extrabold text-[#610027] uppercase tracking-wider">Price</th>
                        <th className="px-6 py-4 text-left text-xs font-extrabold text-[#610027] uppercase tracking-wider">Tax Group</th>
                        <th className="px-6 py-4 text-left text-xs font-extrabold text-[#610027] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-extrabold text-[#610027] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryProducts.map((product, index) => (
                        <tr 
                          key={product.id} 
                          className={`border-b border-[#E5E7EB]/50 transition-all duration-300 ease-in-out hover:bg-linear-to-r hover:from-[#FFF0F3]/30 hover:to-[#FFF0F3]/10 hover:shadow-xs ${
                            index % 2 === 0 ? 'bg-white' : 'bg-[#FFF0F3]/5'
                          }`}
                        >
                          <td className="px-6 py-4 font-semibold text-[#610027] text-sm">{product.name}</td>
                          <td className="px-6 py-4 text-[#610027] font-medium">₹{product.selling_price.toFixed(2)}</td>
                          <td className="px-6 py-4 text-[#6B6B6B] text-sm">
                            {(() => {
                              const taxGroup = taxGroups.find(tg => tg.id === product.tax_group_id)
                              if (!taxGroup) return <span className="text-[#9CA3AF] italic">No Tax Group</span>
                              const inclusiveText = taxGroup.is_tax_inclusive ? ' (Inclusive)' : ' (Exclusive)'
                              return `${taxGroup.name}${inclusiveText}`
                            })()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1.5 text-xs rounded-full font-bold shadow-xs ${
                              product.is_active 
                                ? 'bg-linear-to-r from-green-100 to-green-50 text-green-700 border border-green-200' 
                                : 'bg-linear-to-r from-red-100 to-red-50 text-red-700 border border-red-200'
                            }`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleEditItem(product)}
                                className="p-2 rounded-lg text-[#610027] hover:text-[#912B48] hover:bg-[#FFF0F3]/30 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 shadow-xs hover:shadow-md"
                                title="Edit item"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {product.is_active && (
                                <button
                                  onClick={() => handleDeactivateItem(product.id)}
                                  className="p-2 rounded-lg text-[#912B48] hover:text-[#610027] hover:bg-red-50 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 shadow-xs hover:shadow-md"
                                  title="Delete item"
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
              </div>
            )
          })}

          {/* Uncategorized Items */}
          {(!selectedCategory || selectedCategory === null) && uncategorizedProducts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] overflow-hidden">
              <div className="p-6 border-b border-[#E5E7EB] bg-linear-to-r from-white to-[#FFF0F3]/10">
                <h3 className="text-xl font-bold text-[#610027]">Uncategorized</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead className="bg-linear-to-r from-[#B45A69]/25 to-[#B45A69]/15 border-b-2 border-[#B45A69]/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-[#610027] uppercase tracking-wider">Item</th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-[#610027] uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-[#610027] uppercase tracking-wider">Tax Group</th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-[#610027] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-[#610027] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uncategorizedProducts.map((product, index) => (
                      <tr 
                        key={product.id} 
                        className={`border-b border-[#E5E7EB]/50 transition-all duration-300 ease-in-out hover:bg-linear-to-r hover:from-[#FFF0F3]/30 hover:to-[#FFF0F3]/10 hover:shadow-xs ${
                          index % 2 === 0 ? 'bg-white' : 'bg-[#FFF0F3]/5'
                        }`}
                      >
                        <td className="px-6 py-4 font-semibold text-[#610027] text-sm">{product.name}</td>
                        <td className="px-6 py-4 text-[#610027] font-medium">₹{product.selling_price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-[#6B6B6B] text-sm">
                          {(() => {
                            const taxGroup = taxGroups.find(tg => tg.id === product.tax_group_id)
                            if (!taxGroup) return <span className="text-[#9CA3AF] italic">No Tax Group</span>
                            const inclusiveText = taxGroup.is_tax_inclusive ? ' (Inclusive)' : ' (Exclusive)'
                            return `${taxGroup.name}${inclusiveText}`
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-xs ${
                            product.is_active 
                              ? 'bg-linear-to-r from-green-100 to-green-50 text-green-700 border border-green-200' 
                              : 'bg-linear-to-r from-red-100 to-red-50 text-red-700 border border-red-200'
                          }`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEditItem(product)}
                              className="p-2 rounded-lg text-[#610027] hover:text-[#912B48] hover:bg-[#FFF0F3]/30 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 shadow-xs hover:shadow-md"
                              title="Edit item"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {product.is_active && (
                              <button
                                onClick={() => handleDeactivateItem(product.id)}
                                className="p-2 rounded-lg text-[#912B48] hover:text-[#610027] hover:bg-red-50 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 shadow-xs hover:shadow-md"
                                title="Delete item"
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
            </div>
          )}
        </div>

        {/* Menu Item Modal */}
        {showItemModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowItemModal(false)
              setEditingProduct(null)
              resetItemForm()
            }}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E7EB]">
                <h2 className="text-2xl font-bold text-[#610027]">
                  {editingProduct ? 'Edit Menu Item' : 'Add Menu Item'}
                </h2>
                <button
                  onClick={() => {
                    setShowItemModal(false)
                    setEditingProduct(null)
                    resetItemForm()
                  }}
                  className="text-[#6B6B6B] hover:text-[#610027] transition-all duration-200 ease-in-out active:scale-[0.9] p-2 rounded-full hover:bg-[#FFF0F3]/20"
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
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 transition-all duration-200 text-[#610027] placeholder-[#9CA3AF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#6B6B6B] mb-2">Category</label>
                  <select
                    value={itemFormData.category_id}
                    onChange={(e) => setItemFormData({ ...itemFormData, category_id: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 transition-all duration-200 text-[#610027]"
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
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 transition-all duration-200 text-[#610027] placeholder-[#9CA3AF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#6B6B6B] mb-2">Tax Group *</label>
                  <select
                    value={itemFormData.tax_group_id}
                    onChange={(e) => setItemFormData({ ...itemFormData, tax_group_id: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 transition-all duration-200 text-[#610027]"
                  >
                    <option value="">Select Tax Group</option>
                    {taxGroups.map((tg) => (
                      <option key={tg.id} value={tg.id}>
                        {tg.name} ({tg.total_rate}% - {tg.is_tax_inclusive ? 'Inclusive' : 'Exclusive'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={itemFormData.is_active}
                      onChange={(e) => setItemFormData({ ...itemFormData, is_active: e.target.checked })}
                      className="w-5 h-5 border border-[#E5E7EB] rounded-sm focus:ring-2 focus:ring-[#912B48] accent-[#912B48]"
                    />
                    <span className="text-sm font-semibold text-[#6B6B6B]">Active</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-[#6B6B6B] hover:text-[#610027] flex items-center gap-1 transition-all duration-200 ease-in-out active:scale-[0.95] focus-visible:ring-3 outline-hidden"
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
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 transition-all duration-200 text-[#610027]"
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
                    className="px-6 py-3 rounded-xl font-medium border border-[#912B48] text-[#610027] hover:bg-[#912B48] hover:text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#912B48] text-white rounded-xl font-medium hover:bg-[#B45A69] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
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
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowCategoryModal(false)
              setEditingCategory(null)
              resetCategoryForm()
            }}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full animate-fade-in animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E7EB]">
                <h2 className="text-2xl font-bold text-[#610027]">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h2>
                <button
                  onClick={() => {
                    setShowCategoryModal(false)
                    setEditingCategory(null)
                    resetCategoryForm()
                  }}
                  className="text-[#6B6B6B] hover:text-[#610027] transition-all duration-200 ease-in-out active:scale-[0.9] p-2 rounded-full hover:bg-[#FFF0F3]/20"
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
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 transition-all duration-200 text-[#610027] placeholder-[#9CA3AF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#6B6B6B] mb-2">Display Order</label>
                  <input
                    type="number"
                    value={categoryFormData.display_order}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 transition-all duration-200 text-[#610027] placeholder-[#9CA3AF]"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={categoryFormData.is_active}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, is_active: e.target.checked })}
                      className="w-5 h-5 border border-[#E5E7EB] rounded-sm focus:ring-2 focus:ring-[#912B48] accent-[#912B48]"
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
                    className="px-6 py-3 rounded-xl font-medium border border-[#912B48] text-[#610027] hover:bg-[#912B48] hover:text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#912B48] text-white rounded-xl font-medium hover:bg-[#B45A69] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  >
                    {editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Tax Group Assignment Modal */}
        {showBulkTaxModal && selectedCategoryForBulk && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowBulkTaxModal(false)
              setSelectedCategoryForBulk(null)
              setBulkTaxGroupId('')
              setShowTaxConfirmation(false)
            }}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full animate-fade-in animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E7EB]">
                <h2 className="text-2xl font-bold text-[#610027]">
                  Assign Tax Group to Category
                </h2>
                <button
                  onClick={() => {
                    setShowBulkTaxModal(false)
                    setSelectedCategoryForBulk(null)
                    setBulkTaxGroupId('')
                    setShowTaxConfirmation(false)
                  }}
                  className="text-[#6B6B6B] hover:text-[#610027] transition-all duration-200 ease-in-out active:scale-[0.9] p-2 rounded-full hover:bg-[#FFF0F3]/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleBulkTaxSubmit} className="space-y-5">
                <div>
                  <p className="text-sm text-[#6B6B6B] mb-4">
                    This will assign the selected tax group to <strong>all products</strong> in the category <strong>&quot;{selectedCategoryForBulk.name}&quot;</strong>.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#6B6B6B] mb-2">Tax Group *</label>
                  <select
                    value={bulkTaxGroupId}
                    onChange={(e) => setBulkTaxGroupId(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 transition-all duration-200 text-[#610027]"
                  >
                    <option value="">Select Tax Group</option>
                    {taxGroups.map((tg) => (
                      <option key={tg.id} value={tg.id}>
                        {tg.name} ({tg.total_rate}% - {tg.is_tax_inclusive ? 'Inclusive' : 'Exclusive'})
                      </option>
                    ))}
                  </select>
                </div>
                {/* Confirmation Notification */}
                {showTaxConfirmation && (
                  <div className="mt-4 p-4 bg-[#FFF0F3] border border-[#B45A69] rounded-xl">
                    <p className="text-sm text-[#610027] mb-4">
                      Are you sure you want to assign this tax group to <strong>ALL products</strong> in &quot;{selectedCategoryForBulk?.name}&quot;?
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={handleCancelTaxConfirmation}
                        className="px-4 py-2 rounded-xl font-medium border border-[#912B48] text-[#610027] hover:bg-[#FFF0F3] transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmTaxAssignment}
                        className="px-4 py-2 bg-[#912B48] text-white rounded-xl font-medium hover:bg-[#B45A69] transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkTaxModal(false)
                      setSelectedCategoryForBulk(null)
                      setBulkTaxGroupId('')
                      setShowTaxConfirmation(false)
                    }}
                    className="px-6 py-3 rounded-xl font-medium border border-[#912B48] text-[#610027] hover:bg-[#912B48] hover:text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#912B48] text-white rounded-xl font-medium hover:bg-[#B45A69] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  >
                    Assign to All Products
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Import Menu Modal */}
        {showImportModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowImportModal(false)
              setImportFile(null)
              setImportErrors([])
            }}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E7EB]">
                <h2 className="text-2xl font-bold text-[#3E2C24]">
                  Import Menu Items
                </h2>
                <button
                  onClick={() => {
                    setShowImportModal(false)
                    setImportFile(null)
                    setImportErrors([])
                  }}
                  className="text-[#6B6B6B] hover:text-[#3E2C24] transition-all duration-200 ease-in-out active:scale-[0.9] p-2 rounded-full hover:bg-[#FAF7F2]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-5">
                {/* Info Note */}
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-sm text-rose-800">
                    <strong>Note:</strong> Invalid rows will stop the entire import. Fix errors and re-upload.
                  </p>
                </div>
                
                {/* Template Download */}
                <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                  <FileText className="w-4 h-4" />
                  <span>Download template:</span>
                  <a
                    href="/menu-import-template.csv"
                    download
                    className="text-rose-900 hover:text-rose-200 underline"
                  >
                    CSV Template
                  </a>
                </div>
                
                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    dragActive
                      ? 'border-[#C89B63] bg-[#C89B63]/10'
                      : 'border-[#E5E7EB] bg-rose-50 hover:bg-white'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {importFile ? (
                    <div className="space-y-3">
                      <FileText className="w-12 h-12 mx-auto text-rose-700" />
                      <p className="font-medium text-[#3E2C24]">{importFile.name}</p>
                      <button
                        onClick={() => setImportFile(null)}
                        className="text-sm text-[#6B6B6B] hover:text-[#3E2C24]"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-12 h-12 mx-auto text-[#6B6B6B]" />
                      <p className="text-rose-950">
                        Drag & drop your CSV or XLSX file here
                      </p>
                      <p className="text-sm text-rose-950">or</p>
                      <label className="inline-block">
                        <span className="px-6 py-3 bg-rose-950 text-white rounded-xl font-medium cursor-pointer hover:bg-rose-900 transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98]">
                          Browse Files
                        </span>
                        <input
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
                
                {/* Error Display */}
                {importErrors.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <h3 className="font-semibold text-red-800 mb-2">Import Errors:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700 max-h-60 overflow-y-auto">
                      {importErrors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false)
                      setImportFile(null)
                      setImportErrors([])
                    }}
                    className="px-6 py-3 rounded-xl font-medium border border-rose-300 text-rose-300 hover:bg-rose-50  transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                    disabled={isImporting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImportFile}
                    disabled={!importFile || isImporting}
                    className="px-6 py-3 bg-rose-700 text-white rounded-xl font-medium hover:bg-rose-800 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isImporting ? 'Importing...' : 'Import'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div 
            className="fixed bottom-6 right-6 z-9999"
            style={{
              animation: 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl min-w-75 max-w-md bg-white border ${
              toast.type === 'success' 
                ? 'border-green-200' 
                : 'border-red-200'
            }`}>
              {toast.type === 'success' ? (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              )}
              <p className={`text-sm font-semibold flex-1 ${
                toast.type === 'success' ? 'text-[#610027]' : 'text-[#610027]'
              }`}>
                {toast.message}
              </p>
              <button
                onClick={() => setToast(null)}
                className="shrink-0 p-1 rounded-full text-[#6B6B6B] hover:text-[#610027] hover:bg-[#FFF0F3]/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
    </div>
  )
}
