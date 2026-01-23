'use client'

import { Coffee, CreditCard, BarChart2, Smartphone, Zap, Shield } from 'lucide-react';

const features = [
  {
    icon: <Coffee className="w-8 h-8 text-coffee-brown" />,
    title: "Easy to Use",
    description: "Intuitive interface that's easy to learn and use, even for beginners."
  },
  {
    icon: <CreditCard className="w-8 h-8 text-coffee-brown" />,
    title: "Fast Checkout",
    description: "Process payments quickly and efficiently with our streamlined checkout."
  },
  {
    icon: <BarChart2 className="w-8 h-8 text-coffee-brown" />,
    title: "Real-time Analytics",
    description: "Get insights into your sales and business performance in real-time."
  },
  {
    icon: <Smartphone className="w-8 h-8 text-coffee-brown" />,
    title: "Mobile Friendly",
    description: "Access your POS from any device, anywhere, anytime."
  },
  {
    icon: <Zap className="w-8 h-8 text-coffee-brown" />,
    title: "Lightning Fast",
    description: "Built for speed to handle your busiest hours with ease."
  },
  {
    icon: <Shield className="w-8 h-8 text-coffee-brown" />,
    title: "Secure & Reliable",
    description: "Your data is safe with enterprise-grade security measures."
  }
];

export function Features() {
  return (
    <section id="features" className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Everything You Need to Run Your Cafe
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to help you manage your business more efficiently
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 sm:p-7 md:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center bg-warm-cream rounded-lg mb-4 sm:mb-5 md:mb-6">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}