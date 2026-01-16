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
    <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] overflow-hidden">
      <div className="p-6 border-b border-[#E5E7EB] bg-linear-to-r from-white to-[#FFF0F3]/10">
        <h3 className="text-xl font-bold text-[#610027]">{categoryName}</h3>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-full leading-normal">
          <div className="bg-linear-to-r from-[#B45A69]/25 to-[#B45A69]/15 grid grid-cols-[2.5fr_1fr_2fr_1fr_0.8fr] sm:grid-cols-[2.5fr_1fr_2fr_1fr_0.8fr] px-6 py-4 text-sm font-bold text-[#610027] uppercase tracking-wider border-b-2 border-[#B45A69]/30">
            <span className="font-extrabold">Item</span>
            <span className="font-extrabold">Price</span>
            <span className="font-extrabold">Tax Group</span>
            <span className="font-extrabold">Status</span>
            <span className="text-right font-extrabold">Actions</span>
          </div>
          <div>
            {products.length === 0 ? (
              <div className="px-6 py-12 text-center text-[#9CA3AF] bg-[#FFF0F3]/5">
                <p className="text-sm font-medium">No items in this category.</p>
              </div>
            ) : (
              products.map((product, index) => (
                <div 
                  key={product.id} 
                  className={`grid grid-cols-[2.5fr_1fr_2fr_1fr_0.8fr] sm:grid-cols-[2.5fr_1fr_2fr_1fr_0.8fr] px-6 py-4 items-center border-b border-[#E5E7EB]/50 transition-all duration-300 ease-in-out hover:bg-linear-to-r hover:from-[#FFF0F3]/30 hover:to-[#FFF0F3]/10 hover:shadow-xs hover:border-[#B45A69]/20 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FFF0F3]/5'
                  }`}
                >
                  <span className="font-semibold text-[#610027] truncate text-sm">{product.name}</span>
                  <span className="text-[#610027] font-medium">₹{product.selling_price.toFixed(2)}</span>
                  <span className="text-[#6B6B6B] truncate text-sm">
                    {product.tax_group ? (
                      <>{product.tax_group.name} {product.tax_group.is_tax_inclusive ? '(Inclusive)' : '(Exclusive)'}</>
                    ) : (
                      <span className="text-[#9CA3AF] italic">No Tax</span>
                    )}
                  </span>
                  <span>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-xs ${
                      product.is_active
                        ? 'bg-linear-to-r from-green-100 to-green-50 text-green-700 border border-green-200'
                        : 'bg-linear-to-r from-red-100 to-red-50 text-red-700 border border-red-200'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                  <div className="flex justify-end gap-3 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditItem(product); }}
                      className="p-2 rounded-lg text-[#610027] hover:text-[#912B48] hover:bg-[#FFF0F3]/30 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 shadow-xs hover:shadow-md"
                      title="Edit item"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {product.is_active && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeactivateItem(product.id); }}
                        className="p-2 rounded-lg text-[#912B48] hover:text-[#610027] hover:bg-red-50 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 shadow-xs hover:shadow-md"
                        title="Delete item"
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
