import { Edit, Trash2 } from 'lucide-react'
import { Product, Category } from '@/app/menu/page' // Assuming Product and Category interfaces are exported or defined here. If not, I'll adjust.

interface MenuTableProps {
  categoryName: string
  products: Product[]
  handleEditItem: (product: Product) => void
  handleDeactivateItem: (id: string) => Promise<void>
  categories: Category[]
}

export default function MenuTable({ categoryName, products, handleEditItem, handleDeactivateItem, categories }: MenuTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-[#E5E7EB]">
      <div className="p-6 border-b border-[#E5E7EB]">
        <h3 className="text-xl font-bold text-[#3E2C24]">{categoryName}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed leading-normal">
          <thead className="bg-[#FAF7F2]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider w-5/12">Item</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider w-1/5">Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider w-[15%]">Tax Rate</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider w-[15%]">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider w-1/10">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[#9CA3AF]">
                  No items in this category.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-t border-[#E5E7EB] transition-all duration-200 ease-in-out hover:bg-[#FAF7F2]">
                  <td className="px-6 py-4 font-medium text-[#1F1F1F] w-5/12">{product.name}</td>
                  <td className="px-6 py-4 text-[#1F1F1F] w-1/5">₹{product.selling_price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-[#6B6B6B] w-[15%]">{product.tax_rate || 0}%</td>
                  <td className="px-6 py-4 w-[15%]">
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      product.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 w-1/10">
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditItem(product); }}
                        className="text-[#3E2C24] hover:text-[#C89B63] transition-all duration-200 ease-in-out hover:scale-[1.05] active:scale-[0.95]"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {product.is_active && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeactivateItem(product.id); }}
                          className="text-[#F4A261] hover:text-[#E08F50] transition-all duration-200 ease-in-out hover:scale-[1.05] active:scale-[0.95]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
