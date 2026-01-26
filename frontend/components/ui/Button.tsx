import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline-solid'
  children: ReactNode
}

export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'
  
  const variantClasses = {
    primary: 'bg-[#1a1a1a] text-white hover:bg-[#000000]',
    secondary: 'bg-[#1a1a1a] text-white hover:bg-[#000000]',
    outline: 'border border-[#1a1a1a] text-primary-text hover:bg-[#1a1a1a] hover:text-white',
    'outline-solid': 'border border-[#1a1a1a] text-primary-text hover:bg-[#1a1a1a] hover:text-white',
  }

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
