'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Search, Plus, Minus, Trash2, CheckCircle } from 'lucide-react'

interface Product {
  id: string
  name: string
  barcode?: string
  price: number
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
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH')
  const [showSuccess, setShowSuccess] = useState(false)

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

  const addToBill = (product: Product) => {
    const existingItem = billItems.find((item) => item.product_id === product.id)

    if (existingItem) {
      setBillItems(
        billItems.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total_price: (item.quantity + 1) * item.unit_price,
              }
            : item
        )
      )
    } else {
      setBillItems([
        ...billItems,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.price,
          total_price: product.price,
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
      alert(error.response?.data?.detail || 'Failed to create bill')
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8">
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
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToBill(product)}
                    className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center hover:bg-black hover:text-white transition-colors"
                  >
                    <div className="w-12 h-12 bg-black text-white rounded-md flex items-center justify-center mx-auto mb-2 font-bold">
                      {product.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="font-semibold text-sm mb-1">{product.name}</div>
                    <div className="font-bold">₹{product.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6 sticky top-4 h-fit">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-black">Current Bill</h3>
              <button
                onClick={() => setBillItems([])}
                className="text-sm text-gray-600 hover:text-black"
              >
                Clear All
              </button>
            </div>

            <div className="mb-4 max-h-64 overflow-y-auto">
              {billItems.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>Add products to start billing</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {billItems.map((item) => (
                    <div key={item.product_id} className="flex justify-between items-center py-2 border-b border-gray-200">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">{item.product_name}</div>
                        <div className="text-xs text-gray-500">
                          Qty: {item.quantity} × ₹{item.unit_price.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, -1)}
                          className="text-gray-600 hover:text-black"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-black">₹{item.total_price.toFixed(2)}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, 1)}
                          className="text-gray-600 hover:text-black"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="text-red-600 hover:text-red-800 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4 pb-4 border-t-2 border-gray-200 pt-4">
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {(['CASH', 'UPI', 'CARD'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                    paymentMethod === method
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            <button
              onClick={handleCompleteBill}
              disabled={billItems.length === 0}
              className="w-full bg-black text-white py-3 px-4 rounded-md font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

