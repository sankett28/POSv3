'use client'

import { useState } from 'react'
import { Settings, User, Key, Bell, CreditCard, Banknote, HelpCircle, LogOut } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { logout } from '@/lib/auth'

export default function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState('profile')

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile & Settings</h1>
        </div>

        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-6 space-y-2">
            <NavItem icon={User} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            <NavItem icon={Settings} label="General Settings" isActive={activeTab === 'general'} onClick={() => setActiveTab('general')} />
            <NavItem icon={Key} label="Security" isActive={activeTab === 'security'} onClick={() => setActiveTab('security')} />
            <NavItem icon={Bell} label="Notifications" isActive={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
            <NavItem icon={CreditCard} label="Payment Methods" isActive={activeTab === 'payment'} onClick={() => setActiveTab('payment')} />
            <NavItem icon={Banknote} label="Billing & Plans" isActive={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
            <NavItem icon={HelpCircle} label="Support" isActive={activeTab === 'support'} onClick={() => setActiveTab('support')} />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Profile Information</h2>
                <p className="text-gray-600">View and edit your personal profile details.</p>
                {/* Add profile specific settings here */}
              </div>
            )}
            {activeTab === 'general' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">General Settings</h2>
                <p className="text-gray-600">Manage application-wide settings.</p>
                {/* Add general settings here */}
              </div>
            )}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Security Settings</h2>
                <p className="text-gray-600">Update your password and manage security preferences.</p>
                {/* Add security settings here */}
              </div>
            )}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notification Settings</h2>
                <p className="text-gray-600">Configure how you receive notifications.</p>
                {/* Add notification settings here */}
              </div>
            )}
            {activeTab === 'payment' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Payment Methods</h2>
                <p className="text-gray-600">Manage your stored payment methods.</p>
                {/* Add payment methods settings here */}
              </div>
            )}
            {activeTab === 'billing' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Billing & Plans</h2>
                <p className="text-gray-600">View your subscription details and billing history.</p>
                {/* Add billing and plans settings here */}
              </div>
            )}
            {activeTab === 'support' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Support</h2>
                <p className="text-gray-600">Get help and contact support.</p>
                {/* Add support settings here */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface NavItemProps {
  icon: React.ElementType
  label: string
  isActive: boolean
  onClick: () => void
}

function NavItem({ icon: Icon, label, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${isActive ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-black'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  )
}
