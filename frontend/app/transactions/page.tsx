'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Eye, Calendar, Receipt } from 'lucide-react'

interface BillItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  line_subtotal: number
  tax_rate: number
  tax_amount: number
  line_total: number
}

interface Bill {
  id: string
  bill_number: string
  subtotal: number
  tax_amount: number
  total_amount: number
  payment_method: string
  created_at: string
  items: BillItem[]
}

export default function TransactionsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)

  useEffect(() => {
    loadBills()
  }, [])

  const loadBills = async () => {
    try {
      const data = await api.getBills(100)
      setBills(data)
    } catch (error) {
      console.error('Error loading bills:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPaymentMethod = (method: string) => {
    return method.charAt(0) + method.slice(1).toLowerCase()
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-500 py-8">Loading transactions...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">Transactions</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bill Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tax Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Payment Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{bill.bill_number}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(bill.created_at)}</td>
                      <td className="px-4 py-3 text-gray-900 font-semibold">₹{bill.total_amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-600">₹{(bill.tax_amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatPaymentMethod(bill.payment_method)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="text-gray-600 hover:text-black flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black">Order Details</h2>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bill Number:</span>
                  <span className="font-semibold">{selectedBill.bill_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span>{formatDate(selectedBill.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span>{formatPaymentMethod(selectedBill.payment_method)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>₹{(selectedBill.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (GST):</span>
                  <span>₹{(selectedBill.tax_amount || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <h3 className="font-semibold text-lg mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedBill.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-100">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.product_name}</div>
                        <div className="text-sm text-gray-500">
                          ₹{item.unit_price.toFixed(2)} × {item.quantity} (Tax: {item.tax_rate}%)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">₹{item.line_total.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">Tax: ₹{item.tax_amount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>₹{(selectedBill.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (GST):</span>
                  <span>₹{(selectedBill.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-black pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>₹{selectedBill.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

