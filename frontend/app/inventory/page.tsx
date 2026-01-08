'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Package, AlertTriangle, TrendingUp } from 'lucide-react'

interface Stock {
  product_id: string
  product_name: string
  current_stock: number
  last_movement_at?: string
}

export default function InventoryPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddStockModal, setShowAddStockModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadStocks()
  }, [])

  const loadStocks = async () => {
    try {
      const data = await api.getStocks()
      setStocks(data)
    } catch (error) {
      console.error('Error loading stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.addStock(selectedProduct, parseInt(quantity), notes)
      setShowAddStockModal(false)
      setSelectedProduct('')
      setQuantity('')
      setNotes('')
      loadStocks()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to add stock')
    }
  }

  const stats = {
    totalProducts: stocks.length,
    lowStock: stocks.filter((s) => s.current_stock < 10).length,
    inStock: stocks.filter((s) => s.current_stock > 0).length,
    totalValue: stocks.reduce((sum, s) => sum + s.current_stock, 0),
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Ledger-based stock tracking</p>
          </div>
          <button
            onClick={() => setShowAddStockModal(true)}
            className="bg-black text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-800"
          >
            Add Stock
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8 text-black" />
              <div>
                <div className="text-2xl font-bold text-black">{stats.inStock}</div>
                <div className="text-sm text-gray-600">In Stock</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-8 h-8 text-warning" />
              <div>
                <div className="text-2xl font-bold text-warning">{stats.lowStock}</div>
                <div className="text-sm text-gray-600">Low Stock</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8 text-gray-600" />
              <div>
                <div className="text-2xl font-bold text-black">{stats.totalProducts}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-success" />
              <div>
                <div className="text-2xl font-bold text-black">₹{stats.totalValue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Stock Value</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Current Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Last Movement</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock.product_id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{stock.product_name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          stock.current_stock < 10
                            ? 'text-warning'
                            : stock.current_stock === 0
                            ? 'text-danger'
                            : 'text-black'
                        }`}
                      >
                        {stock.current_stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {stock.current_stock === 0 ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          Out of Stock
                        </span>
                      ) : stock.current_stock < 10 ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Good Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {stock.last_movement_at
                        ? new Date(stock.last_movement_at).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          )}
        </div>

        {showAddStockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-black mb-4">Add Stock</h2>
              <form onSubmit={handleAddStock} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">Select a product</option>
                    {stocks.map((stock) => (
                      <option key={stock.product_id} value={stock.product_id}>
                        {stock.product_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddStockModal(false)
                      setSelectedProduct('')
                      setQuantity('')
                      setNotes('')
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                    Add Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

