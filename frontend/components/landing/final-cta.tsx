'use client'

import Button from '../ui/Button';
import Link from 'next/link';

export function FinalCta() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-coffee-brown text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-5 md:mb-6">
          Ready to Transform Your Business?
        </h2>
        <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-7 md:mb-8 max-w-2xl sm:max-w-3xl mx-auto text-coffee-100 leading-relaxed">
          Join thousands of businesses that trust Garlic POS to power their operations. Get started today with our 14-day free trial.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button className="bg-white text-coffee-brown hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto">
              Start Free Trial
            </Button>
          </Link>
          <Link href="#features" className="w-full sm:w-auto">
            <Button 
              variant="outline-solid" 
              className="border-white text-white hover:bg-white/10 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
            >
              Learn More
            </Button>
          </Link>
        </div>
        <p className="mt-5 sm:mt-6 text-xs sm:text-sm text-coffee-200">
          No credit card required. Cancel anytime.
        </p>
      </div>
    </section>
  );
}