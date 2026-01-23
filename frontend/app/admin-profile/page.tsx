'use client'

import { useState, useEffect } from 'react'
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
import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@retailboss.com',
    phone: '+91 98765 43210',
    storeName: 'Garlic Cafe',
    address: '123 Main Street, City, State - 123456',
    role: 'Administrator',
    joinDate: 'January 2024',
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  const handleSave = () => setIsEditing(false)
  const handleCancel = () => setIsEditing(false)

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header skeleton */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 sm:h-10 w-48 sm:w-64" />
          <Skeleton className="h-4 sm:h-5 w-64 sm:w-96" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card skeleton */}
          <div>
            <div className="bg-white shadow-md border border-border rounded-2xl p-5 sm:p-6 text-center space-y-4">
              <div className="relative inline-block mx-auto">
                <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-full" />
                <Skeleton className="absolute bottom-0 right-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full" />
              </div>
              <Skeleton className="h-6 sm:h-7 w-40 sm:w-48 mx-auto" />
              <Skeleton className="h-4 sm:h-5 w-28 sm:w-32 mx-auto" />
              <Skeleton className="h-6 w-36 sm:w-40 mx-auto rounded-xl" />
              <Skeleton className="h-4 w-48 sm:w-56 mx-auto" />
            </div>
          </div>

          {/* Details skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md border border-border rounded-2xl p-5 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <Skeleton className="h-7 sm:h-8 w-48 sm:w-56" />
                <Skeleton className="h-10 w-full sm:w-36 rounded-xl" />
              </div>

              <div className="space-y-5">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 sm:h-5 w-28 sm:w-32 mb-1" />
                    <Skeleton className="h-10 sm:h-11 w-full rounded-xl" />
                  </div>
                ))}

                <div>
                  <Skeleton className="h-4 sm:h-5 w-20 sm:w-24 mb-1" />
                  <Skeleton className="h-20 sm:h-24 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-primary-text mb-1">
          Admin Profile
        </h1>
        <p className="text-sm sm:text-base text-primary-text/60">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="bg-white shadow-md border border-border rounded-2xl p-5 sm:p-6 text-center">
            <div className="relative inline-block mb-4 sm:mb-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary text-text-inverse flex items-center justify-center shadow-lg mx-auto">
                <UserCircle className="w-14 h-14 sm:w-16 sm:h-16" />
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 sm:right-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-coffee-brown text-white flex items-center justify-center border-4 border-white shadow-md">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-primary-text mb-1">
              {profileData.name}
            </h2>
            <p className="text-sm sm:text-base text-secondary-text mb-2">
              {profileData.role}
            </p>

            <span className="inline-block px-3 py-1 text-xs sm:text-sm font-medium bg-white text-primary-text rounded-xl border border-border">
              {profileData.storeName}
            </span>

            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-text">
              Member since {profileData.joinDate}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md border border-border rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-primary-text">
                Personal Information
              </h3>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 border border-coffee-brown text-primary-text rounded-xl hover:bg-coffee-brown hover:text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] text-sm sm:text-base"
                >
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleCancel}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 border border-border text-primary-text rounded-xl hover:bg-warm-cream transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] text-sm sm:text-base"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-coffee-brown text-white rounded-xl hover:bg-brand-dusty-rose transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-5 sm:space-y-6">
              {[
                { label: 'Full Name', value: 'name', icon: UserCircle },
                { label: 'Email', value: 'email', icon: Mail },
                { label: 'Phone', value: 'phone', icon: Phone },
                { label: 'Store Name', value: 'storeName', icon: Store },
              ].map(({ label, value, icon: Icon }) => (
                <div key={value}>
                  <label className="block text-sm font-semibold text-secondary-text mb-1.5">
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
                      className="w-full px-4 py-2.5 sm:py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown bg-white hover:bg-warm-cream/10 transition-all duration-200 text-primary-text placeholder-muted-text text-sm sm:text-base"
                    />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2.5 sm:py-3 bg-warm-cream/20 rounded-xl text-primary-text border border-border text-sm sm:text-base">
                      <Icon className="w-5 h-5 text-muted-text shrink-0" />
                      {profileData[value as keyof typeof profileData]}
                    </div>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-secondary-text mb-1.5">
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({ ...profileData, address: e.target.value })
                    }
                    className="w-full px-4 py-2.5 sm:py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown bg-white hover:bg-warm-cream/10 transition-all duration-200 text-primary-text placeholder-muted-text text-sm sm:text-base resize-y min-h-[80px]"
                  />
                ) : (
                  <div className="flex gap-3 px-4 py-2.5 sm:py-3 bg-warm-cream/20 rounded-xl text-primary-text border border-border text-sm sm:text-base">
                    <MapPin className="w-5 h-5 text-muted-text shrink-0 mt-1" />
                    <span className="flex-1">{profileData.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}