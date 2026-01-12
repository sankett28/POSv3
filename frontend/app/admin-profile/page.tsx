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
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@retailboss.com',
    phone: '+91 98765 43210',
    storeName: 'Cafe POS',
    address: '123 Main Street, City, State - 123456',
    role: 'Administrator',
    joinDate: 'January 2024',
  })

  const handleSave = () => setIsEditing(false)
  const handleCancel = () => setIsEditing(false)

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
      </div>
    </div>
  )
}
