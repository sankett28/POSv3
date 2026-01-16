'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { api } from '@/lib/api'
import { BarChart3, IndianRupee, TrendingUp, FileText, Download } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
// Performance: xlsx is only loaded when exportToExcel is called (dynamic import)

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

interface CategorySalesItem {
  category_name: string
  total_sales: number
  item_count: number
}

interface SalesByCategory {
  start_date: string
  end_date: string
  summary: CategorySalesItem[]
  grand_total_sales: number
}

export default function ReportsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null)
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(() => {
    const minDate = '2026-01-01'
    const today = new Date().toISOString().split('T')[0]
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
    
    // Ensure start date is at least 2026-01-01
    const start = thirtyDaysAgo < minDate ? minDate : thirtyDaysAgo
    
    return {
      start,
      end: today < minDate ? minDate : today,
    }
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadTaxSummary = useCallback(async () => {
    try {
      const data = await api.getTaxSummary(dateRange.start, dateRange.end)
      setTaxSummary(data)
    } catch (error: any) {
      console.error('Error loading tax summary:', error)
      // Log more details for debugging
      if (error.response) {
        console.error('Response error:', error.response.status, error.response.data)
      } else if (error.request) {
        console.error('Request error:', error.request)
      } else {
        console.error('Error message:', error.message)
      }
      // Set tax summary to null on error so UI doesn't show stale data
      setTaxSummary(null)
    }
  }, [dateRange.start, dateRange.end])

  const loadSalesByCategory = useCallback(async () => {
    try {
      const data = await api.getSalesByCategory(dateRange.start, dateRange.end)
      setSalesByCategory(data)
    } catch (error: any) {
      console.error('Error loading sales by category:', error)
      // Log more details for debugging
      if (error.response) {
        console.error('Response error:', error.response.status, error.response.data)
      } else if (error.request) {
        console.error('Request error:', error.request)
      } else {
        console.error('Error message:', error.message)
      }
      // Set sales by category to null on error so UI doesn't show stale data
      setSalesByCategory(null)
    }
  }, [dateRange.start, dateRange.end])

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      loadTaxSummary()
      loadSalesByCategory()
    }
  }, [dateRange.start, dateRange.end, loadTaxSummary, loadSalesByCategory])

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

  // Performance: Memoize filtered bills to avoid recalculating on every render
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const billDate = new Date(bill.created_at).toISOString().split('T')[0]
      return billDate >= dateRange.start && billDate <= dateRange.end
    })
  }, [bills, dateRange.start, dateRange.end])

  // Performance: Memoize expensive calculations
  const totalSales = useMemo(() => {
    return filteredBills.reduce((sum, bill) => sum + bill.total_amount, 0)
  }, [filteredBills])

  const transactionCount = filteredBills.length
  
  // Tax values come from tax summary (sum of stored snapshots, not recalculation)
  const totalTax = taxSummary?.grand_total_tax || 0
  const totalCGST = taxSummary?.grand_total_cgst || 0
  const totalSGST = taxSummary?.grand_total_sgst || 0

  // Performance: Memoize payment method breakdown calculation
  const paymentMethodBreakdown = useMemo(() => {
    return filteredBills.reduce((acc, bill) => {
      acc[bill.payment_method] = (acc[bill.payment_method] || 0) + bill.total_amount
      return acc
    }, {} as Record<string, number>)
  }, [filteredBills])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Performance: Use dynamic import for xlsx to reduce initial bundle size
  const exportToExcel = useCallback(async () => {
    // Dynamic import: Only load xlsx when user clicks export
    const XLSX = await import('xlsx')
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new()
    
    const generatedDate = new Date().toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })

    // Summary Sheet
    const summaryData = [
      ['Lichi Cafe - Sales Report'],
      [''],
      ['Date Range:', `${formatDate(dateRange.start)} to ${formatDate(dateRange.end)}`],
      ['Generated on:', generatedDate],
      [''],
      ['Summary'],
      ['Description', 'Amount'],
      ['Total Sales', totalSales.toFixed(2)],
      ['Total Tax (GST)', totalTax.toFixed(2)],
      ['CGST', totalCGST.toFixed(2)],
      ['SGST', totalSGST.toFixed(2)],
      ['Total Transactions', transactionCount],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    // Set column widths
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // Payment Methods Sheet
    if (Object.keys(paymentMethodBreakdown).length > 0) {
      const paymentData = [
        ['Payment Methods'],
        [''],
        ['Payment Method', 'Amount'],
        ...Object.entries(paymentMethodBreakdown).map(([method, amount]) => [
          method.charAt(0) + method.slice(1).toLowerCase(),
          amount.toFixed(2)
        ]),
        ['Total', Object.values(paymentMethodBreakdown).reduce((sum, amount) => sum + amount, 0).toFixed(2)]
      ]
      const paymentSheet = XLSX.utils.aoa_to_sheet(paymentData)
      paymentSheet['!cols'] = [{ wch: 20 }, { wch: 15 }]
      XLSX.utils.book_append_sheet(workbook, paymentSheet, 'Payment Methods')
    }

    // Sales by Category Sheet
    if (salesByCategory && salesByCategory.summary.length > 0) {
      const categoryData = [
        ['Sales by Category'],
        [''],
        ['Category', 'Sales Amount'],
        ...salesByCategory.summary
          .sort((a, b) => b.total_sales - a.total_sales)
          .map((item) => [
            item.category_name,
            item.total_sales.toFixed(2)
          ]),
        ['Total', salesByCategory.grand_total_sales.toFixed(2)]
      ]
      const categorySheet = XLSX.utils.aoa_to_sheet(categoryData)
      categorySheet['!cols'] = [{ wch: 30 }, { wch: 15 }]
      XLSX.utils.book_append_sheet(workbook, categorySheet, 'Sales by Category')
    }

    // Tax Summary Sheet
    if (taxSummary && taxSummary.summary.length > 0) {
      const taxData = [
        ['Tax Summary by Tax Rate'],
        [''],
        ['Tax Rate', 'Tax Group', 'Taxable Value', 'CGST', 'SGST', 'Total Tax', 'Items'],
        ...taxSummary.summary.map((item) => [
          `${item.tax_rate_snapshot}%`,
          item.tax_group_name || 'N/A',
          item.total_taxable_value.toFixed(2),
          item.total_cgst.toFixed(2),
          item.total_sgst.toFixed(2),
          item.total_tax.toFixed(2),
          item.item_count
        ]),
        ['Grand Total', '', 
          taxSummary.grand_total_taxable_value.toFixed(2),
          taxSummary.grand_total_cgst.toFixed(2),
          taxSummary.grand_total_sgst.toFixed(2),
          taxSummary.grand_total_tax.toFixed(2),
          ''
        ]
      ]
      const taxSheet = XLSX.utils.aoa_to_sheet(taxData)
      taxSheet['!cols'] = [
        { wch: 12 }, // Tax Rate
        { wch: 20 }, // Tax Group
        { wch: 15 }, // Taxable Value
        { wch: 12 }, // CGST
        { wch: 12 }, // SGST
        { wch: 12 }, // Total Tax
        { wch: 8 }   // Items
      ]
      XLSX.utils.book_append_sheet(workbook, taxSheet, 'Tax Summary')
    }

    // Generate filename with date range
    const startDateStr = dateRange.start.replace(/-/g, '')
    const endDateStr = dateRange.end.replace(/-/g, '')
    const filename = `Lichi_Report_${startDateStr}_to_${endDateStr}.xlsx`

    // Save the Excel file
    XLSX.writeFile(workbook, filename)
  }, [dateRange.start, dateRange.end, totalSales, totalTax, totalCGST, totalSGST, transactionCount, paymentMethodBreakdown, salesByCategory, taxSummary])

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
    <div className="p-4 sm:p-8 bg-[#FFF0F3] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#610027]">Reports</h1>
          <div className="flex gap-4 items-center">
            <input
              type="date"
              value={dateRange.start}
              min="2026-01-01"
              onChange={(e) => {
                const newStart = e.target.value
                // Ensure start date is not before 2026-01-01
                if (newStart >= '2026-01-01') {
                  setDateRange({ ...dateRange, start: newStart })
                }
              }}
              className="px-4 py-2 border border-[#E5E7EB] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 transition-all duration-200 text-[#610027]"
            />
            <input
              type="date"
              value={dateRange.end}
              min="2026-01-01"
              onChange={(e) => {
                const newEnd = e.target.value
                // Ensure end date is not before 2026-01-01
                if (newEnd >= '2026-01-01') {
                  setDateRange({ ...dateRange, end: newEnd })
                }
              }}
              className="px-4 py-2 border border-[#E5E7EB] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 transition-all duration-200 text-[#610027]"
            />
            <button
              onClick={() => exportToExcel().catch(console.error)}
              className="px-6 py-2 bg-[#912B48] text-white rounded-xl font-medium hover:bg-[#B45A69] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6B6B6B] text-sm font-medium">Total Sales</p>
                <p className="text-3xl font-bold text-[#912B48] mt-2">₹{totalSales.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-full bg-[#FFF0F3]/30">
                <IndianRupee className="w-8 h-8 text-[#912B48]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6B6B6B] text-sm font-medium">Total Tax (GST)</p>
                <p className="text-3xl font-bold text-[#912B48] mt-2">₹{totalTax.toFixed(2)}</p>
                {(totalCGST > 0 || totalSGST > 0) && (
                  <div className="text-xs text-[#6B6B6B] mt-1">
                    CGST: ₹{totalCGST.toFixed(2)} | SGST: ₹{totalSGST.toFixed(2)}
                  </div>
                )}
              </div>
              <div className="p-3 rounded-full bg-[#FFF0F3]/30">
                <TrendingUp className="w-8 h-8 text-[#912B48]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6B6B6B] text-sm font-medium">Transactions</p>
                <p className="text-3xl font-bold text-[#912B48] mt-2">{transactionCount}</p>
              </div>
              <div className="p-3 rounded-full bg-[#FFF0F3]/30">
                <FileText className="w-8 h-8 text-[#912B48]" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Payment Methods Pie Chart */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB]">
            <h2 className="text-xl font-bold text-[#610027] mb-6">Payment Methods</h2>
            {Object.keys(paymentMethodBreakdown).length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={Object.entries(paymentMethodBreakdown).map(([method, amount]) => ({
                        name: method.charAt(0) + method.slice(1).toLowerCase(),
                        value: amount
                      }))}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                        if (!midAngle || percent === undefined) return null
                        const RADIAN = Math.PI / 180
                        const radius = outerRadius + 30
                        const x = cx + radius * Math.cos(-midAngle * RADIAN)
                        const y = cy + radius * Math.sin(-midAngle * RADIAN)
                        
                        return (
                          <text 
                            x={x} 
                            y={y} 
                            fill="#610027" 
                            textAnchor={x > cx ? 'start' : 'end'} 
                            dominantBaseline="middle"
                            fontSize="12"
                            fontWeight="700"
                            style={{ 
                              pointerEvents: 'none',
                              userSelect: 'none'
                            }}
                          >
                            {`${name}: ${(percent * 100).toFixed(0)}%`}
                          </text>
                        )
                      }}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {Object.entries(paymentMethodBreakdown).map((entry, index) => {
                        const method = entry[0].toLowerCase()
                        let color = '#912B48' // default medium-dark red
                        
                        // Assign specific colors based on payment method using new theme
                        if (method === 'card') {
                          color = '#B45A69' // dusty rose for Card
                        } else if (method === 'cash') {
                          color = '#912B48' // medium-dark red for Cash
                        } else if (method === 'upi') {
                          color = '#610027' // deep burgundy for UPI
                        } else {
                          // Fallback colors for other methods using theme palette
                          const fallbackColors = ['#912B48', '#B45A69', '#610027', '#FFF0F3']
                          color = fallbackColors[index % fallbackColors.length]
                        }
                        
                        return <Cell key={`cell-${index}`} fill={color} />
                      })}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => value !== undefined && value !== null ? `₹${Number(value).toFixed(2)}` : ''}
                      contentStyle={{
                        backgroundColor: '#FFF0F3',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        color: '#610027'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value) => (
                        <span style={{ 
                          color: '#610027', 
                          fontWeight: '600',
                          fontSize: '13px'
                        }}>
                          {value}
                        </span>
                      )}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2 w-full">
                  {Object.entries(paymentMethodBreakdown).map(([method, amount]) => (
                    <div key={method} className="flex justify-between items-center py-2 border-b border-[#E5E7EB] last:border-b-0">
                      <span className="text-[#6B6B6B] capitalize">{method.toLowerCase()}</span>
                      <span className="font-semibold text-[#912B48]">₹{amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-[#6B6B6B] text-sm py-8 text-center">No payment data available</div>
            )}
          </div>

          {/* Sales by Category Bar Chart */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB]">
            <h2 className="text-xl font-bold text-[#610027] mb-6">Sales by Category</h2>
            {salesByCategory && salesByCategory.summary.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={salesByCategory.summary
                      .sort((a, b) => b.total_sales - a.total_sales)
                      .map((item) => ({
                        name: item.category_name,
                        sales: item.total_sales
                      }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fill: '#6B6B6B', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: '#6B6B6B', fontSize: 12 }}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip 
                      formatter={(value: any) => value !== undefined && value !== null ? `₹${Number(value).toFixed(2)}` : ''}
                      contentStyle={{
                        backgroundColor: '#FFF0F3',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        color: '#610027'
                      }}
                    />
                    <Bar 
                      dataKey="sales" 
                      fill="#912B48"
                      radius={[8, 8, 0, 0]}
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {salesByCategory.summary
                        .sort((a, b) => b.total_sales - a.total_sales)
                        .map((entry, index) => {
                          // Use theme colors: deep burgundy, medium-dark red, dusty rose, light pink
                          const colors = ['#610027', '#912B48', '#B45A69', '#FFF0F3']
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {salesByCategory.summary
                    .sort((a, b) => b.total_sales - a.total_sales)
                    .map((item) => (
                      <div key={item.category_name} className="flex justify-between items-center py-2 border-b border-[#E5E7EB] last:border-b-0">
                        <span className="text-[#6B6B6B]">{item.category_name}</span>
                        <span className="font-semibold text-[#912B48]">₹{item.total_sales.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-[#6B6B6B] text-sm py-8 text-center">No sales data available for the selected date range</div>
            )}
          </div>
        </div>

        {/* Tax Summary by Tax Rate */}
        {taxSummary && taxSummary.summary.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#E5E7EB] overflow-hidden">
            <h2 className="text-xl font-bold text-[#610027] mb-6">Tax Summary by Tax Rate</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-linear-to-r from-[#B45A69]/25 to-[#B45A69]/15 border-b-2 border-[#B45A69]/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-extrabold text-[#610027] uppercase tracking-wider">Tax Rate</th>
                    <th className="px-6 py-4 text-left text-xs font-extrabold text-[#610027] uppercase tracking-wider">Tax Group</th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold text-[#610027] uppercase tracking-wider">Taxable Value</th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold text-[#610027] uppercase tracking-wider">CGST</th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold text-[#610027] uppercase tracking-wider">SGST</th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold text-[#610027] uppercase tracking-wider">Total Tax</th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold text-[#610027] uppercase tracking-wider">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]/50">
                  {taxSummary.summary.map((item, idx) => (
                    <tr 
                      key={idx} 
                      className={`transition-all duration-300 ease-in-out hover:bg-linear-to-r hover:from-[#FFF0F3]/30 hover:to-[#FFF0F3]/10 hover:shadow-xs ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#FFF0F3]/5'
                      }`}
                    >
                      <td className="px-6 py-4 text-[#610027] font-bold text-sm">{item.tax_rate_snapshot}%</td>
                      <td className="px-6 py-4 text-[#6B6B6B] text-sm font-medium">{item.tax_group_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-right text-[#610027] font-semibold">₹{item.total_taxable_value.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-[#610027] font-semibold">₹{item.total_cgst.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-[#610027] font-semibold">₹{item.total_sgst.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-[#912B48] text-base">₹{item.total_tax.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-[#6B6B6B] font-medium">{item.item_count}</td>
                    </tr>
                  ))}
                  <tr className="bg-linear-to-r from-[#FFF0F3]/40 to-[#FFF0F3]/20 font-bold border-t-2 border-[#B45A69]/30">
                    <td colSpan={2} className="px-6 py-4 text-[#610027] text-base">Grand Total</td>
                    <td className="px-6 py-4 text-right text-[#912B48] text-base">₹{taxSummary.grand_total_taxable_value.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-[#912B48] text-base">₹{taxSummary.grand_total_cgst.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-[#912B48] text-base">₹{taxSummary.grand_total_sgst.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-[#912B48] text-lg">₹{taxSummary.grand_total_tax.toFixed(2)}</td>
                    <td className="px-6 py-4"></td>
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

