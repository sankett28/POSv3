'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Search, Plus, Minus, Trash2, CheckCircle, Wallet, Smartphone, CreditCard, PackageOpen } from 'lucide-react'

interface Category {
  id: string
  name: string
  is_active: boolean
}

interface TaxGroup {
  id: string
  name: string
  total_rate: number
  split_type: 'GST_50_50' | 'NO_SPLIT'
  is_tax_inclusive: boolean
}

// Replace lines 21-26
interface Product {
  id: string
  name: string
  selling_price: number
  tax_group_id?: string; // This should be present if assigned in backend
  tax_group?: TaxGroup;  // Add tax group data
  category_id?: string
  category_name?: string
  is_active: boolean
}

interface BillItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  tax_group?: TaxGroup
  preview_taxable_value?: number
  preview_tax_amount?: number
  preview_cgst?: number
  preview_sgst?: number
  preview_total?: number
}

export default function OrdersPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsData, categoriesData, taxGroupsData] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getActiveTaxGroups()
      ])
      
      const activeProducts = productsData.filter((p: Product) => p.is_active)
      
      // Enrich products with category names and tax group data
      const enrichedProducts = activeProducts.map((p: any) => {
        const category = categoriesData.find((c: Category) => c.id === p.category_id)
        const taxGroup = taxGroupsData.find((tg: TaxGroup) => tg.id === p.tax_group_id)
        return {
          ...p,
          category_name: category?.name,
          tax_group: taxGroup
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

  const addToBill = (product: Product) => {
    const existingItem = billItems.find((item) => item.product_id === product.id)

    if (existingItem) {
      const newQuantity = existingItem.quantity + 1
      const subtotal = newQuantity * product.selling_price
      const taxPreview = calculateTaxPreview(product.selling_price, newQuantity, product.tax_group)
      
      setBillItems(
        billItems.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: newQuantity,
                subtotal,
                tax_group: product.tax_group,
                preview_taxable_value: taxPreview.taxable_value,
                preview_tax_amount: taxPreview.tax_amount,
                preview_cgst: taxPreview.cgst,
                preview_sgst: taxPreview.sgst,
                preview_total: taxPreview.total,
              }
            : item
        )
      )
    } else {
      const subtotal = product.selling_price
      const taxPreview = calculateTaxPreview(product.selling_price, 1, product.tax_group)
      
      setBillItems([
        ...billItems,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.selling_price,
          subtotal,
          tax_group: product.tax_group,
          preview_taxable_value: taxPreview.taxable_value,
          preview_tax_amount: taxPreview.tax_amount,
          preview_cgst: taxPreview.cgst,
          preview_sgst: taxPreview.sgst,
          preview_total: taxPreview.total,
        },
      ])
    }
  }

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    setBillItems(
      billItems
        .map((item) => {
          if (item.product_id === productId) {
            const newQuantity = item.quantity + delta
            if (newQuantity <= 0) return null
            const subtotal = newQuantity * item.unit_price
            const taxGroup = item.tax_group || product.tax_group
            const taxPreview = calculateTaxPreview(item.unit_price, newQuantity, taxGroup)
            
            return {
              ...item,
              quantity: newQuantity,
              subtotal,
              tax_group: taxGroup,
              preview_taxable_value: taxPreview.taxable_value,
              preview_tax_amount: taxPreview.tax_amount,
              preview_cgst: taxPreview.cgst,
              preview_sgst: taxPreview.sgst,
              preview_total: taxPreview.total,
            }
          }
          return item
        })
        .filter((item): item is BillItem => item !== null)
    )
  }

  const removeItem = (productId: string) => {
    setBillItems(billItems.filter((item) => item.product_id !== productId))
  }

  // Tax preview calculation function (for display only - backend does actual calculation)
  const calculateTaxPreview = (
    unitPrice: number,
    quantity: number,
    taxGroup?: TaxGroup
  ): {
    taxable_value: number
    tax_amount: number
    cgst: number
    sgst: number
    total: number
  } => {
    if (!taxGroup || taxGroup.total_rate === 0) {
      const subtotal = unitPrice * quantity
      return {
        taxable_value: subtotal,
        tax_amount: 0,
        cgst: 0,
        sgst: 0,
        total: subtotal
      }
    }

    let taxable_value: number
    let tax_amount: number
    let total: number

    if (taxGroup.is_tax_inclusive) {
      // Price includes tax - extract tax
      total = unitPrice * quantity
      const rateMultiplier = 1 + (taxGroup.total_rate / 100)
      taxable_value = total / rateMultiplier
      tax_amount = total - taxable_value
    } else {
      // Price excludes tax - add tax
      taxable_value = unitPrice * quantity
      tax_amount = taxable_value * (taxGroup.total_rate / 100)
      total = taxable_value + tax_amount
    }

    // Round to 2 decimal places
    taxable_value = Math.round(taxable_value * 100) / 100
    tax_amount = Math.round(tax_amount * 100) / 100
    total = Math.round(total * 100) / 100

    // Split CGST/SGST
    let cgst = 0
    let sgst = 0
    if (taxGroup.split_type === 'GST_50_50') {
      cgst = Math.round((tax_amount / 2) * 100) / 100
      sgst = tax_amount - cgst  // Ensure they sum to tax_amount
    } else {
      cgst = tax_amount  // No split - all goes to CGST
    }

    return {
      taxable_value,
      tax_amount,
      cgst,
      sgst,
      total
    }
  }

  // Calculate totals from preview values
  const subtotal = billItems.reduce((sum, item) => sum + (item.preview_taxable_value || item.subtotal), 0)
  const totalTax = billItems.reduce((sum, item) => sum + (item.preview_tax_amount || 0), 0)
  const totalCGST = billItems.reduce((sum, item) => sum + (item.preview_cgst || 0), 0)
  const totalSGST = billItems.reduce((sum, item) => sum + (item.preview_sgst || 0), 0)
  const grandTotal = billItems.reduce((sum, item) => sum + (item.preview_total || item.subtotal), 0)

  const handleCompleteBill = async () => {
    if (billItems.length === 0) {
      alert('Please add items to the order first!')
      return
    }

    try {
      await api.createBill({
        items: billItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        payment_method: paymentMethod,
      })

      setShowSuccess(true)
      setBillItems([])
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create order')
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

  return (
    <div className="p-4 sm:p-8 bg-[#F5F3EE] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#3E2C24] mb-6">Orders</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar: Categories */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB]">
            <h3 className="font-bold text-[#3E2C24] mb-4 text-xl">Categories</h3>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring outline-none ${selectedCategory === null
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
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring outline-none ${selectedCategory === category.id
                      ? 'bg-[#3E2C24] text-white shadow-md'
                      : 'bg-[#FAF7F2] text-[#3E2C24] hover:bg-[#C89B63]/10'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Menu Items */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB]">
            <div className="mb-6">
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

            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading menu items...</div>
            ) : (
              <div className="space-y-6">
                {categories.map((category) => {
                  const categoryProducts = productsByCategory[category.id] || []
                  if (categoryProducts.length === 0 || (selectedCategory && selectedCategory !== category.id)) return null

                  return (
                    <div key={category.id}>
                      <h4 className="font-bold text-[#3E2C24] mb-4 text-xl">{category.name}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {categoryProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => addToBill(product)}
                            className="bg-white rounded-2xl p-4 shadow-md border border-[#E5E7EB]
                                       transition-all duration-200 ease-in-out
                                       hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl
                                       active:scale-[0.98] cursor-pointer group flex flex-col items-center justify-between min-h-[160px] text-center"
                          >
                            {/* Product Image Placeholder */}
                            <div className="h-24 w-full bg-gradient-to-br from-[#C89B63]/30 to-[#F4A261]/30 flex items-center justify-center rounded-xl mb-3">
                              <span className="text-5xl">☕</span> {/* Cafe-friendly emoji fallback */}
                            </div>
                            {/* Product Details */}
                            <div className="flex-grow flex flex-col justify-end w-full">
                              <div className="font-semibold text-[#1F1F1F] text-lg mb-1 leading-tight">{product.name}</div>
                              <div className="font-bold text-[#3E2C24] text-xl">₹{product.selling_price.toFixed(2)}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Uncategorized Items */}
                {(!selectedCategory || selectedCategory === null) && uncategorizedProducts.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#3E2C24] mb-4 text-xl">Other Items</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {uncategorizedProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => addToBill(product)}
                          className="bg-white rounded-2xl p-4 shadow-md border border-[#E5E7EB]
                                     transition-all duration-200 ease-in-out
                                     hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl
                                     active:scale-[0.98] cursor-pointer group flex flex-col items-center justify-between min-h-[160px] text-center"
                        >
                          {/* Product Image Placeholder */}
                          <div className="h-24 w-full bg-gradient-to-br from-[#C89B63]/30 to-[#F4A261]/30 flex items-center justify-center rounded-xl mb-3">
                            <span className="text-5xl">☕</span> {/* Cafe-friendly emoji fallback */}
                          </div>
                          {/* Product Details */}
                          <div className="flex-grow flex flex-col justify-end w-full">
                            <div className="font-semibold text-[#1F1F1F] text-lg mb-1 leading-tight">{product.name}</div>
                            <div className="font-bold text-[#3E2C24] text-xl">₹{product.selling_price.toFixed(2)}</div>
                            {product.tax_group && (
                              <div className="text-xs text-[#6B6B6B] mt-1">
                                {product.tax_group.name}
                                {product.tax_group.is_tax_inclusive && ' (Incl. Tax)'}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB] sticky top-4 h-fit">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#E5E7EB]">
              <h3 className="text-xl font-bold text-[#3E2C24]">Current Order</h3>
              <button
                onClick={() => setBillItems([])}
                className="text-sm bg-[#F4A261] text-white hover:bg-[#E08F50] rounded-xl px-4 py-2 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                Clear
              </button>
            </div>

            <div className="mb-4 max-h-64 overflow-y-auto">
              {billItems.length === 0 ? (
                <div className="text-center text-[#9CA3AF] py-8">
                  <PackageOpen className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-sm">Add items to start order</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {billItems.map((item) => {
                    const taxPreview = item.preview_tax_amount || 0
                    const cgst = item.preview_cgst || 0
                    const sgst = item.preview_sgst || 0
                    const itemTotal = item.preview_total || item.subtotal
                    
                    return (
                      <div key={item.product_id} className="flex justify-between items-start py-2 border-b border-[#E5E7EB] last:border-b-0 transition-all duration-200 ease-in-out hover:bg-[#FAF7F2] rounded-md px-2">
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-[#1F1F1F]">{item.product_name}</div>
                          <div className="text-xs text-[#6B6B6B]">
                            ₹{item.unit_price.toFixed(2)} × {item.quantity}
                          </div>
                          {/* Tax Breakdown Preview */}
                          {taxPreview > 0 && item.tax_group && (
                            <div className="text-xs text-[#6B6B6B] mt-1">
                              {item.tax_group.split_type === 'GST_50_50' ? (
                                <>CGST: ₹{cgst.toFixed(2)} | SGST: ₹{sgst.toFixed(2)}</>
                              ) : (
                                <>Tax: ₹{taxPreview.toFixed(2)}</>
                              )}
                            </div>
                          )}
                          {item.tax_group && item.tax_group.is_tax_inclusive && (
                            <div className="text-xs text-blue-600 mt-0.5">(Tax Inclusive)</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product_id, -1)}
                            className="p-1.5 rounded-full bg-[#FAF7F2] text-[#3E2C24] hover:bg-[#E5E7EB] transition-all duration-200 ease-in-out active:scale-[0.9] border border-[#E5E7EB]"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-sm text-[#1F1F1F] min-w-[30px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, 1)}
                            className="p-1.5 rounded-full bg-[#FAF7F2] text-[#3E2C24] hover:bg-[#E5E7EB] transition-all duration-200 ease-in-out active:scale-[0.9] border border-[#E5E7EB]"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product_id)}
                            className="p-1.5 rounded-full bg-[#F5F3EE] text-[#EF4444] hover:bg-[#F4A261]/20 transition-all duration-200 ease-in-out active:scale-[0.9]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="text-right min-w-[70px]">
                            <div className="font-bold text-sm text-[#1F1F1F]">
                              ₹{itemTotal.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4 pt-4 border-t border-[#E5E7EB]">
              <div className="flex justify-between text-sm text-[#6B6B6B]">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {totalTax > 0 && (
                <>
                  {totalCGST > 0 && totalSGST > 0 ? (
                    <>
                      <div className="flex justify-between text-sm text-[#6B6B6B]">
                        <span>CGST</span>
                        <span>₹{totalCGST.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-[#6B6B6B]">
                        <span>SGST</span>
                        <span>₹{totalSGST.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm text-[#6B6B6B]">
                      <span>Tax (GST)</span>
                      <span>₹{totalTax.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-between items-center mb-6 pt-4 border-t-2 border-[#3E2C24]">
              <span className="text-lg font-bold text-[#3E2C24]">Total</span>
              <span className="text-lg font-bold text-[#3E2C24]">₹{grandTotal.toFixed(2)}</span>
            </div>
            <div className="text-xs text-[#6B6B6B] text-center mb-4">
              * Tax preview - Final amount calculated by backend
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border border-[#E5E7EB] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring outline-none ${
                  paymentMethod === 'CASH'
                    ? 'bg-[#3E2C24] text-white shadow-md'
                    : 'bg-[#FAF7F2] text-[#3E2C24] hover:bg-[#C89B63]/10'
                }`}
              >
                <Wallet className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Cash</span>
              </button>
              <button
                onClick={() => setPaymentMethod('UPI')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border border-[#E5E7EB] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring outline-none ${
                  paymentMethod === 'UPI'
                    ? 'bg-[#3E2C24] text-white shadow-md'
                    : 'bg-[#FAF7F2] text-[#3E2C24] hover:bg-[#C89B63]/10'
                }`}
              >
                <Smartphone className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">UPI</span>
              </button>
              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border border-[#E5E7EB] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring outline-none ${
                  paymentMethod === 'CARD'
                    ? 'bg-[#3E2C24] text-white shadow-md'
                    : 'bg-[#FAF7F2] text-[#3E2C24] hover:bg-[#C89B63]/10'
                }`}
              >
                <CreditCard className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Card</span>
              </button>
            </div>

            <button
              onClick={handleCompleteBill}
              disabled={billItems.length === 0}
              className="w-full bg-[#3E2C24] text-white py-3 px-4 rounded-xl font-semibold 
                         transition-all duration-200 ease-in-out
                         hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
                         focus-visible:ring outline-none disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Order
            </button>
          </div>
        </div>

        {showSuccess && (
          <div className="fixed bottom-6 right-6 bg-[#3E2C24] text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5" />
            <span>Order completed successfully!</span>
          </div>
        )}
      </div>
    </div>
  )
}
