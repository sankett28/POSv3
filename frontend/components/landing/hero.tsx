import Button from '../ui/Button';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Modern POS System for Your Cafe
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Streamline your cafe operations with our intuitive point of sale system. Manage orders, track inventory, and grow your business with ease.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="bg-coffee-brown hover:bg-coffee-brown/90 text-lg px-8 py-6">
              Get Started - It's Free
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
