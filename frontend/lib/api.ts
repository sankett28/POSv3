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
      timeout: 10000, // 10 second timeout
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        // #region agent log
        fetch('http://127.0.0.1:7248/ingest/85c36ff9-e5e0-49bc-833b-6a6f1bcd9015',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:18',message:'Request interceptor called',data:{url:config.url,method:config.method,baseURL:config.baseURL},"timestamp":Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        // #region agent log
        fetch('http://127.0.0.1:7248/ingest/85c36ff9-e5e0-49bc-833b-6a6f1bcd9015',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:26',message:'Request interceptor error',data:{error:error?.message},"timestamp":Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        // #region agent log
        fetch('http://127.0.0.1:7248/ingest/85c36ff9-e5e0-49bc-833b-6a6f1bcd9015',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:32',message:'Response interceptor success',data:{status:response.status,url:response.config.url},"timestamp":Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return response
      },
      (error: AxiosError) => {
        // #region agent log
        fetch('http://127.0.0.1:7248/ingest/85c36ff9-e5e0-49bc-833b-6a6f1bcd9015',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:37',message:'Response interceptor error',data:{errorType:error?.code,errorMessage:error?.message,status:error?.response?.status,responseData:error?.response?.data},"timestamp":Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/85c36ff9-e5e0-49bc-833b-6a6f1bcd9015',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:100',message:'API createProduct called',data:{productData:data,baseURL:this.client.defaults.baseURL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      // #region agent log
      fetch('http://127.0.0.1:7248/ingest/85c36ff9-e5e0-49bc-833b-6a6f1bcd9015',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:103',message:'Before POST request',data:{url:'/products',data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const response = await this.client.post('/products', data)
      // #region agent log
      fetch('http://127.0.0.1:7248/ingest/85c36ff9-e5e0-49bc-833b-6a6f1bcd9015',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:106',message:'POST request successful',data:{status:response.status,statusText:response.statusText,responseData:response.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return response.data
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7248/ingest/85c36ff9-e5e0-49bc-833b-6a6f1bcd9015',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:110',message:'POST request failed',data:{error:error?.message,status:error?.response?.status,responseData:error?.response?.data,stack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      throw error
    }
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

