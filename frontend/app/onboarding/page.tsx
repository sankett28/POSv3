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

  // Shared styles
  const cardStyle = {
    background: '#ffffff',
    borderRadius: '0.75rem',
    padding: '3rem 2.5rem',
    maxWidth: '520px',
    width: '100%',
    margin: '0 auto',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    animation: 'fadeInUp 0.3s ease'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '1.5px solid #e0e0e0',
    borderRadius: '0.375rem',
    fontSize: '0.9375rem',
    background: '#ffffff',
    color: '#1a1a1a',
    transition: 'all 0.2s ease',
    fontWeight: '400',
    outline: 'none',
    fontFamily: 'inherit'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    color: '#666666',
    fontWeight: '500',
    marginBottom: '0.5rem'
  };

  const buttonPrimaryStyle = {
    display: 'inline-block',
    padding: '0.875rem 1.75rem',
    borderRadius: '1.5rem',
    fontSize: '0.9375rem',
    fontWeight: '600',
    background: '#1a1a1a',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  };

  const backButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    background: '#1a1a1a',
    borderRadius: '1.5rem',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '1.5rem',
    border: 'none',
    fontFamily: 'inherit'
  };

  const stepBadgeStyle = {
    display: 'inline-block',
    padding: '0.375rem 1rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: '#f5f5f5',
    color: '#666666',
    marginBottom: '1.5rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    width: '100%',
    textAlign: 'center' as const,
    marginTop: '1rem'
  };

  const titleStyle = {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '0.75rem',
    lineHeight: '1.3',
    letterSpacing: '-0.01em'
  };

  const subtitleStyle = {
    fontSize: '0.9375rem',
    color: '#666666',
    marginBottom: '2rem',
    lineHeight: '1.5',
    fontWeight: '400'
  };

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
      
      // Removed: localStorage.setItem('onboarding_completed', 'true')
      // Backend now tracks onboarding status - no localStorage needed
      
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fafafa',
      padding: '2rem 1rem'
    }}>
      <style>{`
        .onboarding-input::placeholder {
          color: #999999 !important;
          opacity: 1;
        }
        .brand-textarea::placeholder {
          color: #999999 !important;
          opacity: 1;
        }
        .onboarding-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231a1a1a' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }
        select option:checked {
          background-color: #1a1a1a !important;
          color: #ffffff !important;
        }
        select option:hover {
          background-color: #f5f5f5 !important;
          color: #1a1a1a !important;
        }
        select:focus option:checked {
          background: #1a1a1a !important;
          color: #ffffff !important;
        }
        /* Remove blue highlight on select */
        select {
          accent-color: #1a1a1a;
        }
        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(0.5rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div className="w-full max-w-3xl px-4">
        <Modal
          isOpen={isUrlModalOpen}
          onClose={() => {
            setIsUrlModalOpen(false);
            setUrlError('');
          }}
          title="Add your website URL"
        >
          <div style={{ padding: '1.5rem 2rem 2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '0.5rem'
              }}>Website URL</label>
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
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  background: '#ffffff',
                  color: '#1a1a1a',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a1a1a';
                  e.target.style.boxShadow = '0 0 0 3px rgba(26, 26, 26, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {urlError && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }} role="alert">
                  <span>⚠</span>
                  <span>{urlError}</span>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
              marginTop: '1.5rem'
            }}>
              <button
                type="button"
                onClick={() => {
                  setIsUrlModalOpen(false);
                  setUrlError('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '1.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: '#1a1a1a',
                  color: '#ffffff',
                  border: 'none',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
              >
                Cancel
              </button>
              <button
                type="button"
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
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '1.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: '#1a1a1a',
                  color: '#ffffff',
                  border: 'none',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
              >
                Add URL
              </button>
            </div>
          </div>
        </Modal>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div style={{
            background: '#ffffff',
            borderRadius: '0.75rem',
            padding: '3rem 2.5rem',
            maxWidth: '520px',
            width: '100%',
            margin: '0 auto',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            animation: 'fadeInUp 0.3s ease',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '0.375rem 1rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: '#f5f5f5',
              color: '#666666',
              marginBottom: '1.5rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              width: '100%',
              marginTop: '1rem'
            }}>Step 1 of 5</div>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '0.75rem',
              lineHeight: '1.3',
              letterSpacing: '-0.01em'
            }}>Welcome to Garlic</h1>
            <p style={{
              fontSize: '0.9375rem',
              color: '#666666',
              marginBottom: '2rem',
              lineHeight: '1.5',
              fontWeight: '400'
            }}>
              Let's set up your POS in just a few steps.
            </p>
            <button onClick={handleNext} style={{
              display: 'inline-block',
              padding: '0.875rem 1.75rem',
              borderRadius: '1.5rem',
              fontSize: '0.9375rem',
              fontWeight: '600',
              background: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#000000'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}>
              Get Started
            </button>
          </div>
        )}

        {/* Step 2: Business Info */}
        {step === 2 && (
          <div style={{
            background: '#ffffff',
            borderRadius: '0.75rem',
            padding: '3rem 2.5rem',
            maxWidth: '520px',
            width: '100%',
            margin: '0 auto',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <button onClick={handleBack} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              background: '#1a1a1a',
              borderRadius: '1.5rem',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '1.5rem',
              border: 'none',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#000000'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}>
              ← Back
            </button>
            <div style={{
              display: 'inline-block',
              padding: '0.375rem 1rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: '#f5f5f5',
              color: '#666666',
              marginBottom: '1.5rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              width: '100%',
              textAlign: 'center',
              marginTop: '1rem'
            }}>Step 2 of 5</div>
            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '0.75rem',
              lineHeight: '1.3',
              letterSpacing: '-0.01em'
            }}>Tell us about your business.</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#666666',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>Business name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter business name"
                className="onboarding-input"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: '0.375rem',
                  fontSize: '0.9375rem',
                  background: '#ffffff',
                  color: '#1a1a1a',
                  transition: 'all 0.2s ease',
                  fontWeight: '400',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a1a1a';
                  e.target.style.boxShadow = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#666666',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>Business type</label>
              <select
                value={businessType || ''}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                className="onboarding-input onboarding-select"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: '0.375rem',
                  fontSize: '0.9375rem',
                  background: '#ffffff',
                  color: '#1a1a1a',
                  transition: 'all 0.2s ease',
                  fontWeight: '400',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a1a1a';
                  e.target.style.boxShadow = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="" disabled>Select business type</option>
                <option value="cafe">Café - Coffee shops & tea houses</option>
                <option value="restaurant">Restaurant - Dine-in & takeout</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#666666',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>What is your annual income?</label>
              <select
                value={revenue || ''}
                onChange={(e) => setRevenue(e.target.value as Revenue)}
                className="onboarding-input onboarding-select"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: '0.375rem',
                  fontSize: '0.9375rem',
                  background: '#ffffff',
                  color: '#1a1a1a',
                  transition: 'all 0.2s ease',
                  fontWeight: '400',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a1a1a';
                  e.target.style.boxShadow = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
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

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#666666',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>Do you have GST?</label>
              <select
                value={hasGST}
                onChange={(e) => {
                  setHasGST(e.target.value);
                  if (e.target.value === 'no') {
                    setGstNumber('');
                  }
                }}
                className="onboarding-input onboarding-select"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: '0.375rem',
                  fontSize: '0.9375rem',
                  background: '#ffffff',
                  color: '#1a1a1a',
                  transition: 'all 0.2s ease',
                  fontWeight: '400',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a1a1a';
                  e.target.style.boxShadow = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="" disabled>Select option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {hasGST === 'yes' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  color: '#666666',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>GSTIN Number</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5"
                  className="onboarding-input"
                  maxLength={15}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    border: '1.5px solid #e0e0e0',
                    borderRadius: '0.375rem',
                    fontSize: '0.9375rem',
                    background: '#ffffff',
                    color: '#1a1a1a',
                    transition: 'all 0.2s ease',
                    fontWeight: '400',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1a1a1a';
                    e.target.style.boxShadow = 'none';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={!canProceedStep2}
              style={{
                width: '100%',
                padding: '0.875rem 1.75rem',
                borderRadius: '1.5rem',
                fontSize: '0.9375rem',
                fontWeight: '600',
                background: canProceedStep2 ? '#1a1a1a' : '#666666',
                color: '#ffffff',
                border: 'none',
                cursor: canProceedStep2 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                opacity: canProceedStep2 ? 1 : 0.4,
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                if (canProceedStep2) e.currentTarget.style.background = '#000000';
              }}
              onMouseLeave={(e) => {
                if (canProceedStep2) e.currentTarget.style.background = '#1a1a1a';
              }}
            >
              Next
            </button>
          </div>
        )}

        {/* Step 3: Business Configuration */}
        {step === 3 && businessType === 'cafe' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '0.75rem',
            padding: '3rem 2.5rem',
            maxWidth: '520px',
            width: '100%',
            margin: '0 auto',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <button onClick={handleBack} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              background: '#1a1a1a',
              borderRadius: '1.5rem',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '1.5rem',
              border: 'none',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#000000'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}>
              ← Back
            </button>
            <div style={{
              display: 'inline-block',
              padding: '0.375rem 1rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: '#f5f5f5',
              color: '#666666',
              marginBottom: '1.5rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              width: '100%',
              textAlign: 'center',
              marginTop: '1rem'
            }}>Step 3 of 5</div>
            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '0.75rem',
              lineHeight: '1.3',
              letterSpacing: '-0.01em'
            }}>Configure your café</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#666666',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>Enable service charge?</label>
              <select
                value={serviceCharge}
                onChange={(e) => setServiceCharge(e.target.value)}
                className="onboarding-input onboarding-select"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: '0.375rem',
                  fontSize: '0.9375rem',
                  background: '#ffffff',
                  color: '#1a1a1a',
                  transition: 'all 0.2s ease',
                  fontWeight: '400',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a1a1a';
                  e.target.style.boxShadow = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="yes">Yes (Default)</option>
                <option value="no">No</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#666666',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>Counter billing or table billing?</label>
              <select
                value={billingType}
                onChange={(e) => setBillingType(e.target.value)}
                className="onboarding-input onboarding-select"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: '0.375rem',
                  fontSize: '0.9375rem',
                  background: '#ffffff',
                  color: '#1a1a1a',
                  transition: 'all 0.2s ease',
                  fontWeight: '400',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a1a1a';
                  e.target.style.boxShadow = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="" disabled>Select billing type</option>
                <option value="counter">Counter Billing</option>
                <option value="table">Table Billing</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#666666',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>Inclusive or exclusive prices?</label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="onboarding-input onboarding-select"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: '0.375rem',
                  fontSize: '0.9375rem',
                  background: '#ffffff',
                  color: '#1a1a1a',
                  transition: 'all 0.2s ease',
                  fontWeight: '400',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a1a1a';
                  e.target.style.boxShadow = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
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
              style={{
                width: '100%',
                padding: '0.875rem 1.75rem',
                borderRadius: '1.5rem',
                fontSize: '0.9375rem',
                fontWeight: '600',
                background: canProceedStep3 ? '#1a1a1a' : '#666666',
                color: '#ffffff',
                border: 'none',
                cursor: canProceedStep3 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                opacity: canProceedStep3 ? 1 : 0.4,
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                if (canProceedStep3) e.currentTarget.style.background = '#000000';
              }}
              onMouseLeave={(e) => {
                if (canProceedStep3) e.currentTarget.style.background = '#1a1a1a';
              }}
            >
              Next
            </button>
          </div>
        )}

        {step === 3 && businessType === 'restaurant' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '0.75rem',
            padding: '3rem 2.5rem',
            maxWidth: '520px',
            width: '100%',
            margin: '0 auto',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <button onClick={handleBack} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              background: '#1a1a1a',
              borderRadius: '1.5rem',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '1.5rem',
              border: 'none',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#000000'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}>
              ← Back
            </button>
            <div style={{
              display: 'inline-block',
              padding: '0.375rem 1rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: '#f5f5f5',
              color: '#666666',
              marginBottom: '1.5rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              width: '100%',
              textAlign: 'center',
              marginTop: '1rem'
            }}>Step 3 of 5</div>
            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '0.75rem',
              lineHeight: '1.3',
              letterSpacing: '-0.01em'
            }}>Configure your restaurant</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#666666',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>Table service?</label>
              <select
                value={tableService}
                onChange={(e) => setTableService(e.target.value)}
                className="onboarding-input onboarding-select"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: '0.375rem',
                  fontSize: '0.9375rem',
                  background: '#ffffff',
                  color: '#1a1a1a',
                  transition: 'all 0.2s ease',
                  fontWeight: '400',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a1a1a';
                  e.target.style.boxShadow = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="" disabled>Select option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#666666',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>Kitchen Order Tickets?</label>
              <select
                value={kitchenTickets}
                onChange={(e) => setKitchenTickets(e.target.value)}
                className="onboarding-input onboarding-select"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: '0.375rem',
                  fontSize: '0.9375rem',
                  background: '#ffffff',
                  color: '#1a1a1a',
                  transition: 'all 0.2s ease',
                  fontWeight: '400',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a1a1a';
                  e.target.style.boxShadow = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="" disabled>Select option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#666666',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>Service charge?</label>
              <select
                value={restaurantServiceCharge}
                onChange={(e) => setRestaurantServiceCharge(e.target.value)}
                className="onboarding-input onboarding-select"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: '0.375rem',
                  fontSize: '0.9375rem',
                  background: '#ffffff',
                  color: '#1a1a1a',
                  transition: 'all 0.2s ease',
                  fontWeight: '400',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a1a1a';
                  e.target.style.boxShadow = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="" disabled>Select option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#666666',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>Number of tables (optional)</label>
              <input
                type="number"
                value={numberOfTables}
                onChange={(e) => setNumberOfTables(e.target.value)}
                placeholder="e.g., 10"
                className="onboarding-input"
                min="0"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: '0.375rem',
                  fontSize: '0.9375rem',
                  background: '#ffffff',
                  color: '#1a1a1a',
                  transition: 'all 0.2s ease',
                  fontWeight: '400',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a1a1a';
                  e.target.style.boxShadow = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!canProceedStep3}
              style={{
                width: '100%',
                padding: '0.875rem 1.75rem',
                borderRadius: '1.5rem',
                fontSize: '0.9375rem',
                fontWeight: '600',
                background: canProceedStep3 ? '#1a1a1a' : '#666666',
                color: '#ffffff',
                border: 'none',
                cursor: canProceedStep3 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                opacity: canProceedStep3 ? 1 : 0.4,
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                if (canProceedStep3) e.currentTarget.style.background = '#000000';
              }}
              onMouseLeave={(e) => {
                if (canProceedStep3) e.currentTarget.style.background = '#1a1a1a';
              }}
            >
              Next
            </button>
          </div>
        )}

        {/* Step 4: UI Branding & Style */}
        {step === 4 && (
          <div style={{
            background: '#ffffff',
            borderRadius: '0.75rem',
            padding: '3rem 2.5rem',
            maxWidth: '520px',
            width: '100%',
            margin: '0 auto',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <button onClick={handleBack} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              background: '#1a1a1a',
              borderRadius: '1.5rem',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '1.5rem',
              border: 'none',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#000000'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}>
              ← Back
            </button>
            <div style={{
              display: 'inline-block',
              padding: '0.375rem 1rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: '#f5f5f5',
              color: '#666666',
              marginBottom: '1.5rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              width: '100%',
              textAlign: 'center',
              marginTop: '1rem'
            }}>Step 4 of 5</div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}>⭐</span>
              <h2 style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '0.75rem',
                lineHeight: '1.3',
                letterSpacing: '-0.01em'
              }}>UI Branding & Style</h2>
              <p style={{
                fontSize: '0.9375rem',
                color: '#666666',
                marginBottom: '0',
                lineHeight: '1.5',
                fontWeight: '400'
              }}>
                Let us match your brand automatically
              </p>
            </div>

            <div style={{
              position: 'relative',
              border: '1.5px solid #e0e0e0',
              borderRadius: '1.5rem',
              padding: '0.75rem 1rem',
              background: '#ffffff',
              transition: 'all 0.2s ease'
            }}>
              {showUrlInput && websiteUrl && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: '#f5f5f5',
                  borderRadius: '0.5rem',
                  fontSize: '0.8125rem',
                  color: '#1a1a1a',
                  marginTop: '0.5rem'
                }}>
                  <span>🔗</span>
                  <span style={{ fontSize: '0.8125rem' }}>{websiteUrl}</span>
                  <button onClick={() => {
                    setWebsiteUrl('');
                    setShowUrlInput(false);
                  }} style={{
                    background: 'none',
                    border: 'none',
                    color: '#666666',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
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
                className="brand-textarea"
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontSize: '0.9375rem',
                  color: '#1a1a1a',
                  background: 'transparent',
                  minHeight: '2.5rem',
                  maxHeight: '10rem',
                  fontFamily: 'inherit'
                }}
              />
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}>
                <button 
                  onClick={() => {
                    setUrlDraft(websiteUrl || '');
                    setUrlError('');
                    setIsUrlModalOpen(true);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: '#1a1a1a',
                    border: 'none',
                    borderRadius: '1.5rem',
                    fontSize: '0.8125rem',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#000000'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
                >
                  <span>+</span>
                  <span>Add URL</span>
                </button>
                
                <button
                  disabled={!brandPrompt.trim() && !websiteUrl.trim()}
                  onClick={() => {
                    if (websiteUrl.trim() || brandPrompt.trim()) {
                      if (brandPrompt.trim()) {
                        setBrandingChoice('prompt');
                      }
                      handleNext();
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2rem',
                    height: '2rem',
                    background: (!brandPrompt.trim() && !websiteUrl.trim()) ? '#666666' : '#1a1a1a',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    cursor: (!brandPrompt.trim() && !websiteUrl.trim()) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    marginLeft: 'auto',
                    opacity: (!brandPrompt.trim() && !websiteUrl.trim()) ? 0.3 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (brandPrompt.trim() || websiteUrl.trim()) e.currentTarget.style.background = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    if (brandPrompt.trim() || websiteUrl.trim()) e.currentTarget.style.background = '#1a1a1a';
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
              style={{ 
                width: '100%',
                padding: '0.875rem 1.75rem',
                borderRadius: '1.5rem',
                fontSize: '0.9375rem',
                fontWeight: '600',
                background: 'transparent',
                color: '#1a1a1a',
                border: '1.5px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Choose Manually
            </button>

            <button
              onClick={handleFinish}
              style={{ 
                width: '100%',
                padding: '0.875rem 1.75rem',
                borderRadius: '1.5rem',
                fontSize: '0.9375rem',
                fontWeight: '600',
                background: 'transparent',
                color: '#666666',
                border: '1.5px solid #e0e0e0',
                marginTop: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
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
          <div style={{ animation: 'fadeInUp 0.3s ease' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={handleBack} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                background: '#1a1a1a',
                borderRadius: '1.5rem',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: 'none',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#000000'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}>
                ← Back
              </button>
              <div style={{
                display: 'inline-block',
                padding: '0.375rem 1rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: '#f5f5f5',
                color: '#666666',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}>Step 5 of 5</div>
            </div>
            {/* Reuse the full ThemeEditor UI, like in Settings → Theme */}
            <div style={{
              background: '#ffffff',
              borderRadius: '0.5rem',
              border: '1px solid #e0e0e0',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}>
              <ThemeEditor />
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <button 
                onClick={handleFinish}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '1.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: '#1a1a1a',
                  color: '#ffffff',
                  border: 'none',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
              >
                Skip Theme Setup
              </button>
              <button 
                onClick={handleFinish} 
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '1.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: '#1a1a1a',
                  color: '#ffffff',
                  border: 'none',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
              >
                Continue to Orders
              </button>
            </div>
          </div>
        )}

        {step === 5 && brandingChoice === 'url' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '0.75rem',
            padding: '3rem 2.5rem',
            maxWidth: '520px',
            width: '100%',
            margin: '0 auto',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            animation: 'fadeInUp 0.3s ease',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '0.375rem 1rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: '#f5f5f5',
              color: '#666666',
              marginBottom: '1.5rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              width: '100%',
              textAlign: 'center',
              marginTop: '1rem'
            }}>Step 5 of 5</div>
            
            {isGenerating ? (
              <>
                <div style={{ fontSize: '3.75rem', marginBottom: '1.5rem' }}>🎉</div>
                <h2 style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  marginBottom: '0.75rem',
                  lineHeight: '1.3',
                  letterSpacing: '-0.01em'
                }}>Your POS is being generated</h2>
                <p style={{
                  fontSize: '0.9375rem',
                  color: '#666666',
                  marginBottom: '2rem',
                  lineHeight: '1.5',
                  fontWeight: '400'
                }}>Analyzing your brand and setting up {businessName}...</p>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    border: '3px solid #e0e0e0',
                    borderTopColor: '#1a1a1a',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></div>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3.75rem', marginBottom: '1.5rem' }}>✨</div>
                <h2 style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  marginBottom: '0.75rem',
                  lineHeight: '1.3',
                  letterSpacing: '-0.01em'
                }}>Ready to launch!</h2>
                <p style={{
                  fontSize: '0.9375rem',
                  color: '#666666',
                  marginBottom: '2rem',
                  lineHeight: '1.5',
                  fontWeight: '400'
                }}>Everything is set up and ready to go.</p>
                <button onClick={handleFinish} style={{
                  display: 'inline-block',
                  padding: '0.875rem 1.75rem',
                  borderRadius: '1.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  background: '#1a1a1a',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}>
                  Go to Dashboard
                </button>
              </>
            )}
          </div>
        )}

        {/* Step Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '2rem'
        }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} style={{
              width: s === step ? '1.5rem' : '0.375rem',
              height: '0.375rem',
              borderRadius: s === step ? '0.1875rem' : '50%',
              background: s === step ? '#1a1a1a' : '#d0d0d0',
              transition: 'all 0.2s ease',
              border: 'none',
              padding: 0,
              cursor: 'default'
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
