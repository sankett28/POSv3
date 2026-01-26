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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Perfect For All Types of Food Businesses
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Whether you run a small coffee shop or a full restaurant, we've got you covered
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {businessTypes.map((type, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-warm-cream rounded-full flex items-center justify-center mx-auto mb-4">
                {type.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{type.title}</h3>
              <p className="text-gray-600">{type.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
