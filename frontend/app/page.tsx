'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--color-bg)' }}>
      {/* Hero Section - Split Screen */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">
            Your Cafe. Your Brand.<br />
            Your POS — Instantly.
          </h1>
          <p className="landing-hero-subtitle">
            Choose your business type and brand colors. We generate a complete POS system with a stunning UI — ready to use in minutes.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/login" className="landing-cta-primary">
              Get Started
            </Link>
            <button className="landing-cta-secondary">
              See Demo
            </button>
          </div>
        </div>
        <div className="landing-hero-image">
          {/* Placeholder for hero image */}
          <div style={{ 
            width: '100%', 
            height: '100%', 
            background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-surface)',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            POS Preview
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="landing-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="landing-section-title">Launch Your POS in 3 Simple Steps</h2>
          <p className="landing-section-subtitle">
            Go from idea to a fully branded point-of-sale system faster than ever before.
          </p>

          <div className="landing-grid-3">
            <div className="steps-card">
              <div className="landing-card-icon">
                <span>🏪</span>
                <div className="landing-card-badge">1</div>
              </div>
              <h3 className="landing-card-title">Choose Your Business Type</h3>
              <p className="landing-card-text">
                Select from Cafe, Restaurant, Bakery, or Cloud Kitchen to get features tailored for you.
              </p>
            </div>

            <div className="steps-card">
              <div className="landing-card-icon">
                <span>🎨</span>
                <div className="landing-card-badge">2</div>
              </div>
              <h3 className="landing-card-title">Select Your Brand Colors</h3>
              <p className="landing-card-text">
                Pick your primary color and watch your POS transform to match your brand identity.
              </p>
            </div>

            <div className="steps-card">
              <div className="landing-card-icon">
                <span>🚀</span>
                <div className="landing-card-badge">3</div>
              </div>
              <h3 className="landing-card-title">Get Your POS Instantly</h3>
              <p className="landing-card-text">
                Your fully-functional, beautiful POS is generated and delivered in minutes, not weeks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-section landing-section-alt">
        <div className="max-w-6xl mx-auto">
          <h2 className="landing-section-title">Everything You Need to Succeed</h2>
          <p className="landing-section-subtitle">
            Lichy comes packed with powerful features to streamline your operations and boost your growth.
          </p>

          <div className="landing-grid-4">
            <div className="feature-card">
              <div className="landing-card-icon">
                <span>🧾</span>
              </div>
              <h3 className="landing-card-title">Smart Billing & GST</h3>
              <p className="landing-card-text">
                Automated tax calculations and compliant invoicing
              </p>
            </div>

            <div className="feature-card">
              <div className="landing-card-icon">
                <span>📊</span>
              </div>
              <h3 className="landing-card-title">Sales & Tax Reports</h3>
              <p className="landing-card-text">
                Real-time insights into your business performance
              </p>
            </div>

            <div className="feature-card">
              <div className="landing-card-icon">
                <span>📦</span>
              </div>
              <h3 className="landing-card-title">Inventory Management</h3>
              <p className="landing-card-text">
                Track stock levels and get low-stock alerts
              </p>
            </div>

            <div className="feature-card">
              <div className="landing-card-icon">
                <span>💳</span>
              </div>
              <h3 className="landing-card-title">Multi-Payment Support</h3>
              <p className="landing-card-text">
                Accept cash, cards, UPI, and digital wallets
              </p>
            </div>

            <div className="feature-card">
              <div className="landing-card-icon">
                <span>🎨</span>
              </div>
              <h3 className="landing-card-title">Custom Theme & Branding</h3>
              <p className="landing-card-text">
                Match your brand with custom colors and logos
              </p>
            </div>

            <div className="feature-card">
              <div className="landing-card-icon">
                <span>📱</span>
              </div>
              <h3 className="landing-card-title">Mobile & Tablet Friendly</h3>
              <p className="landing-card-text">
                Works seamlessly on any device, anywhere
              </p>
            </div>

            <div className="feature-card">
              <div className="landing-card-icon">
                <span>☁️</span>
              </div>
              <h3 className="landing-card-title">Cloud Sync & Backup</h3>
              <p className="landing-card-text">
                Your data is always safe and accessible
              </p>
            </div>

            <div className="feature-card">
              <div className="landing-card-icon">
                <span>🇮🇳</span>
              </div>
              <h3 className="landing-card-title">Built for Indian GST</h3>
              <p className="landing-card-text">
                Fully compliant with Indian tax regulations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Colors Demo Section */}
      <section className="brand-demo-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="landing-section-title">Your Brand, Your Colors</h2>
          <p className="landing-section-subtitle">
            Instantly see how your entire POS UI updates with your brand color. No code, no waiting.
          </p>

          <div className="brand-demo-container">
            <div className="brand-color-selector">
              <h3>Select Your Brand Color</h3>
              <div className="color-swatches">
                <div 
                  className="color-swatch active" 
                  style={{ background: '#1a1a1a' }}
                />
                <div 
                  className="color-swatch" 
                  style={{ background: '#2a2a2a' }}
                />
                <div 
                  className="color-swatch" 
                  style={{ background: '#4a4a4a' }}
                />
                <div 
                  className="color-swatch" 
                  style={{ background: '#6a6a6a' }}
                />
                <div 
                  className="color-swatch" 
                  style={{ background: '#8a8a8a' }}
                />
              </div>
              <p className="brand-demo-text">
                Watch the POS dashboard on the right change instantly. This is the power of Lichy—total brand control, delivered in minutes.
              </p>
            </div>

            <div className="pos-preview-card">
              <div className="pos-preview-header">
                <div className="pos-preview-section">Categories</div>
                <div className="pos-preview-section">Main Course Menu</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                <div className="pos-categories">
                  <div className="pos-category-item">
                    <span>🥘</span>
                    <span>Appetizers</span>
                  </div>
                  <div className="pos-category-item active">
                    <span>🍛</span>
                    <span>Main Course</span>
                  </div>
                  <div className="pos-category-item">
                    <span>🍰</span>
                    <span>Desserts</span>
                  </div>
                </div>

                <div>
                  <div className="pos-menu-grid">
                    <div className="pos-menu-item">
                      <h4>Paneer Tikka</h4>
                      <p>₹250.00</p>
                    </div>
                    <div className="pos-menu-item">
                      <h4>Veg Biryani</h4>
                      <p>₹320.00</p>
                    </div>
                    <div className="pos-menu-item">
                      <h4>Garlic Naan</h4>
                      <p>₹60.00</p>
                    </div>
                    <div className="pos-menu-item">
                      <h4>Gulab Jamun</h4>
                      <p>₹120.00</p>
                    </div>
                  </div>

                  <div className="pos-order-summary">
                    <div className="pos-summary-title">Order Summary</div>
                    <div className="pos-summary-row">
                      <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                      <span style={{ color: 'var(--color-text)' }}>₹750.00</span>
                    </div>
                    <div className="pos-summary-row">
                      <span style={{ color: 'var(--color-text-muted)' }}>GST (5%)</span>
                      <span style={{ color: 'var(--color-text)' }}>₹37.50</span>
                    </div>
                    <div className="pos-summary-row total">
                      <span style={{ color: 'var(--color-text)' }}>Total</span>
                      <span style={{ color: 'var(--color-text)' }}>₹787.50</span>
                    </div>
                    <button className="pos-charge-button">
                      Charge ₹787.50
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Types Section */}
      <section className="landing-section landing-section-alt">
        <div className="max-w-6xl mx-auto">
          <h2 className="landing-section-title">Built for Every Food Business</h2>
          <p className="landing-section-subtitle">
            Whether you run a cozy cafe or a bustling cloud kitchen, Lichy adapts to your unique needs.
          </p>

          <div className="landing-grid-4">
            <div className="business-card">
              <div className="landing-card-icon">
                <span>☕</span>
              </div>
              <h3 className="landing-card-title">Cafe</h3>
              <p className="landing-card-text">
                Perfect for your specialty coffee shop, with quick billing and table management.
              </p>
            </div>

            <div className="business-card">
              <div className="landing-card-icon">
                <span>🍽️</span>
              </div>
              <h3 className="landing-card-title">Restaurant</h3>
              <p className="landing-card-text">
                Manage fine dining, QSRs, or pubs with advanced inventory and reporting.
              </p>
            </div>

            <div className="business-card">
              <div className="landing-card-icon">
                <span>🥐</span>
              </div>
              <h3 className="landing-card-title">Bakery</h3>
              <p className="landing-card-text">
                Streamline orders for your cakes, pastries, and bread with our intuitive interface.
              </p>
            </div>

            <div className="business-card">
              <div className="landing-card-icon">
                <span>🚚</span>
              </div>
              <h3 className="landing-card-title">Cloud Kitchen</h3>
              <p className="landing-card-text">
                Integrate with online aggregators and manage delivery-only orders seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="landing-section">
        <div className="max-w-6xl mx-auto">
          <div className="landing-split-section">
            <div className="landing-split-content">
              <h2>Focus on Your Food, Not Your Software</h2>
              <p>
                We built Lichy to be incredibly simple and powerful, so you can spend more time doing what you love.
              </p>
              <ul className="landing-feature-list">
                <li className="landing-feature-item">
                  <div className="landing-feature-icon"></div>
                  <span>No setup hassle. Zero configuration required.</span>
                </li>
                <li className="landing-feature-item">
                  <div className="landing-feature-icon"></div>
                  <span>No design work needed. Get a professional UI out of the box.</span>
                </li>
                <li className="landing-feature-item">
                  <div className="landing-feature-icon"></div>
                  <span>Built for Indian GST. Billing and tax reports made simple.</span>
                </li>
                <li className="landing-feature-item">
                  <div className="landing-feature-icon"></div>
                  <span>Lightning fast delivery. Your POS is ready in minutes, not months.</span>
                </li>
                <li className="landing-feature-item">
                  <div className="landing-feature-icon"></div>
                  <span>Premium and trustworthy UI that your staff and customers will love.</span>
                </li>
              </ul>
            </div>
            <div className="landing-split-image">
              {/* Placeholder for image */}
              <div style={{ 
                width: '100%', 
                height: '100%', 
                background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '1.25rem',
                fontWeight: '600'
              }}>
                Business Image
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="landing-section landing-section-alt">
        <div className="max-w-6xl mx-auto">
          <h2 className="landing-section-title">Loved by Business Owners Like You</h2>
          <p className="landing-section-subtitle">
            Don't just take our word for it. Here's what our customers are saying.
          </p>

          <div className="landing-grid-3">
            <div className="testimonial-card">
              <div className="testimonial-stars">
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
              </div>
              <p className="testimonial-text">
                "Lichy is a game-changer. We had a beautiful, branded POS running in one afternoon. Our staff loves it, and customers compliment the clean interface!"
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">AK</div>
                <div className="testimonial-info">
                  <h4>Asha Khan</h4>
                  <p>Owner, The Cozy Mug Cafe</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
              </div>
              <p className="testimonial-text">
                "The sales and inventory reports are incredibly detailed. We've cut down on waste and optimized our menu, all thanks to Lichy's insights. Setup was instant!"
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">RV</div>
                <div className="testimonial-info">
                  <h4>Rohan Verma</h4>
                  <p>Chef, Saffron Spice Restaurant</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
              </div>
              <p className="testimonial-text">
                "I'm not a tech person, but Lichy made it so simple. Choosing my brand colors and seeing the POS update instantly was like magic. Highly recommended!"
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">PP</div>
                <div className="testimonial-info">
                  <h4>Priya Patel</h4>
                  <p>Founder, Sweet Layers Bakery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="cta-title">Your POS. Your Brand. Ready in Minutes.</h2>
          <p className="cta-subtitle">
            Stop wrestling with complicated software. Get a beautiful, powerful, and easy-to-use POS system today.
          </p>
          <div className="cta-buttons">
            <Link href="/login" className="landing-cta-primary" style={{ fontSize: '1.125rem', padding: '1.25rem 3rem' }}>
              Get Started
            </Link>
            <button className="landing-cta-secondary" style={{ fontSize: '1.125rem', padding: '1.25rem 3rem' }}>
              Talk to Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
