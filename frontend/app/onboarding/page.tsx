'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import Modal from '@/components/ui/Modal';
import ThemeEditor from '@/components/ui/ThemeEditor';
import { submitOnboarding, OnboardingPayload } from '@/lib/api/onboarding';

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
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [urlError, setUrlError] = useState<string>('');
  
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [primaryColor, setPrimaryColor] = useState('#1f2937');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load cached data from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem('onboarding_data');
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setBusinessName(data.businessName || '');
        setBusinessType(data.businessType || null);
        setRevenue(data.revenue || null);
        setHasGST(data.hasGST || '');
        setGstNumber(data.gstNumber || '');
        setServiceCharge(data.serviceCharge || 'yes');
        setBillingType(data.billingType || '');
        setPriceType(data.priceType || '');
        setTableService(data.tableService || '');
        setKitchenTickets(data.kitchenTickets || '');
        setRestaurantServiceCharge(data.restaurantServiceCharge || '');
        setNumberOfTables(data.numberOfTables || '');
        setWebsiteUrl(data.websiteUrl || '');
        setBrandPrompt(data.brandPrompt || '');
        setBrandingChoice(data.brandingChoice || null);
        setThemeMode(data.themeMode || 'light');
        setPrimaryColor(data.primaryColor || '#1f2937');
      } catch (e) {
        console.error('Failed to load cached onboarding data:', e);
      }
    }
  }, []);

  // Save to localStorage whenever form data changes
  useEffect(() => {
    const data = {
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
      brandPrompt,
      brandingChoice,
      themeMode,
      primaryColor,
    };
    localStorage.setItem('onboarding_data', JSON.stringify(data));
  }, [
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
    brandPrompt,
    brandingChoice,
    themeMode,
    primaryColor,
  ]);

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

  const handleFinish = async () => {
    setIsGenerating(true);
    
    try {
      // Validate required fields before submission
      if (!businessName || !businessType || !revenue || !hasGST) {
        throw new Error('Please complete all required fields in Step 2');
      }

      // Log the data being sent for debugging
      console.log('Submitting onboarding data:', {
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
        brandPrompt,
        brandingChoice,
        themeMode,
        primaryColor,
      });

      // Prepare onboarding payload with proper field names matching backend schema (snake_case)
      const payload: OnboardingPayload = {
        business_name: businessName.trim(),
        business_type: businessType as 'cafe' | 'restaurant' | 'cloud-kitchen',
        revenue: revenue as 'less-10l' | '10l-50l' | '50l-2cr' | '2cr-plus' | 'not-sure',
        has_gst: hasGST as 'yes' | 'no',
        gst_number: hasGST === 'yes' && gstNumber ? gstNumber.trim() : undefined,
        
        // Cafe fields
        service_charge: serviceCharge ? (serviceCharge as 'yes' | 'no') : undefined,
        billing_type: billingType ? (billingType as 'counter' | 'table') : undefined,
        price_type: priceType ? (priceType as 'inclusive' | 'exclusive') : undefined,
        
        // Restaurant fields
        table_service: tableService ? (tableService as 'yes' | 'no') : undefined,
        kitchen_tickets: kitchenTickets ? (kitchenTickets as 'yes' | 'no') : undefined,
        restaurant_service_charge: restaurantServiceCharge ? (restaurantServiceCharge as 'yes' | 'no') : undefined,
        number_of_tables: numberOfTables ? parseInt(numberOfTables) : undefined,
        
        // Branding (optional)
        website_url: websiteUrl ? websiteUrl.trim() : undefined,
        brand_prompt: brandPrompt ? brandPrompt.trim() : undefined,
        branding_choice: brandingChoice || undefined,
        
        // Theme (optional - backend will apply defaults)
        theme_mode: themeMode || undefined,
        primary_color: primaryColor || undefined,
        secondary_color: '#ffffff',
        background_color: themeMode === 'light' ? '#ffffff' : '#0a0a0a',
        foreground_color: themeMode === 'light' ? '#000000' : '#ffffff',
      };

      console.log('Payload being sent to API:', payload);
      
      // Submit to backend
      const response = await submitOnboarding(payload);
      
      console.log('Onboarding successful:', response);
      
      // Clear cached data after successful submission
      localStorage.removeItem('onboarding_data');
      
      // Mark onboarding as completed
      localStorage.setItem('onboarding_completed', 'true');
      
      // Redirect to orders page
      setTimeout(() => {
        router.push('/orders');
      }, 1500);
    } catch (error: any) {
      console.error('Onboarding failed:', error);
      setIsGenerating(false);
      
      // Handle authentication errors
      if (error.message && error.message.includes('Authentication')) {
        alert('Your session has expired. Please sign up again.');
        router.push('/signup');
        return;
      }
      
      // Show error to user
      alert(error.message || 'Failed to complete onboarding. Please try again.');
    }
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
        <Modal
          isOpen={isUrlModalOpen}
          onClose={() => {
            setIsUrlModalOpen(false);
            setUrlError('');
          }}
          title="Add your website URL"
        >
          <div className="onboarding-modal-body">
            <div className="form-field" style={{ marginBottom: '1rem' }}>
              <label>Website URL</label>
              <input
                className="onboarding-input"
                placeholder="example.com or https://example.com"
                value={urlDraft}
                onChange={(e) => {
                  setUrlDraft(e.target.value);
                  if (urlError) setUrlError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const raw = urlDraft.trim();
                    if (!raw) {
                      setUrlError('Please enter a URL.');
                      return;
                    }

                    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

                    try {
                      // eslint-disable-next-line no-new
                      new URL(normalized);
                    } catch {
                      setUrlError('Please enter a valid URL (e.g. example.com).');
                      return;
                    }

                    setWebsiteUrl(normalized);
                    setShowUrlInput(true);
                    setBrandingChoice('url');
                    setIsUrlModalOpen(false);
                    setUrlError('');
                  }
                }}
              />
              {urlError && (
                <div className="onboarding-modal-error" role="alert">
                  {urlError}
                </div>
              )}
            </div>

            <div className="onboarding-modal-actions">
              <button
                type="button"
                className="onboarding-btn-secondary"
                onClick={() => {
                  setIsUrlModalOpen(false);
                  setUrlError('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="onboarding-btn-primary"
                onClick={() => {
                  const raw = urlDraft.trim();
                  if (!raw) {
                    setUrlError('Please enter a URL.');
                    return;
                  }

                  const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

                  try {
                    // eslint-disable-next-line no-new
                    new URL(normalized);
                  } catch {
                    setUrlError('Please enter a valid URL (e.g. example.com).');
                    return;
                  }

                  setWebsiteUrl(normalized);
                  setShowUrlInput(true);
                  setBrandingChoice('url');
                  setIsUrlModalOpen(false);
                  setUrlError('');
                }}
              >
                Add URL
              </button>
            </div>
          </div>
        </Modal>

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
                className="onboarding-input onboarding-select"
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
                className="onboarding-input onboarding-select"
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
                className="onboarding-input onboarding-select"
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
                className="onboarding-input onboarding-select"
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
                className="onboarding-input onboarding-select"
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
                className="onboarding-input onboarding-select"
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
                className="onboarding-input onboarding-select"
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
                className="onboarding-input onboarding-select"
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
                className="onboarding-input onboarding-select"
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
                    setUrlDraft(websiteUrl || '');
                    setUrlError('');
                    setIsUrlModalOpen(true);
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

            <button
              onClick={handleFinish}
              className="onboarding-btn-primary w-full"
              style={{ 
                background: 'transparent',
                color: '#666666',
                border: '1.5px solid #e0e0e0',
                marginTop: '0.5rem'
              }}
            >
              Skip for Now
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

        {/* Step 5: Manual Color Selection - Full Theme Editor */}
        {step === 5 && brandingChoice === 'manual' && (
          <div className="fade-in-up">
            <div className="mb-4 flex items-center justify-between">
              <button onClick={handleBack} className="back-button">
                ← Back
              </button>
              <div className="step-badge">Step 5 of 5</div>
            </div>
            {/* Reuse the full ThemeEditor UI, like in Settings → Theme */}
            <div className="bg-white rounded-lg border border-border shadow-sm">
              <ThemeEditor />
            </div>
            <div className="mt-4 flex justify-between gap-3">
              <button 
                onClick={handleFinish}
                className="onboarding-btn-secondary flex-1"
              >
                Skip Theme Setup
              </button>
              <button 
                onClick={handleFinish} 
                className="onboarding-btn-primary flex-1"
              >
                Continue to Orders
              </button>
            </div>
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
