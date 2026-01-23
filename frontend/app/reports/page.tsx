'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { api } from '@/lib/api'
import { BarChart3, IndianRupee, TrendingUp, FileText, Download } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Skeleton } from '@/components/ui/Skeleton'

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
      if (error.response) {
        console.error('Response error:', error.response.status, error.response.data)
      } else if (error.request) {
        console.error('Request error:', error.request)
      } else {
        console.error('Error message:', error.message)
      }
      setTaxSummary(null)
    }
  }, [dateRange.start, dateRange.end])

  const loadSalesByCategory = useCallback(async () => {
    try {
      const data = await api.getSalesByCategory(dateRange.start, dateRange.end)
      setSalesByCategory(data)
    } catch (error: any) {
      console.error('Error loading sales by category:', error)
      if (error.response) {
        console.error('Response error:', error.response.status, error.response.data)
      } else if (error.request) {
        console.error('Request error:', error.request)
      } else {
        console.error('Error message:', error.message)
      }
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

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const billDate = new Date(bill.created_at).toISOString().split('T')[0]
      return billDate >= dateRange.start && billDate <= dateRange.end
    })
  }, [bills, dateRange.start, dateRange.end])

  const totalSales = useMemo(() => {
    return filteredBills.reduce((sum, bill) => sum + bill.total_amount, 0)
  }, [filteredBills])

  const transactionCount = filteredBills.length
  
  const totalTax = taxSummary?.grand_total_tax || 0
  const totalCGST = taxSummary?.grand_total_cgst || 0
  const totalSGST = taxSummary?.grand_total_sgst || 0

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

  const exportToExcel = useCallback(async () => {
    const XLSX = await import('xlsx')
    
    const workbook = XLSX.utils.book_new()
    
    const generatedDate = new Date().toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })

    const summaryData = [
      ['Garlic Cafe - Sales Report'],
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
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

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
        { wch: 12 },
        { wch: 20 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 8 }
      ]
      XLSX.utils.book_append_sheet(workbook, taxSheet, 'Tax Summary')
    }

    const startDateStr = dateRange.start.replace(/-/g, '')
    const endDateStr = dateRange.end.replace(/-/g, '')
    const filename = `Garlic_Report_${startDateStr}_to_${endDateStr}.xlsx`

    XLSX.writeFile(workbook, filename)
  }, [dateRange.start, dateRange.end, totalSales, totalTax, totalCGST, totalSGST, transactionCount, paymentMethodBreakdown, salesByCategory, taxSummary])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="flex justify-between items-end mb-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-72" />
          </div>
          <div className="flex gap-4 items-center">
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md p-6 border border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-48" />
                </div>
                <Skeleton className="h-14 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md p-6 border border-border">
              <Skeleton className="h-8 w-64 mb-6" />
              <Skeleton className="h-[350px] w-full rounded-xl" />
              <div className="mt-4 space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex justify-between items-center py-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tax summary table skeleton */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-border">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  {[...Array(7)].map((_, i) => (
                    <th key={i} className="px-6 py-4">
                      <Skeleton className="h-4 w-20 mx-auto" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(6)].map((_, i) => (
                  <tr key={i} className="h-16">
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-5 w-28 ml-auto" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-5 w-28 ml-auto" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-5 w-28 ml-auto" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-5 w-32 ml-auto" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-5 w-16 ml-auto" /></td>
                  </tr>
                ))}
                <tr className="h-16 font-bold">
                  <td colSpan={2} className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                  <td className="px-6 py-4 text-right"><Skeleton className="h-6 w-28 ml-auto" /></td>
                  <td className="px-6 py-4 text-right"><Skeleton className="h-6 w-28 ml-auto" /></td>
                  <td className="px-6 py-4 text-right"><Skeleton className="h-6 w-28 ml-auto" /></td>
                  <td className="px-6 py-4 text-right"><Skeleton className="h-6 w-36 ml-auto" /></td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-text mb-1">Reports</h1>
            <p className="text-sm text-primary-text/60">View sales analytics and export summaries.</p>
          </div>
          <div className="flex gap-4 items-center">
            <input
              type="date"
              value={dateRange.start}
              min="2026-01-01"
              onChange={(e) => {
                const newStart = e.target.value
                if (newStart >= '2026-01-01') {
                  setDateRange({ ...dateRange, start: newStart })
                }
              }}
              className="px-4 py-2 border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown bg-white hover:bg-warm-cream/10 transition-all duration-200 text-primary-text"
            />
            <input
              type="date"
              value={dateRange.end}
              min="2026-01-01"
              onChange={(e) => {
                const newEnd = e.target.value
                if (newEnd >= '2026-01-01') {
                  setDateRange({ ...dateRange, end: newEnd })
                }
              }}
              className="px-4 py-2 border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary focus:secondary bg-bg-page hover:bg-interactive-hover/10 transition-all duration-200 text-primary-text"
            />
            <button
              onClick={() => exportToExcel().catch(console.error)}
              className="px-6 py-2 bg-primary text-text-inverse rounded-xl font-medium hover:bg-interactive-hover transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-text text-sm font-medium">Total Sales</p>
                <p className="text-3xl font-bold text-coffee-brown mt-2">₹{totalSales.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-full bg-warm-cream/30">
                <IndianRupee className="w-8 h-8 text-coffee-brown" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-text text-sm font-medium">Total Tax (GST)</p>
                <p className="text-3xl font-bold text-coffee-brown mt-2">₹{totalTax.toFixed(2)}</p>
                {(totalCGST > 0 || totalSGST > 0) && (
                  <div className="text-xs text-secondary-text mt-1">
                    CGST: ₹{totalCGST.toFixed(2)} | SGST: ₹{totalSGST.toFixed(2)}
                  </div>
                )}
              </div>
              <div className="p-3 rounded-full bg-warm-cream/30">
                <TrendingUp className="w-8 h-8 text-coffee-brown" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-text text-sm font-medium">Transactions</p>
                <p className="text-3xl font-bold text-coffee-brown mt-2">{transactionCount}</p>
              </div>
              <div className="p-3 rounded-full bg-warm-cream/30">
                <FileText className="w-8 h-8 text-coffee-brown" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Payment Methods Pie Chart */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-border">
            <h2 className="text-xl font-bold text-primary-text mb-6">Payment Methods</h2>
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
                            fill="#1F2937" 
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
                        let color = '#4B5563'
                        
                        if (method === 'card') {
                          color = '#6B7280'
                        } else if (method === 'cash') {
                          color = '#374151'
                        } else if (method === 'upi') {
                          color = '#1F2937'
                        } else {
                          const fallbackColors = ['#1F2937', '#374151', '#4B5563', '#6B7280']
                          color = fallbackColors[index % fallbackColors.length]
                        }
                        
                        return <Cell key={`cell-${index}`} fill={color} />
                      })}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => value !== undefined && value !== null ? `₹${Number(value).toFixed(2)}` : ''}
                      contentStyle={{
                        backgroundColor: '#F3F4F6',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        color: '#1F2937'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value) => (
                        <span style={{ 
                          color: '#1F2937', 
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
                    <div key={method} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                      <span className="text-secondary-text capitalize">{method.toLowerCase()}</span>
                      <span className="font-semibold text-coffee-brown">₹{amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-secondary-text text-sm py-8 text-center">No payment data available</div>
            )}
          </div>

          {/* Sales by Category Bar Chart */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-border">
            <h2 className="text-xl font-bold text-primary-text mb-6">Sales by Category</h2>
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
                    margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      angle={-35}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      tick={{ fill: '#6B6B6B', fontSize: 11 }}
                    />
                    <YAxis 
                      tick={{ fill: '#6B6B6B', fontSize: 12 }}
                      tickFormatter={(value) => `₹${value}`}
                      ticks={[0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]}
                      domain={[0, 'dataMax + 1000']}
                    />
                    <Tooltip 
                      formatter={(value: any) => value !== undefined && value !== null ? `₹${Number(value).toFixed(2)}` : ''}
                      contentStyle={{
                        backgroundColor: '#F3F4F6',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        color: '#1F2937'
                      }}
                    />
                    <Bar 
                      dataKey="sales" 
                      fill="#4B5563"
                      radius={[8, 8, 0, 0]}
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {salesByCategory.summary
                        .sort((a, b) => b.total_sales - a.total_sales)
                        .map((entry, index) => {
                          const colors = ['#1F2937', '#374151', '#4B5563', '#6B7280']
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {salesByCategory.summary
                    .sort((a, b) => b.total_sales - a.total_sales)
                    .map((item) => (
                      <div key={item.category_name} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                        <span className="text-secondary-text">{item.category_name}</span>
                        <span className="font-semibold text-coffee-brown">₹{item.total_sales.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-secondary-text text-sm py-8 text-center">No sales data available for the selected date range</div>
            )}
          </div>
        </div>

        {/* Tax Summary by Tax Rate */}
        {taxSummary && taxSummary.summary.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-border overflow-hidden">
            <h2 className="text-xl font-bold text-primary-text mb-6">Tax Summary by Tax Rate</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-linear-to-r from-brand-dusty-rose/25 to-brand-dusty-rose/15 border-b-2 border-brand-dusty-rose/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider">Tax Rate</th>
                    <th className="px-6 py-4 text-left text-xs font-extrabold text-primary-text uppercase tracking-wider">Tax Group</th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold text-primary-text uppercase tracking-wider">Taxable Value</th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold text-primary-text uppercase tracking-wider">CGST</th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold text-primary-text uppercase tracking-wider">SGST</th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold text-primary-text uppercase tracking-wider">Total Tax</th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold text-primary-text uppercase tracking-wider">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]/50">
                  {taxSummary.summary.map((item, idx) => (
                    <tr 
                      key={idx} 
                      className={`transition-all duration-300 ease-in-out hover:bg-linear-to-r hover:from-warm-cream/30 hover:to-warm-cream/10 hover:shadow-xs ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-warm-cream/5'
                      }`}
                    >
                      <td className="px-6 py-4 text-primary-text font-bold text-sm">{item.tax_rate_snapshot}%</td>
                      <td className="px-6 py-4 text-secondary-text text-sm font-medium">{item.tax_group_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-right text-primary-text font-semibold">₹{item.total_taxable_value.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-primary-text font-semibold">₹{item.total_cgst.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-primary-text font-semibold">₹{item.total_sgst.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-coffee-brown text-base">₹{item.total_tax.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-secondary-text font-medium">{item.item_count}</td>
                    </tr>
                  ))}
                  <tr className="bg-linear-to-r from-warm-cream/40 to-warm-cream/20 font-bold border-t-2 border-brand-dusty-rose/30">
                    <td colSpan={2} className="px-6 py-4 text-primary-text text-base">Grand Total</td>
                    <td className="px-6 py-4 text-right text-coffee-brown text-base">₹{taxSummary.grand_total_taxable_value.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-coffee-brown text-base">₹{taxSummary.grand_total_cgst.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-coffee-brown text-base">₹{taxSummary.grand_total_sgst.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-coffee-brown text-lg">₹{taxSummary.grand_total_tax.toFixed(2)}</td>
                    <td className="px-6 py-4"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  )
}