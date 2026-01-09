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
    storeName: 'Cafe POS',
    address: '123 Main Street, City, State - 123456',
    role: 'Administrator',
    joinDate: 'January 2024',
  })

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
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
    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-[32px] font-bold text-primary mb-1">
          Admin Profile
        </h1>
        <p className="text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl p-1 mb-8">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all flex-1 sm:flex-none ${
                  activeTab === tab.id
                    ? 'bg-primary text-secondary'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
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
            <div className="bg-white border rounded-xl p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-28 h-28 rounded-full bg-primary text-secondary flex items-center justify-center">
                  <UserCircle className="w-16 h-16" />
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary text-secondary flex items-center justify-center border-4 border-white">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h2 className="text-xl font-bold">{profileData.name}</h2>
              <p className="text-gray-500">{profileData.role}</p>

              <span className="inline-block mt-3 px-3 py-1 bg-primary text-secondary rounded-full text-sm">
                {profileData.storeName}
              </span>

              <p className="mt-4 text-sm text-gray-500">
                Member since {profileData.joinDate}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <div className="bg-white border rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Personal Information</h3>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 border rounded-md"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-secondary rounded-md"
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
                    <label className="block text-sm font-semibold mb-1">
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
                        className="w-full px-4 py-2 border rounded-md"
                      />
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-md">
                        <Icon className="w-5 h-5 text-gray-400" />
                        {profileData[value as keyof typeof profileData]}
                      </div>
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={profileData.address}
                      onChange={(e) =>
                        setProfileData({ ...profileData, address: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-md"
                    />
                  ) : (
                    <div className="flex gap-3 px-4 py-2 bg-gray-50 rounded-md">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
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
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6">Notification Settings</h3>

          {[
            { key: 'emailNotifications', label: 'Email Notifications', icon: Mail },
            { key: 'smsNotifications', label: 'SMS Notifications', icon: Phone },
            { key: 'salesReports', label: 'Daily Sales Reports', icon: Database },
            { key: 'weeklyReports', label: 'Weekly Reports', icon: Shield },
          ].map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="flex justify-between items-center p-4 border rounded-lg mb-3"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-primary" />
                <span className="font-medium">{label}</span>
              </div>
              <input
                type="checkbox"
                checked={settings[key as keyof typeof settings]}
                onChange={(e) =>
                  setSettings({ ...settings, [key]: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </div>
          ))}
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'security' && (
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6">Security</h3>
          <button className="px-6 py-3 bg-primary text-secondary rounded-md">
            Update Password
          </button>
        </div>
      )}

      {/* BILLING TAB */}
      {activeTab === 'billing' && (
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6">Billing</h3>
          <p className="text-gray-600">Premium Plan – ₹2,999 / month</p>
        </div>
      )}
      </div>
    </div>
  )
}
