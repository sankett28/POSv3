'use client'

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

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Simple Text Logo */}
      <span className={`font-bold ${sizeClasses[size]} tracking-tight text-gray-800`}>
        Garlic
      </span>
    </div>
  )
}

