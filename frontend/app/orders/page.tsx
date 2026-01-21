'use client'

import { useState, useEffect } from 'react'
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
  gst: number
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
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false)
  const [billDetails, setBillDetails] = useState<BillDetails | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showOrderSuccessModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showOrderSuccessModal])

  const loadData = async () => {
    try {
      const [productsData, categoriesData, taxGroupsData] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getActiveTaxGroups()
      ])
      
      if (!Array.isArray(productsData)) {
        console.error("Products data is not an array:", productsData)
        setLoading(false)
        return
      }
      if (!Array.isArray(categoriesData)) {
        console.error("Categories data is not an array:", categoriesData)
        setLoading(false)
        return
      }
      if (!Array.isArray(taxGroupsData)) {
        console.error("Tax groups data is not an array:", taxGroupsData)
        setLoading(false)
        return
      }

      const activeProducts = productsData.filter((p: Product) => p.is_active)
      
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
      console.error('Error loading data:', JSON.stringify(error, null, 2))    } finally {
      setLoading(false)
    }
  }

  const addToBill = (product: Product) => {
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
  }

  const updateQuantity = (productId: string, delta: number) => {
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
  }

  const removeItem = (productId: string) => {
    setBillItems(billItems.filter((item) => item.product_id !== productId))
  }

  // Tax preview calculation function (for display only - backend does actual calculation)
  const calculateTaxPreview = (
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
  }

  // Calculate totals from preview values
  const subtotal = billItems.reduce((sum, item) => sum + (item.preview_taxable_value || item.subtotal), 0)
  const totalTax = billItems.reduce((sum, item) => sum + (item.preview_tax_amount || 0), 0)
  // Derive balanced CGST/SGST from total tax (matching backend logic)
  const totalCGST = Math.round((totalTax / 2) * 100) / 100
  const totalSGST = totalTax - totalCGST  // Ensure exact balance
  const grandTotal = billItems.reduce((sum, item) => sum + (item.preview_total || item.subtotal), 0)

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
      })

      setBillDetails({
        invoice_number: res.bill_number,
        items: billItems,
        subtotal,
        gst: totalTax,
        total: grandTotal,
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
              background: var(--warm-cream); /* Light Pink */
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
              border-bottom: 1px solid var(--border);
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .logo-text {
              font-size: 24px;
              font-weight: 700;
              color: var(--primary-text); /* Lichy Deep Burgundy */
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
              color: var(--primary-text); /* Lichy Deep Burgundy */
              margin: 0 0 2px 0;
              letter-spacing: -0.2px;
            }
            .header-left-content p {
              font-size: 11px;
              color: var(--secondary-text);
              margin: 0;
              font-weight: 400;
            }
            .invoice-number-box {
              background: var(--warm-cream); /* Light Pink */
              padding: 8px 12px;
              border-radius: 8px; /* rounded-xl */
              border: 1px solid var(--border);
              text-align: right;
            }
            .invoice-number-box p:first-child {
              font-size: 9px;
              color: var(--secondary-text);
              margin-bottom: 3px;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              font-weight: 500;
            }
            .invoice-number-box p:last-child {
              font-size: 16px;
              font-weight: 600;
              color: var(--primary-text); /* Lichy Deep Wine */
              margin: 0;
              letter-spacing: 0.2px;
            }
            .details-section {
              background: var(--card-background);
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
              color: var(--secondary-text);
              margin-bottom: 3px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              font-weight: 500;
            }
            .detail-item p:last-child {
              font-size: 14px;
              font-weight: 500;
              color: var(--primary-text); /* Lichy Deep Wine */
              margin: 0;
            }
            .table-section {
              margin-bottom: 25px;
            }
            .table-title {
              font-size: 15px;
              font-weight: 600;
              color: var(--primary-text); /* Lichy Deep Wine */
              margin-bottom: 10px;
              padding-bottom: 6px;
              border-bottom: 1px solid var(--border);
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 0;
            }
            thead {
              background: var(--warm-cream); /* Light Pink */
              color: #555;
            }
            thead tr {
              border-bottom: 1px solid var(--border);
            }
            th {
              text-align: left;
              padding: 10px 12px;
              font-size: 10px;
              font-weight: 600;
              color: var(--secondary-text);
              text-transform: uppercase;
              letter-spacing: 0.7px;
            }
            th:nth-child(2), th:nth-child(3), th:nth-child(4) {
              text-align: right;
            }
            tbody tr {
              border-bottom: 1px solid var(--border);
              transition: background 0.1s;
            }
            tbody tr:hover {
              background: var(--warm-cream); /* Light Pink */
            }
            tbody tr:last-child {
              border-bottom: none;
            }
            td {
              padding: 12px;
              font-size: 12px;
              color: var(--primary-text); /* Lichy Deep Wine */
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
              color: var(--primary-text); /* Lichy Deep Wine */
            }
            .totals-section {
              background: var(--warm-cream); /* Light Pink */
              padding: 18px 22px;
              border-radius: 8px; /* rounded-xl */
              border: 1px solid var(--border);
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
              color: var(--secondary-text);
              font-weight: 500;
            }
            .total-row span:last-child {
              color: var(--primary-text); /* Lichy Deep Wine */
              font-weight: 600;
            }
            .total-row:last-child {
              font-size: 18px;
              font-weight: 700;
              padding-top: 10px;
              margin-top: 5px;
              border-top: 1px solid var(--coffee-brown); /* Lichy Primary Rose */
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .total-row:last-child span {
              color: var(--primary-text); /* Lichy Deep Wine */
            }
            .footer {
              margin-top: 35px;
              padding-top: 20px;
              border-top: 1px solid var(--border);
              text-align: center;
            }
            .footer p:first-child {
              font-size: 12px;
              color: var(--secondary-text);
              margin-bottom: 5px;
              font-weight: 500;
            }
            .footer p:last-child {
              font-size: 9px;
              color: var(--muted-text);
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
                  <div class="total-row">
                    <span>GST (5%)</span>
                    <span>₹${billDetails.gst.toFixed(2)}</span>
                  </div>
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

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const productsByCategory = categories.reduce((acc, cat) => {
    acc[cat.id] = filteredProducts.filter(p => p.category_id === cat.id)
    return acc
  }, {} as Record<string, Product[]>)

  const uncategorizedProducts = filteredProducts.filter(p => !p.category_id)

  return (
    <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-text mb-1">Orders</h1>
        <p className="text-sm text-primary-text/60 mb-6">Create orders, add items, and complete billing.</p>
          <button className='bg-primary text-white rounded-2xl p-6'>
            test 
          </button>
          <button className='bg-secondary text-black rounded-2xl p-6'>
            test 2
          </button>
           <button className='bg-accent text-foreground rounded-2xl p-6'>
            test 3
          </button>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar: Categories */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 border border-border">
            <h3 className="font-bold text-primary-text mb-4 text-xl">Categories</h3>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-4 py-3 rounded-full font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring-3 outline-hidden ${selectedCategory === null
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-primary-text hover:bg-brand-dusty-rose/10 border border-border'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-4 my-1 white py-3 rounded-full font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring-3 outline-hidden ${selectedCategory === category.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-primary-text hover:bg-brand-dusty-rose/10 border border-border'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Menu Items */}
          <div className="lg:col-span-6 bg-white rounded-2xl shadow-md p-6 border border-border">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-text w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown bg-white hover:bg-warm-cream/10 transition-all duration-200 text-primary-text placeholder-muted-text"
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
                      <h4 className="font-bold text-primary-text mb-4 text-xl">{category.name}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categoryProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => addToBill(product)}
                            className="group relative w-full bg-white rounded-xl shadow-xs border border-border
                                       hover:shadow-md hover:border-coffee-brown transition-all duration-200
                                       active:scale-[0.98] cursor-pointer flex flex-col overflow-hidden p-3"
                            style={{ aspectRatio: '4/5' }}
                          >
                            {/* Product Image Container - Takes ~60% of card */}
                            <div className="w-full flex-[0_0_60%] flex items-center justify-center overflow-hidden bg-warm-cream/20 rounded-lg mb-2">
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
                            <div className="flex flex-col justify-center items-center w-full flex-1 px-1 min-h-0 gap-1">
                              <div className="font-semibold text-text-dark text-xs sm:text-sm text-center mb-1 leading-tight wrap-break-word line-clamp-2 w-full overflow-hidden">
                                <span className="block">{product.name}</span>
                              </div>
                              <div className="font-bold text-coffee-brown text-xs sm:text-sm mt-auto">₹{product.selling_price.toFixed(2)}</div>
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
                    <h4 className="font-bold text-primary-text mb-4 text-xl">Other Items</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {uncategorizedProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => addToBill(product)}
                          className="group relative w-full bg-white rounded-xl shadow-xs border border-border
                                     hover:shadow-md hover:border-coffee-brown transition-all duration-200
                                     active:scale-[0.98] cursor-pointer flex flex-col overflow-hidden p-3"
                          style={{ aspectRatio: '4/5' }}
                        >
                          {/* Product Image Container - Takes ~60% of card */}
                          <div className="w-full flex-[0_0_60%] flex items-center justify-center overflow-hidden bg-warm-cream/20 rounded-lg mb-2">
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
                          <div className="flex flex-col justify-center items-center w-full flex-1 px-1 min-h-0 gap-1">
                            <div className="font-semibold text-text-dark text-xs sm:text-sm text-center mb-1 leading-tight wrap-break-word line-clamp-2 w-full overflow-hidden">
                              <span className="block">{product.name}</span>
                            </div>
                            <div className="font-bold text-coffee-brown text-xs sm:text-sm mt-auto">₹{product.selling_price.toFixed(2)}</div>
                            {product.tax_group && (
                              <div className="text-[10px] text-secondary-text mt-0.5 text-center line-clamp-1">
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
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-md p-6 border border-border sticky top-4">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
              <h3 className="text-xl font-bold text-primary-text">Current Order</h3>
              <button
                onClick={() => setBillItems([])}
                className="text-sm bg-coffee-brown text-white hover:bg-primary rounded-xl px-4 py-2 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                Clear
              </button>
            </div>

            <div className="mb-4">
              {billItems.length === 0 ? (
                <div className="text-center text-muted-text py-8">
                  <PackageOpen className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-sm">Add items to start order</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {billItems.map((item) => {
                    const productImage = products.find(p => p.id === item.product_id)
                    const itemIsDosaOrUttapam = productImage?.category_name?.toLowerCase().includes('dosa') || productImage?.category_name?.toLowerCase().includes('uttapam')

                    return (
                      <div key={item.product_id} className="flex gap-3 py-3 border-b border-border last:border-b-0 transition-all duration-200 ease-in-out hover:bg-warm-cream/10 rounded-md px-2">
                        {/* Left: Image */}
                        <div className="shrink-0">
                          <div className="h-16 w-16 flex items-center justify-center rounded-md overflow-hidden bg-warm-cream/20">
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
                                    priority
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
                                    priority
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
                                    priority
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
                                    priority
                                  />
                                )
                              } else {
                                return <span className="text-xl">☕</span>
                              }
                            })()}
                          </div>
                        </div>

                        {/* Right: Name, GST, Controls, Total */}
                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                          {/* Product Name */}
                          <div className="font-semibold text-sm text-text-dark">{item.product_name}</div>
                          
                          {/* GST Details */}
                          {(item.preview_tax_amount || 0) > 0 && item.tax_group && (
                            <div className="flex flex-col gap-0.5">
                              {item.tax_group.split_type === 'GST_50_50' ? (
                                <>
                                  <div className="text-xs text-secondary-text">
                                    CGST: ₹{(item.preview_cgst || 0).toFixed(2)}
                                  </div>
                                  <div className="text-xs text-secondary-text">
                                    SGST: ₹{(item.preview_sgst || 0).toFixed(2)}
                                  </div>
                                </>
                              ) : (
                                <div className="text-xs text-secondary-text">
                                  Tax: ₹{(item.preview_tax_amount || 0).toFixed(2)}
                                </div>
                              )}
                              {item.tax_group.is_tax_inclusive && (
                                <div className="text-xs text-blue-600">(Tax Inclusive)</div>
                              )}
                            </div>
                          )}

                          {/* Quantity Controls and Total */}
                          <div className="flex items-center w-fit">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.product_id, -1)}
                                className="p-1.5 rounded-full bg-white text-primary-text hover:bg-warm-cream/20 transition-all duration-200 ease-in-out active:scale-[0.9] border border-border"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold text-sm text-text-dark w-10 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product_id, 1)}
                                className="p-1.5 rounded-full bg-white text-primary-text hover:bg-warm-cream/20 transition-all duration-200 ease-in-out active:scale-[0.9] border border-border"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeItem(item.product_id)}
                                className="p-1.5 rounded-full bg-warm-cream/20 text-error hover:bg-coffee-brown/20 transition-all duration-200 ease-in-out active:scale-[0.9] ml-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="font-bold text-sm text-text-dark">
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

            <div className="space-y-2 mb-4 pt-4 border-t border-border">
              <div className="flex justify-between text-sm text-secondary-text">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {totalTax > 0 && (
                <>
                  {totalCGST > 0 && totalSGST > 0 ? (
                    <>
                      <div className="flex justify-between text-sm text-secondary-text">
                        <span>CGST</span>
                        <span>₹{totalCGST.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-secondary-text">
                        <span>SGST</span>
                        <span>₹{totalSGST.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm text-secondary-text">
                      <span>Tax (GST)</span>
                      <span>₹{totalTax.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-between items-center mb-6 pt-4 border-t-2 border-coffee-brown">
              <span className="text-lg font-bold text-primary-text">Total</span>
              <span className="text-lg font-bold text-coffee-brown">₹{grandTotal.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border border-border transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring-3 outline-hidden ${
                  paymentMethod === 'CASH'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-primary-text hover:bg-brand-dusty-rose/10'
                }`}
              >
                <Wallet className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Cash</span>
              </button>
              <button
                onClick={() => setPaymentMethod('UPI')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border border-border transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring-3 outline-hidden ${
                  paymentMethod === 'UPI'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-primary-text hover:bg-brand-dusty-rose/10'
                }`}
              >
                <Smartphone className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">UPI</span>
              </button>
              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border border-border transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring-3 outline-hidden ${
                  paymentMethod === 'CARD'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-primary-text hover:bg-brand-dusty-rose/10'
                }`}
              >
                <CreditCard className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Card</span>
              </button>
            </div>

            <button
              onClick={handleCompleteBill}
              disabled={billItems.length === 0}
              className="w-full bg-coffee-brown text-white py-3 px-4 rounded-xl font-semibold hover:bg-brand-dusty-rose
                         transition-all duration-200 ease-in-out
                         hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
                         focus-visible:ring-3 outline-hidden disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Order
            </button>
          </div>
        </div>

        {showOrderSuccessModal && billDetails && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 print:hidden transition-opacity duration-300 ease-in-out opacity-100"
            onClick={() => setShowOrderSuccessModal(false)}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center transform scale-100 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
              onClick={(e) => e.stopPropagation()}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary-text mb-2">Order Completed!</h2>
              <p className="text-gray-700 mb-1">Bill Number: <span className="font-semibold">{billDetails.invoice_number}</span></p>
              <p className="text-gray-700 mb-4">Total Amount: <span className="font-bold text-xl text-coffee-brown">₹{billDetails.total.toFixed(2)}</span></p>
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handlePrintInvoice}
                  className="bg-coffee-brown text-white py-3 px-6 rounded-xl font-semibold hover:bg-brand-dusty-rose
                             transition-all duration-200 ease-in-out
                             hover:scale-[1.05] hover:shadow-lg active:scale-[0.95]"
                >
                  Print Invoice
                </button>
                <button
                  onClick={() => setShowOrderSuccessModal(false)}
                  className="bg-gray-300 text-primary-text py-3 px-6 rounded-xl font-semibold
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
  )
}
