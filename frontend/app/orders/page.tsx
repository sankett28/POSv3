'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { api } from '@/lib/api'
import { Search, Plus, Minus, Trash2, CheckCircle, Wallet, Smartphone, CreditCard, PackageOpen } from 'lucide-react'
import Image from 'next/image' // Import Next.js Image component

interface Category {
  id: string
  name: string
  is_active: boolean
}

interface TaxGroup {
  id: string
  name: string
  total_rate: number
  split_type: 'GST_50_50' | 'NO_SPLIT'
  is_tax_inclusive: boolean
  code?: string  // For system-level tax groups like SERVICE_CHARGE_GST
}

// Replace lines 21-26
interface Product {
  id: string
  name: string
  selling_price: number
  tax_group_id?: string; // This should be present if assigned in backend
  tax_group?: TaxGroup;  // Add tax group data
  category_id?: string
  category_name?: string
  is_active: boolean
}


interface BillItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  tax_group?: TaxGroup
  preview_taxable_value?: number
  preview_tax_amount?: number
  preview_cgst?: number
  preview_sgst?: number
  preview_total?: number
}

interface BillDetails {
  invoice_number: string
  items: BillItem[]
  subtotal: number
  service_charge_amount?: number
  gst: number
  cgst?: number
  sgst?: number
  total: number
  paymentMethod: 'CASH' | 'UPI' | 'CARD'
  date: string
}

