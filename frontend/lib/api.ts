import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          this.clearToken()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_id')
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('access_token', token)
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password })
    if (response.data.access_token) {
      this.setToken(response.data.access_token)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_id', response.data.user_id)
      }
    }
    return response.data
  }

  logout(): void {
    this.clearToken()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  // Product endpoints
  async getProducts() {
    const response = await this.client.get('/products')
    return response.data
  }

  async getProduct(id: string) {
    const response = await this.client.get(`/products/${id}`)
    return response.data
  }

  async createProduct(data: { name: string; barcode?: string; price: number }) {
    const response = await this.client.post('/products', data)
    return response.data
  }

  async updateProduct(id: string, data: { name?: string; barcode?: string; price?: number }) {
    const response = await this.client.put(`/products/${id}`, data)
    return response.data
  }

  async deleteProduct(id: string) {
    await this.client.delete(`/products/${id}`)
  }

  async getProductByBarcode(barcode: string) {
    const response = await this.client.get(`/products/barcode/${barcode}`)
    return response.data
  }

  // Inventory endpoints
  async getStocks() {
    const response = await this.client.get('/inventory/stocks')
    return response.data
  }

  async getStock(productId: string) {
    const response = await this.client.get(`/inventory/stock/${productId}`)
    return response.data
  }

  async addStock(productId: string, quantity: number, notes?: string) {
    const response = await this.client.post('/inventory/add-stock', {
      product_id: productId,
      quantity,
      notes,
    })
    return response.data
  }

  async deductStock(productId: string, quantity: number, notes?: string) {
    const response = await this.client.post('/inventory/deduct-stock', {
      product_id: productId,
      quantity,
      notes,
    })
    return response.data
  }

  async getStockHistory(productId: string, limit = 100) {
    const response = await this.client.get(`/inventory/history/${productId}?limit=${limit}`)
    return response.data
  }

  // Billing endpoints
  async createBill(data: {
    items: Array<{ product_id: string; quantity: number; unit_price: number }>
    payment_method: 'CASH' | 'UPI' | 'CARD'
  }) {
    const response = await this.client.post('/bills', data)
    return response.data
  }

  async getBill(id: string) {
    const response = await this.client.get(`/bills/${id}`)
    return response.data
  }

  async getBills(limit = 100) {
    const response = await this.client.get(`/bills?limit=${limit}`)
    return response.data
  }
}

export const api = new ApiClient()

