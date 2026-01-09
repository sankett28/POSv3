import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export interface Product {
  id: string
  name: string
  barcode?: string
  price: number
  created_at: string
  updated_at: string
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getProducts()
      setProducts(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const createProduct = async (data: {
    name: string
    sku: string
    barcode?: string
    selling_price: number
    unit: 'pcs' | 'kg' | 'litre'
    is_active?: boolean
  }) => {
    try {
      const newProduct = await api.createProduct(data)
      setProducts([newProduct, ...products])
      return newProduct
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to create product')
    }
  }

  const updateProduct = async (id: string, data: { name?: string; barcode?: string; price?: number }) => {
    try {
      const updatedProduct = await api.updateProduct(id, data)
      setProducts(products.map((p) => (p.id === id ? updatedProduct : p)))
      return updatedProduct
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to update product')
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id)
      setProducts(products.filter((p) => p.id !== id))
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to delete product')
    }
  }

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refresh: loadProducts,
  }
}