export default function OrdersPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH')
  const [serviceChargeEnabled, setServiceChargeEnabled] = useState(true)
  const [serviceChargeRate, setServiceChargeRate] = useState(10.0)
  const [serviceChargeTaxGroup, setServiceChargeTaxGroup] = useState<TaxGroup | null>(null)
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false)
  const [billDetails, setBillDetails] = useState<BillDetails | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsData, categoriesData, taxGroupsData] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getActiveTaxGroups()
      ])
      
      if (!Array.isArray(productsData)) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Products data is not an array:", productsData)
        }
        setLoading(false)
        return
      }
      if (!Array.isArray(categoriesData)) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Categories data is not an array:", categoriesData)
        }
        setLoading(false)
        return
      }
      if (!Array.isArray(taxGroupsData)) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Tax groups data is not an array:", taxGroupsData)
        }
        setLoading(false)
        return
      }

      const activeProducts = productsData.filter((p: Product) => p.is_active)
      
      // Find SERVICE_CHARGE_GST tax group by name or code
      const serviceChargeGST = taxGroupsData.find((tg: TaxGroup) => 
        tg.name === 'Service Charge GST' || (tg as any).code === 'SERVICE_CHARGE_GST'
      )
      setServiceChargeTaxGroup(serviceChargeGST || null)
      
      // Enrich products with category names and tax group data
      const enrichedProducts = activeProducts.map((p: any) => {
        const category = categoriesData.find((c: Category) => c.id === p.category_id)
        const taxGroup = taxGroupsData.find((tg: TaxGroup) => tg.id === p.tax_group_id)
        return {
          ...p,
          category_name: category?.name,
          tax_group: taxGroup
        }
      })
      
      setProducts(enrichedProducts)
      setCategories(categoriesData.filter((c: Category) => c.is_active))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading data:', JSON.stringify(error, null, 2))
      }
    } finally {
      setLoading(false)
    }
  }

  // Tax preview calculation function (for display only - backend does actual calculation)
  const calculateTaxPreview = useCallback((
    unitPrice: number,
    quantity: number,
    taxGroup?: TaxGroup
  ): {
    taxable_value: number
    tax_amount: number
    cgst: number
    sgst: number
    total: number
  } => {
    if (!taxGroup || taxGroup.total_rate === 0) {
      const subtotal = unitPrice * quantity
      return {
        taxable_value: subtotal,
        tax_amount: 0,
        cgst: 0,
        sgst: 0,
        total: subtotal
      }
    }

    let taxable_value: number
    let tax_amount: number
    let total: number

    if (taxGroup.is_tax_inclusive) {
      // Price includes tax - extract tax
      total = unitPrice * quantity
      const rateMultiplier = 1 + (taxGroup.total_rate / 100)
      taxable_value = total / rateMultiplier
      tax_amount = total - taxable_value
    } else {
      // Price excludes tax - add tax
      taxable_value = unitPrice * quantity
      tax_amount = taxable_value * (taxGroup.total_rate / 100)
      total = taxable_value + tax_amount
    }

    // Round to 2 decimal places
    taxable_value = Math.round(taxable_value * 100) / 100
    tax_amount = Math.round(tax_amount * 100) / 100
    total = Math.round(total * 100) / 100

    // Split CGST/SGST
    let cgst = 0
    let sgst = 0
    if (taxGroup.split_type === 'GST_50_50') {
      cgst = Math.round((tax_amount / 2) * 100) / 100
      sgst = tax_amount - cgst  // Ensure they sum to tax_amount
    } else {
      cgst = tax_amount  // No split - all goes to CGST
    }

    return {
      taxable_value,
      tax_amount,
      cgst,
      sgst,
      total
    }
  }, [])

  const addToBill = useCallback((product: Product) => {
    const existingItem = billItems.find((item) => item.product_id === product.id)

    if (existingItem) {
      const newQuantity = existingItem.quantity + 1
      const subtotal = newQuantity * product.selling_price
      const taxPreview = calculateTaxPreview(product.selling_price, newQuantity, product.tax_group)
      
      setBillItems(
        billItems.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: newQuantity,
                subtotal,
                tax_group: product.tax_group,
                preview_taxable_value: taxPreview.taxable_value,
                preview_tax_amount: taxPreview.tax_amount,
                preview_cgst: taxPreview.cgst,
                preview_sgst: taxPreview.sgst,
                preview_total: taxPreview.total,
              }
            : item
        )
      )
    } else {
      const subtotal = product.selling_price
      const taxPreview = calculateTaxPreview(product.selling_price, 1, product.tax_group)
      
      setBillItems([
        ...billItems,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.selling_price,
          subtotal,
          tax_group: product.tax_group,
          preview_taxable_value: taxPreview.taxable_value,
          preview_tax_amount: taxPreview.tax_amount,
          preview_cgst: taxPreview.cgst,
          preview_sgst: taxPreview.sgst,
          preview_total: taxPreview.total,
        },
      ])
    }
  }, [billItems, calculateTaxPreview])

  const updateQuantity = useCallback((productId: string, delta: number) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    setBillItems(
      billItems
        .map((item) => {
          if (item.product_id === productId) {
            const newQuantity = item.quantity + delta
            if (newQuantity <= 0) return null
            const subtotal = newQuantity * item.unit_price
            const taxGroup = item.tax_group || product.tax_group
            const taxPreview = calculateTaxPreview(item.unit_price, newQuantity, taxGroup)
            
            return {
              ...item,
              quantity: newQuantity,
              subtotal,
              tax_group: taxGroup,
              preview_taxable_value: taxPreview.taxable_value,
              preview_tax_amount: taxPreview.tax_amount,
              preview_cgst: taxPreview.cgst,
              preview_sgst: taxPreview.sgst,
              preview_total: taxPreview.total,
            }
          }
          return item
        })
        .filter((item): item is BillItem => item !== null)
    )
  }, [billItems, products, calculateTaxPreview])

  const removeItem = useCallback((productId: string) => {
    setBillItems(billItems.filter((item) => item.product_id !== productId))
  }, [billItems])

  // Calculate totals from preview values - memoized for performance
  const subtotal = useMemo(() => 
    billItems.reduce((sum, item) => sum + (item.preview_taxable_value || item.subtotal), 0),
    [billItems]
  )
  const totalTax = useMemo(() => 
    billItems.reduce((sum, item) => sum + (item.preview_tax_amount || 0), 0),
    [billItems]
  )
  // Derive balanced CGST/SGST from total tax (matching backend logic)
  const totalCGST = Math.round((totalTax / 2) * 100) / 100
  const totalSGST = totalTax - totalCGST  // Ensure exact balance
  
  // Calculate service charge preview (always exclusive GST in India)
  const serviceChargeAmount = serviceChargeEnabled && serviceChargeRate > 0
    ? Math.round((subtotal * serviceChargeRate / 100) * 100) / 100
    : 0
  
  // Calculate GST on service charge using dedicated SERVICE_CHARGE_GST tax group
  // If not found, fallback to 18% (default) but log a warning
  const serviceChargeGSTRate = serviceChargeTaxGroup?.total_rate || 18.0
  if (serviceChargeAmount > 0 && !serviceChargeTaxGroup) {
    console.warn('SERVICE_CHARGE_GST tax group not found. Using default 18% for preview.')
  }
  const gstOnServiceCharge = serviceChargeAmount > 0
    ? Math.round((serviceChargeAmount * serviceChargeGSTRate / 100) * 100) / 100
    : 0
  const cgstOnServiceCharge = Math.round((gstOnServiceCharge / 2) * 100) / 100
  const sgstOnServiceCharge = gstOnServiceCharge - cgstOnServiceCharge
  
  // Grand total includes items + service charge + GST on service charge
  const grandTotal = billItems.reduce((sum, item) => sum + (item.preview_total || item.subtotal), 0) 
    + serviceChargeAmount 
    + gstOnServiceCharge

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

  const handleCompleteBill = async () => {
    if (billItems.length === 0) {
      alert('Please add items to the order first!')
      return
    }

    try {
      const res = await api.createBill({
        items: billItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        payment_method: paymentMethod,
        service_charge_enabled: serviceChargeEnabled,
        service_charge_rate: serviceChargeRate,
      })

      setBillDetails({
        invoice_number: res.bill_number,
        items: billItems,
        subtotal: res.subtotal,
        service_charge_amount: res.service_charge_amount || 0,
        gst: res.tax_amount,
        cgst: res.cgst,
        sgst: res.sgst,
        total: res.total_amount,
        paymentMethod,
        date: new Date().toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})
      })
      setShowOrderSuccessModal(true)
      setBillItems([])
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create order')
    }
  }

  const handlePrintInvoice = () => {
    if (!billDetails) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${billDetails.invoice_number}</title>
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
            .logo-box {
              width: 40px;
              height: 40px;
              background: #3E2C24; /* Primary coffee brown */
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              font-weight: 500;
              border-radius: 4px;
            }
            .header-left-content h1 {
              font-size: 24px;
              font-weight: 600;
              color: #3E2C24; /* Primary coffee brown */
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
              color: #3E2C24; /* Primary coffee brown */
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
              color: #3E2C24; /* Primary coffee brown */
              margin: 0;
            }
            .table-section {
              margin-bottom: 25px;
            }
            .table-title {
              font-size: 15px;
              font-weight: 600;
              color: #3E2C24; /* Primary coffee brown */
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
              color: #3E2C24; /* Primary coffee brown */
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
              color: #3E2C24; /* Primary coffee brown */
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
              color: #3E2C24; /* Primary coffee brown */
              font-weight: 600;
            }
            .total-row:last-child {
              font-size: 18px;
              font-weight: 700;
              padding-top: 10px;
              margin-top: 5px;
              border-top: 1px solid #C89B63; /* Accent color */
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .total-row:last-child span {
              color: #3E2C24; /* Primary coffee brown */
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
                <div class="logo-box">BB</div>
                <div class="header-left-content">
                  <h1>BrewBite Cafe</h1>
                  <p>Your Daily Dose of Delight</p>
                </div>
              </div>
              <div class="invoice-number-box">
                <p>Bill Number</p>
                <p>${billDetails.invoice_number}</p>
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
                  <p>${billDetails.paymentMethod}</p>
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
                  ${billDetails.items.map((item: any) => `
                    <tr>
                      <td>${item.product_name}</td>
                      <td>${item.quantity}</td>
                      <td>₹${item.unit_price.toFixed(2)}</td>
                      <td>₹${(item.preview_total ?? 0).toFixed(2)}</td>
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
                    <span>₹${billDetails.subtotal.toFixed(2)}</span>
                  </div>
                  ${billDetails.service_charge_amount && billDetails.service_charge_amount > 0 ? `
                  <div class="total-row">
                    <span>Service Charge</span>
                    <span>₹${billDetails.service_charge_amount.toFixed(2)}</span>
                  </div>
                  ` : ''}
                  ${billDetails.cgst && billDetails.sgst ? `
                  <div class="total-row">
                    <span>CGST</span>
                    <span>₹${billDetails.cgst.toFixed(2)}</span>
                  </div>
                  <div class="total-row">
                    <span>SGST</span>
                    <span>₹${billDetails.sgst.toFixed(2)}</span>
                  </div>
                  ` : `
                  <div class="total-row">
                    <span>GST</span>
                    <span>₹${billDetails.gst.toFixed(2)}</span>
                  </div>
                  `}
                  <div class="total-row">
                    <span>Total Amount</span>
                    <span>₹${billDetails.total.toFixed(2)}</span>
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

  // Memoize filtered products for performance
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || p.category_id === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, selectedCategory])

  const productsByCategory = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = filteredProducts.filter(p => p.category_id === cat.id)
      return acc
    }, {} as Record<string, Product[]>)
  }, [categories, filteredProducts])

  const uncategorizedProducts = useMemo(() => {
    return filteredProducts.filter(p => !p.category_id)
  }, [filteredProducts])

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-[#F5F3EE] min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#3E2C24] mb-4 sm:mb-6">Orders</h1>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 w-full">
          {/* Left Sidebar: Categories */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-[#E5E7EB]">
            <h3 className="font-bold text-[#3E2C24] mb-3 sm:mb-4 text-lg sm:text-xl">Categories</h3>
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring outline-none truncate ${selectedCategory === null
                    ? 'bg-[#3E2C24] text-white shadow-md'
                    : 'bg-[#FAF7F2] text-[#3E2C24] hover:bg-[#C89B63]/10'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring outline-none truncate ${selectedCategory === category.id
                      ? 'bg-[#3E2C24] text-white shadow-md'
                      : 'bg-[#FAF7F2] text-[#3E2C24] hover:bg-[#C89B63]/10'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Menu Items */}
          <div className="xl:col-span-6 lg:col-span-7 bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-[#E5E7EB]">
            <div className="mb-4 sm:mb-6">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-sm sm:text-base text-[#1F1F1F] placeholder-[#9CA3AF]"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading menu items...</div>
            ) : (
              <div className="space-y-6">
                {categories.map((category) => {
                  const categoryProducts = productsByCategory[category.id] || []
                  if (categoryProducts.length === 0 || (selectedCategory && selectedCategory !== category.id)) return null

                  return (
                    <div key={category.id}>
                      <h4 className="font-bold text-[#3E2C24] mb-3 sm:mb-4 text-lg sm:text-xl">{category.name}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {categoryProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => addToBill(product)}
                            className="group relative w-full bg-white rounded-xl shadow-sm border border-[#E5E7EB]
                                       hover:shadow-md hover:border-[#C89B63] transition-all duration-200
                                       active:scale-[0.98] cursor-pointer flex flex-col overflow-hidden p-2 sm:p-3"
                            style={{ aspectRatio: '4/5' }}
                          >
                            {/* Product Image Container - Takes ~60% of card */}
                            <div className="w-full flex-[0_0_60%] flex items-center justify-center overflow-hidden bg-[#FAF7F2] rounded-lg mb-1 sm:mb-2">
                              {(() => {
                                const categoryLower = product.category_name?.toLowerCase() || ''
                                if (categoryLower.includes('idli')) {
                                  return (
                                    <Image 
                                      key={product.id + "-idli"}
                                      src="/images/menu_items/idli.png"
                                      alt={product.name}
                                      width={120}
                                      height={120}
                                      objectFit="contain"
                                      className="w-full h-full object-contain"
                                      priority
                                    />
                                  )
                                } else if (categoryLower.includes('dosa') || categoryLower.includes('uttapam')) {
                                  return (
                                    <Image 
                                      key={product.id + "-dosa"}
                                      src="/images/menu_items/dosa.jpeg"
                                      alt={product.name}
                                      width={120}
                                      height={120}
                                      objectFit="contain"
                                      className="w-full h-full object-contain"
                                      priority
                                    />
                                  )
                                } else if (categoryLower.includes('snack') || categoryLower === 'other snacks' || categoryLower === 'snacks') {
                                  return (
                                    <Image 
                                      key={product.id + "-snack"}
                                      src="/images/menu_items/snacks.png"
                                      alt={product.name}
                                      width={120}
                                      height={120}
                                      objectFit="contain"
                                      className="w-full h-full object-contain"
                                      priority
                                    />
                                  )
                                } else if (categoryLower.includes('beverage') || categoryLower === 'beverages') {
                                  return (
                                    <Image 
                                      key={product.id + "-beverage"}
                                      src="/images/menu_items/beverages.png"
                                      alt={product.name}
                                      width={120}
                                      height={120}
                                      objectFit="contain"
                                      className="w-full h-full object-contain"
                                      priority
                                    />
                                  )
                                } else {
                                  return <span className="text-4xl">☕</span>
                                }
                              })()}
                            </div>
                            
                          {/* Product Details - Takes remaining ~40% of card */}
                          <div className="flex flex-col justify-center items-center w-full flex-1 px-1 min-h-0">
                            <div className="font-semibold text-[#1F1F1F] text-[10px] sm:text-xs text-center mb-1 leading-tight break-words line-clamp-2 flex items-center justify-center min-h-[2rem] max-w-full">
                              <span className="truncate w-full">{product.name}</span>
                            </div>
                            <div className="font-bold text-[#3E2C24] text-xs sm:text-sm whitespace-nowrap">₹{product.selling_price.toFixed(2)}</div>
                          </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Uncategorized Items */}
                {(!selectedCategory || selectedCategory === null) && uncategorizedProducts.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#3E2C24] mb-3 sm:mb-4 text-lg sm:text-xl">Other Items</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {uncategorizedProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => addToBill(product)}
                          className="group relative w-full bg-white rounded-xl shadow-sm border border-[#E5E7EB]
                                     hover:shadow-md hover:border-[#C89B63] transition-all duration-200
                                     active:scale-[0.98] cursor-pointer flex flex-col overflow-hidden p-2 sm:p-3"
                          style={{ aspectRatio: '4/5' }}
                        >
                          {/* Product Image Container - Takes ~60% of card */}
                          <div className="w-full flex-[0_0_60%] flex items-center justify-center overflow-hidden bg-[#FAF7F2] rounded-lg mb-1 sm:mb-2">
                            {(() => {
                              const categoryLower = product.category_name?.toLowerCase() || ''
                              if (categoryLower.includes('idli')) {
                                return (
                                  <Image 
                                    key={product.id + "-idli"}
                                    src="/images/menu_items/idli.png"
                                    alt={product.name}
                                    width={120}
                                    height={120}
                                    objectFit="contain"
                                    className="w-full h-full object-contain"
                                    priority
                                  />
                                )
                              } else if (categoryLower.includes('dosa') || categoryLower.includes('uttapam')) {
                                return (
                                  <Image 
                                    key={product.id + "-dosa"}
                                    src="/images/menu_items/dosa.jpeg"
                                    alt={product.name}
                                    width={120}
                                    height={120}
                                    objectFit="contain"
                                    className="w-full h-full object-contain"
                                    priority
                                  />
                                )
                              } else if (categoryLower.includes('snack') || categoryLower === 'other snacks' || categoryLower === 'snacks') {
                                return (
                                  <Image 
                                    key={product.id + "-snack"}
                                    src="/images/menu_items/snacks.png"
                                    alt={product.name}
                                    width={120}
                                    height={120}
                                    objectFit="contain"
                                    className="w-full h-full object-contain"
                                    priority
                                  />
                                )
                              } else if (categoryLower.includes('beverage') || categoryLower === 'beverages') {
                                return (
                                  <Image 
                                    key={product.id + "-beverage"}
                                    src="/images/menu_items/beverages.png"
                                    alt={product.name}
                                    width={120}
                                    height={120}
                                    objectFit="contain"
                                    className="w-full h-full object-contain"
                                    priority
                                  />
                                )
                              } else {
                                return <span className="text-4xl">☕</span>
                              }
                            })()}
                          </div>
                          
                          {/* Product Details - Takes remaining ~40% of card */}
                          <div className="flex flex-col justify-center items-center w-full flex-1 px-1 min-h-0">
                            <div className="font-semibold text-[#1F1F1F] text-xs text-center mb-1 leading-tight break-words line-clamp-2 flex items-center justify-center min-h-[2rem]">
                              {product.name}
                            </div>
                            <div className="font-bold text-[#3E2C24] text-sm">₹{product.selling_price.toFixed(2)}</div>
                            {product.tax_group && (
                              <div className="text-[10px] text-[#6B6B6B] mt-0.5 text-center line-clamp-1">
                                {product.tax_group.name}
                                {product.tax_group.is_tax_inclusive && ' (Incl. Tax)'}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="xl:col-span-4 lg:col-span-5 bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-[#E5E7EB] xl:sticky xl:top-4 xl:self-start">
            <div className="flex justify-between items-center mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#E5E7EB]">
              <h3 className="text-lg sm:text-xl font-bold text-[#3E2C24]">Current Order</h3>
              <button
                onClick={() => setBillItems([])}
                className="text-xs sm:text-sm bg-[#F4A261] text-white hover:bg-[#E08F50] rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] whitespace-nowrap"
              >
                Clear
              </button>
            </div>

            <div className="mb-4">
              {billItems.length === 0 ? (
                <div className="text-center text-[#9CA3AF] py-8">
                  <PackageOpen className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-sm">Add items to start order</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {billItems.map((item) => {
                    const productImage = products.find(p => p.id === item.product_id)
                    const itemIsDosaOrUttapam = productImage?.category_name?.toLowerCase().includes('dosa') || productImage?.category_name?.toLowerCase().includes('uttapam')

                    return (
                      <div key={item.product_id} className="flex gap-2 sm:gap-3 py-2 sm:py-3 border-b border-[#E5E7EB] last:border-b-0 transition-all duration-200 ease-in-out hover:bg-[#FAF7F2] rounded-md px-1 sm:px-2">
                        {/* Left: Image */}
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center rounded-md overflow-hidden bg-[#FAF7F2]">
                            {(() => {
                              const categoryLower = productImage?.category_name?.toLowerCase() || ''
                              if (categoryLower.includes('idli')) {
                                return (
                                  <Image
                                    key={item.product_id + "-summary-idli"}
                                    src="/images/menu_items/idli.png"
                                    alt={item.product_name}
                                    width={64}
                                    height={64}
                                    objectFit="cover"
                                    className="rounded-md"
                                    loading="lazy"
                                  />
                                )
                              } else if (categoryLower.includes('dosa') || categoryLower.includes('uttapam')) {
                                return (
                                  <Image
                                    key={item.product_id + "-summary-dosa"}
                                    src="/images/menu_items/dosa.jpeg"
                                    alt={item.product_name}
                                    width={64}
                                    height={64}
                                    objectFit="cover"
                                    className="rounded-md"
                                    loading="lazy"
                                  />
                                )
                              } else if (categoryLower.includes('snack') || categoryLower === 'other snacks' || categoryLower === 'snacks') {
                                return (
                                  <Image
                                    key={item.product_id + "-summary-snack"}
                                    src="/images/menu_items/snacks.png"
                                    alt={item.product_name}
                                    width={64}
                                    height={64}
                                    objectFit="cover"
                                    className="rounded-md"
                                    loading="lazy"
                                  />
                                )
                              } else if (categoryLower.includes('beverage') || categoryLower === 'beverages') {
                                return (
                                  <Image
                                    key={item.product_id + "-summary-beverage"}
                                    src="/images/menu_items/beverages.png"
                                    alt={item.product_name}
                                    width={64}
                                    height={64}
                                    objectFit="cover"
                                    className="rounded-md"
                                    loading="lazy"
                                  />
                                )
                              } else {
                                return <span className="text-xl">☕</span>
                              }
                            })()}
                          </div>
                        </div>

                        {/* Right: Name, GST, Controls, Total */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1 sm:gap-2">
                          {/* Product Name */}
                          <div className="font-semibold text-xs sm:text-sm text-[#1F1F1F] truncate">{item.product_name}</div>
                          
                          {/* GST Details */}
                          {(item.preview_tax_amount || 0) > 0 && item.tax_group && (
                            <div className="flex flex-col gap-0.5">
                              {item.tax_group.split_type === 'GST_50_50' ? (
                                <>
                                  <div className="text-[10px] sm:text-xs text-[#6B6B6B] whitespace-nowrap">
                                    CGST: ₹{(item.preview_cgst || 0).toFixed(2)}
                                  </div>
                                  <div className="text-[10px] sm:text-xs text-[#6B6B6B] whitespace-nowrap">
                                    SGST: ₹{(item.preview_sgst || 0).toFixed(2)}
                                  </div>
                                </>
                              ) : (
                                <div className="text-[10px] sm:text-xs text-[#6B6B6B] whitespace-nowrap">
                                  Tax: ₹{(item.preview_tax_amount || 0).toFixed(2)}
                                </div>
                              )}
                              {item.tax_group.is_tax_inclusive && (
                                <div className="text-[10px] sm:text-xs text-blue-600">(Tax Inclusive)</div>
                              )}
                            </div>
                          )}

                          {/* Quantity Controls and Total */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                              <button
                                onClick={() => updateQuantity(item.product_id, -1)}
                                className="p-1 sm:p-1.5 rounded-full bg-[#FAF7F2] text-[#3E2C24] hover:bg-[#E5E7EB] transition-all duration-200 ease-in-out active:scale-[0.9] border border-[#E5E7EB]"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <span className="font-bold text-xs sm:text-sm text-[#1F1F1F] min-w-[24px] sm:min-w-[30px] text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product_id, 1)}
                                className="p-1 sm:p-1.5 rounded-full bg-[#FAF7F2] text-[#3E2C24] hover:bg-[#E5E7EB] transition-all duration-200 ease-in-out active:scale-[0.9] border border-[#E5E7EB]"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={() => removeItem(item.product_id)}
                                className="p-1 sm:p-1.5 rounded-full bg-[#F5F3EE] text-[#EF4444] hover:bg-[#F4A261]/20 transition-all duration-200 ease-in-out active:scale-[0.9] ml-0.5 sm:ml-1"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                            <div className="font-bold text-xs sm:text-sm text-[#1F1F1F] whitespace-nowrap">
                              ₹{(item.preview_total || item.subtotal).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Service Charge Toggle */}
            <div className="space-y-2 mb-4 pt-4 border-t border-[#E5E7EB]">
              <div className="flex justify-between items-center mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceChargeEnabled}
                    onChange={(e) => setServiceChargeEnabled(e.target.checked)}
                    className="w-5 h-5 border border-[#E5E7EB] rounded focus:ring-2 focus:ring-[#C89B63] accent-[#3E2C24]"
                  />
                  <span className="text-sm font-semibold text-[#3E2C24]">
                    Service Charge (Voluntary)
                  </span>
                </label>
                {serviceChargeEnabled && (
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={serviceChargeRate}
                    onChange={(e) => setServiceChargeRate(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-[#E5E7EB] rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#C89B63] bg-[#FAF7F2]"
                  />
                )}
              </div>
              {serviceChargeEnabled && (
                <p className="text-xs text-[#6B6B6B] mb-2">
                  Service charge is optional and can be removed on request.
                </p>
              )}
            </div>

            <div className="space-y-2 mb-4 pt-4 border-t border-[#E5E7EB]">
              <div className="flex justify-between text-sm text-[#6B6B6B]">
                <span>Subtotal</span>
                <span className="whitespace-nowrap">₹{subtotal.toFixed(2)}</span>
              </div>
              {serviceChargeEnabled && serviceChargeAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm text-[#6B6B6B]">
                    <span>Service Charge ({serviceChargeRate}%)</span>
                    <span>₹{serviceChargeAmount.toFixed(2)}</span>
                  </div>
                  {gstOnServiceCharge > 0 && (
                    <>
                      <div className="flex justify-between text-xs text-[#9CA3AF] pl-4">
                        <span>CGST on Service Charge</span>
                        <span>₹{cgstOnServiceCharge.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-[#9CA3AF] pl-4">
                        <span>SGST on Service Charge</span>
                        <span>₹{sgstOnServiceCharge.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </>
              )}
              {totalTax > 0 && (
                <>
                  {totalCGST > 0 && totalSGST > 0 ? (
                    <>
                      <div className="flex justify-between text-sm text-[#6B6B6B]">
                        <span>CGST (Items)</span>
                        <span>₹{totalCGST.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-[#6B6B6B]">
                        <span>SGST (Items)</span>
                        <span>₹{totalSGST.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm text-[#6B6B6B]">
                      <span>Tax (GST) - Items</span>
                      <span>₹{totalTax.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-between items-center mb-4 sm:mb-6 pt-3 sm:pt-4 border-t-2 border-[#3E2C24]">
              <span className="text-base sm:text-lg font-bold text-[#3E2C24]">Total</span>
              <span className="text-base sm:text-lg font-bold text-[#3E2C24] whitespace-nowrap">₹{grandTotal.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-[#E5E7EB] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring outline-none ${
                  paymentMethod === 'CASH'
                    ? 'bg-[#3E2C24] text-white shadow-md'
                    : 'bg-[#FAF7F2] text-[#3E2C24] hover:bg-[#C89B63]/10'
                }`}
              >
                <Wallet className="w-4 h-4 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
                <span className="text-[10px] sm:text-sm font-medium">Cash</span>
              </button>
              <button
                onClick={() => setPaymentMethod('UPI')}
                className={`flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-[#E5E7EB] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring outline-none ${
                  paymentMethod === 'UPI'
                    ? 'bg-[#3E2C24] text-white shadow-md'
                    : 'bg-[#FAF7F2] text-[#3E2C24] hover:bg-[#C89B63]/10'
                }`}
              >
                <Smartphone className="w-4 h-4 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
                <span className="text-[10px] sm:text-sm font-medium">UPI</span>
              </button>
              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-[#E5E7EB] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring outline-none ${
                  paymentMethod === 'CARD'
                    ? 'bg-[#3E2C24] text-white shadow-md'
                    : 'bg-[#FAF7F2] text-[#3E2C24] hover:bg-[#C89B63]/10'
                }`}
              >
                <CreditCard className="w-4 h-4 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
                <span className="text-[10px] sm:text-sm font-medium">Card</span>
              </button>
            </div>

            <button
              onClick={handleCompleteBill}
              disabled={billItems.length === 0}
              className="w-full bg-[#3E2C24] text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold
                         transition-all duration-200 ease-in-out
                         hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
                         focus-visible:ring outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="whitespace-nowrap">Complete Order</span>
            </button>
          </div>
        </div>

        {showOrderSuccessModal && billDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 print:hidden transition-opacity duration-300 ease-in-out opacity-100">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center transform scale-100 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#3E2C24] mb-2">Order Completed!</h2>
              <p className="text-gray-700 mb-1">Bill Number: <span className="font-semibold">{billDetails.invoice_number}</span></p>
              <p className="text-gray-700 mb-4">Total Amount: <span className="font-bold text-xl text-[#3E2C24]">₹{billDetails.total.toFixed(2)}</span></p>
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handlePrintInvoice}
                  className="bg-[#C89B63] text-white py-3 px-6 rounded-xl font-semibold
                             transition-all duration-200 ease-in-out
                             hover:scale-[1.05] hover:shadow-lg active:scale-[0.95]"
                >
                  Print Invoice
                </button>
                <button
                  onClick={() => setShowOrderSuccessModal(false)}
                  className="bg-gray-300 text-[#3E2C24] py-3 px-6 rounded-xl font-semibold
                             transition-all duration-200 ease-in-out
                             hover:scale-[1.05] hover:shadow-lg active:scale-[0.95]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
