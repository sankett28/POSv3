'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Search, Plus, Minus, Trash2, CheckCircle, Wallet, Smartphone, CreditCard, PackageOpen, AlertCircle } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  selling_price: number
  unit: 'pcs' | 'kg' | 'litre'
  is_active: boolean
}

interface BillItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export default function PosBillingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stocks, setStocks] = useState<Record<string, number>>({})
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    loadProducts()
    loadStocks()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await api.getProducts()
      // Filter only active products
      setProducts(data.filter((p: Product) => p.is_active))
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStocks = async () => {
    try {
      const stockData = await api.getStocks()
      const stockMap: Record<string, number> = {}
      stockData.forEach((stock: { product_id: string; current_stock: number }) => {
        stockMap[stock.product_id] = stock.current_stock
      })
      setStocks(stockMap)
    } catch (error) {
      console.error('Error loading stocks:', error)
    }
  }

  const addToBill = (product: Product) => {
    const currentStock = stocks[product.id] || 0
    const existingItem = billItems.find((item) => item.product_id === product.id)

    if (existingItem) {
      const newQuantity = existingItem.quantity + 1
      if (newQuantity > currentStock) {
        alert(`Insufficient stock! Available: ${currentStock}`)
        return
      }
      setBillItems(
        billItems.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: newQuantity,
                total_price: newQuantity * item.unit_price,
              }
            : item
        )
      )
    } else {
      if (currentStock < 1) {
        alert(`Insufficient stock! Available: ${currentStock}`)
        return
      }
      setBillItems([
        ...billItems,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.selling_price,
          total_price: product.selling_price,
        },
      ])
    }
  }

  const updateQuantity = (productId: string, delta: number) => {
    const currentStock = stocks[productId] || 0
    setBillItems(
      billItems
        .map((item) => {
          if (item.product_id === productId) {
            const newQuantity = item.quantity + delta
            if (newQuantity <= 0) return null
            if (newQuantity > currentStock) {
              alert(`Insufficient stock! Available: ${currentStock}`)
              return item
            }
            return {
              ...item,
              quantity: newQuantity,
              total_price: newQuantity * item.unit_price,
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

  const subtotal = billItems.reduce((sum, item) => sum + item.total_price, 0)
  const total = subtotal

  const handleCompleteBill = async () => {
    if (billItems.length === 0) {
      alert('Please add items to the bill first!')
      return
    }

    // Validate stock one more time before submitting
    for (const item of billItems) {
      const currentStock = stocks[item.product_id] || 0
      if (item.quantity > currentStock) {
        alert(`Insufficient stock for ${item.product_name}! Available: ${currentStock}, Requested: ${item.quantity}`)
        return
      }
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
      loadStocks() // Reload stocks after bill creation
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create bill')
    }
  }

  const filteredProducts =
    searchTerm.length > 0
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : products

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-6">Quick Billing</h1>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search or scan product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading products...</div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const currentStock = stocks[product.id] || 0
                  const isOutOfStock = currentStock <= 0
                  return (
                    <button
                      key={product.id}
                      onClick={() => !isOutOfStock && addToBill(product)}
                      disabled={isOutOfStock}
                      className={`border rounded-md p-4 text-center transition-colors flex flex-col items-center justify-center ${
                        isOutOfStock
                          ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                          : 'bg-gray-50 border-gray-200 hover:bg-black hover:text-white'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-md flex items-center justify-center mx-auto mb-2 font-bold ${
                        isOutOfStock ? 'bg-gray-300 text-gray-500' : 'bg-black text-white'
                      }`}>
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-semibold text-sm mb-1">{product.name}</div>
                      <div className="font-bold mb-1">₹{product.selling_price.toFixed(2)}</div>
                      <div className={`text-xs ${isOutOfStock ? 'text-red-600' : currentStock < 10 ? 'text-orange-600' : 'text-gray-600'}`}>
                        {isOutOfStock ? (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Out of Stock
                          </span>
                        ) : (
                          `Stock: ${currentStock} ${product.unit}`
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6 sticky top-4 h-fit">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-black">Current Bill</h3>
              <button
                onClick={() => setBillItems([])}
                className="text-sm bg-black text-white hover:bg-black hover:text-white rounded-md p-2"
              >
                Clear All
              </button>
            </div>

            <div className="mb-4 max-h-64 overflow-y-auto">
              {billItems.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <PackageOpen className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg">Add products to start billing</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {billItems.map((item) => {
                    const currentStock = stocks[item.product_id] || 0
                    return (
                      <div key={item.product_id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex-1">
                          <div className="font-semibold text-base text-gray-900">{item.product_name}</div>
                          <div className="text-xs text-gray-500">
                            ₹{item.unit_price.toFixed(2)} x {item.quantity}
                          </div>
                          {item.quantity > currentStock && (
                            <div className="text-xs text-red-600 flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              Low stock: {currentStock} available
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product_id, -1)}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="font-bold text-base text-black">₹{item.total_price.toFixed(2)}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, 1)}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product_id)}
                            className="p-1 rounded-full hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-base text-gray-700">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 pt-4 border-t-2 border-black">
              <span className="text-2xl font-bold text-black">Total</span>
              <span className="text-2xl font-bold text-black">₹{total.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-colors ${
                  paymentMethod === 'CASH'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-black hover:text-black'
                }`}
              >
                <Wallet className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">Cash</span>
              </button>
              <button
                onClick={() => setPaymentMethod('UPI')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-colors ${
                  paymentMethod === 'UPI'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-black hover:text-black'
                }`}
              >
                <Smartphone className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">UPI</span>
              </button>
              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-colors ${
                  paymentMethod === 'CARD'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-black hover:text-black'
                }`}
              >
                <CreditCard className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">Card</span>
              </button>
            </div>

            <button
              onClick={handleCompleteBill}
              disabled={billItems.length === 0}
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" />
              Complete & Print
            </button>
          </div>
        </div>

        {showSuccess && (
          <div className="fixed bottom-6 right-6 bg-black text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5" />
            <span>Bill generated successfully!</span>
          </div>
        )}
      </div>
    </div>
  )
}

