'use client'

import { Users, UserPlus, Star, Heart, Coffee } from 'lucide-react'

export default function CustomersPage() {
  return (
    <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-[#E5E7EB]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#DC586D] rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#4C1D3D]">Customer Management</h1>
                <p className="text-[#4C1D3D]/60">Build relationships with your cafe guests</p>
              </div>
            </div>
            <button className="bg-[#DC586D] text-white px-6 py-4 rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out flex items-center justify-center gap-3 text-base opacity-60 cursor-not-allowed">
              <UserPlus className="w-5 h-5" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Coming Soon Card */}
          <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-[#E5E7EB]">
            <div className="w-20 h-20 bg-linear-to-br from-[#C89B63] to-[#F4A261] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#4C1D3D] mb-4">Customer Loyalty Program</h2>
            <p className="text-[#4C1D3D]/60 text-lg mb-6 leading-relaxed">
              Track your favorite customers, manage loyalty points, and create personalized experiences
              that keep guests coming back to your cafe.
            </p>
            <div className="bg-[#F9F9F9] rounded-xl p-4 border border-[#E5E7EB]">
              <p className="text-[#4C1D3D] font-medium">Coming Soon</p>
              <p className="text-[#4C1D3D]/60 text-sm mt-1">Advanced customer management features</p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#4CAF50]/20 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-[#4CAF50]" />
                </div>
                <h3 className="text-lg font-bold text-[#1F1F1F]">Loyalty Points System</h3>
              </div>
              <p className="text-[#6B6B6B]">Reward repeat customers with points for every purchase and special offers.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#F4A261]/20 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-[#F4A261]" />
                </div>
                <h3 className="text-lg font-bold text-[#1F1F1F]">Customer Profiles</h3>
              </div>
              <p className="text-[#6B6B6B]">Store customer preferences, order history, and contact information.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#C89B63]/20 rounded-lg flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-[#C89B63]" />
                </div>
                <h3 className="text-lg font-bold text-[#1F1F1F]">Personalized Recommendations</h3>
              </div>
              <p className="text-[#6B6B6B]">Suggest menu items based on customer preferences and past orders.</p>
            </div>
          </div>
        </div>

        {/* Future Features Teaser */}
        <div className="mt-8 bg-linear-to-r from-[#3E2C24] to-[#C89B63] rounded-2xl p-8 text-white text-center shadow-lg">
          <h3 className="text-2xl font-bold mb-4">Exciting Features Coming Soon</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-xs">
              <div className="text-lg font-semibold mb-2">📱 Mobile App Integration</div>
              <div className="text-sm opacity-90">Let customers order ahead and earn rewards</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-xs">
              <div className="text-lg font-semibold mb-2">📊 Advanced Analytics</div>
              <div className="text-sm opacity-90">Understand customer behavior and preferences</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-xs">
              <div className="text-lg font-semibold mb-2">🎯 Targeted Marketing</div>
              <div className="text-sm opacity-90">Send personalized offers and promotions</div>
            </div>
          </div>
        </div>
    </div>
  )
}
