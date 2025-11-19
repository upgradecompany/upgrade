import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
    }

    // Check cache first
    const { data: cachedCard, error: cacheError } = await supabase
      .from('card_cache')
      .select('*')
      .eq('query', query)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (cachedCard && !cacheError) {
      console.log('Cache hit for:', query)

      // If sales history is empty (due to rate limits), return empty arrays
      // CardService will generate mock data on the frontend
      const rawSalesHistory = Array.isArray(cachedCard.raw_sales_history) ? cachedCard.raw_sales_history : []
      const psa10SalesHistory = Array.isArray(cachedCard.psa10_sales_history) ? cachedCard.psa10_sales_history : []

      return NextResponse.json({
        query: cachedCard.query,
        rawPrice: parseFloat(cachedCard.raw_price),
        psa10Price: parseFloat(cachedCard.psa10_price),
        imageUrl: cachedCard.image_url,
        rawResults: cachedCard.raw_results || [],
        psa10Results: cachedCard.psa10_results || [],
        rawSalesHistory,
        psa10SalesHistory,
        cached: true,
      })
    }

    console.log('Cache miss for:', query, '- fetching from eBay')

    const CLIENT_ID = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID
    const CLIENT_SECRET = process.env.NEXT_PUBLIC_EBAY_CLIENT_SECRET

    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.warn('eBay credentials not configured')
      return NextResponse.json({ error: 'eBay API not configured' }, { status: 503 })
    }

    // Get OAuth token
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

    const tokenResponse = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('eBay OAuth error:', errorText)
      return NextResponse.json({ error: 'Failed to authenticate with eBay' }, { status: 500 })
    }

    const { access_token } = await tokenResponse.json()

    // Search for current listings and fetch sold listings separately
    const [rawData, psa10Data, soldDataResponse] = await Promise.all([
      // Raw card search - current listings
      fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&category_ids=212&filter=buyingOptions:{FIXED_PRICE|AUCTION},itemLocationCountry:US&limit=20`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      }),
      // PSA 10 search - current listings
      fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query + ' PSA 10')}&category_ids=212&filter=buyingOptions:{FIXED_PRICE|AUCTION},itemLocationCountry:US&limit=20`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      }),
      // Get sold listings from our Finding API endpoint
      fetch(`http://localhost:3000/api/ebay/sold?q=${encodeURIComponent(query)}`)
    ])

    const rawResults = await rawData.json()
    const psa10Results = await psa10Data.json()
    const soldData = await soldDataResponse.json()

    // Calculate average prices
    const calculateAvgPrice = (items) => {
      if (!items || items.length === 0) return 0
      const prices = items
        .map(item => parseFloat(item.price?.value || 0))
        .filter(p => p > 0)
      return prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0
    }

    const rawPrice = calculateAvgPrice(rawResults.itemSummaries)
    const psa10Price = calculateAvgPrice(psa10Results.itemSummaries)

    // Get first image if available - prioritize PSA 10 images
    const firstItem = psa10Results.itemSummaries?.[0] || rawResults.itemSummaries?.[0]
    const imageUrl = firstItem?.image?.imageUrl || 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800'

    // Use sold listings from Finding API endpoint
    const rawSalesHistory = soldData.rawSalesHistory || []
    const psa10SalesHistory = soldData.psa10SalesHistory || []

    const finalRawPrice = Math.round(rawPrice * 100) / 100
    const finalPsa10Price = Math.round(psa10Price * 100) / 100
    const gradingCost = 100
    const profitMargin = finalPsa10Price - finalRawPrice - gradingCost
    const roiPercentage = finalRawPrice > 0 ? (profitMargin / finalRawPrice) * 100 : 0

    // Save to cache for future requests
    try {
      const { error: insertError } = await supabase
        .from('card_cache')
        .upsert({
          query,
          raw_price: finalRawPrice,
          psa10_price: finalPsa10Price,
          profit_margin: profitMargin,
          roi_percentage: roiPercentage,
          grading_cost: gradingCost,
          image_url: imageUrl,
          raw_sales_history: rawSalesHistory,
          psa10_sales_history: psa10SalesHistory,
          raw_results: rawResults.itemSummaries || [],
          psa10_results: psa10Results.itemSummaries || [],
          cached_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        }, {
          onConflict: 'query'
        })

      if (insertError) {
        console.error('Failed to cache card data:', insertError)
      } else {
        console.log('Cached card data for:', query)
      }
    } catch (cacheInsertError) {
      console.error('Cache insert error:', cacheInsertError)
    }

    return NextResponse.json({
      query,
      rawPrice: finalRawPrice,
      psa10Price: finalPsa10Price,
      imageUrl,
      rawResults: rawResults.itemSummaries || [],
      psa10Results: psa10Results.itemSummaries || [],
      rawSalesHistory,
      psa10SalesHistory,
      cached: false,
    })

  } catch (error) {
    console.error('eBay API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch from eBay',
      details: error.message
    }, { status: 500 })
  }
}
