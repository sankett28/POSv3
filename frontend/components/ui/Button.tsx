import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  children: ReactNode
}

export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'
  
  const variantClasses = {
    primary: 'bg-[#3E2C24] text-white hover:bg-[#2c1f19]',
    secondary: 'bg-[#C89B63] text-white hover:bg-[#b08754]',
    outline: 'border border-[#3E2C24] text-[#3E2C24] hover:bg-[#3E2C24] hover:text-white',
  }

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

