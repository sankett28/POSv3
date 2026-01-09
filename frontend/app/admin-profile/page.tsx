'use client'

import { useState } from 'react'
import {
  UserCircle,
  Settings,
  Lock,
  Bell,
  Shield,
  Database,
  CreditCard,
  Store,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Camera,
} from 'lucide-react'

export default function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@retailboss.com',
    phone: '+91 98765 43210',
    storeName: 'Retail Boss Store',
    address: '123 Main Street, City, State - 123456',
    role: 'Administrator',
    joinDate: 'January 2024',
  })

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    salesReports: true,
    weeklyReports: true,
    twoFactorAuth: false,
  })

  const handleSave = () => setIsEditing(false)
  const handleCancel = () => setIsEditing(false)

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ] as const

  return (
    <div className="min-h-screen bg-[#F5F3EE] p-4 pb-16 sm:p-8">
      <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-[32px] font-bold text-[#3E2C24] mb-1">
          Admin Profile
        </h1>
        <p className="text-[#6B6B6B]">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl p-1 mb-8 shadow-md">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex-1 sm:flex-none ${
                  activeTab === tab.id
                    ? 'bg-[#3E2C24] text-white shadow-md'
                    : 'text-[#3E2C24] hover:bg-[#C89B63]/10'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-[#3E2C24]'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div>
            <div className="bg-white shadow-md border border-[#E5E7EB] rounded-2xl p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#3E2C24] to-[#C89B63] text-white flex items-center justify-center shadow-lg">
                  <UserCircle className="w-16 h-16" />
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#C89B63] text-white flex items-center justify-center border-4 border-white shadow-md">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h2 className="text-xl font-bold text-[#1F1F1F]">{profileData.name}</h2>
              <p className="text-[#6B6B6B]">{profileData.role}</p>

              <span className="inline-block mt-3 px-3 py-1 bg-[#FAF7F2] text-[#3E2C24] rounded-xl text-sm font-medium border border-[#E5E7EB]">
                {profileData.storeName}
              </span>

              <p className="mt-4 text-sm text-[#9CA3AF]">
                Member since {profileData.joinDate}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md border border-[#E5E7EB] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-[#1F1F1F]">Personal Information</h3>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-[#3E2C24] text-[#3E2C24] rounded-xl hover:bg-[#3E2C24] hover:text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-[#3E2C24] rounded-xl hover:bg-[#F5F3EE] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-[#3E2C24] text-white rounded-xl hover:bg-[#2c1f19] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                {[
                  { label: 'Full Name', value: 'name', icon: UserCircle },
                  { label: 'Email', value: 'email', icon: Mail },
                  { label: 'Phone', value: 'phone', icon: Phone },
                  { label: 'Store Name', value: 'storeName', icon: Store },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={value}>
                    <label className="block text-sm font-semibold text-[#6B6B6B] mb-1">
                      {label}
                    </label>
                    {isEditing ? (
                      <input
                        value={profileData[value as keyof typeof profileData]}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            [value]: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-[#1F1F1F] placeholder-[#9CA3AF]"
                      />
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#F5F3EE] rounded-xl text-[#1F1F1F] border border-[#E5E7EB]">
                        <Icon className="w-5 h-5 text-[#9CA3AF]" />
                        {profileData[value as keyof typeof profileData]}
                      </div>
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-semibold text-[#6B6B6B] mb-1">
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={profileData.address}
                      onChange={(e) =>
                        setProfileData({ ...profileData, address: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89B63] focus:border-[#C89B63] bg-[#FAF7F2] hover:bg-white transition-all duration-200 text-[#1F1F1F] placeholder-[#9CA3AF]"
                    />
                  ) : (
                    <div className="flex gap-3 px-4 py-2.5 bg-[#F5F3EE] rounded-xl text-[#1F1F1F] border border-[#E5E7EB]">
                      <MapPin className="w-5 h-5 text-[#9CA3AF] mt-1" />
                      {profileData.address}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-white shadow-md border border-[#E5E7EB] rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-[#1F1F1F] mb-6">Notification Settings</h3>

          {[
            { key: 'emailNotifications', label: 'Email Notifications', icon: Mail },
            { key: 'smsNotifications', label: 'SMS Notifications', icon: Phone },
            { key: 'lowStockAlerts', label: 'Low Stock Alerts', icon: Bell },
            { key: 'salesReports', label: 'Daily Sales Reports', icon: Database },
            { key: 'weeklyReports', label: 'Weekly Reports', icon: Shield },
          ].map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="flex justify-between items-center p-4 border border-[#E5E7EB] rounded-xl mb-3 bg-[#FAF7F2] shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-[#3E2C24]" />
                <span className="font-medium text-[#1F1F1F]">{label}</span>
              </div>
              <input
                type="checkbox"
                checked={settings[key as keyof typeof settings]}
                onChange={(e) =>
                  setSettings({ ...settings, [key]: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-[#E5E7EB] rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#C89B63] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#9CA3AF] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4CAF50]"></div>
            </div>
          ))}
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'security' && (
        <div className="bg-white shadow-md border border-[#E5E7EB] rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-[#1F1F1F] mb-6">Security</h3>
          <button className="px-6 py-3 bg-[#3E2C24] text-white rounded-xl hover:bg-[#2c1f19] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">
            Update Password
          </button>
        </div>
      )}

      {/* BILLING TAB */}
      {activeTab === 'billing' && (
        <div className="bg-white shadow-md border border-[#E5E7EB] rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-[#1F1F1F] mb-6">Billing</h3>
          <p className="text-[#1F1F1F]">Premium Plan – ₹2,999 / month</p>
        </div>
      )}
      </div>
    </div>
  )
}
