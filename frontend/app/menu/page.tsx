'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Plus, Edit, Trash2, Search, X, Settings, CheckCircle, AlertCircle, Upload, FileText } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'

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
  tax_group?: TaxGroup
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
      
      const enrichedProducts = productsData.map((p: any) => {
        const category = categoriesData.find((c: Category) => c.id === p.category_id)
        const taxGroup = taxGroupsData.find((tg: TaxGroup) => tg.id === p.tax_group_id)
        return {
          ...p,
          category_name: category?.name,
          tax_group: taxGroup,
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
      let errorMessage = 'Unknown error occurred'
      if (error?.response?.data) {
        const errorData = error.response.data
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <div className="space-y-2 w-full sm:w-auto">
            <Skeleton className="h-9 sm:h-10 w-40 sm:w-48" />
            <Skeleton className="h-4 sm:h-5 w-64 sm:w-72" />
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-11 w-full sm:w-44 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Categories chips skeleton */}
        <div className="bg-white rounded-2xl shadow-md mb-6 p-5 sm:p-6 border border-border">
          <Skeleton className="h-7 w-36 mb-4" />
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Skeleton className="h-9 sm:h-10 w-14 sm:w-16 rounded-full" />
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-9 sm:h-10 w-24 sm:w-28 rounded-full" />
            ))}
          </div>
        </div>

        {/* Search bar skeleton */}
        <Skeleton className="h-11 sm:h-12 w-full rounded-xl mb-6" />

        {/* Table sections skeleton */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md border border-border">
              <div className="p-5 sm:p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Skeleton className="h-7 w-40 sm:w-48" />
                <Skeleton className="h-10 w-full sm:w-52 rounded-xl" />
              </div>
              <div className="overflow-x-auto p-4 sm:p-6">
                <div className="space-y-4 min-w-[640px] md:min-w-full">
                  {[...Array(5)].map((_, row) => (
                    <div key={row} className="flex flex-wrap sm:flex-nowrap gap-4 sm:gap-6">
                      <Skeleton className="h-6 flex-1 min-w-[140px]" />
                      <Skeleton className="h-6 w-20 sm:w-28" />
                      <Skeleton className="h-6 flex-1 min-w-[160px]" />
                      <Skeleton className="h-8 w-20 sm:w-24 rounded-full" />
                      <div className="flex gap-2 sm:gap-3">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Menu</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage categories, items, and tax groups.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setEditingCategory(null)
              resetCategoryForm()
              setShowCategoryModal(true)
            }}
            className="flex-1 sm:flex-none bg-primary text-white px-5 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 text-sm sm:text-base min-w-[140px]"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Category
          </button>
          <button
            onClick={() => {
              setShowImportModal(true)
              setImportFile(null)
              setImportErrors([])
            }}
            className="flex-1 sm:flex-none bg-primary text-white px-5 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 text-sm sm:text-base min-w-[140px]"
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            Import Menu
          </button>
          <button
            onClick={() => {
              setEditingProduct(null)
              resetItemForm()
              setShowItemModal(true)
            }}
            className="flex-1 sm:flex-none bg-primary text-white px-5 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 text-sm sm:text-base min-w-[140px]"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Menu Item
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white rounded-2xl shadow-md mb-6 p-5 sm:p-6 border border-border">
        <h2 className="text-lg sm:text-xl font-bold text-primary-text mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 sm:px-5 py-2 rounded-full font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring-3 outline-none text-sm sm:text-base ${
              selectedCategory === null
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-primary-text hover:bg-brand-dusty-rose/10 border border-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-1.5 sm:gap-2"
            >
              <button
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 sm:px-5 py-2 rounded-full font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring-3 outline-none text-sm sm:text-base ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-primary-text hover:bg-brand-dusty-rose/10 border border-gray-300'
                }`}
              >
                {category.name}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditCategory(category)
                }}
                className="p-1.5 sm:p-2 rounded-full text-secondary-text hover:bg-[#E5E7EB] transition-all duration-200 ease-in-out active:scale-95"
                title="Edit category"
              >
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-text w-4 h-4 sm:w-5 sm:h-5" />
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white hover:bg-warm-cream/10 transition-all duration-200 text-primary-text placeholder-muted-text text-sm sm:text-base"
        />
      </div>

      {/* Menu Items by Category */}
      <div className="space-y-6 sm:space-y-8">
        {categories.map((category) => {
          if (selectedCategory && selectedCategory !== category.id) return null
          const categoryProducts = filteredProducts.filter(p => p.category_id === category.id)
          if (categoryProducts.length === 0 && !selectedCategory) return null

          return (
            <div key={category.id} className="bg-white rounded-2xl shadow-md border border-border">
              <div className="p-5 sm:p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg sm:text-xl font-bold text-primary-text">{category.name}</h3>
                <button
                  onClick={() => handleBulkTaxGroupAssign(category)}
                  className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-xl font-medium text-sm hover:bg-brand-dusty-rose transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                  title="Assign tax group to all products in this category"
                >
                  <Settings className="w-4 h-4" />
                  Assign Tax Group
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead className="bg-gradient-to-r from-primary/25 to-brand-dusty-rose/15 border-b-2 border-brand-dusty-rose/30">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider whitespace-nowrap">
                        Item
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider whitespace-nowrap">
                        Price
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider whitespace-nowrap">
                        Tax Group
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryProducts.map((product, index) => (
                      <tr 
                        key={product.id} 
                        className={`border-b border-border/50 transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-warm-cream/30 hover:to-warm-cream/10 hover:shadow-xs ${
                          index % 2 === 0 ? 'bg-white' : 'bg-warm-cream/5'
                        }`}
                      >
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-primary-text text-sm">
                          {product.name}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-primary-text font-medium text-sm">
                          ₹{product.selling_price.toFixed(2)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-secondary-text text-xs sm:text-sm">
                          {(() => {
                            const taxGroup = taxGroups.find(tg => tg.id === product.tax_group_id)
                            if (!taxGroup) return <span className="text-muted-text italic">No Tax Group</span>
                            const inclusiveText = taxGroup.is_tax_inclusive ? ' (Inclusive)' : ' (Exclusive)'
                            return `${taxGroup.name}${inclusiveText}`
                          })()}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className={`px-2.5 sm:px-3 py-1 text-xs rounded-full font-bold shadow-xs ${
                            product.is_active 
                              ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200' 
                              : 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200'
                          }`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex gap-2 sm:gap-3">
                            <button
                              onClick={() => handleEditItem(product)}
                              className="p-1.5 sm:p-2 rounded-lg text-primary-text hover:text-primary hover:bg-warm-cream/30 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 shadow-xs hover:shadow-md"
                              title="Edit item"
                            >
                              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            {product.is_active && (
                              <button
                                onClick={() => handleDeactivateItem(product.id)}
                                className="p-1.5 sm:p-2 rounded-lg text-primary hover:text-primary-text hover:bg-red-50 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 shadow-xs hover:shadow-md"
                                title="Delete item"
                              >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
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
          <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-border bg-gradient-to-r from-white to-warm-cream/10">
              <h3 className="text-lg sm:text-xl font-bold text-primary-text">Uncategorized</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead className="bg-gradient-to-r from-brand-dusty-rose/25 to-brand-dusty-rose/15 border-b-2 border-brand-dusty-rose/30">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider whitespace-nowrap">
                      Item
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider whitespace-nowrap">
                      Price
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider whitespace-nowrap">
                      Tax Group
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {uncategorizedProducts.map((product, index) => (
                    <tr 
                      key={product.id} 
                      className={`border-b border-border/50 transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-warm-cream/30 hover:to-warm-cream/10 hover:shadow-xs ${
                        index % 2 === 0 ? 'bg-white' : 'bg-warm-cream/5'
                      }`}
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-primary-text text-sm">
                        {product.name}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-primary-text font-medium text-sm">
                        ₹{product.selling_price.toFixed(2)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-secondary-text text-xs sm:text-sm">
                        {(() => {
                          const taxGroup = taxGroups.find(tg => tg.id === product.tax_group_id)
                          if (!taxGroup) return <span className="text-muted-text italic">No Tax Group</span>
                          const inclusiveText = taxGroup.is_tax_inclusive ? ' (Inclusive)' : ' (Exclusive)'
                          return `${taxGroup.name}${inclusiveText}`
                        })()}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className={`px-2.5 sm:px-3 py-1 text-xs rounded-full font-bold shadow-xs ${
                          product.is_active 
                            ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200' 
                            : 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex gap-2 sm:gap-3">
                          <button
                            onClick={() => handleEditItem(product)}
                            className="p-1.5 sm:p-2 rounded-lg text-primary-text hover:text-primary hover:bg-warm-cream/30 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 shadow-xs hover:shadow-md"
                            title="Edit item"
                          >
                            <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          {product.is_active && (
                            <button
                              onClick={() => handleDeactivateItem(product.id)}
                              className="p-1.5 sm:p-2 rounded-lg text-primary hover:text-primary-text hover:bg-red-50 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 shadow-xs hover:shadow-md"
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
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

      {/* Menu Item Modal - Responsive */}
      {showItemModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowItemModal(false)
            setEditingProduct(null)
            resetItemForm()
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5 sm:mb-6 pb-4 border-b border-border">
              <h2 className="text-xl sm:text-2xl font-bold text-primary-text">
                {editingProduct ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <button
                onClick={() => {
                  setShowItemModal(false)
                  setEditingProduct(null)
                  resetItemForm()
                }}
                className="text-secondary-text hover:text-primary-text transition-all duration-200 ease-in-out active:scale-95 p-2 rounded-full hover:bg-warm-cream/20"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleItemSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-semibold text-secondary-text mb-1.5">Name *</label>
                <input
                  type="text"
                  value={itemFormData.name}
                  onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 sm:py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white hover:bg-warm-cream/10 transition-all duration-200 text-primary-text placeholder-muted-text text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-text mb-1.5">Category</label>
                <select
                  value={itemFormData.category_id}
                  onChange={(e) => setItemFormData({ ...itemFormData, category_id: e.target.value })}
                  className="w-full px-4 py-2.5 sm:py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white hover:bg-warm-cream/10 transition-all duration-200 text-primary-text text-sm sm:text-base"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-text mb-1.5">Selling Price *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={itemFormData.selling_price}
                  onChange={(e) => setItemFormData({ ...itemFormData, selling_price: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 sm:py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white hover:bg-warm-cream/10 transition-all duration-200 text-primary-text placeholder-muted-text text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-text mb-1.5">Tax Group *</label>
                <select
                  value={itemFormData.tax_group_id}
                  onChange={(e) => setItemFormData({ ...itemFormData, tax_group_id: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 sm:py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white hover:bg-warm-cream/10 transition-all duration-200 text-primary-text text-sm sm:text-base"
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
                <label className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={itemFormData.is_active}
                    onChange={(e) => setItemFormData({ ...itemFormData, is_active: e.target.checked })}
                    className="w-5 h-5 border border-border rounded-sm focus:ring-2 focus:ring-primary accent-[#912B48]"
                  />
                  <span className="text-sm font-semibold text-secondary-text">Active</span>
                </label>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-secondary-text hover:text-primary-text flex items-center gap-1.5 transition-all duration-200 ease-in-out active:scale-95 focus-visible:ring-3 outline-none"
              >
                <Settings className="w-4 h-4" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
              </button>

              {showAdvanced && (
                <div>
                  <label className="block text-sm font-semibold text-secondary-text mb-1.5">Unit (optional)</label>
                  <select
                    value={itemFormData.unit}
                    onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 sm:py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white hover:bg-warm-cream/10 transition-all duration-200 text-primary-text text-sm sm:text-base"
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

              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 sm:pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowItemModal(false)
                    setEditingProduct(null)
                    resetItemForm()
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl font-medium border border-primary text-primary-text hover:bg-primary hover:text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-primary text-white rounded-xl font-medium hover:bg-brand-dusty-rose transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] text-sm sm:text-base"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal - Responsive */}
      {showCategoryModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowCategoryModal(false)
            setEditingCategory(null)
            resetCategoryForm()
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5 sm:mb-6 pb-4 border-b border-border">
              <h2 className="text-xl sm:text-2xl font-bold text-primary-text">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  setEditingCategory(null)
                  resetCategoryForm()
                }}
                className="text-secondary-text hover:text-primary-text transition-all duration-200 ease-in-out active:scale-95 p-2 rounded-full hover:bg-warm-cream/20"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-semibold text-secondary-text mb-1.5">Name *</label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 sm:py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white hover:bg-warm-cream/10 transition-all duration-200 text-primary-text placeholder-muted-text text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-text mb-1.5">Display Order</label>
                <input
                  type="number"
                  value={categoryFormData.display_order}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 sm:py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white hover:bg-warm-cream/10 transition-all duration-200 text-primary-text placeholder-muted-text text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={categoryFormData.is_active}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, is_active: e.target.checked })}
                    className="w-5 h-5 border border-border rounded-sm focus:ring-2 focus:ring-primary accent-[#912B48]"
                  />
                  <span className="text-sm font-semibold text-secondary-text">Active</span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 sm:pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false)
                    setEditingCategory(null)
                    resetCategoryForm()
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl font-medium border border-primary text-primary-text hover:bg-primary hover:text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-primary text-white rounded-xl font-medium hover:bg-brand-dusty-rose transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] text-sm sm:text-base"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Tax Group Assignment Modal - Responsive */}
      {showBulkTaxModal && selectedCategoryForBulk && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowBulkTaxModal(false)
            setSelectedCategoryForBulk(null)
            setBulkTaxGroupId('')
            setShowTaxConfirmation(false)
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5 sm:mb-6 pb-4 border-b border-border">
              <h2 className="text-xl sm:text-2xl font-bold text-primary-text">
                Assign Tax Group to Category
              </h2>
              <button
                onClick={() => {
                  setShowBulkTaxModal(false)
                  setSelectedCategoryForBulk(null)
                  setBulkTaxGroupId('')
                  setShowTaxConfirmation(false)
                }}
                className="text-secondary-text hover:text-primary-text transition-all duration-200 ease-in-out active:scale-95 p-2 rounded-full hover:bg-warm-cream/20"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleBulkTaxSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <p className="text-sm text-secondary-text mb-4">
                  This will assign the selected tax group to <strong>all products</strong> in the category <strong>&quot;{selectedCategoryForBulk.name}&quot;</strong>.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-text mb-1.5">Tax Group *</label>
                <select
                  value={bulkTaxGroupId}
                  onChange={(e) => setBulkTaxGroupId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 sm:py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white hover:bg-warm-cream/10 transition-all duration-200 text-primary-text text-sm sm:text-base"
                >
                  <option value="">Select Tax Group</option>
                  {taxGroups.map((tg) => (
                    <option key={tg.id} value={tg.id}>
                      {tg.name} ({tg.total_rate}% - {tg.is_tax_inclusive ? 'Inclusive' : 'Exclusive'})
                    </option>
                  ))}
                </select>
              </div>

              {showTaxConfirmation && (
                <div className="mt-4 p-4 bg-primary border border-border-default rounded-xl">
                  <p className="text-sm text-primary-text mb-4">
                    Are you sure you want to assign this tax group to <strong>ALL products</strong> in &quot;{selectedCategoryForBulk?.name}&quot;?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      type="button"
                      onClick={handleCancelTaxConfirmation}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium border border-primary text-primary-text hover:bg-warm-cream transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmTaxAssignment}
                      className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-brand-dusty-rose transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 sm:pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkTaxModal(false)
                    setSelectedCategoryForBulk(null)
                    setBulkTaxGroupId('')
                    setShowTaxConfirmation(false)
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl font-medium border border-primary text-primary-text hover:bg-primary hover:text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-primary text-white rounded-xl font-medium hover:bg-brand-dusty-rose transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] text-sm sm:text-base"
                >
                  Assign to All Products
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Menu Modal - Responsive */}
      {showImportModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowImportModal(false)
            setImportFile(null)
            setImportErrors([])
          }}
        >
          <div 
            className="bg-bg-page rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 w-full max-w-lg sm:max-w-xl md:max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5 sm:mb-6 pb-4 border-b border-border">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                Import Menu Items
              </h2>
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportFile(null)
                  setImportErrors([])
                }}
                className="text-secondary-text hover:text-text-primary transition-all duration-200 ease-in-out active:scale-95 p-2 rounded-full hover:bg-primary"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="space-y-5">
              {/* Info Note */}
              <div className="p-4 bg-secondary border border-border-default rounded-xl text-sm sm:text-base">
                <p className="text-text-primary">
                  <strong>Note:</strong> Invalid rows will stop the entire import. Fix errors and re-upload.
                </p>
              </div>
              
              {/* Template Download */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm text-secondary-text">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Download template:</span>
                </div>
                <a
                  href="/menu-import-template.csv"
                  download
                  className="text-primary hover:text-interactive-hover underline"
                >
                  CSV Template
                </a>
              </div>
              
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? 'border-[#C89B63] bg-[#C89B63]/10'
                    : 'border-border bg-primary/30 hover:bg-bg-page'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {importFile ? (
                  <div className="space-y-3">
                    <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-text-primary" />
                    <p className="font-medium text-text-primary text-sm sm:text-base">{importFile.name}</p>
                    <button
                      onClick={() => setImportFile(null)}
                      className="text-xs sm:text-sm text-secondary-text hover:text-text-primary"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-secondary-text" />
                    <p className="text-text-primary text-sm sm:text-base">
                      Drag & drop your CSV or XLSX file here
                    </p>
                    <p className="text-xs sm:text-sm text-text-primary">or</p>
                    <label className="inline-block">
                      <span className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary text-text-primary rounded-xl font-medium cursor-pointer hover:bg-interactive-hover transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base">
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
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm sm:text-base">
                  <h3 className="font-semibold text-red-800 mb-2">Import Errors:</h3>
                  <ul className="list-disc list-inside space-y-1 text-red-700 max-h-60 overflow-y-auto">
                    {importErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 sm:pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false)
                    setImportFile(null)
                    setImportErrors([])
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl bg-bg-page font-medium border border-secondary text-text-primary hover:bg-interactive-hover hover:text-text-inverse transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] text-sm sm:text-base"
                  disabled={isImporting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportFile}
                  disabled={!importFile || isImporting}
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-primary text-text-primary rounded-xl font-medium hover:bg-accent transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isImporting ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification - Responsive position & size */}
      {toast && (
        <div 
          className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:right-6 sm:left-auto z-[9999] max-w-[90vw] sm:max-w-md"
          style={{
            animation: 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div className={`flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl bg-white border ${
            toast.type === 'success' 
              ? 'border-green-200' 
              : 'border-red-200'
          }`}>
            {toast.type === 'success' ? (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            )}
            <p className={`text-sm sm:text-base font-semibold flex-1 ${
              toast.type === 'success' ? 'text-primary-text' : 'text-primary-text'
            }`}>
              {toast.message}
            </p>
            <button
              onClick={() => setToast(null)}
              className="shrink-0 p-1.5 sm:p-2 rounded-full text-secondary-text hover:text-primary-text hover:bg-warm-cream/20 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}