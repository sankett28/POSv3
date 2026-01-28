import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route: Extract Brand Colors
 * 
 * This endpoint calls the brand.dev API to extract brand colors from a website URL.
 * It acts as a proxy to keep the API key secure on the server side.
 */

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    console.log('🔍 Extract colors request received for URL:', url)

    if (!url) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Get brand.dev API key from environment variable
    const brandDevApiKey = process.env.BRAND_DEV_API_KEY

    console.log('🔑 API Key configured:', brandDevApiKey ? 'Yes' : 'No')

    if (!brandDevApiKey || brandDevApiKey === 'your_brand_dev_api_key_here') {
      console.error('❌ BRAND_DEV_API_KEY is not configured or still has placeholder value')
      return NextResponse.json(
        { 
          error: 'Color extraction service is not configured. Please add your brand.dev API key to .env.local',
          details: 'BRAND_DEV_API_KEY environment variable is missing or invalid'
        },
        { status: 500 }
      )
    }

    console.log('📡 Calling brand.dev API...')

    // Brand.dev API endpoint (from official documentation)
    // Endpoint: GET https://api.brand.dev/v1/brand/retrieve?domain=example.com
    // Documentation: https://docs.brand.dev/api-reference/retrieve-brand/retrieve-brand-data-by-domain
    
    // Extract domain from URL for the API call
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace('www.', '')
    
    // Correct brand.dev API endpoint
    const apiUrl = `https://api.brand.dev/v1/brand/retrieve?domain=${domain}`
    console.log('🌐 API URL:', apiUrl)

    const brandDevResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${brandDevApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    console.log('📊 brand.dev API response status:', brandDevResponse.status)

    // Log response headers for debugging
    const responseHeaders: Record<string, string> = {}
    brandDevResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })
    console.log('📋 Response headers:', responseHeaders)

    // Get response text first to handle both JSON and plain text responses
    const responseText = await brandDevResponse.text()
    console.log('📄 Response body:', responseText)

    if (!brandDevResponse.ok) {
      let errorData: any = {}
      
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText }
      }
      
      console.error('❌ brand.dev API error:', {
        status: brandDevResponse.status,
        statusText: brandDevResponse.statusText,
        errorData
      })
      
      let errorMessage = 'Failed to extract colors from website'
      
      if (brandDevResponse.status === 401) {
        errorMessage = 'Invalid brand.dev API key. Please check your configuration.'
      } else if (brandDevResponse.status === 403) {
        errorMessage = 'Access forbidden. The API endpoint may be incorrect. Please check brand.dev documentation at https://docs.brand.dev'
      } else if (brandDevResponse.status === 404) {
        errorMessage = 'Could not find brand colors for this website. Try a different URL.'
      } else if (brandDevResponse.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.'
      } else if (responseText.includes('does not exist')) {
        errorMessage = 'API endpoint not found. Please verify the correct brand.dev API endpoint in the documentation.'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorData,
          status: brandDevResponse.status,
          hint: 'Check https://docs.brand.dev for the correct API endpoint'
        },
        { status: brandDevResponse.status }
      )
    }

    let brandData: any
    try {
      brandData = JSON.parse(responseText)
    } catch {
      console.error('❌ Failed to parse response as JSON:', responseText)
      return NextResponse.json(
        { 
          error: 'Invalid response format from brand.dev API',
          details: { rawResponse: responseText }
        },
        { status: 500 }
      )
    }
    
    console.log('✅ brand.dev API response:', JSON.stringify(brandData, null, 2))

    // Map brand.dev response to our theme format
    // Brand.dev returns: { status: "ok", brand: { colors: [{ hex: "#...", name: "..." }], ... } }
    const colors = brandData.brand?.colors || []
    
    // Extract hex values from the colors array
    const colorHexValues = colors.map((c: any) => c.hex).filter(Boolean)
    
    console.log('🎨 Extracted color hex values:', colorHexValues)
    
    const extractedColors = {
      // Map the first few colors to our theme slots
      primary: colorHexValues[0] || '#912b48',
      secondary: colorHexValues[1] || '#ffffff',
      accent: colorHexValues[2] || '#b45a69',
      // Always use white background and black foreground
      background: '#ffffff',
      foreground: '#000000',
      // Keep default values for these
      danger: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b',
    }

    console.log('🎨 Mapped theme colors:', extractedColors)

    return NextResponse.json({
      success: true,
      colors: extractedColors,
      rawData: brandData, // Include raw data for debugging
    })

  } catch (error: any) {
    console.error('❌ Error extracting colors:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error while extracting colors',
        details: error.message
      },
      { status: 500 }
    )
  }
}
