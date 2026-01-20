import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline-solid'
  children: ReactNode
}

export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'
  
  const variantClasses = {
    primary: 'bg-coffee-brown text-white hover:bg-brand-dusty-rose',
    secondary: 'bg-brand-deep-burgundy text-white hover:bg-coffee-brown',
    outline: 'border border-coffee-brown text-primary-text hover:bg-coffee-brown hover:text-white',
    'outline-solid': 'border border-coffee-brown text-primary-text hover:bg-coffee-brown hover:text-white',
  }

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

