import { supabase } from '../../../../../lib/supabase'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request, { params }) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }
  const { id } = await params
  const { rating, comment } = await request.json()

  // Simple IP hashing for basic spam prevention
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex')

  try {
    // Insert rating
    const { error: ratingError } = await supabase
      .from('ratings')
      .insert({
        recipe_id: id,
        rating,
        comment: comment || null,
        ip_hash: ipHash
      })

    if (ratingError) throw ratingError

    // Update recipe ratings
    const { data: ratings, error: fetchError } = await supabase
      .from('ratings')
      .select('rating')
      .eq('recipe_id', id)

    if (fetchError) throw fetchError

    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    const ratingsCount = ratings.length

    const { error: updateError } = await supabase
      .from('recipes')
      .update({
        average_rating: averageRating,
        ratings_count: ratingsCount
      })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting rating:', error)
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 })
  }
}