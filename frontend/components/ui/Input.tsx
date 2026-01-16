import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[#610027] mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 text-sm sm:text-base border border-[#E5E7EB] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#912B48] ${
          error ? 'border-red-500' : ''
        } ${className}`}        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

