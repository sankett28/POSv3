'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

type BusinessType = 'cafe' | 'restaurant' | 'cloud-kitchen' | null;
type Revenue = 'less-10l' | '10l-50l' | '50l-2cr' | '2cr-plus' | 'not-sure' | null;
type ThemeMode = 'light' | 'dark';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>(null);
  const [revenue, setRevenue] = useState<Revenue>(null);
  const [hasGST, setHasGST] = useState<string>('');
  const [gstNumber, setGstNumber] = useState('');
  
  // Cafe specific
  const [serviceCharge, setServiceCharge] = useState<string>('yes');
  const [billingType, setBillingType] = useState<string>('');
  const [priceType, setPriceType] = useState<string>('');
  
  // Restaurant specific
  const [tableService, setTableService] = useState<string>('');
  const [kitchenTickets, setKitchenTickets] = useState<string>('');
  const [restaurantServiceCharge, setRestaurantServiceCharge] = useState<string>('');
  const [numberOfTables, setNumberOfTables] = useState<string>('');
  
  // Branding
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [brandPrompt, setBrandPrompt] = useState<string>('');
  const [brandingChoice, setBrandingChoice] = useState<'url' | 'prompt' | 'manual' | null>(null);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [primaryColor, setPrimaryColor] = useState('#1f2937');
  const [isGenerating, setIsGenerating] = useState(false);

  // Apply theme changes live
  useEffect(() => {
    if (step === 4) {
      document.documentElement.style.setProperty('--theme-primary', primaryColor);
      document.documentElement.style.setProperty(
        '--background',
        themeMode === 'light' ? '#ffffff' : '#0a0a0a'
      );
      document.documentElement.style.setProperty(
        '--foreground',
        themeMode === 'light' ? '#1f2937' : '#f8fafc'
      );
    }
  }, [primaryColor, themeMode, step]);

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    setIsGenerating(true);
    
    // Save to localStorage
    const config = {
      businessName,
      businessType,
      revenue,
      hasGST,
      gstNumber,
      serviceCharge,
      billingType,
      priceType,
      tableService,
      kitchenTickets,
      restaurantServiceCharge,
      numberOfTables,
      websiteUrl,
      brandingChoice,
      themeMode,
      primaryColor,
    };
    localStorage.setItem('lichy-onboarding', JSON.stringify(config));

    // Simulate generation
    setTimeout(() => {
      router.push('/pos-billing');
    }, 2000);
  };

  const canProceedStep2 = businessName.trim() !== '' && 
                          businessType !== null && 
                          revenue !== null && 
                          hasGST !== '' && 
                          (hasGST === 'no' || (hasGST === 'yes' && gstNumber.trim() !== ''));
  
  const canProceedStep3 = businessType === 'cafe' 
    ? (billingType !== '' && priceType !== '')
    : businessType === 'restaurant'
    ? (tableService !== '' && kitchenTickets !== '' && restaurantServiceCharge !== '')
    : false;

  return (
    <div className="onboarding-container">
      <div className="w-full max-w-3xl px-4">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="onboarding-card fade-in-up text-center">
            <div className="step-badge">Step 1 of 5</div>
            <h1 className="onboarding-title">Welcome to Lichy</h1>
            <p className="onboarding-subtitle">
              Let's set up your POS in just a few steps.
            </p>
            <button onClick={handleNext} className="onboarding-btn-primary">
              Get Started
            </button>
          </div>
        )}

        {/* Step 2: Business Info */}
        {step === 2 && (
          <div className="onboarding-card fade-in-up">
            <button onClick={handleBack} className="back-button">
              ← Back
            </button>
            <div className="step-badge">Step 2 of 5</div>
            <h2 className="onboarding-title">Tell us about your business.</h2>
            
            <div className="form-field">
              <label>Business name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter business name"
                className="onboarding-input"
              />
            </div>

            <div className="form-field">
              <label>Business type</label>
              <select
                value={businessType || ''}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                className="onboarding-input"
                style={{
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '3rem'
                }}
              >
                <option value="" disabled>Select business type</option>
                <option value="cafe">Café - Coffee shops & tea houses</option>
                <option value="restaurant">Restaurant - Dine-in & takeout</option>
              </select>
            </div>

            <div className="form-field">
              <label>What is your annual income?</label>
              <select
                value={revenue || ''}
                onChange={(e) => setRevenue(e.target.value as Revenue)}
                className="onboarding-input"
                style={{
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '3rem'
                }}
              >
                <option value="" disabled>Select annual income</option>
                <option value="less-10l">Less than ₹10L</option>
                <option value="10l-50l">₹10L – ₹50L</option>
                <option value="50l-2cr">₹50L – ₹2Cr</option>
                <option value="2cr-plus">₹2Cr+</option>
                <option value="not-sure">Not sure yet</option>
              </select>
            </div>

            <div className="form-field">
              <label>Do you have GST?</label>
              <select
                value={hasGST}
                onChange={(e) => {
                  setHasGST(e.target.value);
                  if (e.target.value === 'no') {
                    setGstNumber('');
                  }
                }}
                className="onboarding-input"
                style={{
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '3rem'
                }}
              >
                <option value="" disabled>Select option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {hasGST === 'yes' && (
              <div className="form-field">
                <label>GSTIN Number</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5"
                  className="onboarding-input"
                  maxLength={15}
                />
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={!canProceedStep2}
              className="onboarding-btn-primary w-full"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 3: Business Configuration */}
        {step === 3 && businessType === 'cafe' && (
          <div className="onboarding-card fade-in-up">
            <button onClick={handleBack} className="back-button">
              ← Back
            </button>
            <div className="step-badge">Step 3 of 5</div>
            <h2 className="onboarding-title">Configure your café</h2>

            <div className="form-field">
              <label>Enable service charge?</label>
              <select
                value={serviceCharge}
                onChange={(e) => setServiceCharge(e.target.value)}
                className="onboarding-input"
                style={{
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '3rem'
                }}
              >
                <option value="yes">Yes (Default)</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="form-field">
              <label>Counter billing or table billing?</label>
              <select
                value={billingType}
                onChange={(e) => setBillingType(e.target.value)}
                className="onboarding-input"
                style={{
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '3rem'
                }}
              >
                <option value="" disabled>Select billing type</option>
                <option value="counter">Counter Billing</option>
                <option value="table">Table Billing</option>
              </select>
            </div>

            <div className="form-field">
              <label>Inclusive or exclusive prices?</label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="onboarding-input"
                style={{
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '3rem'
                }}
              >
                <option value="" disabled>Select price type</option>
                <option value="inclusive">Inclusive (Tax included in price)</option>
                <option value="exclusive">Exclusive (Tax added at checkout)</option>
              </select>
            </div>

            <button
              onClick={handleNext}
              disabled={!canProceedStep3}
              className="onboarding-btn-primary w-full"
            >
              Next
            </button>
          </div>
        )}

        {step === 3 && businessType === 'restaurant' && (
          <div className="onboarding-card fade-in-up">
            <button onClick={handleBack} className="back-button">
              ← Back
            </button>
            <div className="step-badge">Step 3 of 5</div>
            <h2 className="onboarding-title">Configure your restaurant</h2>

            <div className="form-field">
              <label>Table service?</label>
              <select
                value={tableService}
                onChange={(e) => setTableService(e.target.value)}
                className="onboarding-input"
                style={{
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '3rem'
                }}
              >
                <option value="" disabled>Select option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="form-field">
              <label>Kitchen Order Tickets?</label>
              <select
                value={kitchenTickets}
                onChange={(e) => setKitchenTickets(e.target.value)}
                className="onboarding-input"
                style={{
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '3rem'
                }}
              >
                <option value="" disabled>Select option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="form-field">
              <label>Service charge?</label>
              <select
                value={restaurantServiceCharge}
                onChange={(e) => setRestaurantServiceCharge(e.target.value)}
                className="onboarding-input"
                style={{
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '3rem'
                }}
              >
                <option value="" disabled>Select option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="form-field">
              <label>Number of tables (optional)</label>
              <input
                type="number"
                value={numberOfTables}
                onChange={(e) => setNumberOfTables(e.target.value)}
                placeholder="e.g., 10"
                className="onboarding-input"
                min="0"
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!canProceedStep3}
              className="onboarding-btn-primary w-full"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 4: UI Branding & Style */}
        {step === 4 && (
          <div className="onboarding-card fade-in-up">
            <button onClick={handleBack} className="back-button">
              ← Back
            </button>
            <div className="step-badge">Step 4 of 5</div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}>⭐</span>
              <h2 className="onboarding-title">UI Branding & Style</h2>
              <p className="onboarding-subtitle">
                Let us match your brand automatically
              </p>
            </div>

            <div className="prompt-input-container">
              {showUrlInput && websiteUrl && (
                <div className="url-attachment">
                  <span>🔗</span>
                  <span style={{ fontSize: '0.8125rem' }}>{websiteUrl}</span>
                  <button onClick={() => {
                    setWebsiteUrl('');
                    setShowUrlInput(false);
                  }}>
                    ✕
                  </button>
                </div>
              )}
              
              <textarea
                value={brandPrompt}
                onChange={(e) => {
                  setBrandPrompt(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                placeholder="Describe your brand style or ask anything..."
                rows={1}
              />
              
              <div className="prompt-actions">
                <button 
                  className="attach-button"
                  onClick={() => {
                    const url = prompt('Enter your website URL:');
                    if (url) {
                      setWebsiteUrl(url);
                      setShowUrlInput(true);
                      setBrandingChoice('url');
                    }
                  }}
                >
                  <span>+</span>
                  <span>Add URL</span>
                </button>
                
                <button
                  className="send-button"
                  disabled={!brandPrompt.trim() && !websiteUrl.trim()}
                  onClick={() => {
                    if (websiteUrl.trim() || brandPrompt.trim()) {
                      if (brandPrompt.trim()) {
                        setBrandingChoice('prompt');
                      }
                      handleNext();
                    }
                  }}
                >
                  →
                </button>
              </div>
            </div>

            <div style={{ 
              textAlign: 'center', 
              margin: '2rem 0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                background: '#e0e0e0'
              }}></div>
              <span style={{
                position: 'relative',
                background: '#ffffff',
                padding: '0 1rem',
                fontSize: '0.875rem',
                color: '#999999'
              }}>
                OR
              </span>
            </div>

            <button
              onClick={() => {
                setBrandingChoice('manual');
                handleNext();
              }}
              className="onboarding-btn-primary w-full"
              style={{ 
                background: 'transparent',
                color: '#1a1a1a',
                border: '1.5px solid #e0e0e0'
              }}
            >
              Choose Manually
            </button>

            <div style={{ 
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#f9f9f9',
              borderRadius: '0.5rem',
              fontSize: '0.8125rem',
              color: '#666666'
            }}>
              <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>💡 Examples:</p>
              <p style={{ marginBottom: '0.25rem' }}>• "Warm earthy cafe, beige background, dark brown text"</p>
              <p style={{ marginBottom: '0.25rem' }}>• "Modern minimalist restaurant, white and black"</p>
              <p>• "Vibrant colorful bakery with pastel tones"</p>
            </div>
          </div>
        )}

        {/* Step 5: Manual Color Selection or Confirmation */}
        {step === 5 && brandingChoice === 'manual' && (
          <div className="onboarding-card fade-in-up">
            <div className="step-badge">Step 5 of 5</div>
            <h2 className="onboarding-title">Choose your colors</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-3" style={{ color: '#666666' }}>
                Theme mode
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ 
                  flex: 1,
                  padding: '1rem',
                  border: `2px solid ${themeMode === 'light' ? '#1a1a1a' : '#e0e0e0'}`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="radio"
                    checked={themeMode === 'light'}
                    onChange={() => setThemeMode('light')}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>☀️</div>
                  <div style={{ fontWeight: '600', color: '#1a1a1a' }}>Light</div>
                </label>
                <label style={{ 
                  flex: 1,
                  padding: '1rem',
                  border: `2px solid ${themeMode === 'dark' ? '#1a1a1a' : '#e0e0e0'}`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="radio"
                    checked={themeMode === 'dark'}
                    onChange={() => setThemeMode('dark')}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌙</div>
                  <div style={{ fontWeight: '600', color: '#1a1a1a' }}>Dark</div>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#666666' }}>
                Primary color
              </label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{
                    width: '4rem',
                    height: '3rem',
                    border: '1.5px solid #e0e0e0',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="onboarding-input"
                  style={{ flex: 1 }}
                  placeholder="#1f2937"
                />
              </div>
            </div>

            <div style={{
              padding: '2rem',
              background: themeMode === 'light' ? '#f9fafb' : '#1a1a1a',
              borderRadius: '0.5rem',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              <p style={{ 
                fontSize: '0.875rem', 
                color: themeMode === 'light' ? '#666666' : '#999999',
                marginBottom: '1rem'
              }}>
                Preview
              </p>
              <button
                style={{
                  padding: '0.875rem 2rem',
                  background: primaryColor,
                  color: themeMode === 'light' ? '#ffffff' : '#0a0a0a',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'default'
                }}
              >
                Sample Button
              </button>
            </div>

            <button
              onClick={handleFinish}
              className="onboarding-btn-primary w-full"
            >
              Complete Setup
            </button>
          </div>
        )}

        {step === 5 && brandingChoice === 'url' && (
          <div className="onboarding-card fade-in-up text-center">
            <div className="step-badge">Step 5 of 5</div>
            
            {isGenerating ? (
              <>
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="onboarding-title">Your POS is being generated</h2>
                <p className="onboarding-subtitle">Analyzing your brand and setting up {businessName}...</p>
                <div className="flex justify-center items-center py-8">
                  <div className="onboarding-spinner"></div>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6">✨</div>
                <h2 className="onboarding-title">Ready to launch!</h2>
                <p className="onboarding-subtitle">Everything is set up and ready to go.</p>
                <button onClick={handleFinish} className="onboarding-btn-primary">
                  Go to Dashboard
                </button>
              </>
            )}
          </div>
        )}

        {/* Step Indicator */}
        <div className="step-indicator">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={clsx('step-dot', s === step && 'active')} />
          ))}
        </div>
      </div>
    </div>
  );
}
