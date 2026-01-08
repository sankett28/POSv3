import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export interface Stock {
  product_id: string
  product_name: string
  current_stock: number
  last_movement_at?: string
}

export function useInventory() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStocks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getStocks()
      setStocks(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load stocks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStocks()
  }, [])

  const addStock = async (productId: string, quantity: number, notes?: string) => {
    try {
      await api.addStock(productId, quantity, notes)
      await loadStocks()
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to add stock')
    }
  }

  const deductStock = async (productId: string, quantity: number, notes?: string) => {
    try {
      await api.deductStock(productId, quantity, notes)
      await loadStocks()
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to deduct stock')
    }
  }

  const getStock = async (productId: string) => {
    try {
      const data = await api.getStock(productId)
      return data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to get stock')
    }
  }

  return {
    stocks,
    loading,
    error,
    addStock,
    deductStock,
    getStock,
    refresh: loadStocks,
  }
}

