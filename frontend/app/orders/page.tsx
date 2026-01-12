'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Search, Plus, Minus, Trash2, CheckCircle, Wallet, Smartphone, CreditCard, PackageOpen } from 'lucide-react'

interface Category {
  id: string
  name: string
  is_active: boolean
}

interface Product {
  id: string
  name: string
  selling_price: number
  tax_rate?: number
  category_id?: string
  category_name?: string
  is_active: boolean
}

interface BillItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  tax_rate: number
  subtotal: number
  tax_amount: number
  total_price: number
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
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ])
      
      const activeProducts = productsData.filter((p: Product) => p.is_active)
      
      // Enrich products with category names
      const enrichedProducts = activeProducts.map((p: any) => {
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

  const addToBill = (product: Product) => {
    const existingItem = billItems.find((item) => item.product_id === product.id)
    const taxRate = product.tax_rate || 0

    if (existingItem) {
      const newQuantity = existingItem.quantity + 1
      const subtotal = newQuantity * product.selling_price
      const taxAmount = (subtotal * taxRate) / 100
      const totalPrice = subtotal + taxAmount
      
      setBillItems(
        billItems.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: newQuantity,
                subtotal,
                tax_amount: taxAmount,
                total_price: totalPrice,
              }
            : item
        )
      )
    } else {
      const subtotal = product.selling_price
      const taxAmount = (subtotal * taxRate) / 100
      const totalPrice = subtotal + taxAmount
      
      setBillItems([
        ...billItems,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.selling_price,
          tax_rate: taxRate,
          subtotal,
          tax_amount: taxAmount,
          total_price: totalPrice,
        },
      ])
    }
  }

  const updateQuantity = (productId: string, delta: number) => {
    setBillItems(
      billItems
        .map((item) => {
          if (item.product_id === productId) {
            const newQuantity = item.quantity + delta
            if (newQuantity <= 0) return null
            const subtotal = newQuantity * item.unit_price
            const taxAmount = (subtotal * item.tax_rate) / 100
            const totalPrice = subtotal + taxAmount
            return {
              ...item,
              quantity: newQuantity,
              subtotal,
              tax_amount: taxAmount,
              total_price: totalPrice,
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

  const subtotal = billItems.reduce((sum, item) => sum + item.subtotal, 0)
  const totalTax = billItems.reduce((sum, item) => sum + item.tax_amount, 0)
  const total = subtotal + totalTax

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
                              {product.tax_rate && product.tax_rate > 0 && (
                                <div className="text-xs text-[#6B6B6B] mt-1">+ {product.tax_rate}% tax</div>
                              )}
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
                            {product.tax_rate && product.tax_rate > 0 && (
                              <div className="text-xs text-[#6B6B6B] mt-1">+ {product.tax_rate}% tax</div>
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
                  {billItems.map((item) => (
                    <div key={item.product_id} className="flex justify-between items-start py-2 border-b border-[#E5E7EB] last:border-b-0 transition-all duration-200 ease-in-out hover:bg-[#FAF7F2] rounded-md px-2">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-[#1F1F1F]">{item.product_name}</div>
                        <div className="text-xs text-[#6B6B6B]">
                          ₹{item.unit_price.toFixed(2)} × {item.quantity}
                        </div>
                        {item.tax_rate > 0 && (
                          <div className="text-xs text-[#6B6B6B]">Tax: {item.tax_rate}%</div>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4 pt-4 border-t border-[#E5E7EB]">
              <div className="flex justify-between text-sm text-[#6B6B6B]">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#6B6B6B]">
                <span>Tax (GST)</span>
                <span>₹{totalTax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 pt-4 border-t-2 border-[#3E2C24]">
              <span className="text-lg font-bold text-[#3E2C24]">Total</span>
              <span className="text-lg font-bold text-[#3E2C24]">₹{total.toFixed(2)}</span>
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
