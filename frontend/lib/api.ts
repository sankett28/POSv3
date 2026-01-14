import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

class ApiClient {
  private client: AxiosInstance
  private isRefreshing = false
  private refreshPromise: Promise<boolean> | null = null

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    })

    // Request interceptor to add auth token and refresh if needed
    this.client.interceptors.request.use(
      async (config) => {
        // Refresh token if needed before making the request
        await this.refreshTokenIfNeeded()
        
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

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response) => {
        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        // Don't logout on network errors or service unavailable (503) - user is just offline
        if (!error.response || error.response.status === 503) {
          // Network error or service unavailable - don't logout, just reject the error
          return Promise.reject(error)
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          // Try to refresh the token
          const refreshToken = this.getRefreshToken()
          if (refreshToken) {
            try {
              const response = await axios.post(
                `${API_BASE_URL}/api/v1/auth/refresh`,
                { refresh_token: refreshToken },
                { headers: { 'Content-Type': 'application/json' } }
              )

              if (response.data.access_token) {
                this.setTokens(
                  response.data.access_token,
                  response.data.refresh_token,
                  response.data.expires_at
                )

                // Retry the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`
                return this.client(originalRequest)
              }
            } catch (refreshError: any) {
              // If refresh failed due to network error (no response), don't logout
              if (!refreshError?.response) {
                // Network error during refresh - don't logout, user is offline
                return Promise.reject(refreshError)
              }
              
              // If refresh returned 503 (service unavailable), don't logout
              if (refreshError?.response?.status === 503) {
                return Promise.reject(refreshError)
              }

              // Refresh token was rejected by server (401) => real logout needed
              this.clearToken()
              if (typeof window !== 'undefined') {
                window.location.href = '/login'
              }
              return Promise.reject(refreshError)
            }
          }

          // No refresh token available, clear and redirect
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

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refresh_token')
  }

  private getTokenExpiry(): number | null {
    if (typeof window === 'undefined') return null
    const expiry = localStorage.getItem('token_expires_at')
    return expiry ? parseInt(expiry, 10) : null
  }

  private isTokenExpired(): boolean {
    const expiresAt = this.getTokenExpiry()
    if (!expiresAt) return true
    // Consider token expired if it expires within 60 seconds (1 minute buffer)
    return Date.now() / 1000 >= (expiresAt - 60)
  }

  private async refreshTokenIfNeeded(): Promise<boolean> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      return false
    }

    // Only refresh if token is expired or about to expire
    if (!this.isTokenExpired()) {
      return true
    }

    // If already refreshing, wait for that to complete
    if (this.isRefreshing && this.refreshPromise) {
      return await this.refreshPromise
    }

    // Start refresh process
    this.isRefreshing = true
    this.refreshPromise = (async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        )

        if (response.data.access_token) {
          this.setTokens(
            response.data.access_token,
            response.data.refresh_token,
            response.data.expires_at
          )
          return true
        }
        return false
      } catch (error) {
        console.error('Token refresh failed:', error)
        return false
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
      }
    })()

    return await this.refreshPromise
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expires_at')
    localStorage.removeItem('user_id')
    // Also clear cookie for middleware
    document.cookie = 'access_token=; path=/; max-age=0'
  }

  private setTokens(accessToken: string, refreshToken: string, expiresAt: number): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('token_expires_at', expiresAt.toString())
    // Also set cookie for middleware to access (24 hour expiry)
    document.cookie = `access_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('access_token', token)
    // Also set cookie for middleware to access (24 hour expiry)
    document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password })
    if (response.data.access_token && response.data.refresh_token && response.data.expires_at) {
      this.setTokens(
        response.data.access_token,
        response.data.refresh_token,
        response.data.expires_at
      )
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

  async createProduct(data: { 
    name: string
    sku: string
    barcode?: string
    selling_price: number
    tax_rate?: number
    category_id?: string
    unit?: 'pcs' | 'kg' | 'litre' | 'cup' | 'plate' | 'bowl' | 'serving' | 'piece' | 'bottle' | 'can'
    is_active?: boolean
  }) {
      const response = await this.client.post('/products', data)
      return response.data
  }

  async updateProduct(id: string, data: { 
    name?: string
    sku?: string
    barcode?: string
    selling_price?: number
    tax_rate?: number
    category_id?: string
    unit?: 'pcs' | 'kg' | 'litre' | 'cup' | 'plate' | 'bowl' | 'serving' | 'piece' | 'bottle' | 'can'
    is_active?: boolean
  }) {
    const response = await this.client.put(`/products/${id}`, data)
    return response.data
  }

  async deleteProduct(id: string) {
    await this.client.delete(`/products/${id}`)
  }

  async bulkUpdateProductsByCategory(categoryId: string, taxGroupId: string) {
    const response = await this.client.put('/products/bulk-update-by-category', {
      category_id: categoryId,
      tax_group_id: taxGroupId
    })
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

  // Category endpoints
  async getCategories() {
    const response = await this.client.get('/categories')
    return response.data
  }

  async getCategory(id: string) {
    const response = await this.client.get(`/categories/${id}`)
    return response.data
  }

  async createCategory(data: {
    name: string
    is_active?: boolean
    display_order?: number
  }) {
    const response = await this.client.post('/categories', data)
    return response.data
  }

  async updateCategory(id: string, data: {
    name?: string
    is_active?: boolean
    display_order?: number
  }) {
    const response = await this.client.put(`/categories/${id}`, data)
    return response.data
  }

  async deleteCategory(id: string) {
    await this.client.delete(`/categories/${id}`)
  }

  // Inventory endpoints
  async getStocks() {
    const response = await this.client.get('/inventory/stocks')
    return response.data
  }

  async getStock(productId: string) {
    const response = await this.client.get(`/inventory/stocks/${productId}`)
    return response.data
  }

  async addStock(productId: string, quantity: number) {
    const response = await this.client.post('/inventory/stocks', {
      product_id: productId,
      quantity: quantity
    })
    return response.data
  }

  async deductStock(productId: string, quantity: number) {
    const response = await this.client.post('/inventory/stocks/deduct', {
      product_id: productId,
      quantity: quantity
    })
    return response.data
  }

  // Tax group endpoints
  async getTaxGroups() {
    const response = await this.client.get('/tax-groups')
    return response.data
  }

  async getActiveTaxGroups() {
    const response = await this.client.get('/tax-groups/active')
    return response.data
  }

  async getTaxGroup(id: string) {
    const response = await this.client.get(`/tax-groups/${id}`)
    return response.data
  }

  async createTaxGroup(data: {
    name: string
    total_rate: number
    split_type?: 'GST_50_50' | 'NO_SPLIT'
    is_tax_inclusive?: boolean
    is_active?: boolean
  }) {
    const response = await this.client.post('/tax-groups', data)
    return response.data
  }

  async updateTaxGroup(id: string, data: {
    name?: string
    total_rate?: number
    split_type?: 'GST_50_50' | 'NO_SPLIT'
    is_tax_inclusive?: boolean
    is_active?: boolean
  }) {
    const response = await this.client.put(`/tax-groups/${id}`, data)
    return response.data
  }

  // Reports endpoints
  async getTaxSummary(startDate: string, endDate: string) {
    const response = await this.client.get(`/reports/tax-summary?start_date=${startDate}&end_date=${endDate}`)
    return response.data
  }

  async getSalesByCategory(startDate: string, endDate: string) {
    const response = await this.client.get(`/reports/sales-by-category?start_date=${startDate}&end_date=${endDate}`)
    return response.data
  }
}

export const api = new ApiClient()

