import { Edit, Trash2 } from 'lucide-react'
import { Product } from '@/app/menu/page'

interface MenuTableProps {
  categoryName: string
  products: Product[]
  handleEditItem: (product: Product) => void
  handleDeactivateItem: (id: string) => Promise<void>
}

export default function MenuTable({ categoryName, products, handleEditItem, handleDeactivateItem }: MenuTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-[#E5E7EB]">
      <div className="p-6 border-b border-[#E5E7EB]">
        <h3 className="text-xl font-bold text-[#610027]">{categoryName}</h3>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-full leading-normal">
          <div className="bg-[#B45A69]/20 grid grid-cols-[2.5fr_1fr_2fr_1fr_0.8fr] sm:grid-cols-[2.5fr_1fr_2fr_1fr_0.8fr] px-4 py-3 text-sm font-semibold text-[#610027] uppercase tracking-wider rounded-t-2xl">
            <span>Item</span>
            <span>Price</span>
            <span>Tax Group</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div>
            {products.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#9CA3AF]">
                No items in this category.
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="grid grid-cols-[2.5fr_1fr_2fr_1fr_0.8fr] sm:grid-cols-[2.5fr_1fr_2fr_1fr_0.8fr] px-4 py-3 items-center border-t border-[#E5E7EB] transition-all duration-200 ease-in-out hover:bg-[#FFF0F3]/20">
                  <span className="font-medium text-[#610027] truncate">{product.name}</span>
                  <span className="text-[#610027]">₹{product.selling_price.toFixed(2)}</span>
                  <span className="text-[#6B6B6B] truncate">
                    {product.tax_group ? (
                      <>{product.tax_group.name} {product.tax_group.is_tax_inclusive ? '(Inclusive)' : '(Exclusive)'}</>
                    ) : (
                      'No Tax'
                    )}
                  </span>
                  <span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      product.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                  <div className="flex justify-end gap-3 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditItem(product); }}
                      className="text-[#610027] hover:text-[#912B48] transition-all duration-200 ease-in-out hover:scale-[1.05] active:scale-[0.95]"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {product.is_active && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeactivateItem(product.id); }}
                        className="text-[#912B48] hover:text-[#610027] transition-all duration-200 ease-in-out hover:scale-[1.05] active:scale-[0.95]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
