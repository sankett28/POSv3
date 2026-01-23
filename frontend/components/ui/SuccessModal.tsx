'use client'

import { CheckCircle, Printer } from 'lucide-react'

interface BillItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  tax_group?: {
    name: string
    is_tax_inclusive: boolean
  }
  preview_taxable_value?: number
  preview_tax_amount?: number
  preview_cgst?: number
  preview_sgst?: number
  preview_total?: number
  total_price?: number
  line_total?: number
  tax_rate?: number
  tax_amount?: number
}

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  billData?: {
    items: BillItem[]
    subtotal: number
    gst: number
    total: number
    paymentMethod: string
    date: string
  }
  invoiceNumber?: string
}

export default function SuccessModal({ isOpen, onClose, billData, invoiceNumber = 'INV-2025-001' }: SuccessModalProps) {

  const handlePrint = () => {
    if (!billData) return
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
              padding: 30px 15px;
              background: #f9f9f9;
              line-height: 1.5;
            }
            .invoice-container {
              max-width: 700px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
              border-radius: 6px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              padding-bottom: 15px;
              border-bottom: 1px solid #eee;
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .logo-text {
              font-size: 24px;
              font-weight: 700;
              color: #333;
              margin: 0;
              letter-spacing: -0.2px;
              display: inline-flex;
              align-items: center;
            }
            .header-left-content h1 {
              font-size: 24px;
              font-weight: 600;
              color: var(--primary-text); /* Garlic Deep Burgundy */
              margin: 0 0 2px 0;
              letter-spacing: -0.2px;
            }
            .header-left-content p {
              font-size: 11px;
              color: #888;
              margin: 0;
              font-weight: 400;
            }
            .invoice-number-box {
              background: #f0f0f0;
              padding: 8px 12px;
              border-radius: 4px;
              border: 1px solid #e0e0e0;
              text-align: right;
            }
            .invoice-number-box p:first-child {
              font-size: 9px;
              color: #777;
              margin-bottom: 3px;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              font-weight: 500;
            }
            .invoice-number-box p:last-child {
              font-size: 16px;
              font-weight: 600;
              color: #444;
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
              color: #777;
              margin-bottom: 3px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              font-weight: 500;
            }
            .detail-item p:last-child {
              font-size: 14px;
              font-weight: 500;
              color: #444;
              margin: 0;
            }
            .table-section {
              margin-bottom: 25px;
            }
            .table-title {
              font-size: 15px;
              font-weight: 600;
              color: #444;
              margin-bottom: 10px;
              padding-bottom: 6px;
              border-bottom: 1px solid #eee;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 0;
            }
            thead {
              background: #f5f5f5;
              color: #555;
            }
            thead tr {
              border-bottom: 1px solid #eee;
            }
            th {
              text-align: left;
              padding: 10px 12px;
              font-size: 10px;
              font-weight: 600;
              color: #555;
              text-transform: uppercase;
              letter-spacing: 0.7px;
            }
            th:nth-child(2), th:nth-child(3), th:nth-child(4) {
              text-align: right;
            }
            tbody tr {
              border-bottom: 1px solid #eee;
              transition: background 0.1s;
            }
            tbody tr:hover {
              background: #fcfcfc;
            }
            tbody tr:last-child {
              border-bottom: none;
            }
            td {
              padding: 12px;
              font-size: 12px;
              color: #444;
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
              color: #333;
            }
            .totals-section {
              background: var(--card-background);
              padding: 18px 22px;
              border-radius: 6px;
              border: 1px solid #eee;
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
              border-bottom: 1px dashed #eee;
            }
            .total-row span:first-child {
              color: #666;
              font-weight: 500;
            }
            .total-row span:last-child {
              color: #444;
              font-weight: 600;
            }
            .total-row:last-child {
              font-size: 18px;
              font-weight: 700;
              padding-top: 10px;
              margin-top: 5px;
              border-top: 1px solid #ddd;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .total-row:last-child span {
              color: #333;
            }
            .footer {
              margin-top: 35px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
            }
            .footer p:first-child {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
              font-weight: 500;
            }
            .footer p:last-child {
              font-size: 9px;
              color: #aaa;
              margin: 0;
            }
            .divider {
              height: 1px;
              background: linear-gradient(to right, transparent, #eee, transparent);
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
                    <span class="logo-text">Garlic</span>
                  </h1>
                  <p>Cafe POS System</p>
                </div>
              </div>
              <div class="invoice-number-box">
                <p>Invoice Number</p>
                <p>${invoiceNumber}</p>
              </div>
            </div>
            
            <div class="details-section">
              <div class="details">
                <div class="detail-item">
                  <p>Invoice Date</p>
                  <p>${billData.date}</p>
                </div>
                <div class="detail-item">
                  <p>Payment Method</p>
                  <p>${billData.paymentMethod}</p>
                </div>
              </div>
            </div>

            <div class="table-title">Items Ordered</div>
            <div class="bg-warm-cream/20 rounded-xl p-4 space-y-3">
              ${billData.items.map((item: any) => `
                <div class="flex flex-col gap-1 border-b border-border-light py-3 last:border-none">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-primary-text">${item.product_name}</span>
                    <span class="font-semibold text-coffee-brown">
                      ₹${(item.total_price || item.line_total || item.unit_price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <div class="text-sm text-secondary-text">
                    ₹${item.unit_price.toFixed(2)} × ${item.quantity}
                    (${item.tax_group ? `GST ${item.tax_group.total_rate}%` : 'No Tax'})
                  </div>

                  ${item.preview_tax_amount > 0 ? `
                    <div class="text-xs text-muted-text">
                      CGST: ₹${(item.preview_tax_amount / 2).toFixed(2)}, SGST: ₹{(item.preview_tax_amount / 2).toFixed(2)}
                    </div>
                  ` : ''}

                  <div class="text-right text-sm font-medium text-primary-text mt-1">
                    Item Total: ₹${(item.unit_price * item.quantity + item.preview_tax_amount).toFixed(2)}
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="totals-section">
              <div class="totals">
                <div class="totals-inner">
                  <div class="total-row">
                    <span>Subtotal</span>
                    <span>₹${billData.subtotal.toFixed(2)}</span>
                  </div>
                  <div class="total-row">
                    <span>GST (5%)</span>
                    <span>₹${billData.gst.toFixed(2)}</span>
                  </div>
                  <div class="total-row">
                    <span>Total Amount</span>
                    <span>₹${billData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>Thank you for your business!</p>
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

  if (!isOpen) return null

  return (
    <>
    <div
        className="fixed inset-0 bg-black/50 z-1000 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
          className="bg-white rounded-2xl p-6 sm:p-8 lg:p-12 max-w-[400px] w-full text-center animate-fade-in animate-scale-in shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-700" />
        </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-primary-text mb-2">Bill Generated Successfully!</h3>
          <p className="text-sm sm:text-base text-secondary-text mb-6 sm:mb-8">Invoice #{invoiceNumber} created</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={onClose}
              className="flex-1 bg-white text-primary-text border border-border px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold cursor-pointer transition-all hover:bg-warm-cream/20 hover:border-coffee-brown hover:scale-[1.02] active:scale-[0.98]"
          >
            Close
          </button>
            <button
              onClick={handlePrint}
              className="flex-1 bg-coffee-brown text-white border-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-brand-dusty-rose hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            Print Invoice
          </button>
        </div>
      </div>
    </div>

    </>
  )
}
