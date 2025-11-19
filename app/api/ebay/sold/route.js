import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
    }

    const CLIENT_ID = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID

    if (!CLIENT_ID) {
      return NextResponse.json({ error: 'eBay API not configured' }, { status: 503 })
    }

    // Finding API doesn't use OAuth - it uses App ID directly in the URL

    // Use Finding API to get sold listings (last 90 days)
    // Finding API uses a different format (XML)
    const findingSoldUrl = `https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findCompletedItems&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=${CLIENT_ID}&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&keywords=${encodeURIComponent(query)}&categoryId=212&itemFilter(0).name=SoldItemsOnly&itemFilter(0).value=true&sortOrder=EndTimeSoonest&paginationInput.entriesPerPage=20`

    const findingPSA10Url = `https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findCompletedItems&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=${CLIENT_ID}&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&keywords=${encodeURIComponent(query + ' PSA 10')}&categoryId=212&itemFilter(0).name=SoldItemsOnly&itemFilter(0).value=true&sortOrder=EndTimeSoonest&paginationInput.entriesPerPage=20`

    const [rawSoldResponse, psa10SoldResponse] = await Promise.all([
      fetch(findingSoldUrl),
      fetch(findingPSA10Url)
    ])

    const rawSoldData = await rawSoldResponse.json()
    const psa10SoldData = await psa10SoldResponse.json()

    // Check for rate limit errors
    const checkForErrors = (data) => {
      if (data.errorMessage) {
        const error = data.errorMessage[0]?.error?.[0]
        if (error) {
          console.warn('eBay API Error:', error.message?.[0])
          return error
        }
      }
      return null
    }

    const rawError = checkForErrors(rawSoldData)
    const psa10Error = checkForErrors(psa10SoldData)

    // If rate limited, return empty arrays (will fall back to mock data on frontend)
    if (rawError || psa10Error) {
      console.warn('eBay API rate limited or error occurred. Returning empty results.')
      return NextResponse.json({
        query,
        rawSalesHistory: [],
        psa10SalesHistory: [],
        error: 'eBay API temporarily unavailable (rate limit exceeded)',
      })
    }

    // Parse Finding API response
    const formatFindingItems = (data) => {
      const items = data.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item || []

      return items.map(item => ({
        date: item.listingInfo?.[0]?.endTime?.[0]
          ? new Date(item.listingInfo[0].endTime[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Unknown',
        price: parseFloat(item.sellingStatus?.[0]?.convertedCurrentPrice?.[0]?.__value__ || 0),
        platform: 'eBay',
        id: item.itemId?.[0] || Math.random().toString(36).substr(2, 9),
        title: item.title?.[0] || '',
      })).filter(item => item.price > 0) // Only include items with valid prices
    }

    const rawSalesHistory = formatFindingItems(rawSoldData)
    const psa10SalesHistory = formatFindingItems(psa10SoldData)

    return NextResponse.json({
      query,
      rawSalesHistory,
      psa10SalesHistory,
    })

  } catch (error) {
    console.error('eBay sold listings error:', error)
    return NextResponse.json({
      error: 'Failed to fetch sold listings from eBay',
      details: error.message
    }, { status: 500 })
  }
}
