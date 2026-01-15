
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
  ShoppingCart,
  Receipt,
} from 'lucide-react'
import Logo from '@/components/ui/Logo'

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

interface BillDetails {
  invoice_number: string
  items: BillItem[]
  subtotal: number
  gst: number
  total: number
  paymentMethod: 'CASH' | 'UPI' | 'CARD'
  date: string
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
  // Tax is calculated by backend - no frontend tax math

  const getCurrentDate = () => {
    const now = new Date()
    return now.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePrintInvoice = () => {
    if (!generatedBillData) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${generatedBillData.billResponse.invoice_number}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
              padding: 30px 15px;
              background: #F5F3EE; /* Warm cream / off-white */
              line-height: 1.5;
            }
            .invoice-container {
              max-width: 700px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1); /* Soft shadows */
              border-radius: 16px; /* rounded-2xl */
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              padding-bottom: 15px;
              border-bottom: 1px solid #E5E7EB;
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .logo-text {
              font-size: 24px;
              font-weight: 700;
              color: #610027; /* Lichy Deep Burgundy */
              margin: 0;
              letter-spacing: -0.2px;
              display: inline-block;
            }
            .logo-dot {
              display: inline-block;
              width: 6px;
              height: 6px;
              background: #FFBB94; /* Cream */
              border-radius: 50%;
              margin-left: 1px;
              vertical-align: top;
              margin-top: 2px;
            }
            .logo-accent {
              display: inline-block;
              width: 16px;
              height: 16px;
              color: #FB9590; /* Soft Pink */
              margin-left: 4px;
              vertical-align: middle;
            }
            .header-left-content h1 {
              font-size: 24px;
              font-weight: 600;
              color: #610027; /* Lichy Deep Burgundy */
              margin: 0 0 2px 0;
              letter-spacing: -0.2px;
            }
            .header-left-content p {
              font-size: 11px;
              color: #6B6B6B;
              margin: 0;
              font-weight: 400;
            }
            .invoice-number-box {
              background: #FAF7F2; /* Light background */
              padding: 8px 12px;
              border-radius: 8px; /* rounded-xl */
              border: 1px solid #E5E7EB;
              text-align: right;
            }
            .invoice-number-box p:first-child {
              font-size: 9px;
              color: #6B6B6B;
              margin-bottom: 3px;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              font-weight: 500;
            }
            .invoice-number-box p:last-child {
              font-size: 16px;
              font-weight: 600;
              color: #610027; /* Lichy Deep Wine */
              margin: 0;
              letter-spacing: 0.2px;
            }
            .details-section {
              background: #fdfdfd;
              padding: 18px;
              border-radius: 6px;
              margin-bottom: 25px;
              border: 1px solid #eee;
            }
            .details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .detail-item {
              border-left: 1px solid #ddd;
              padding-left: 10px;
            }
            .detail-item p:first-child {
              font-size: 9px;
              color: #6B6B6B;
              margin-bottom: 3px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              font-weight: 500;
            }
            .detail-item p:last-child {
              font-size: 14px;
              font-weight: 500;
              color: #610027; /* Lichy Deep Wine */
              margin: 0;
            }
            .table-section {
              margin-bottom: 25px;
            }
            .table-title {
              font-size: 15px;
              font-weight: 600;
              color: #610027; /* Lichy Deep Wine */
              margin-bottom: 10px;
              padding-bottom: 6px;
              border-bottom: 1px solid #E5E7EB;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 0;
            }
            thead {
              background: #FAF7F2; /* Light background */
              color: #555;
            }
            thead tr {
              border-bottom: 1px solid #E5E7EB;
            }
            th {
              text-align: left;
              padding: 10px 12px;
              font-size: 10px;
              font-weight: 600;
              color: #6B6B6B;
              text-transform: uppercase;
              letter-spacing: 0.7px;
            }
            th:nth-child(2), th:nth-child(3), th:nth-child(4) {
              text-align: right;
            }
            tbody tr {
              border-bottom: 1px solid #E5E7EB;
              transition: background 0.1s;
            }
            tbody tr:hover {
              background: #F5F3EE; /* Warm cream / off-white */
            }
            tbody tr:last-child {
              border-bottom: none;
            }
            td {
              padding: 12px;
              font-size: 12px;
              color: #610027; /* Lichy Deep Wine */
            }
            td:first-child {
              font-weight: 500;
            }
            td:nth-child(2), td:nth-child(3), td:nth-child(4) {
              text-align: right;
              font-weight: 400;
            }
            td:nth-child(4) {
              font-weight: 500;
              color: #610027; /* Lichy Deep Wine */
            }
            .totals-section {
              background: #FAF7F2; /* Light background */
              padding: 18px 22px;
              border-radius: 8px; /* rounded-xl */
              border: 1px solid #E5E7EB;
              margin-top: 20px;
            }
            .totals {
              display: flex;
              justify-content: flex-end;
            }
            .totals-inner {
              width: 250px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 13px;
              padding-bottom: 5px;
            }
            .total-row:not(:last-child) {
              border-bottom: 1px dashed #E5E7EB;
            }
            .total-row span:first-child {
              color: #6B6B6B;
              font-weight: 500;
            }
            .total-row span:last-child {
              color: #912B48; /* Lichy Berry */
              font-weight: 600;
            }
            .total-row:last-child {
              font-size: 18px;
              font-weight: 700;
              padding-top: 10px;
              margin-top: 5px;
              border-top: 1px solid #912B48; /* Lichy Primary Rose */
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .total-row:last-child span {
              color: #610027; /* Lichy Deep Wine */
            }
            .footer {
              margin-top: 35px;
              padding-top: 20px;
              border-top: 1px solid #E5E7EB;
              text-align: center;
            }
            .footer p:first-child {
              font-size: 12px;
              color: #6B6B6B;
              margin-bottom: 5px;
              font-weight: 500;
            }
            .footer p:last-child {
              font-size: 9px;
              color: #9CA3AF;
              margin: 0;
            }
            .divider {
              height: 1px;
              background: linear-gradient(to right, transparent, #E5E7EB, transparent);
              margin: 20px 0;
            }
            @media print {
              @page {
                margin: 0.5cm;
                size: A4;
              }
              body {
                padding: 0;
                background: white;
              }
              .invoice-container {
                box-shadow: none;
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="header-left">
                <div class="header-left-content">
                  <h1>
                    <span class="logo-text">Lich<span class="logo-dot"></span>i</span>
                    <svg class="logo-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 11"/>
                    </svg>
                  </h1>
                  <p>Your Daily Dose of Delight</p>
                </div>
              </div>
              <div class="invoice-number-box">
                <p>Bill Number</p>
                <p>${generatedBillData.billResponse.invoice_number}</p>
              </div>
            </div>
            
            <div class="details-section">
              <div class="details">
                <div class="detail-item">
                  <p>Invoice Date</p>
                  <p>${getCurrentDate()}</p>
                </div>
                <div class="detail-item">
                  <p>Payment Method</p>
                  <p>${generatedBillData.paymentMethod}</p>
                </div>
              </div>
            </div>

            <div class="table-section">
              <div class="table-title">Items</div>
              <table>
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${generatedBillData.billItems.map((item: any) => `
                    <tr>
                      <td>${item.product_name}</td>
                      <td>${item.quantity}</td>
                      <td>₹${item.unit_price.toFixed(2)}</td>
                      <td>₹${item.total_price.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="totals-section">
              <div class="totals">
                <div class="totals-inner">
                  <div class="total-row">
                    <span>Subtotal</span>
                    <span>₹${generatedBillData.subtotal.toFixed(2)}</span>
                  </div>
                  <div class="total-row">
                    <span>GST (5%)</span>
                    <span>₹${generatedBillData.gst.toFixed(2)}</span>
                  </div>
                  <div class="total-row">
                    <span>Total Amount</span>
                    <span>₹${generatedBillData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>Thank you for your purchase!</p>
              <p>This is a computer-generated invoice. No signature required.</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `

    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
  }

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

      setGeneratedBillData({ billItems, subtotal, gst: res.tax_amount, total: res.total_amount, paymentMethod })
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
    <div className="h-screen flex bg-[#FFF0F3]">
      {/* CATEGORIES SECTION */}
      <div className="w-56 bg-white rounded-2xl shadow-md m-4 p-6 flex flex-col">
        <h2 className="text-xl font-bold text-[#610027] mb-4">Categories</h2>
        <div className="flex flex-col gap-3">
          {/* Example Category Buttons (replace with actual data mapping) */}
          <button className="w-full text-left px-4 py-3 rounded-full font-medium bg-[#610027] text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">All</button>
          <button className="w-full text-left px-4 py-3 rounded-full font-medium text-[#610027] hover:bg-[#B45A69]/10 border border-[#E5E7EB] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">Drinks</button>
          <button className="w-full text-left px-4 py-3 rounded-full font-medium text-[#610027] hover:bg-[#B45A69]/10 border border-[#E5E7EB] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">Food</button>
          <button className="w-full text-left px-4 py-3 rounded-full font-medium text-[#610027] hover:bg-[#B45A69]/10 border border-[#E5E7EB] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">Cocktails</button>
        </div>
      </div>

      {/* LEFT MENU */}
      <div className="flex-1 flex flex-col bg-[#FFF0F3] p-4">
        <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Logo size="lg" showAccent={true} />
        </div>
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
            <input
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 transition-all duration-200 text-[#610027] placeholder-[#9CA3AF]"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-4 flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold text-[#610027] mb-4">Menu Items</h2>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#912B48] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-[#6B6B6B]">Loading menu items...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToBill(p)}
                  className="bg-white rounded-2xl p-4 shadow-md border border-[#E5E7EB]
                             transition-all duration-200 ease-in-out
                             hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl
                             active:scale-[0.98] cursor-pointer group"
                >
                  <div className="w-14 h-14 bg-[#912B48] text-white rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">
                    {p.name[0]}
                  </div>
                  <h3 className="font-semibold text-[#610027] mb-1">{p.name}</h3>
                  <p className="text-[#912B48] font-bold text-lg">₹{p.selling_price}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT CART */}
      <div className="w-96 bg-white border-l flex flex-col rounded-2xl shadow-lg m-4">
        <div className="p-6 bg-[#610027] text-white flex items-center gap-3">
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
              <div key={i.product_id} className="flex items-center justify-between mb-3 transition-all duration-200 ease-in-out hover:bg-[#FFF0F3]/10 rounded-xl p-2">
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
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
            <div className="text-xs text-[#6B6B6B] mt-1">Tax calculated by backend</div>
          </div>

          <button
            onClick={handleCompleteBill}
            className="w-full bg-[#912B48] text-white py-3 rounded-xl
                       transition-all duration-200 ease-in-out
                       hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
                       focus-visible:ring outline-none hover:bg-[#B45A69]"
          >
            <Receipt className="inline mr-2" />
            Complete Order
          </button>
        </div>
      </div>
    </div>
  )
}