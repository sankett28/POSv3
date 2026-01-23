'use client'

export interface TaxGroup {
  id: string
  name: string
  total_rate: number
  split_type: 'GST_50_50' | 'NO_SPLIT'
  is_tax_inclusive: boolean
}

export interface Product {
  id: string
  name: string
  selling_price: number
  tax_group_id?: string
  tax_group?: TaxGroup
  category_id?: string
  category_name?: string
  is_active: boolean
}

export default function MenuPage() {
  return (
    <div className="mx-auto">
      <h1 className="text-3xl font-bold text-primary-text mb-1">Menu</h1>
      <p className="text-sm text-primary-text/60 mb-6">Manage your menu items and categories.</p>
      
      <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
        <p className="text-muted-text">Menu management coming soon...</p>
      </div>
    </div>
  )
}
