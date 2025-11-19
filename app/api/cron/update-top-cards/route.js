import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    console.log('=== Starting Daily Top Cards Update ===')
    const startTime = Date.now()

    // Get all user-searched cards, ordered by popularity
    const { data: searchedCards, error: searchError } = await supabase
      .from('searched_cards')
      .select('query, search_count')
      .order('search_count', { ascending: false })
      .order('last_searched_at', { ascending: false })
      .limit(200)

    if (searchError) {
      console.error('Error fetching searched cards:', searchError)
      return NextResponse.json({ error: 'Failed to fetch searched cards' }, { status: 500 })
    }

    if (!searchedCards || searchedCards.length === 0) {
      console.log('No searched cards found. Using seed list.')
      // Use a seed list of popular cards
      searchedCards.push(
        { query: 'Michael Jordan 1986 Fleer', search_count: 100 },
        { query: 'LeBron James 2003 Topps Chrome', search_count: 90 },
        { query: 'Tom Brady 2000 Playoff Contenders', search_count: 85 },
        { query: 'Patrick Mahomes 2017 Panini Prizm', search_count: 80 },
        { query: 'Luka Doncic 2018 Panini Prizm', search_count: 75 },
        { query: 'Mike Trout 2011 Topps Update', search_count: 70 },
        { query: 'Shohei Ohtani 2018 Topps Chrome', search_count: 65 },
        { query: 'Giannis Antetokounmpo 2013 Panini Prizm', search_count: 60 },
        { query: 'Justin Herbert 2020 Panini Prizm', search_count: 55 },
        { query: 'Ja Morant 2019 Panini Prizm', search_count: 50 },
      )
    }

    console.log(`Found ${searchedCards.length} cards to scan`)

    // Fetch card data for each (will use cache where available)
    const cardResults = []
    let apiCalls = 0
    let cacheHits = 0

    for (const searchedCard of searchedCards) {
      try {
        // Call our own API endpoint which has caching built in
        const response = await fetch(
          `${request.url.origin}/api/ebay/search?q=${encodeURIComponent(searchedCard.query)}`
        )

        if (response.ok) {
          const cardData = await response.json()

          if (cardData.cached) {
            cacheHits++
          } else {
            apiCalls++
          }

          // Only include cards with valid prices
          if (cardData.rawPrice > 0 && cardData.psa10Price > 0) {
            const gradingCost = 100
            const profitMargin = cardData.psa10Price - cardData.rawPrice - gradingCost
            const roiPercentage = (profitMargin / cardData.rawPrice) * 100

            cardResults.push({
              query: cardData.query,
              rawPrice: cardData.rawPrice,
              psa10Price: cardData.psa10Price,
              profitMargin,
              roiPercentage,
              imageUrl: cardData.imageUrl,
            })
          }
        } else {
          console.warn(`Failed to fetch card: ${searchedCard.query}`)
        }

        // Add small delay to avoid rate limiting (only for non-cached requests)
        if (apiCalls % 10 === 0 && apiCalls > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

      } catch (error) {
        console.error(`Error fetching card ${searchedCard.query}:`, error.message)
      }
    }

    console.log(`Scanned ${cardResults.length} cards (${apiCalls} API calls, ${cacheHits} cache hits)`)

    // Group cards by price category and get top 20 for each
    const categories = {
      under50: [],
      under200: [],
      under500: [],
      under2000: [],
      over2000: [],
    }

    for (const card of cardResults) {
      if (card.rawPrice < 50) {
        categories.under50.push(card)
      } else if (card.rawPrice < 200) {
        categories.under200.push(card)
      } else if (card.rawPrice < 500) {
        categories.under500.push(card)
      } else if (card.rawPrice < 2000) {
        categories.under2000.push(card)
      } else {
        categories.over2000.push(card)
      }
    }

    // Sort each category by profit margin (descending) and take top 20
    const generatedAt = new Date().toISOString()
    const topCardsToInsert = []

    for (const [categoryName, cards] of Object.entries(categories)) {
      const sortedCards = cards
        .sort((a, b) => b.profitMargin - a.profitMargin)
        .slice(0, 20)

      sortedCards.forEach((card, index) => {
        topCardsToInsert.push({
          price_category: categoryName,
          rank: index + 1,
          query: card.query,
          raw_price: card.rawPrice,
          psa10_price: card.psa10Price,
          profit_margin: card.profitMargin,
          roi_percentage: card.roiPercentage,
          image_url: card.imageUrl,
          grading_cost: 100,
          generated_at: generatedAt,
        })
      })

      console.log(`${categoryName}: ${sortedCards.length} cards`)
    }

    // Delete old top cards (keep last 7 days for history)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    await supabase
      .from('top_opportunities')
      .delete()
      .lt('generated_at', sevenDaysAgo)

    // Insert new top cards
    if (topCardsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('top_opportunities')
        .insert(topCardsToInsert)

      if (insertError) {
        console.error('Error inserting top cards:', insertError)
        return NextResponse.json({ error: 'Failed to save top cards' }, { status: 500 })
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    const summary = {
      success: true,
      cardsScanned: cardResults.length,
      apiCalls,
      cacheHits,
      topCardsGenerated: topCardsToInsert.length,
      generatedAt,
      durationSeconds: duration,
      breakdown: {
        under50: categories.under50.length,
        under200: categories.under200.length,
        under500: categories.under500.length,
        under2000: categories.under2000.length,
        over2000: categories.over2000.length,
      }
    }

    console.log('=== Daily Update Complete ===')
    console.log(JSON.stringify(summary, null, 2))

    return NextResponse.json(summary)

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({
      error: 'Cron job failed',
      details: error.message
    }, { status: 500 })
  }
}
