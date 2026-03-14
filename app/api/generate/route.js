import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
  const { ingredients, profile } = await request.json()

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
  return Response.json(recipe)
}