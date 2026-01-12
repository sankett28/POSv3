'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { BarChart3, IndianRupee, TrendingUp, FileText } from 'lucide-react'

interface BillItem {
  id: string
  product_name: string
  category_name?: string
  quantity: number
  line_subtotal: number
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

export default function ReportsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    loadBills()
  }, [])

  const loadBills = async () => {
    try {
      const data = await api.getBills(1000)
      setBills(data)
    } catch (error) {
      console.error('Error loading bills:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBills = bills.filter((bill) => {
    const billDate = new Date(bill.created_at).toISOString().split('T')[0]
    return billDate >= dateRange.start && billDate <= dateRange.end
  })

  const totalSales = filteredBills.reduce((sum, bill) => sum + bill.total_amount, 0)
  const totalTax = filteredBills.reduce((sum, bill) => sum + bill.tax_amount, 0)
  const transactionCount = filteredBills.length

  const paymentMethodBreakdown = filteredBills.reduce((acc, bill) => {
    acc[bill.payment_method] = (acc[bill.payment_method] || 0) + bill.total_amount
    return acc
  }, {} as Record<string, number>)

  const categoryBreakdown = filteredBills.reduce((acc, bill) => {
    bill.items.forEach((item) => {
      const category = item.category_name || 'Uncategorized'
      acc[category] = (acc[category] || 0) + item.line_total
    })
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-500 py-8">Loading reports...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">Reports</h1>
          <div className="flex gap-4">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Sales</p>
                <p className="text-3xl font-bold text-black mt-2">₹{totalSales.toFixed(2)}</p>
              </div>
              <IndianRupee className="w-12 h-12 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Tax (GST)</p>
                <p className="text-3xl font-bold text-black mt-2">₹{totalTax.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Transactions</p>
                <p className="text-3xl font-bold text-black mt-2">{transactionCount}</p>
              </div>
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-black mb-4">Payment Methods</h2>
            <div className="space-y-3">
              {Object.entries(paymentMethodBreakdown).map(([method, amount]) => (
                <div key={method} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{method.toLowerCase()}</span>
                  <span className="font-semibold text-black">₹{amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-black mb-4">Sales by Category</h2>
            <div className="space-y-3">
              {Object.entries(categoryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-gray-700">{category}</span>
                    <span className="font-semibold text-black">₹{amount.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

