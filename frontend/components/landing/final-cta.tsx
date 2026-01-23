import Button from '../ui/Button';
import Link from 'next/link';

export function FinalCta() {
  return (
    <section className="py-20 bg-coffee-brown text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl mb-6">
          Ready to Transform Your Business?
        </h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto text-coffee-100">
          Join thousands of businesses that trust Garlic POS to power their operations. Get started today with our 14-day free trial.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button className="bg-white text-coffee-brown hover:bg-gray-100 text-lg px-8 py-6">
              Start Free Trial
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline-solid" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
              Learn More
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-coffee-200">
          No credit card required. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
