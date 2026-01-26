import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export function HowItWorks() {
  const steps = [
    {
      title: 'Sign Up',
      description: 'Create your account in just a few clicks',
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />
    },
    {
      title: 'Set Up Your Menu',
      description: 'Add your menu items and customize them to fit your needs',
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />
    },
    {
      title: 'Start Selling',
      description: 'Begin taking orders and processing payments immediately',
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Get started in minutes with our simple setup process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-xl text-center">
              <div className="w-12 h-12 bg-coffee-brown/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-coffee-brown">{index + 1}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
