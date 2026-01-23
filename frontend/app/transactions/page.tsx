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
  cgst_amount?: number
  sgst_amount?: number
  tax_group_name?: string
  is_tax_inclusive?: boolean
  total_rate?: number
  line_total: number
}

interface Bill {
  id: string
  bill_number: string
  subtotal: number
  tax_amount: number
  cgst?: number
  sgst?: number
  total_amount: number
  payment_method: string
  created_at: string
  items: BillItem[]
}

// ────────────────────────────────────────────────
// Skeleton Components
// ────────────────────────────────────────────────

function SkeletonTableRow() {
  return (
    <tr className="border-b border-border/50">
      <td className="px-6 py-4">
        <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-36 bg-gray-200 rounded animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
      </td>
    </tr>
  )
}

function SkeletonDetailSection() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
      <div className="p-4 bg-warm-cream/20 rounded-xl border border-border space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-2">
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-warm-cream/20 rounded-xl border border-border space-y-4">
        <div className="h-7 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-b border-border-light py-3 last:border-none space-y-2">
            <div className="flex justify-between">
              <div className="h-6 w-56 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-28 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-warm-cream/20 rounded-xl border border-border space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-6 w-28 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
        <div className="h-10 w-full bg-gray-200 rounded animate-pulse mt-4"></div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────

export default function TransactionsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    loadBills()
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedBill) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedBill])

  const loadBills = async () => {
    try {
      setLoading(true)
      const data = await api.getBills(100)
      setBills(data ?? [])
    } catch (error) {
      console.error('Error loading bills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewBill = async (billId: string) => {
    try {
      setLoadingDetail(true)
      const fullBill = await api.getBill(billId)
      setSelectedBill(fullBill)
    } catch (err) {
      console.error('Failed to load bill details:', err)
    } finally {
      setLoadingDetail(false)
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary-text mb-1">Transactions</h1>
        <p className="text-sm text-primary-text/60">Review bills and reprint invoices.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead className="bg-gradient-to-r from-brand-dusty-rose/25 to-brand-dusty-rose/15 border-b-2 border-brand-dusty-rose/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider">
                  Bill Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider">
                  Tax Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {[...Array(6)].map((_, i) => (
                    <SkeletonTableRow key={i} />
                  ))}
                </>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-text bg-warm-cream/5">
                    <p className="text-sm font-medium">No transactions found</p>
                  </td>
                </tr>
              ) : (
                bills.map((bill, index) => (
                  <tr
                    key={bill.id}
                    className={`border-b border-border/50 transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-warm-cream/30 hover:to-warm-cream/10 hover:shadow-xs ${
                      index % 2 === 0 ? 'bg-white' : 'bg-warm-cream/5'
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-primary-text text-sm">{bill.bill_number}</td>
                    <td className="px-6 py-4 text-secondary-text text-sm">{formatDate(bill.created_at)}</td>
                    <td className="px-6 py-4 text-coffee-brown font-bold text-base">
                      ₹{bill.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-secondary-text text-sm">
                      ₹{(bill.tax_amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-warm-cream text-primary-text border border-brand-dusty-rose/20">
                        {formatPaymentMethod(bill.payment_method)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewBill(bill.id)}
                        disabled={loadingDetail}
                        className="px-4 py-2 rounded-lg text-primary-text hover:text-white hover:bg-coffee-brown flex items-center gap-2 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 shadow-xs hover:shadow-md font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Detail Modal */}
      {selectedBill && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBill(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in animate-scale-in custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
              <h2 className="text-2xl font-bold text-primary-text">Order Details</h2>
              <button
                onClick={() => setSelectedBill(null)}
                className="text-secondary-text hover:text-primary-text transition-all duration-200 ease-in-out active:scale-[0.9] p-2 rounded-full hover:bg-warm-cream/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <SkeletonDetailSection />
            ) : (
              <>
                <div className="mb-6 p-4 bg-warm-cream/20 rounded-xl border border-border">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-secondary-text">Bill Number:</span>
                    <span className="font-bold text-primary-text">{selectedBill.bill_number}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-secondary-text">Date & Time:</span>
                    <span className="text-primary-text">{formatDate(selectedBill.created_at)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-secondary-text">Payment Method:</span>
                    <span className="text-primary-text">{formatPaymentMethod(selectedBill.payment_method)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-secondary-text">Subtotal:</span>
                    <span className="text-primary-text">₹{(selectedBill.subtotal || 0).toFixed(2)}</span>
                  </div>

                  {selectedBill.items.some((item) => item.cgst_amount || item.sgst_amount) ? (
                    <>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-secondary-text font-medium">CGST:</span>
                        <span className="text-primary-text">₹{(selectedBill.cgst || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-secondary-text font-medium">SGST:</span>
                        <span className="text-primary-text">₹{(selectedBill.sgst || 0).toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-secondary-text font-medium">Tax (GST):</span>
                      <span className="text-primary-text">₹{(selectedBill.tax_amount || 0).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="mb-6 p-4 bg-warm-cream/20 rounded-xl border border-border">
                  <h3 className="font-bold text-xl text-primary-text mb-4">Items Ordered</h3>
                  <div className="space-y-3">
                    {selectedBill.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-1 border-b border-border-light py-3 last:border-none"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-primary-text">{item.product_name}</span>
                          <span className="font-semibold text-coffee-brown">
                            ₹{((item.unit_price * item.quantity) + (item.tax_amount || 0)).toFixed(2)}
                          </span>
                        </div>

                        <div className="text-sm text-secondary-text">
                          ₹{item.unit_price.toFixed(2)} × {item.quantity}
                          {item.tax_group_name && (
                            <span className="ml-2">({item.tax_group_name})</span>
                          )}
                        </div>

                        {(item.cgst_amount ?? 0) > 0 || (item.sgst_amount ?? 0) > 0 ? (
                          <div className="text-xs text-muted-text">
                            CGST: ₹{(item.cgst_amount || 0).toFixed(2)}, SGST: ₹
                            {(item.sgst_amount || 0).toFixed(2)}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-warm-cream/20 rounded-xl border border-border space-y-3">
                  <div className="flex justify-between text-secondary-text text-base">
                    <span>Subtotal:</span>
                    <span>₹{(selectedBill.subtotal || 0).toFixed(2)}</span>
                  </div>

                  {selectedBill.items.some((item) => item.cgst_amount || item.sgst_amount) ? (
                    <>
                      <div className="flex justify-between text-secondary-text text-base font-medium">
                        <span>CGST:</span>
                        <span>₹{(selectedBill.cgst || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-secondary-text text-base font-medium">
                        <span>SGST:</span>
                        <span>₹{(selectedBill.sgst || 0).toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-secondary-text text-base font-medium">
                      <span>Tax (GST):</span>
                      <span>₹{(selectedBill.tax_amount || 0).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xl font-bold text-primary-text pt-4 border-t border-coffee-brown">
                    <span>Total:</span>
                    <span className="text-coffee-brown">₹{selectedBill.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}