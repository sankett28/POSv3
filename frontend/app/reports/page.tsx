'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { BarChart3, IndianRupee, TrendingUp, FileText, Download } from 'lucide-react'
import jsPDF from 'jspdf'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPos = 20
    const margin = 15
    const lineHeight = 7
    const sectionGap = 12
    const tableRowHeight = 8

    // Helper function to draw a line
    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      doc.setLineWidth(0.5)
      doc.line(x1, y1, x2, y2)
    }

    // Helper function to add new page if needed
    const checkNewPage = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - margin - 15) {
        doc.addPage()
        yPos = margin
        return true
      }
      return false
    }

    // Helper function to draw table with borders
    const drawTable = (headers: string[], rows: string[][], colWidths: number[], startX: number, startY: number) => {
      let currentY = startY
      const tableWidth = colWidths.reduce((sum, width) => sum + width, 0)
      
      // Draw header background
      doc.setFillColor(240, 240, 240)
      doc.rect(startX, currentY - 6, tableWidth, tableRowHeight, 'F')
      
      // Draw header text
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      let currentX = startX + 3
      headers.forEach((header, idx) => {
        // Truncate long headers
        const headerText = header.length > 20 ? header.substring(0, 17) + '...' : header
        doc.text(headerText, currentX, currentY)
        currentX += colWidths[idx]
      })
      
      // Draw header border
      drawLine(startX, currentY - 6, startX + tableWidth, currentY - 6)
      drawLine(startX, currentY + 2, startX + tableWidth, currentY + 2)
      currentY += tableRowHeight
      
      // Draw rows (excluding last row if it's a total - we'll handle that separately)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      rows.forEach((row, rowIdx) => {
        // Skip if this is a total row (we'll handle it separately)
        if (row[0] === 'Total') {
          return
        }
        
        if (checkNewPage(tableRowHeight + 3)) {
          currentY = margin + tableRowHeight
        }
        
        currentX = startX + 3
        row.forEach((cell, colIdx) => {
          // Truncate long cell text to prevent overflow
          const cellText = cell.length > 25 ? cell.substring(0, 22) + '...' : cell
          doc.text(cellText, currentX, currentY)
          currentX += colWidths[colIdx]
        })
        
        // Draw row border
        drawLine(startX, currentY + 2, startX + tableWidth, currentY + 2)
        currentY += tableRowHeight
      })
      
      // Draw side borders
      drawLine(startX, startY - 6, startX, currentY - tableRowHeight)
      drawLine(startX + tableWidth, startY - 6, startX + tableWidth, currentY - tableRowHeight)
      
      return currentY
    }

    // Header with better styling
    doc.setFillColor(62, 44, 36) // Brown color
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('BrewBite Cafe', margin, 15)
    
    doc.setFontSize(16)
    doc.text('Sales Report', margin, 25)
    
    doc.setTextColor(0, 0, 0)
    yPos = 45

    // Date info
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Date Range: ${formatDate(dateRange.start)} to ${formatDate(dateRange.end)}`, margin, yPos)
    yPos += 5
    const generatedDate = new Date().toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    doc.text(`Generated on: ${generatedDate}`, margin, yPos)
    yPos += sectionGap + 5
    doc.setTextColor(0, 0, 0)

    // Summary Table
    checkNewPage(50)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary', margin, yPos)
    yPos += 8

    const summaryHeaders = ['Description', 'Amount']
    const summaryColWidths = [120, 60]
    const summaryRows = [
      ['Total Sales', `Rs. ${totalSales.toFixed(2)}`],
      ['Total Tax (GST)', `Rs. ${totalTax.toFixed(2)}`],
      ['CGST', `Rs. ${totalCGST.toFixed(2)}`],
      ['SGST', `Rs. ${totalSGST.toFixed(2)}`],
      ['Total Transactions', transactionCount.toString()],
    ]

    yPos = drawTable(summaryHeaders, summaryRows, summaryColWidths, margin, yPos)
    yPos += sectionGap

    // Payment Methods Table
    checkNewPage(40)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Payment Methods', margin, yPos)
    yPos += 8

    if (Object.keys(paymentMethodBreakdown).length > 0) {
      const paymentHeaders = ['Payment Method', 'Amount']
      const paymentColWidths = [120, 60]
      const paymentRows = Object.entries(paymentMethodBreakdown).map(([method, amount]) => [
        method.charAt(0) + method.slice(1).toLowerCase(),
        `Rs. ${amount.toFixed(2)}`
      ])
      
      yPos = drawTable(paymentHeaders, paymentRows, paymentColWidths, margin, yPos)
    } else {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(150, 150, 150)
      doc.text('No payment data available', margin + 5, yPos)
      yPos += tableRowHeight
      doc.setTextColor(0, 0, 0)
    }
    yPos += sectionGap

    // Sales by Category Table
    checkNewPage(40)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Sales by Category', margin, yPos)
    yPos += 8

    if (salesByCategory && salesByCategory.summary.length > 0) {
      const categoryHeaders = ['Category', 'Sales Amount']
      const categoryColWidths = [120, 60]
      const categoryRows = salesByCategory.summary
        .sort((a, b) => b.total_sales - a.total_sales)
        .map((item) => [
          item.category_name,
          `Rs. ${item.total_sales.toFixed(2)}`
        ])
      
      // Add total row
      categoryRows.push([
        'Total',
        `Rs. ${salesByCategory.grand_total_sales.toFixed(2)}`
      ])
      
      // Draw table without total row
      const categoryRowsWithoutTotal = salesByCategory.summary
        .sort((a, b) => b.total_sales - a.total_sales)
        .map((item) => [
          item.category_name.length > 25 ? item.category_name.substring(0, 22) + '...' : item.category_name,
          `Rs. ${item.total_sales.toFixed(2)}`
        ])
      
      yPos = drawTable(categoryHeaders, categoryRowsWithoutTotal, categoryColWidths, margin, yPos)
      
      // Add total row separately with proper spacing
      checkNewPage(tableRowHeight + 8)
      yPos += 5
      doc.setFillColor(240, 240, 240)
      const categoryTableWidth = categoryColWidths.reduce((sum, w) => sum + w, 0)
      doc.rect(margin, yPos - 6, categoryTableWidth, tableRowHeight, 'F')
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text('Total', margin + 3, yPos)
      doc.text(`Rs. ${salesByCategory.grand_total_sales.toFixed(2)}`, margin + 123, yPos)
      
      // Draw borders for total
      drawLine(margin, yPos - 6, margin + categoryTableWidth, yPos - 6)
      drawLine(margin, yPos + 2, margin + categoryTableWidth, yPos + 2)
      drawLine(margin, yPos - 6, margin, yPos + 2)
      drawLine(margin + categoryTableWidth, yPos - 6, margin + categoryTableWidth, yPos + 2)
      yPos += tableRowHeight + 5
    } else {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(150, 150, 150)
      doc.text('No category sales data available', margin + 5, yPos)
      yPos += tableRowHeight
      doc.setTextColor(0, 0, 0)
    }
    yPos += sectionGap

    // Tax Summary by Tax Rate Table
    if (taxSummary && taxSummary.summary.length > 0) {
      checkNewPage(60)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Tax Summary by Tax Rate', margin, yPos)
      yPos += 8

      const taxHeaders = ['Tax Rate', 'Tax Group', 'Taxable Value', 'CGST', 'SGST', 'Total Tax', 'Items']
      const taxColWidths = [25, 40, 35, 30, 30, 35, 20]
      const taxRows = taxSummary.summary.map((item) => [
        `${item.tax_rate_snapshot}%`,
        item.tax_group_name || 'N/A',
        `Rs. ${item.total_taxable_value.toFixed(2)}`,
        `Rs. ${item.total_cgst.toFixed(2)}`,
        `Rs. ${item.total_sgst.toFixed(2)}`,
        `Rs. ${item.total_tax.toFixed(2)}`,
        item.item_count.toString(),
      ])

      yPos = drawTable(taxHeaders, taxRows, taxColWidths, margin, yPos)
      
      // Grand Total Row
      checkNewPage(tableRowHeight + 8)
      yPos += 5
      doc.setFillColor(240, 240, 240)
      const grandTotalWidth = taxColWidths.reduce((sum, w) => sum + w, 0)
      doc.rect(margin, yPos - 6, grandTotalWidth, tableRowHeight, 'F')
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      let xPos = margin + 3
      doc.text('Grand Total', xPos, yPos)
      xPos += taxColWidths[0] + taxColWidths[1]
      doc.text(`Rs. ${taxSummary.grand_total_taxable_value.toFixed(2)}`, xPos, yPos)
      xPos += taxColWidths[2]
      doc.text(`Rs. ${taxSummary.grand_total_cgst.toFixed(2)}`, xPos, yPos)
      xPos += taxColWidths[3]
      doc.text(`Rs. ${taxSummary.grand_total_sgst.toFixed(2)}`, xPos, yPos)
      xPos += taxColWidths[4]
      doc.text(`Rs. ${taxSummary.grand_total_tax.toFixed(2)}`, xPos, yPos)
      
      // Draw borders for grand total
      drawLine(margin, yPos - 6, margin + grandTotalWidth, yPos - 6)
      drawLine(margin, yPos + 2, margin + grandTotalWidth, yPos + 2)
      drawLine(margin, yPos - 6, margin, yPos + 2)
      drawLine(margin + grandTotalWidth, yPos - 6, margin + grandTotalWidth, yPos + 2)
      yPos += tableRowHeight + 5
    }

    // Footer on each page
    const addFooter = (pageNum: number, totalPages: number) => {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Page ${pageNum} of ${totalPages} - BrewBite Cafe Management System`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
      doc.setTextColor(0, 0, 0)
    }

    // Add footer to all pages
    const totalPages = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      addFooter(i, totalPages)
    }

    // Generate filename with date range
    const startDateStr = dateRange.start.replace(/-/g, '')
    const endDateStr = dateRange.end.replace(/-/g, '')
    const filename = `BrewBite_Report_${startDateStr}_to_${endDateStr}.pdf`

    // Save the PDF
    doc.save(filename)
  }

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
          <h1 className="text-3xl font-bold text-[#3E2C24]">Reports</h1>
          <div className="flex gap-4 items-center">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-4 py-2 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-[#1F1F1F]"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-4 py-2 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-[#1F1F1F]"
            />
            <button
              onClick={exportToPDF}
              className="px-6 py-2 bg-[#3E2C24] text-white rounded-xl font-medium hover:bg-[#2c1f19] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center gap-2"
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
                <p className="text-3xl font-bold text-[#3E2C24] mt-2">₹{totalSales.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-full bg-[#FAF7F2]">
                <IndianRupee className="w-8 h-8 text-[#C89B63]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6B6B6B] text-sm font-medium">Total Tax (GST)</p>
                <p className="text-3xl font-bold text-[#3E2C24] mt-2">₹{totalTax.toFixed(2)}</p>
                {(totalCGST > 0 || totalSGST > 0) && (
                  <div className="text-xs text-[#6B6B6B] mt-1">
                    CGST: ₹{totalCGST.toFixed(2)} | SGST: ₹{totalSGST.toFixed(2)}
                  </div>
                )}
              </div>
              <div className="p-3 rounded-full bg-[#FAF7F2]">
                <TrendingUp className="w-8 h-8 text-[#C89B63]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6B6B6B] text-sm font-medium">Transactions</p>
                <p className="text-3xl font-bold text-[#3E2C24] mt-2">{transactionCount}</p>
              </div>
              <div className="p-3 rounded-full bg-[#FAF7F2]">
                <FileText className="w-8 h-8 text-[#C89B63]" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Payment Methods Pie Chart */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB]">
            <h2 className="text-xl font-bold text-[#3E2C24] mb-6">Payment Methods</h2>
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
                            fill="#3E2C24" 
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
                        let color = '#C89B63' // default caramel
                        
                        // Assign specific colors based on payment method
                        if (method === 'card') {
                          color = '#F4A261' // lighter orange for Card (same as bar chart)
                        } else if (method === 'cash') {
                          color = '#D4A574' // light caramel for Cash
                        } else if (method === 'upi') {
                          color = '#3E2C24' // dark brown for UPI
                        } else {
                          // Fallback colors for other methods
                          const fallbackColors = ['#C89B63', '#E5B88A', '#F4A261', '#F5C89B', '#FFB88C', '#FFA07A']
                          color = fallbackColors[index % fallbackColors.length]
                        }
                        
                        return <Cell key={`cell-${index}`} fill={color} />
                      })}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => value !== undefined && value !== null ? `₹${Number(value).toFixed(2)}` : ''}
                      contentStyle={{
                        backgroundColor: '#FAF7F2',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        color: '#3E2C24'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value) => (
                        <span style={{ 
                          color: '#3E2C24', 
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
                      <span className="font-semibold text-[#3E2C24]">₹{amount.toFixed(2)}</span>
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
            <h2 className="text-xl font-bold text-[#3E2C24] mb-6">Sales by Category</h2>
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
                        backgroundColor: '#FAF7F2',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        color: '#3E2C24'
                      }}
                    />
                    <Bar 
                      dataKey="sales" 
                      fill="#C89B63"
                      radius={[8, 8, 0, 0]}
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {salesByCategory.summary
                        .sort((a, b) => b.total_sales - a.total_sales)
                        .map((entry, index) => {
                          const colors = ['#3E2C24', '#C89B63', '#F4A261', '#D4A574', '#E5B88A']
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
                        <span className="font-semibold text-[#3E2C24]">₹{item.total_sales.toFixed(2)}</span>
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
          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB]">
            <h2 className="text-xl font-bold text-[#3E2C24] mb-6">Tax Summary by Tax Rate</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#FAF7F2]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Tax Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Tax Group</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Taxable Value</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">CGST</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">SGST</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Total Tax</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {taxSummary.summary.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="px-4 py-3 text-[#1F1F1F] font-medium">{item.tax_rate_snapshot}%</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{item.tax_group_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-right text-[#1F1F1F]">₹{item.total_taxable_value.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-[#1F1F1F]">₹{item.total_cgst.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-[#1F1F1F]">₹{item.total_sgst.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[#3E2C24]">₹{item.total_tax.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-[#6B6B6B]">{item.item_count}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#FAF7F2] font-bold">
                    <td colSpan={2} className="px-4 py-3 text-[#3E2C24]">Grand Total</td>
                    <td className="px-4 py-3 text-right text-[#3E2C24]">₹{taxSummary.grand_total_taxable_value.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-[#3E2C24]">₹{taxSummary.grand_total_cgst.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-[#3E2C24]">₹{taxSummary.grand_total_sgst.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-[#3E2C24]">₹{taxSummary.grand_total_tax.toFixed(2)}</td>
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

