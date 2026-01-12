'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Eye, Calendar, Receipt, X } from 'lucide-react'

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
    <div className="p-4 sm:p-8 bg-[#F5F3EE] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#3E2C24]">Transactions</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB]">
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead className="bg-[#FAF7F2]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider rounded-tl-xl">Bill Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Total Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Tax Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Payment Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#9CA3AF]">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id} className="border-t border-[#E5E7EB] transition-all duration-200 ease-in-out hover:bg-[#FAF7F2]">
                      <td className="px-4 py-3 font-medium text-[#1F1F1F]">{bill.bill_number}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{formatDate(bill.created_at)}</td>
                      <td className="px-4 py-3 text-[#3E2C24] font-bold">₹{bill.total_amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">₹{(bill.tax_amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{formatPaymentMethod(bill.payment_method)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={async () => {
                            console.log("Fetching bill with ID:", bill.id);
                            try {
                              const fullBillDetails = await api.getBill(bill.id);
                              setSelectedBill(fullBillDetails);
                            } catch (error) {
                              console.error("Failed to fetch full bill details:", error);
                              // Optionally, set an error state or show a user-friendly message
                            }
                          }}
                          className="text-[#3E2C24] hover:text-[#C89B63] flex items-center gap-1 transition-all duration-200 ease-in-out hover:scale-[1.05] active:scale-[0.95]"
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
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in animate-scale-in">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E7EB]">
                <h2 className="text-2xl font-bold text-[#3E2C24]">Order Details</h2>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="text-[#6B6B6B] hover:text-[#3E2C24] transition-all duration-200 ease-in-out active:scale-[0.9] p-2 rounded-full hover:bg-[#FAF7F2]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-[#FAF7F2] rounded-xl border border-[#E5E7EB]">
                <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                  <span className="text-[#6B6B6B]">Bill Number:</span>
                  <span className="font-bold text-[#3E2C24]">{selectedBill.bill_number}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                  <span className="text-[#6B6B6B]">Date & Time:</span>
                  <span className="text-[#3E2C24]">{formatDate(selectedBill.created_at)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                  <span className="text-[#6B6B6B]">Payment Method:</span>
                  <span className="text-[#3E2C24]">{formatPaymentMethod(selectedBill.payment_method)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#6B6B6B]">Subtotal:</span>
                  <span className="text-[#3E2C24]">₹{(selectedBill.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#6B6B6B]">Tax (GST):</span>
                  <span className="text-[#3E2C24]">₹{(selectedBill.tax_amount || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-6 p-4 bg-[#FAF7F2] rounded-xl border border-[#E5E7EB]">
                <h3 className="font-bold text-xl text-[#3E2C24] mb-4">Items Ordered</h3>
                <div className="space-y-3">
                  {selectedBill.items.length === 0 ? (
                    <div className="text-center text-[#9CA3AF] py-4">No items found for this order.</div>
                  ) : (
                    selectedBill.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start py-2 border-b border-[#E5E7EB] last:border-b-0">
                        <div className="flex-1 pr-4">
                          <div className="font-semibold text-[#1F1F1F] text-base">{item.product_name}</div>
                          <div className="text-sm text-[#6B6B6B]">
                            {item.quantity} x ₹{item.unit_price.toFixed(2)} ({item.tax_rate || 0}% Tax)
                          </div>
                        </div>
                        <div className="text-right font-bold text-[#1F1F1F]">
                          ₹{(item.unit_price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E5E7EB] space-y-3">
                <div className="flex justify-between text-[#6B6B6B] text-base">
                  <span>Subtotal:</span>
                  <span>₹{(selectedBill.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#6B6B6B] text-base">
                  <span>Tax (GST):</span>
                  <span>₹{(selectedBill.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-[#3E2C24] pt-4 border-t border-[#E5E7EB]">
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

