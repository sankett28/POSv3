'use client'

import { Megaphone, Mail, Percent, Gift } from 'lucide-react'

export default function MarketingPage() {
  return (
    <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-[#E5E7EB]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#DC586D] rounded-xl flex items-center justify-center shadow-md">
                <Megaphone className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#4C1D3D]">Marketing Campaigns</h1>
                <p className="text-[#4C1D3D]/60">Boost your sales and engage with customers</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Email Campaigns Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-[#E5E7EB]">
            <Mail className="w-16 h-16 text-[#DC586D] mb-4" />
            <h2 className="text-2xl font-bold text-[#4C1D3D] mb-2">Email Campaigns</h2>
            <p className="text-[#4C1D3D]/60 mb-4">
              Send newsletters, promotions, and updates to your customers.
            </p>
            <button className="bg-[#DC586D] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#A33757] transition-all duration-200">
              Manage Email Campaigns
            </button>
          </div>

          {/* Discounts & Offers Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-[#E5E7EB]">
            <Percent className="w-16 h-16 text-[#DC586D] mb-4" />
            <h2 className="text-2xl font-bold text-[#4C1D3D] mb-2">Discounts & Offers</h2>
            <p className="text-[#4C1D3D]/60 mb-4">
              Create and manage special discounts and loyalty programs.
            </p>
            <button className="bg-[#DC586D] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#A33757] transition-all duration-200">
              Manage Discounts
            </button>
          </div>

          {/* Gift Cards Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-[#E5E7EB]">
            <Gift className="w-16 h-16 text-[#DC586D] mb-4" />
            <h2 className="text-2xl font-bold text-[#4C1D3D] mb-2">Gift Cards</h2>
            <p className="text-[#4C1D3D]/60 mb-4">
              Offer digital or physical gift cards to your customers.
            </p>
            <button className="bg-[#DC586D] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#A33757] transition-all duration-200">
              Manage Gift Cards
            </button>
          </div>
        </div>
    </div>
  )
}

