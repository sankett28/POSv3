'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Wallet,
  Smartphone,
  CreditCard,
  PackageOpen,
  AlertCircle,
  Coffee,
  ShoppingCart,
  Receipt,
} from 'lucide-react'
import SuccessModal from '@/components/ui/SuccessModal'

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
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [generatedBillData, setGeneratedBillData] = useState<any>(null)
  const [generatedInvoiceNumber, setGeneratedInvoiceNumber] = useState('')

  useEffect(() => {
    loadProducts()
    loadStocks()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await api.getProducts()
      setProducts(data.filter((p: Product) => p.is_active))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadStocks = async () => {
    try {
      const stockData = await api.getStocks()
      const map: Record<string, number> = {}
      stockData.forEach((s: any) => (map[s.product_id] = s.current_stock))
      setStocks(map)
    } catch (err) {
      console.error(err)
    }
  }

  const addToBill = (product: Product) => {
    const stock = stocks[product.id] || 0
    const existing = billItems.find(i => i.product_id === product.id)

    if (existing) {
      if (existing.quantity + 1 > stock) return alert('Insufficient stock')
      setBillItems(
        billItems.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + 1, total_price: (i.quantity + 1) * i.unit_price }
            : i
        )
      )
    } else {
      if (stock < 1) return alert('Out of stock')
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

  const updateQuantity = (id: string, delta: number) => {
    setBillItems(
      billItems
        .map(i => {
          if (i.product_id !== id) return i
          const qty = i.quantity + delta
          if (qty <= 0) return null
          if (qty > (stocks[id] || 0)) return i
          return { ...i, quantity: qty, total_price: qty * i.unit_price }
        })
        .filter(Boolean) as BillItem[]
    )
  }

  const removeItem = (id: string) => {
    setBillItems(billItems.filter(i => i.product_id !== id))
  }

  const subtotal = billItems.reduce((s, i) => s + i.total_price, 0)
  const gst = subtotal * 0.05
  const total = subtotal + gst

  const handleCompleteBill = async () => {
    if (!billItems.length) return alert('Add items first')

    try {
      const res = await api.createBill({
        items: billItems.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
        payment_method: paymentMethod,
      })

      setGeneratedBillData({ billItems, subtotal, gst, total, paymentMethod })
      setGeneratedInvoiceNumber(res.invoice_number)
      setShowSuccessModal(true)
      setBillItems([])
      loadStocks()
    } catch (err: any) {
      console.error('Failed to create bill:', err)
      alert(err?.response?.data?.detail || 'Failed to create bill')
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-screen flex bg-[#F5F3EE]">
      {/* LEFT MENU */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-6 bg-[#3E2C24] text-white flex items-center gap-3 shadow-lg">
          <Coffee />
          <h1 className="text-2xl font-bold">BrewBite POS</h1>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-12 py-3 rounded-xl border"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToBill(p)}
                  className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition"
                >
                  <div className="w-14 h-14 bg-[#C89B63] text-white rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">
                    {p.name[0]}
                  </div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-[#3E2C24] font-bold">₹{p.selling_price}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT CART */}
      <div className="w-96 bg-[#FAF7F2] border-l flex flex-col rounded-2xl shadow-lg m-4">
        <div className="p-6 bg-[#3E2C24] text-white flex items-center gap-3">
          <ShoppingCart />
          <h2 className="font-bold">Order</h2>
        </div>

        <div className="flex-1 p-4">
          {billItems.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <PackageOpen className="mx-auto mb-2" />
              No items
            </div>
          ) : (
            billItems.map(i => (
              <div key={i.product_id} className="flex items-center justify-between mb-3 transition-all duration-200 ease-in-out hover:bg-[#F5F3EE] rounded-xl p-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(i.product_id, -1)}
                    className="text-gray-500 hover:text-red-500 transition-all duration-200 ease-in-out active:scale-[0.9]"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-medium">{i.quantity}x</span>
                  <button
                    onClick={() => updateQuantity(i.product_id, 1)}
                    className="text-gray-500 hover:text-green-500 transition-all duration-200 ease-in-out active:scale-[0.9]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span>{i.product_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>₹{i.total_price.toFixed(2)}</span>
                  <button
                    onClick={() => removeItem(i.product_id)}
                    className="text-red-500 hover:text-red-700 transition-all duration-200 ease-in-out active:scale-[0.9]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t">
          <div className="flex justify-between font-bold mb-4">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCompleteBill}
            className="w-full bg-[#3E2C24] text-white py-3 rounded-xl
                       transition-all duration-200 ease-in-out
                       hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
                       focus-visible:ring outline-none"
          >
            <Receipt className="inline mr-2" />
            Complete Order
          </button>
        </div>
      </div>

      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          billData={generatedBillData}
          invoiceNumber={generatedInvoiceNumber}
        />
      )}
    </div>
  )
}
