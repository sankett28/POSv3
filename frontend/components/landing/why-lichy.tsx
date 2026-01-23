import { CheckCircle2, Clock, BarChart2, Headset, Zap, Shield } from 'lucide-react';

const benefits = [
  {
    icon: <Zap className="w-6 h-6 text-coffee-brown" />,
    title: "Lightning Fast",
    description: "Process orders quickly even during peak hours"
  },
  {
    icon: <BarChart2 className="w-6 h-6 text-coffee-brown" />,
    title: "Powerful Analytics",
    description: "Make data-driven decisions with detailed reports"
  },
  {
    icon: <Clock className="w-6 h-6 text-coffee-brown" />,
    title: "24/7 Support",
    description: "Our team is always here to help you"
  },
  {
    icon: <Shield className="w-6 h-6 text-coffee-brown" />,
    title: "Secure & Reliable",
    description: "Your data is protected with enterprise-grade security"
  }
];

export function WhyGarlic() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div className="mb-12 lg:mb-0">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">
              Why Choose Garlic POS?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              We've built a modern, intuitive point of sale system that helps you run your business more efficiently.
            </p>
            
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="shrink-0 mt-1">
                    {benefit.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
              <div className="flex items-center justify-center h-full p-8 text-center">
                <div>
                  <h3 className="text-xl font-bold text-coffee-brown mb-2">See It In Action</h3>
                  <p className="text-gray-600 mb-4">Schedule a demo to see how Garlic can transform your business</p>
                  <button className="bg-coffee-brown text-white px-6 py-3 rounded-lg font-medium hover:bg-coffee-brown/90 transition-colors">
                    Request Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
