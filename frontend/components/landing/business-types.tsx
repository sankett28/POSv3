'use client'

import { Coffee, Utensils, IceCream } from 'lucide-react';

const businessTypes = [
  {
    icon: <Coffee className="w-8 h-8 text-coffee-brown" />,
    title: "Coffee Shops",
    description: "Perfect for coffee shops of all sizes, from small kiosks to large cafes."
  },
  {
    icon: <Utensils className="w-8 h-8 text-coffee-brown" />,
    title: "Restaurants",
    description: "Ideal for full-service restaurants with table service and complex orders."
  },
  {
    icon: <IceCream className="w-8 h-8 text-coffee-brown" />,
    title: "Dessert Shops",
    description: "Great for bakeries, ice cream parlors, and dessert cafes."
  }
];

export function BusinessTypes() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Perfect For All Types of Food Businesses
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-gray-600">
            Whether you run a small coffee shop or a full restaurant, we've got you covered
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {businessTypes.map((type, index) => (
            <div 
              key={index} 
              className="bg-gray-50 p-6 sm:p-7 md:p-8 rounded-xl text-center hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-warm-cream rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
                {type.icon}
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                {type.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {type.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}