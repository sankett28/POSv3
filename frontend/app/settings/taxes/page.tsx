'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import {
  Plus,
  Edit,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react'

interface TaxGroup {
  id: string
  name: string
  total_rate: number
  split_type: 'GST_50_50' | 'NO_SPLIT'
  is_tax_inclusive: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function TaxSettingsPage() {
  const [taxGroups, setTaxGroups] = useState<TaxGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<TaxGroup | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    total_rate: 0,
    split_type: 'GST_50_50' as 'GST_50_50' | 'NO_SPLIT',
    is_tax_inclusive: false,
    is_active: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadTaxGroups()
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showForm])

  const loadTaxGroups = async () => {
    try {
      setLoading(true)
      const data = await api.getTaxGroups()
      setTaxGroups(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load tax groups')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingGroup(null)
    setFormData({
      name: '',
      total_rate: 0,
      split_type: 'GST_50_50',
      is_tax_inclusive: false,
      is_active: true,
    })
    setShowForm(true)
    setError(null)
    setSuccess(null)
  }

  const handleEdit = (group: TaxGroup) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      total_rate: group.total_rate,
      split_type: group.split_type,
      is_tax_inclusive: group.is_tax_inclusive,
      is_active: group.is_active,
    })
    setShowForm(true)
    setError(null)
    setSuccess(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tax group?')) return
    setError(null)
    setSuccess(null)
    try {
      await api.deleteTaxGroup(id)
      setSuccess('Tax group deleted successfully')
      loadTaxGroups()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete tax group')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      if (editingGroup) {
        await api.updateTaxGroup(editingGroup.id, formData)
        setSuccess('Tax group updated successfully')
      } else {
        await api.createTaxGroup(formData)
        setSuccess('Tax group created successfully')
      }
      setShowForm(false)
      loadTaxGroups()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save tax group')
    }
  }

  const formatGSTPreview = (group: TaxGroup) => {
    if (group.split_type === 'GST_50_50') {
      const halfRate = group.total_rate / 2
      return `${group.total_rate}% GST (${halfRate}% CGST + ${halfRate}% SGST)`
    }
    return `${group.total_rate}% (No split)`
  }

  return (
    <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-[32px] font-bold text-[#4C1D3D] mb-1">
            Tax Settings
          </h1>
          <p className="text-[#4C1D3D]/60">
            Manage tax groups for GST-compliant billing
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-[#FFF0F3] border border-[#B45A69] rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#912B48] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#610027] mb-1">
              Important: Tax Group Changes
            </p>
            <p className="text-sm text-[#610027]">
              Changing tax groups does <strong>not</strong> affect past bills. Historical bills
              preserve their tax snapshots for audit compliance. Only new bills will use updated
              tax group configurations. Please consult your accountant before modifying taxes.
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Create Button */}
        <div className="mb-6">
          <button
            onClick={handleCreate}
            className="bg-[#610027] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#912B48]
                     transition-all duration-200 ease-in-out
                     hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
                     flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Tax Group
          </button>
        </div>

        {/* Tax Groups List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="w-12 h-12 border-4 border-[#912B48] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-[#6B6B6B]">Loading tax groups...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#E5E7EB]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#B45A69]/25 to-[#B45A69]/15 border-b-2 border-[#B45A69]/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-extrabold text-[#610027] uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-extrabold text-[#610027] uppercase tracking-wider">
                      Rate & Split
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-extrabold text-[#610027] uppercase tracking-wider">
                      Pricing Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-extrabold text-[#610027] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold text-[#610027] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]/50">
                  {taxGroups.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[#6B6B6B] bg-[#FFF0F3]/5">
                        <p className="text-sm font-medium">No tax groups found. Create one to get started.</p>
                      </td>
                    </tr>
                  ) : (
                    taxGroups.map((group, index) => (
                      <tr 
                        key={group.id} 
                        className={`transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-[#FFF0F3]/30 hover:to-[#FFF0F3]/10 hover:shadow-sm ${
                          index % 2 === 0 ? 'bg-white' : 'bg-[#FFF0F3]/5'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#610027] text-sm">{group.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[#6B6B6B] font-medium">
                            {formatGSTPreview(group)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                            group.is_tax_inclusive
                              ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200'
                          }`}>
                            {group.is_tax_inclusive ? 'Inclusive' : 'Exclusive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                            group.is_active
                              ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200'
                              : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200'
                          }`}>
                            {group.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(group)}
                              className="p-2 rounded-lg text-[#610027] hover:text-[#912B48] hover:bg-[#FFF0F3]/30 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                              title="Edit tax group"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(group.id)}
                              className="p-2 rounded-lg text-[#912B48] hover:text-[#610027] hover:bg-red-50 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                              title="Delete tax group"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowForm(false)
              setEditingGroup(null)
              setFormData({
                name: '',
                total_rate: 0,
                split_type: 'GST_50_50',
                is_tax_inclusive: false,
                is_active: true,
              })
            }}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#610027]">
                  {editingGroup ? 'Edit Tax Group' : 'Create Tax Group'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-[#6B6B6B] hover:text-[#610027] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#610027] mb-2">
                    Tax Group Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 text-[#610027] placeholder-[#9CA3AF]"
                    placeholder="e.g., GST 18%"
                  />
                </div>

                {/* Total Rate */}
                <div>
                  <label className="block text-sm font-semibold text-[#610027] mb-2">
                    Total Tax Rate (%) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.total_rate}
                    onChange={(e) => setFormData({ ...formData, total_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 text-[#610027] placeholder-[#9CA3AF]"
                    placeholder="0.00"
                  />
                </div>

                {/* Split Type */}
                <div>
                  <label className="block text-sm font-semibold text-[#610027] mb-2">
                    Split Type *
                  </label>
                  <select
                    value={formData.split_type}
                    onChange={(e) => setFormData({ ...formData, split_type: e.target.value as 'GST_50_50' | 'NO_SPLIT' })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 text-[#610027] placeholder-[#9CA3AF]"
                  >
                    <option value="GST_50_50">GST 50/50 (CGST + SGST)</option>
                    <option value="NO_SPLIT">No Split</option>
                  </select>
                  <p className="mt-2 text-xs text-[#6B6B6B] flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      GST 50/50 splits tax into Central GST (CGST) and State GST (SGST) equally.
                      No Split keeps all tax in a single component.
                    </span>
                  </p>
                </div>

                {/* Tax Inclusive */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_tax_inclusive}
                      onChange={(e) => setFormData({ ...formData, is_tax_inclusive: e.target.checked })}
                      className="w-5 h-5 rounded border-[#912B48] text-[#610027] focus:ring-[#912B48] accent-[#912B48]"
                    />
                    <span className="text-sm font-semibold text-[#6B6B6B]">
                      Tax Inclusive Pricing
                    </span>
                  </label>
                  <p className="mt-2 text-xs text-[#6B6B6B] ml-8">
                    When enabled, the product price includes tax. Tax will be extracted from the price.
                    When disabled, tax will be added to the product price.
                  </p>
                </div>

                {/* Active Status */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 rounded border-[#912B48] text-[#610027] focus:ring-[#912B48] accent-[#912B48]"
                    />
                    <span className="text-sm font-semibold text-[#6B6B6B]">
                      Active
                    </span>
                  </label>
                  <p className="mt-2 text-xs text-[#6B6B6B] ml-8">
                    Only active tax groups can be assigned to products.
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-[#912B48] text-[#610027] font-semibold
                             hover:bg-[#FFF0F3]/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl bg-[#912B48] text-white font-semibold
                             hover:bg-[#B45A69] transition-colors"
                  >
                    {editingGroup ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  )
}

