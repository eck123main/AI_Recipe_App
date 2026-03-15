import { createSupabaseClient } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

function getAuthClient(request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
  return createSupabaseClient(token)
}

function getUserIdFromToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'))
    return payload?.sub ?? null
  } catch {
    return null
  }
}

export async function POST(request) {
  const supabase = getAuthClient(request)
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }
  try {
    const { title, description, prepTime, cookTime, servings, ingredients, steps } = await request.json()

    let userId = null
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
    if (token) {
      userId = getUserIdFromToken(token)
    }

    const insertPayload = {
      title,
      description,
      prep_time: prepTime,
      cook_time: cookTime,
      servings,
      ingredients,
      steps,
      ratings_count: 0,
      average_rating: 0,
      ...(userId ? { user_id: userId } : {})
    }

    const { data, error } = await supabase
      .from('recipes')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      // If the column doesn't exist yet, retry without user_id.
      if (error.code === 'PGRST204' || (error.message || '').includes('user_id')) {
        const { data: retryData, error: retryError } = await supabase
          .from('recipes')
          .insert({
            title,
            description,
            prep_time: prepTime,
            cook_time: cookTime,
            servings,
            ingredients,
            steps,
            ratings_count: 0,
            average_rating: 0,
          })
          .select()
          .single()

        if (retryError) throw retryError
        return NextResponse.json({ id: retryData.id })
      }

      throw error
    }

    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error('Error saving recipe:', error)
    return NextResponse.json({ error: 'Failed to save recipe' }, { status: 500 })
  }
}

export async function GET(request) {
  const supabase = getAuthClient(request)
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit')) || 20
  const offset = parseInt(searchParams.get('offset')) || 0
  const mine = searchParams.get('mine') === '1'

  try {
    let query = supabase.from('recipes').select('*').order('created_at', { ascending: false })

    if (mine) {
      const authHeader = request.headers.get('authorization') || ''
      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
      const userId = token ? getUserIdFromToken(token) : null
      if (!userId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
      }
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
  }
}