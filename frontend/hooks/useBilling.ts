import { useState } from 'react'
import { api } from '@/lib/api'

export interface BillItem {
  product_id: string
  quantity: number
  unit_price: number
}

export interface Bill {
  id: string
  bill_number: string
  total_amount: number
  payment_method: string
  created_at: string
  items: Array<{
    id: string
    product_id: string
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
  }>
}

export function useBilling() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createBill = async (items: BillItem[], paymentMethod: 'CASH' | 'UPI' | 'CARD') => {
    try {
      setLoading(true)
      setError(null)
      const bill = await api.createBill({
        items,
        payment_method: paymentMethod,
      })
      return bill
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to create bill'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getBill = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const bill = await api.getBill(id)
      return bill
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to get bill'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getBills = async (limit = 100) => {
    try {
      setLoading(true)
      setError(null)
      const bills = await api.getBills(limit)
      return bills
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to get bills'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    createBill,
    getBill,
    getBills,
    loading,
    error,
  }
}

