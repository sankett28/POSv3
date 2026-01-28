import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className='w-full mt-auto'>
      {/* Footer Text Section */}
      <div className="bg-gray-100 py-4 sm:py-6 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-black text-xs sm:text-sm">
            {/* Left - Terms of Use and Privacy Policy */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6 order-2 md:order-1">
              <Link 
                href="/terms-of-use" 
                className="hover:text-gray-600 transition-colors duration-300 whitespace-nowrap"
              >
                Terms Of Use
              </Link>
              <Link 
                href="/privacy-policy" 
                className="hover:text-gray-600 transition-colors duration-300 whitespace-nowrap"
              >
                Privacy Policy
              </Link>
            </div>

            {/* Center - Copyright */}
            <div className="text-center order-1 md:order-2">
              © 2026 Garlic POS. All rights reserved.
            </div>

            {/* Right - Product by Neural Arc Inc */}
            <div className="text-center md:text-right order-3">
              Product by{' '}
              <Link 
                href="https://neuralarc.ai" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-gray-600 transition-colors duration-300 whitespace-nowrap"
              >
                Neural Arc Inc
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
