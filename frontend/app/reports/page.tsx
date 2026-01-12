'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { BarChart3, DollarSign, Receipt, TrendingUp } from 'lucide-react'

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

interface TaxSummaryItem {
  tax_rate_snapshot: number
  tax_group_name?: string
  total_taxable_value: number
  total_cgst: number
  total_sgst: number
  total_tax: number
  item_count: number
}

interface TaxSummary {
  start_date: string
  end_date: string
  summary: TaxSummaryItem[]
  grand_total_taxable_value: number
  grand_total_cgst: number
  grand_total_sgst: number
  grand_total_tax: number
}

export default function ReportsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadTaxSummary = async () => {
    try {
      const data = await api.getTaxSummary(dateRange.start, dateRange.end)
      setTaxSummary(data)
    } catch (error) {
      console.error('Error loading tax summary:', error)
    }
  }

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      loadTaxSummary()
    }
  }, [dateRange.start, dateRange.end])

  const loadData = async () => {
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
  const transactionCount = filteredBills.length
  // Tax values come from tax summary (sum of stored snapshots, not recalculation)
  const totalTax = taxSummary?.grand_total_tax || 0
  const totalCGST = taxSummary?.grand_total_cgst || 0
  const totalSGST = taxSummary?.grand_total_sgst || 0

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
              <DollarSign className="w-12 h-12 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Tax (GST)</p>
                <p className="text-3xl font-bold text-black mt-2">₹{totalTax.toFixed(2)}</p>
                {(totalCGST > 0 || totalSGST > 0) && (
                  <div className="text-xs text-gray-500 mt-1">
                    CGST: ₹{totalCGST.toFixed(2)} | SGST: ₹{totalSGST.toFixed(2)}
                  </div>
                )}
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
              <Receipt className="w-12 h-12 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

        {/* Tax Summary by Tax Rate */}
        {taxSummary && taxSummary.summary.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-black mb-4">Tax Summary by Tax Rate</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tax Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tax Group</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Taxable Value</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">CGST</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">SGST</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Tax</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {taxSummary.summary.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{item.tax_rate_snapshot}%</td>
                      <td className="px-4 py-3 text-gray-700">{item.tax_group_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-right text-gray-900">₹{item.total_taxable_value.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-900">₹{item.total_cgst.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-900">₹{item.total_sgst.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{item.total_tax.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{item.item_count}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={2} className="px-4 py-3 text-gray-900">Grand Total</td>
                    <td className="px-4 py-3 text-right text-gray-900">₹{taxSummary.grand_total_taxable_value.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-900">₹{taxSummary.grand_total_cgst.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-900">₹{taxSummary.grand_total_sgst.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-900">₹{taxSummary.grand_total_tax.toFixed(2)}</td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

