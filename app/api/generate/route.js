import Groq from "groq-sdk"
import { createSupabaseClient } from '../../../lib/supabase'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
  const { ingredients, profile, share } = await request.json()

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a personal chef AI. Generate a single recipe using the provided ingredients.
        Dietary mode: ${profile?.dietary_mode || "none"}
        Allergies to avoid: ${profile?.allergies?.join(", ") || "none"}
        
        Respond in this exact JSON structure:
        {
          "title": "Recipe name",
          "description": "One sentence description",
          "prepTime": 10,
          "cookTime": 20,
          "servings": 2,
          "ingredients": [{ "name": "", "quantity": "", "unit": "" }],
          "steps": ["Step 1...", "Step 2..."]
        }`
      },
      {
        role: "user",
        content: `Available ingredients: ${JSON.stringify(ingredients)}`
      }
    ]
  })

  const raw = response.choices[0].message.content.replace(/```json|```/g, "").trim()
  const recipe = JSON.parse(raw)

  // If share is true, save to Supabase
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
  const supabaseClient = createSupabaseClient(token)

  function getUserIdFromToken(token) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'))
      return payload?.sub ?? null
    } catch {
      return null
    }
  }

  if (share && supabaseClient) {
    try {
      const userId = token ? getUserIdFromToken(token) : null

      const insertPayload = {
        title: recipe.title,
        description: recipe.description,
        prep_time: recipe.prepTime,
        cook_time: recipe.cookTime,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        ratings_count: 0,
        average_rating: 0,
        ...(userId ? { user_id: userId } : {})
      }

      const { data, error } = await supabaseClient
        .from('recipes')
        .insert(insertPayload)
        .select('id')
        .single()

      if (!error) {
        recipe.sharedId = data.id
      } else if (error.code === 'PGRST204' || (error.message || '').includes('user_id')) {
        // Retry without `user_id` if schema hasn't been updated yet
        const { data: retryData, error: retryError } = await supabaseClient
          .from('recipes')
          .insert({
            title: recipe.title,
            description: recipe.description,
            prep_time: recipe.prepTime,
            cook_time: recipe.cookTime,
            servings: recipe.servings,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            ratings_count: 0,
            average_rating: 0,
          })
          .select('id')
          .single()

        if (!retryError) {
          recipe.sharedId = retryData.id
        }
      }
    } catch (error) {
      console.error('Error sharing recipe:', error)
      // Don't fail the request if sharing fails
    }
  }

  return Response.json(recipe)
}