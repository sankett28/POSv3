import { NextRequest, NextResponse } from 'next/server'

/**
 * Test endpoint to verify brand.dev API configuration
 */

export async function GET(request: NextRequest) {
  const testUrl = 'https://www.starbucks.com'
  const testDomain = 'starbucks.com'
  
  try {
    const brandDevApiKey = process.env.BRAND_DEV_API_KEY

    console.log('Testing brand.dev API...')
    console.log('API Key present:', !!brandDevApiKey)
    console.log('API Key length:', brandDevApiKey?.length)
    console.log('API Key prefix:', brandDevApiKey?.substring(0, 10))

    if (!brandDevApiKey || brandDevApiKey === 'your_brand_dev_api_key_here') {
      return NextResponse.json({
        error: 'API key not configured',
        configured: false
      })
    }

    // Test the brand.dev API with correct endpoint
    // Endpoint: GET https://api.brand.dev/v1/brand/retrieve?domain=starbucks.com
    const response = await fetch(`https://api.brand.dev/v1/brand/retrieve?domain=${testDomain}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${brandDevApiKey}`,
        'Content-Type': 'application/json',
      },
    })

    const responseText = await response.text()
    let responseData
    
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { rawResponse: responseText }
    }

    return NextResponse.json({
      configured: true,
      testUrl,
      testDomain,
      endpoint: `https://api.brand.dev/v1/brand/retrieve?domain=${testDomain}`,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      response: responseData,
      success: response.ok
    })

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
