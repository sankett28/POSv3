'use client'

import { Users, UserPlus, Star, Heart, Coffee } from 'lucide-react'

export default function CustomersPage() {
  return (
    <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-border">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-accent-pink rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary-text">Customer Management</h1>
                <p className="text-primary-text/60">Build relationships with your cafe guests</p>
              </div>
            </div>
            <button className="bg-accent-pink text-white px-6 py-4 rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out flex items-center justify-center gap-3 text-base opacity-60 cursor-not-allowed">
              <UserPlus className="w-5 h-5" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Coming Soon Card */}
          <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-border">
            <div className="w-20 h-20 bg-linear-to-br from-accent-gold to-accent-orange rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-primary-text mb-4">Customer Loyalty Program</h2>
            <p className="text-primary-text/60 text-lg mb-6 leading-relaxed">
              Track your favorite customers, manage loyalty points, and create personalized experiences
              that keep guests coming back to your cafe.
            </p>
            <div className="bg-warm-cream rounded-xl p-4 border border-border">
              <p className="text-primary-text font-medium">Coming Soon</p>
              <p className="text-primary-text/60 text-sm mt-1">Advanced customer management features</p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-leaf-green/20 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-leaf-green" />
                </div>
                <h3 className="text-lg font-bold text-text-dark">Loyalty Points System</h3>
              </div>
              <p className="text-secondary-text">Reward repeat customers with points for every purchase and special offers.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent-orange/20 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-accent-orange" />
                </div>
                <h3 className="text-lg font-bold text-text-dark">Customer Profiles</h3>
              </div>
              <p className="text-secondary-text">Store customer preferences, order history, and contact information.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent-gold/20 rounded-lg flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-accent-gold" />
                </div>
                <h3 className="text-lg font-bold text-text-dark">Personalized Recommendations</h3>
              </div>
              <p className="text-secondary-text">Suggest menu items based on customer preferences and past orders.</p>
            </div>
          </div>
        </div>

        {/* Future Features Teaser */}
        <div className="mt-8 bg-linear-to-r from-dark-brown to-accent-gold rounded-2xl p-8 text-white text-center shadow-lg">
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
