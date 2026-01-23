'use client'

import { useState } from 'react'
import { Settings as SettingsIcon, Palette, Receipt } from 'lucide-react'
import TaxSettingsPage from './taxes/page'
import ThemeSettingsPage from './theme/page'

type TabType = 'tax' | 'theme'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('tax')

  const tabs = [
    {
      id: 'tax' as TabType,
      label: 'Tax Settings',
      icon: Receipt,
      description: 'Manage tax groups and GST configuration'
    },
    {
      id: 'theme' as TabType,
      label: 'Theme Editor',
      icon: Palette,
      description: 'Customize your brand colors and appearance'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="text-2xl sm:text-[32px] font-bold text-primary-text">
            Settings
          </h1>
        </div>
        <p className="text-primary-text/60">
          Manage your business settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-border">
          <nav className="flex gap-2 -mb-px" aria-label="Settings tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group relative flex items-center gap-2 px-6 py-4 font-semibold text-sm
                    border-b-2 transition-all duration-200
                    ${isActive 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-secondary-text hover:text-primary-text hover:border-border'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-text group-hover:text-primary-text'}`} />
                  <span>{tab.label}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
        
        {/* Tab description */}
        <div className="mt-4 px-2">
          <p className="text-sm text-secondary-text">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'tax' && <TaxSettingsPage />}
        {activeTab === 'theme' && <ThemeSettingsPage />}
      </div>
    </div>
  )
}
