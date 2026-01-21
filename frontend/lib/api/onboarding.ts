/**
 * Onboarding API client.
 * 
 * Handles submission of onboarding data to the backend.
 */

import { api } from '../api';

/**
 * Onboarding payload interface matching backend OnboardingRequest schema.
 * Note: Backend expects snake_case field names
 */
export interface OnboardingPayload {
  // Step 2: Business Info
  business_name: string;
  business_type: 'cafe' | 'restaurant' | 'cloud-kitchen';
  revenue: 'less-10l' | '10l-50l' | '50l-2cr' | '2cr-plus' | 'not-sure';
  has_gst: 'yes' | 'no';
  gst_number?: string;
  
  // Step 3: Cafe Configuration
  service_charge?: 'yes' | 'no';
  billing_type?: 'counter' | 'table';
  price_type?: 'inclusive' | 'exclusive';
  
  // Step 3: Restaurant Configuration
  table_service?: 'yes' | 'no';
  kitchen_tickets?: 'yes' | 'no';
  restaurant_service_charge?: 'yes' | 'no';
  number_of_tables?: number;
  
  // Step 4: Branding (optional - can be skipped)
  website_url?: string;
  brand_prompt?: string;
  branding_choice?: 'url' | 'prompt' | 'manual';
  
  // Step 5: Theme (optional - defaults applied if not provided)
  theme_mode?: 'light' | 'dark';
  primary_color?: string;
  secondary_color?: string;
  background_color?: string;
  foreground_color?: string;
  accent_color?: string;
  danger_color?: string;
  success_color?: string;
  warning_color?: string;
}

/**
 * Onboarding response interface matching backend OnboardingResponse schema.
 */
export interface OnboardingResponse {
  success: boolean;
  businessId: string;
  message: string;
}

/**
 * Parse error message from various formats into a readable string.
 * Handles objects, arrays of objects, and strings.
 */
function parseErrorMessage(data: any): string {
  // If it's already a string, return it
  if (typeof data === 'string') {
    return data;
  }
  
  // If it's null or undefined, return default message
  if (!data) {
    return 'Unknown error';
  }
  
  // Check for FastAPI/Pydantic validation error format (array of error objects)
  if (Array.isArray(data)) {
    const messages = data.map((err: any) => {
      if (typeof err === 'string') return err;
      
      // Pydantic validation error format
      if (err.loc && err.msg) {
        const field = Array.isArray(err.loc) ? err.loc.join('.') : err.loc;
        return `${field}: ${err.msg}`;
      }
      
      // Other formats
      if (err.msg) return err.msg;
      if (err.message) return err.message;
      if (err.field && err.msg) return `${err.field}: ${err.msg}`;
      if (err.field && err.message) return `${err.field}: ${err.message}`;
      
      return JSON.stringify(err);
    });
    return messages.join('; ');
  }
  
  // Check for common error object formats
  if (typeof data === 'object') {
    // FastAPI detail field (can be string or array)
    if (data.detail) {
      if (typeof data.detail === 'string') {
        return data.detail;
      }
      if (Array.isArray(data.detail)) {
        return parseErrorMessage(data.detail);
      }
      if (typeof data.detail === 'object') {
        return parseErrorMessage(data.detail);
      }
    }
    
    // Standard message field
    if (data.message) {
      return typeof data.message === 'string' ? data.message : parseErrorMessage(data.message);
    }
    
    // Error field
    if (data.error) {
      return typeof data.error === 'string' ? data.error : parseErrorMessage(data.error);
    }
    
    // If object has no recognizable fields, stringify it
    return JSON.stringify(data);
  }
  
  // Fallback
  return String(data);
}

/**
 * Submit complete onboarding data to the backend.
 * 
 * Creates business, configuration, and theme records.
 * Requires authentication token.
 * 
 * @param payload - Complete onboarding data from the form
 * @returns Promise resolving to OnboardingResponse with business_id
 * @throws Error if submission fails or validation errors occur
 * 
 * @example
 * ```typescript
 * const payload: OnboardingPayload = {
 *   business_name: "My Cafe",
 *   business_type: "cafe",
 *   revenue: "10l-50l",
 *   has_gst: "yes",
 *   gst_number: "22AAAAA0000A1Z5",
 *   service_charge: "yes",
 *   billing_type: "counter",
 *   price_type: "inclusive",
 *   branding_choice: "manual",
 *   theme_mode: "light",
 *   primary_color: "#912b48"
 * };
 * 
 * try {
 *   const response = await submitOnboarding(payload);
 *   console.log("Business created:", response.businessId);
 * } catch (error) {
 *   console.error("Onboarding failed:", error.message);
 * }
 * ```
 */
export async function submitOnboarding(
  payload: OnboardingPayload
): Promise<OnboardingResponse> {
  try {
    const response = await api.post<OnboardingResponse>(
      '/onboarding',
      payload
    );
    
    return response.data;
  } catch (error: any) {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const errorData = error.response.data;
      
      // Parse the error message properly
      const message = parseErrorMessage(errorData);
      
      if (status === 400) {
        // Validation error
        throw new Error(`Validation error: ${message}`);
      } else if (status === 401) {
        // Authentication error
        throw new Error('Authentication required. Please log in again.');
      } else if (status === 500) {
        // Server error
        throw new Error(`Server error: ${message}`);
      } else {
        throw new Error(`Error: ${message}`);
      }
    } else if (error.request) {
      // Request made but no response received (network error)
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      // Something else happened
      throw new Error(error.message || 'Failed to submit onboarding data');
    }
  }
}
