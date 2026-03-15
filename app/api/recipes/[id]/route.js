import { supabase } from '../../../../lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }
  const { id } = await params

  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching recipe:', error)
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
  }
}