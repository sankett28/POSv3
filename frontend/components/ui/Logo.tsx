'use client'

import { Leaf } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showAccent?: boolean
  className?: string
}

export default function Logo({ size = 'md', showAccent = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  }

  const accentSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  }

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
    xl: 'w-3 h-3',
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className={`font-bold ${sizeClasses[size]} tracking-tight`} style={{ color: '#610027' }}>
        L
        <span className="relative inline-block">
          i
          <span 
            className={`absolute ${dotSizeClasses[size]} rounded-full`}
            style={{ 
              backgroundColor: '#FFBB94',
              top: '-0.2em',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </span>
        chi
      </span>
      {showAccent && (
        <Leaf 
          className={`${accentSizeClasses[size]} flex-shrink-0`} 
          style={{ color: '#FB9590' }}
        />
      )}
    </div>
  )
}

