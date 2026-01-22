'use client';

import Link from 'next/link';

export default function LandingPage() {
  const sectionStyle = {
    padding: '5rem 2rem',
    background: '#fafafa'
  };

  const sectionAltStyle = {
    ...sectionStyle,
    background: '#ffffff'
  };

  const sectionTitleStyle = {
    fontSize: '2.75rem',
    fontWeight: '700',
    textAlign: 'center' as const,
    marginBottom: '1rem',
    color: '#1a1a1a',
    letterSpacing: '-0.02em'
  };

  const sectionSubtitleStyle = {
    fontSize: '1rem',
    textAlign: 'center' as const,
    color: '#666666',
    marginBottom: '3.5rem',
    maxWidth: '900px',
    marginLeft: 'auto',
    marginRight: 'auto'
  };

  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '1rem',
    padding: '2.5rem 2rem',
    transition: 'all 0.3s ease',
    textAlign: 'center' as const,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    minHeight: '240px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center'
  };

  const cardIconStyle = {
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: '50%',
    background: '#fafafa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.25rem',
    fontSize: '1.75rem',
    position: 'relative' as const,
    border: '1px solid #e0e0e0'
  };

  const cardTitleStyle = {
    fontSize: '1.125rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
    color: '#1a1a1a'
  };

  const cardTextStyle = {
    fontSize: '0.9375rem',
    lineHeight: '1.6',
    color: '#666666'
  };

  const buttonPrimaryStyle = {
    display: 'inline-block',
    padding: '0.875rem 2rem',
    background: '#1a1a1a',
    color: '#ffffff',
    borderRadius: '0.5rem',
    fontWeight: '600',
    fontSize: '0.9375rem',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer'
  };

  const buttonSecondaryStyle = {
    display: 'inline-block',
    padding: '0.875rem 2rem',
    color: '#1a1a1a',
    fontWeight: '600',
    fontSize: '0.9375rem',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    border: '1.5px solid #e0e0e0',
    borderRadius: '0.5rem',
    background: '#ffffff',
    cursor: 'pointer'
  };

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
      
      <div style={{ background: '#fafafa' }}>
        {/* Hero Section */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center',
          padding: '4rem 2rem',
          maxWidth: '1600px',
          margin: '0 auto',
          minHeight: '600px'
        }} className="hero-grid">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            paddingRight: '2rem'
          }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '700',
              lineHeight: '1.1',
              color: '#1a1a1a',
              letterSpacing: '-0.02em'
            }}>
              Your Cafe. Your Brand.<br />
              Your POS — Instantly.
            </h1>
            <p style={{
              fontSize: '1rem',
              lineHeight: '1.6',
              color: '#666666',
              maxWidth: '500px'
            }}>
              Choose your business type and brand colors. We generate a complete POS system with a stunning UI — ready to use in minutes.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/login" style={buttonPrimaryStyle}>
                Get Started
              </Link>
              <button style={buttonSecondaryStyle}>
                See Demo
              </button>
            </div>
          </div>
          <div style={{
            width: '100%',
            height: '550px',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{ 
              width: '100%', 
              height: '100%', 
              background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              POS Preview
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={sectionStyle}>
          <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            <h2 style={sectionTitleStyle}>Launch Your POS in 3 Simple Steps</h2>
            <p style={sectionSubtitleStyle}>
              Go from idea to a fully branded point-of-sale system faster than ever before.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem',
              maxWidth: '100%',
              margin: '0 auto'
            }} className="grid-3">
              <div style={cardStyle}>
                <div style={cardIconStyle}>
                  <span>🏪</span>
                  <div style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '50%',
                    background: '#1a1a1a',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff'
                  }}>1</div>
                </div>
                <h3 style={cardTitleStyle}>Choose Your Business Type</h3>
                <p style={cardTextStyle}>
                  Select from Cafe, Restaurant, Bakery, or Cloud Kitchen to get features tailored for you.
                </p>
              </div>

              <div style={cardStyle}>
                <div style={cardIconStyle}>
                  <span>🎨</span>
                  <div style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '50%',
                    background: '#1a1a1a',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff'
                  }}>2</div>
                </div>
                <h3 style={cardTitleStyle}>Select Your Brand Colors</h3>
                <p style={cardTextStyle}>
                  Pick your primary color and watch your POS transform to match your brand identity.
                </p>
              </div>

              <div style={cardStyle}>
                <div style={cardIconStyle}>
                  <span>🚀</span>
                  <div style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '50%',
                    background: '#1a1a1a',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff'
                  }}>3</div>
                </div>
                <h3 style={cardTitleStyle}>Get Your POS Instantly</h3>
                <p style={cardTextStyle}>
                  Your fully-functional, beautiful POS is generated and delivered in minutes, not weeks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={sectionAltStyle}>
          <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            <h2 style={sectionTitleStyle}>Everything You Need to Succeed</h2>
            <p style={sectionSubtitleStyle}>
              Lichy comes packed with powerful features to streamline your operations and boost your growth.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
              maxWidth: '100%',
              margin: '0 auto'
            }} className="grid-4">
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
                <div key={i} style={{
                  ...cardStyle,
                  minHeight: '180px',
                  padding: '2rem 1.5rem'
                }}>
                  <div style={cardIconStyle}>
                    <span>{feature.icon}</span>
                  </div>
                  <h3 style={cardTitleStyle}>{feature.title}</h3>
                  <p style={cardTextStyle}>{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Colors Demo */}
        <section style={sectionStyle}>
          <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            <h2 style={sectionTitleStyle}>Your Brand, Your Colors</h2>
            <p style={sectionSubtitleStyle}>
              Instantly see how your entire POS UI updates with your brand color. No code, no waiting.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.5fr',
              gap: '4rem',
              alignItems: 'center',
              maxWidth: '100%',
              margin: '0 auto'
            }} className="hero-grid">
              <div>
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  marginBottom: '1.5rem',
                  color: '#1a1a1a'
                }}>Select Your Brand Color</h3>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  {['#1a1a1a', '#2a2a2a', '#4a4a4a', '#6a6a6a', '#8a8a8a'].map((color, i) => (
                    <div 
                      key={i}
                      style={{
                        width: '3.5rem',
                        height: '3.5rem',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: i === 0 ? '3px solid #1a1a1a' : '3px solid transparent',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        background: color
                      }}
                    >
                      {i === 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '1.25rem'
                        }}>✓</div>
                      )}
                    </div>
                  ))}
                </div>
                <p style={{
                  fontSize: '0.9375rem',
                  lineHeight: '1.6',
                  color: '#666666'
                }}>
                  Watch the POS dashboard on the right change instantly. This is the power of Lichy—total brand control, delivered in minutes.
                </p>
              </div>

              <div style={{
                background: '#ffffff',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#1a1a1a'
                  }}>Categories</div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#1a1a1a'
                  }}>Main Course Menu</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    {[
                      { icon: '🥘', name: 'Appetizers', active: false },
                      { icon: '🍛', name: 'Main Course', active: true },
                      { icon: '🍰', name: 'Desserts', active: false }
                    ].map((cat, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        color: cat.active ? '#ffffff' : '#1a1a1a',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: cat.active ? '#1a1a1a' : 'transparent',
                        fontWeight: cat.active ? '600' : '400'
                      }}>
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      {[
                        { name: 'Paneer Tikka', price: '₹250.00' },
                        { name: 'Veg Biryani', price: '₹320.00' },
                        { name: 'Garlic Naan', price: '₹60.00' },
                        { name: 'Gulab Jamun', price: '₹120.00' }
                      ].map((item, i) => (
                        <div key={i} style={{
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          background: '#fafafa'
                        }}>
                          <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#1a1a1a',
                            marginBottom: '0.25rem'
                          }}>{item.name}</h4>
                          <p style={{
                            fontSize: '0.75rem',
                            color: '#666666'
                          }}>{item.price}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      padding: '1.5rem',
                      background: '#fafafa',
                      borderRadius: '0.5rem'
                    }}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        marginBottom: '1rem'
                      }}>Order Summary</div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                        fontSize: '0.8125rem'
                      }}>
                        <span style={{ color: '#666666' }}>Subtotal</span>
                        <span style={{ color: '#1a1a1a' }}>₹750.00</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                        fontSize: '0.8125rem'
                      }}>
                        <span style={{ color: '#666666' }}>GST (5%)</span>
                        <span style={{ color: '#1a1a1a' }}>₹37.50</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: '700',
                        fontSize: '0.9375rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #e0e0e0',
                        marginTop: '0.75rem'
                      }}>
                        <span style={{ color: '#1a1a1a' }}>Total</span>
                        <span style={{ color: '#1a1a1a' }}>₹787.50</span>
                      </div>
                      <button style={{
                        width: '100%',
                        padding: '1rem',
                        background: '#1a1a1a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        fontSize: '0.9375rem',
                        cursor: 'pointer',
                        marginTop: '1rem',
                        transition: 'all 0.2s ease'
                      }}>
                        Charge ₹787.50
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Business Types */}
        <section style={sectionAltStyle}>
          <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            <h2 style={sectionTitleStyle}>Built for Every Food Business</h2>
            <p style={sectionSubtitleStyle}>
              Whether you run a cozy cafe or a bustling cloud kitchen, Lichy adapts to your unique needs.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
              maxWidth: '100%',
              margin: '0 auto'
            }} className="grid-4">
              {[
                { icon: '☕', title: 'Cafe', text: 'Perfect for your specialty coffee shop, with quick billing and table management.' },
                { icon: '🍽️', title: 'Restaurant', text: 'Manage fine dining, QSRs, or pubs with advanced inventory and reporting.' },
                { icon: '🥐', title: 'Bakery', text: 'Streamline orders for your cakes, pastries, and bread with our intuitive interface.' },
                { icon: '🚚', title: 'Cloud Kitchen', text: 'Integrate with online aggregators and manage delivery-only orders seamlessly.' }
              ].map((business, i) => (
                <div key={i} style={{
                  ...cardStyle,
                  minHeight: '220px'
                }}>
                  <div style={cardIconStyle}>
                    <span>{business.icon}</span>
                  </div>
                  <h3 style={cardTitleStyle}>{business.title}</h3>
                  <p style={cardTextStyle}>{business.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose */}
        <section style={sectionStyle}>
          <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '5rem',
              alignItems: 'center',
              maxWidth: '100%',
              margin: '0 auto'
            }} className="hero-grid">
              <div>
                <h2 style={{
                  fontSize: '2.75rem',
                  fontWeight: '700',
                  marginBottom: '1.5rem',
                  color: '#1a1a1a',
                  lineHeight: '1.2',
                  letterSpacing: '-0.02em'
                }}>Focus on Your Food, Not Your Software</h2>
                <p style={{
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: '#666666',
                  marginBottom: '2rem'
                }}>
                  We built Lichy to be incredibly simple and powerful, so you can spend more time doing what you love.
                </p>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {[
                    'No setup hassle. Zero configuration required.',
                    'No design work needed. Get a professional UI out of the box.',
                    'Built for Indian GST. Billing and tax reports made simple.',
                    'Lightning fast delivery. Your POS is ready in minutes, not months.',
                    'Premium and trustworthy UI that your staff and customers will love.'
                  ].map((item, i) => (
                    <li key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      marginBottom: '1rem',
                      fontSize: '0.9375rem',
                      color: '#1a1a1a'
                    }}>
                      <div style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        borderRadius: '50%',
                        border: '2px solid #1a1a1a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '0.125rem'
                      }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#1a1a1a'
                        }}>✓</span>
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{
                width: '100%',
                height: '500px',
                borderRadius: '1rem',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666666',
                fontSize: '1.25rem',
                fontWeight: '600'
              }}>
                Business Image
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section style={sectionAltStyle}>
          <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            <h2 style={sectionTitleStyle}>Loved by Business Owners Like You</h2>
            <p style={sectionSubtitleStyle}>
              Don't just take our word for it. Here's what our customers are saying.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem',
              maxWidth: '100%',
              margin: '0 auto'
            }} className="grid-3">
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
                <div key={i} style={{
                  background: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '1rem',
                  padding: '2rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    color: '#fbbf24',
                    fontSize: '1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    gap: '0.25rem'
                  }}>
                    {[...Array(5)].map((_, j) => <span key={j}>⭐</span>)}
                  </div>
                  <p style={{
                    fontSize: '0.9375rem',
                    lineHeight: '1.6',
                    color: '#1a1a1a',
                    marginBottom: '1.5rem',
                    fontStyle: 'italic',
                    flex: 1
                  }}>
                    {testimonial.text}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem'
                  }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      background: '#1a1a1a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      flexShrink: 0
                    }}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: '0.9375rem',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        marginBottom: '0.25rem'
                      }}>{testimonial.name}</h4>
                      <p style={{
                        fontSize: '0.8125rem',
                        color: '#666666'
                      }}>{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{
          ...sectionStyle,
          textAlign: 'center' as const
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.75rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#1a1a1a',
              letterSpacing: '-0.02em'
            }}>Your POS. Your Brand. Ready in Minutes.</h2>
            <p style={{
              fontSize: '1rem',
              color: '#666666',
              marginBottom: '2.5rem',
              maxWidth: '800px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Stop wrestling with complicated software. Get a beautiful, powerful, and easy-to-use POS system today.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login" style={{
                ...buttonPrimaryStyle,
                fontSize: '1.125rem',
                padding: '1.25rem 3rem'
              }}>
                Get Started
              </Link>
              <button style={{
                ...buttonSecondaryStyle,
                fontSize: '1.125rem',
                padding: '1.25rem 3rem'
              }}>
                Talk to Us
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
