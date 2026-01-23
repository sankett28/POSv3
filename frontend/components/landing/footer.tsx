'use client'

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const navigation = {
  main: [
    { name: 'About', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Pricing', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'Terms', href: '#' },
    { name: 'Privacy', href: '#' },
  ],
  social: [
    {
      name: 'Facebook',
      href: '#',
      icon: Facebook,
    },
    {
      name: 'Instagram',
      href: '#',
      icon: Instagram,
    },
    {
      name: 'Twitter',
      href: '#',
      icon: Twitter,
    },
    {
      name: 'LinkedIn',
      href: '#',
      icon: Linkedin,
    },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <nav 
          className="-mx-4 -my-2 flex flex-wrap justify-center gap-x-6 gap-y-3 sm:gap-x-8 sm:gap-y-4" 
          aria-label="Footer"
        >
          {navigation.main.map((item) => (
            <div key={item.name} className="px-2 sm:px-4">
              <Link 
                href={item.href} 
                className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            </div>
          ))}
        </nav>

        <div className="mt-8 sm:mt-10 flex justify-center gap-6 sm:gap-8">
          {navigation.social.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className="text-gray-400 hover:text-white transition-colors"
              aria-label={item.name}
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </Link>
          ))}
        </div>

        <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Garlic POS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}