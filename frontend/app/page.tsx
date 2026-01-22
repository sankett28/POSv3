'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.9, ease: 'easeOut' } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14 }
  }
};

const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.22, delayChildren: 0.3 }
  }
};

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 968px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .grid-4 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="bg-[#fafafa] overflow-hidden">
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={heroVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center px-8 py-20 md:py-32 max-w-[1600px] mx-auto min-h-[700px] hero-grid"
        >
          <motion.div variants={fadeInUp} className="flex flex-col gap-7 pr-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] text-[#1a1a1a] tracking-[-0.025em]">
              Your Cafe. Your Brand.<br />Your POS — Instantly.
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-[#555] max-w-xl">
              Choose your business type and brand colors. We generate a complete POS system with a stunning UI — ready to use in minutes.
            </p>
            <div className="flex flex-wrap gap-5 mt-6">
              <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/login"
                  className="inline-flex items-center px-10 py-4 bg-[#1a1a1a] text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-2xl hover:bg-gray-800 transition-all duration-300"
                >
                  Get Started →
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}>
                <button className="inline-flex items-center px-10 py-4 text-[#1a1a1a] font-semibold text-base border-2 border-[#d0d0d0] rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-300">
                  See Demo
                </button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            variants={scaleIn}
            className="relative w-full h-[520px] md:h-[620px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5"
          >
            <Image src="/images/cafe.jpg" alt="POS Preview" fill className="object-cover" priority />
          </motion.div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="py-24 px-8 bg-[#fafafa]"
        >
          <div className="max-w-[1600px] mx-auto">
            <motion.h2 variants={fadeInUp} className="text-5xl md:text-6xl font-bold text-center text-[#1a1a1a] tracking-tight mb-6">
              Launch Your POS in 3 Simple Steps
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-center text-gray-600 mb-16 max-w-4xl mx-auto">
              Go from idea to a fully branded point-of-sale system faster than ever before.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 grid-3">
              {[
                { icon: '🏪', num: 1, title: 'Choose Your Business Type', text: 'Select from Cafe, Restaurant, Bakery, or Cloud Kitchen to get features tailored for you.' },
                { icon: '🎨', num: 2, title: 'Select Your Brand Colors', text: 'Pick your primary color and watch your POS transform to match your brand identity.' },
                { icon: '🚀', num: 3, title: 'Get Your POS Instantly', text: 'Your fully-functional, beautiful POS is generated and delivered in minutes, not weeks.' }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ y: -10, transition: { duration: 0.35 } }}
                  className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-md hover:shadow-2xl transition-all duration-400 min-h-[260px] flex flex-col items-center group relative overflow-hidden"
                >
                  <div className="relative w-16 h-16 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mb-6 text-4xl group-hover:scale-110 transition-transform duration-400">
                    <span>{step.icon}</span>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#1a1a1a] text-white text-sm font-bold flex items-center justify-center border-2 border-white shadow-sm">
                      {step.num}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed flex-1">{step.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="py-24 px-8 bg-white"
        >
          <div className="max-w-[1600px] mx-auto">
            <motion.h2 variants={fadeInUp} className="text-5xl md:text-6xl font-bold text-center text-gray-900 tracking-tight mb-6">
              Everything You Need to Succeed
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-center text-gray-600 mb-16 max-w-4xl mx-auto">
              Lichy comes packed with powerful features to streamline your operations and boost your growth.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 grid-4">
              {[
                { icon: '🧾', title: 'Smart Billing & GST', text: 'Automated tax calculations and compliant invoicing' },
                { icon: '📊', title: 'Sales & Tax Reports', text: 'Real-time insights into your business performance' },
                { icon: '📦', title: 'Inventory Management', text: 'Track stock levels and get low-stock alerts' },
                { icon: '💳', title: 'Multi-Payment Support', text: 'Accept cash, cards, UPI, and digital wallets' },
                { icon: '🎨', title: 'Custom Theme & Branding', text: 'Match your brand with custom colors and logos' },
                { icon: '📱', title: 'Mobile & Tablet Friendly', text: 'Works seamlessly on any device, anywhere' },
                { icon: '☁️', title: 'Cloud Sync & Backup', text: 'Your data is always safe and accessible' },
                { icon: '🇮🇳', title: 'Built for Indian GST', text: 'Fully compliant with Indian tax regulations' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.3 } }}
                  className="bg-white border border-gray-200 rounded-2xl p-9 text-center shadow-md hover:shadow-2xl transition-all duration-400 min-h-[200px] flex flex-col items-center group"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mb-6 text-4xl group-hover:rotate-6 group-hover:scale-110 transition-transform duration-400">
                    <span>{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-[15px] leading-relaxed flex-1">{feature.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Brand Colors Demo */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="py-24 px-8 bg-[#fafafa]"
        >
          <div className="max-w-[1600px] mx-auto">
            <motion.h2 variants={fadeInUp} className="text-5xl md:text-6xl font-bold text-center text-[#1a1a1a] tracking-tight mb-6">
              Your Brand, Your Colors
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-center text-gray-600 mb-16 max-w-4xl mx-auto">
              Instantly see how your entire POS UI updates with your brand color. No code, no waiting.
            </motion.p>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 items-center hero-grid">
              <motion.div variants={fadeInUp}>
                <h3 className="text-4xl font-bold text-gray-900 mb-8">Select Your Brand Color</h3>
                <div className="flex flex-wrap gap-6 mb-10">
                  {['#1a1a1a', '#2a2a2a', '#4a4a4a', '#6a6a6a', '#8a8a8a'].map((color, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.18, transition: { duration: 0.25 } }}
                      whileTap={{ scale: 0.92 }}
                      className="w-16 h-16 rounded-full cursor-pointer border-4 shadow-md transition-all duration-200 relative"
                      style={{ backgroundColor: color, borderColor: i === 0 ? '#1a1a1a' : 'transparent' }}
                    >
                      {i === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-white font-extrabold text-3xl drop-shadow-lg">
                          ✓
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Watch the POS dashboard on the right change instantly. This is the power of Lichy—total brand control, delivered in minutes.
                </p>
              </motion.div>

              <motion.div variants={scaleIn} className="bg-white rounded-3xl p-10 shadow-2xl border border-gray-200">
                <div className="flex justify-between mb-6 pb-4 border-b border-[#e0e0e0]">
                  <div className="text-sm font-semibold text-[#1a1a1a]">Categories</div>
                  <div className="text-sm font-semibold text-[#1a1a1a]">Main Course Menu</div>
                </div>

                <div className="grid grid-cols-[1fr_2fr] gap-6">
                  <div className="flex flex-col gap-2">
                    {[
                      { icon: '🥘', name: 'Appetizers', active: false },
                      { icon: '🍛', name: 'Main Course', active: true },
                      { icon: '🍰', name: 'Desserts', active: false }
                    ].map((cat, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.03, x: 4 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm cursor-pointer transition-all duration-300 font-${cat.active ? 'semibold' : 'normal'}`}
                        style={{ color: cat.active ? 'white' : '#1a1a1a', background: cat.active ? '#1a1a1a' : 'transparent' }}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[
                        { name: 'Paneer Tikka', price: '₹250.00' },
                        { name: 'Veg Biryani', price: '₹320.00' },
                        { name: 'Garlic Naan', price: '₹60.00' },
                        { name: 'Gulab Jamun', price: '₹120.00' }
                      ].map((item, i) => (
                        <div key={i} className="p-4 rounded-lg bg-[#fafafa]">
                          <h4 className="text-sm font-semibold text-[#1a1a1a] mb-1">{item.name}</h4>
                          <p className="text-xs text-[#666666]">{item.price}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 bg-[#fafafa] rounded-lg">
                      <div className="text-sm font-bold text-[#1a1a1a] mb-4">Order Summary</div>
                      <div className="flex justify-between mb-2 text-[13px]">
                        <span className="text-[#666666]">Subtotal</span>
                        <span className="text-[#1a1a1a]">₹750.00</span>
                      </div>
                      <div className="flex justify-between mb-2 text-[13px]">
                        <span className="text-[#666666]">GST (5%)</span>
                        <span className="text-[#1a1a1a]">₹37.50</span>
                      </div>
                      <div className="flex justify-between font-bold text-[15px] pt-3 mt-3 border-t border-[#e0e0e0]">
                        <span className="text-[#1a1a1a]">Total</span>
                        <span className="text-[#1a1a1a]">₹787.50</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-4 mt-4 bg-[#1a1a1a] text-white border-none rounded-xl font-semibold text-[15px] cursor-pointer transition-all duration-300 hover:bg-gray-800 shadow-md hover:shadow-lg"
                      >
                        Charge ₹787.50
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Business Types */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="py-24 px-8 bg-white"
        >
          <div className="max-w-[1600px] mx-auto">
            <motion.h2 variants={fadeInUp} className="text-5xl md:text-6xl font-bold text-center text-[#1a1a1a] tracking-tight mb-6">
              Built for Every Food Business
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-center text-gray-600 mb-16 max-w-4xl mx-auto">
              Whether you run a cozy cafe or a bustling cloud kitchen, Lichy adapts to your unique needs.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 grid-4">
              {[
                { icon: '☕', title: 'Cafe', text: 'Perfect for your specialty coffee shop, with quick billing and table management.' },
                { icon: '🍽️', title: 'Restaurant', text: 'Manage fine dining, QSRs, or pubs with advanced inventory and reporting.' },
                { icon: '🥐', title: 'Bakery', text: 'Streamline orders for your cakes, pastries, and bread with our intuitive interface.' },
                { icon: '🚚', title: 'Cloud Kitchen', text: 'Integrate with online aggregators and manage delivery-only orders seamlessly.' }
              ].map((business, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ y: -8, scale: 1.03 }}
                  className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-md hover:shadow-2xl transition-all duration-400 min-h-[240px] flex flex-col items-center group"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mb-6 text-4xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-400">
                    <span>{business.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{business.title}</h3>
                  <p className="text-gray-600 leading-relaxed flex-1">{business.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Why Choose */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="py-24 px-8 bg-[#fafafa]"
        >
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center hero-grid">
              <motion.div variants={fadeInUp}>
                <h2 className="text-5xl md:text-6xl font-bold text-[#1a1a1a] leading-[1.15] tracking-[-0.02em] mb-8">
                  Focus on Your Food, Not Your Software
                </h2>
                <p className="text-lg leading-relaxed text-gray-600 mb-10">
                  We built Lichy to be incredibly simple and powerful, so you can spend more time doing what you love.
                </p>
                <ul className="list-none p-0 m-0 space-y-5">
                  {[
                    'No setup hassle. Zero configuration required.',
                    'No design work needed. Get a professional UI out of the box.',
                    'Built for Indian GST. Billing and tax reports made simple.',
                    'Lightning fast delivery. Your POS is ready in minutes, not months.',
                    'Premium and trustworthy UI that your staff and customers will love.'
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      variants={fadeInUp}
                      className="flex items-start gap-5 text-[15px] text-[#1a1a1a]"
                    >
                      <div className="w-7 h-7 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm font-bold text-[#1a1a1a]">✓</span>
                      </div>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                variants={scaleIn}
                className="relative w-full h-[520px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5"
              >
                <Image src="/images/cafe 2.jpg" alt="Business Image" fill className="object-cover" />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Testimonials */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="py-24 px-8 bg-white"
        >
          <div className="max-w-[1600px] mx-auto">
            <motion.h2 variants={fadeInUp} className="text-5xl md:text-6xl font-bold text-center text-[#1a1a1a] tracking-tight mb-6">
              Loved by Business Owners Like You
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-center text-gray-600 mb-16 max-w-4xl mx-auto">
              Don't just take our word for it. Here's what our customers are saying.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 grid-3">
              {[
                {
                  name: 'Asha Khan',
                  role: 'Owner, The Cozy Mug Cafe',
                  avatar: 'AK',
                  text: '"Lichy is a game-changer. We had a beautiful, branded POS running in one afternoon. Our staff loves it, and customers compliment the clean interface!"'
                },
                {
                  name: 'Rohan Verma',
                  role: 'Chef, Saffron Spice Restaurant',
                  avatar: 'RV',
                  text: '"The sales and inventory reports are incredibly detailed. We\'ve cut down on waste and optimized our menu, all thanks to Lichy\'s insights. Setup was instant!"'
                },
                {
                  name: 'Priya Patel',
                  role: 'Founder, Sweet Layers Bakery',
                  avatar: 'PP',
                  text: '"I\'m not a tech person, but Lichy made it so simple. Choosing my brand colors and seeing the POS update instantly was like magic. Highly recommended!"'
                }
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ y: -8, transition: { duration: 0.35 } }}
                  className="bg-white border border-gray-200 rounded-2xl p-10 shadow-md hover:shadow-2xl transition-all duration-400 flex flex-col min-h-[320px]"
                >
                  <div className="text-[#fbbf24] text-2xl mb-6 flex gap-1">
                    {[...Array(5)].map((_, j) => <span key={j}>★</span>)}
                  </div>
                  <p className="text-[15px] leading-relaxed text-gray-800 mb-8 italic flex-1">
                    {testimonial.text}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center font-bold text-white text-lg flex-shrink-0 shadow-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="mt-12"
        >
          <div className="bg-[#1a1a1a] py-8 px-6">
            <div className="max-w-[1600px] mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-gray-300 text-sm flex-wrap">
                <div className="flex items-center gap-8">
                  <Link href="/terms-of-use" className="hover:text-white transition-colors duration-300">
                    Terms Of Use
                  </Link>
                  <Link href="/privacy-policy" className="hover:text-white transition-colors duration-300">
                    Privacy Policy
                  </Link>
                </div>

                <div className="text-center order-3 sm:order-none mt-4 sm:mt-0">
                  © 2025 Helium AI. All rights reserved.
                </div>

                <div className="text-right">
                  Product by{' '}
                  <Link
                    href="https://neuralarc.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors duration-300"
                  >
                    Neural Arc Inc
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </>
  );
}