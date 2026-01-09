'use client'

import { Megaphone, Mail, Percent, Gift } from 'lucide-react'

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EE] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="bg-[#FAF7F2] rounded-2xl shadow-md p-6 mb-8 border border-[#E5E7EB]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#3E2C24] rounded-xl flex items-center justify-center shadow-md">
                <Megaphone className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#3E2C24]">
                  Marketing Campaigns
                </h1>
                <p className="text-[#6B6B6B]">
                  Boost your sales and engage with customers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Email Campaigns */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <Mail className="w-16 h-16 text-[#C89B63] mb-4" />
            <h2 className="text-2xl font-bold text-[#3E2C24] mb-2">
              Email Campaigns
            </h2>
            <p className="text-[#6B6B6B] mb-4">
              Send newsletters, promotions, and updates to your customers.
            </p>
            <button className="bg-[#3E2C24] text-white px-6 py-3 rounded-xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all">
              Manage Email Campaigns
            </button>
          </div>

          {/* Discounts */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <Percent className="w-16 h-16 text-[#C89B63] mb-4" />
            <h2 className="text-2xl font-bold text-[#3E2C24] mb-2">
              Discounts & Offers
            </h2>
            <p className="text-[#6B6B6B] mb-4">
              Create seasonal offers and loyalty discounts.
            </p>
            <button className="bg-[#3E2C24] text-white px-6 py-3 rounded-xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all">
              Manage Discounts
            </button>
          </div>

          {/* Gift Cards */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <Gift className="w-16 h-16 text-[#C89B63] mb-4" />
            <h2 className="text-2xl font-bold text-[#3E2C24] mb-2">
              Gift Cards
            </h2>
            <p className="text-[#6B6B6B] mb-4">
              Sell digital and physical gift cards for BrewBite.
            </p>
            <button className="bg-[#3E2C24] text-white px-6 py-3 rounded-xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all">
              Manage Gift Cards
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
