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
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Everything You Need to Run Your Cafe
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Powerful features designed to help you manage your business more efficiently
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 flex items-center justify-center bg-warm-cream rounded-lg mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
