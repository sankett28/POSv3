import Link from 'next/link';
import Button from '../ui/Button';

export function Header() {
  return (
    <header className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-coffee-brown">Garlic</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-gray-700 hover:text-coffee-brown transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-gray-700 hover:text-coffee-brown transition-colors">
            How It Works
          </Link>
          <Link href="#pricing" className="text-gray-700 hover:text-coffee-brown transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="text-gray-700 hover:text-coffee-brown transition-colors">
            Login
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="outline-solid" className="hidden md:inline-flex">
              Sign In
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-coffee-brown hover:bg-coffee-brown/90">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
