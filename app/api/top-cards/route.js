import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'

    // If requesting all categories, return all top cards
    if (category === 'all') {
      const { data, error } = await supabase
        .from('top_opportunities')
        .select('*')
        .order('generated_at', { ascending: false })
        .order('rank', { ascending: true })
        .limit(100)

      if (error) {
        console.error('Error fetching all top cards:', error)
        return NextResponse.json({ error: 'Failed to fetch top cards', details: error.message }, { status: 500 })
      }

      // Get only the most recent generation
      const latestGeneration = data[0]?.generated_at
      const latestCards = data.filter(card => card.generated_at === latestGeneration)

      return NextResponse.json({
        cards: latestCards || [],
        generatedAt: latestGeneration,
        cached: true,
      })
    }

    // Fetch top cards for specific category
    const { data, error } = await supabase
      .from('top_opportunities')
      .select('*')
      .eq('price_category', category)
      .order('generated_at', { ascending: false })
      .order('rank', { ascending: true })
      .limit(20)

    if (error) {
      console.error(`Error fetching top cards for ${category}:`, error)
      return NextResponse.json({ error: 'Failed to fetch top cards', details: error.message }, { status: 500 })
    }

    // Get only the most recent generation
    const latestGeneration = data[0]?.generated_at
    const latestCards = data.filter(card => card.generated_at === latestGeneration)

    return NextResponse.json({
      category,
      cards: latestCards || [],
      generatedAt: latestGeneration,
      cached: true,
    })

  } catch (error) {
    console.error('Top cards API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch top cards',
      details: error.message
    }, { status: 500 })
  }
}
