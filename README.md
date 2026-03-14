# FridgeIQ

An AI-powered recipe generator with community sharing. Take a photo of your fridge, and the app identifies your ingredients and generates a personalised recipe based on your dietary preferences. Share your creations with the community!

## How it works

1. User takes a photo of their fridge
2. Gemini AI identifies the ingredients
3. Groq AI generates a recipe based on those ingredients and the user's dietary preferences
4. Recipe is displayed to the user
5. Optionally share recipes with the community for ratings and discovery

## Features

- **AI Ingredient Detection** - Upload fridge photos to automatically identify ingredients
- **Personalized Recipes** - Generate recipes based on dietary preferences and allergies
- **Community Sharing** - Share recipes anonymously with the community
- **Recipe Ratings** - Rate and review shared recipes
- **Public Feed** - Browse recipes shared by other users

## Tech Stack

- **Next.js** — full stack framework (frontend + backend in one project)
- **Groq + Llama 3.3 70B** — recipe generation
- **Gemini 1.5 Flash** — ingredient detection from photos
- **Supabase** — database for shared recipes and ratings
- **Tailwind CSS** — styling

## Project Structure
```
app/
├── api/
│   ├── generate/route.js     ← recipe generation (Groq)
│   ├── recipes/route.js      ← shared recipes CRUD
│   ├── recipes/[id]/route.js ← individual recipe fetching
│   ├── recipes/[id]/rate/route.js ← recipe ratings
│   └── scan/route.js         ← image scanning (Gemini)
├── feed/page.js              ← public recipe feed
├── shared/[id]/page.js       ← shared recipe viewer
├── page.js                   ← home page
├── layout.js                 ← app layout
├── globals.css               ← global styles
lib/
└── supabase.js               ← database client
```

## Getting Started

**1. Clone the repo**
```bash
git clone your_repo_url
cd ai_recipe_app
```

**2. Install Node.js**

Download and install the LTS version from nodejs.org

**3. Install dependencies**
```bash
npm install
```

**4. Set up environment variables**

Create a `.env.local` file in the root of the project and add the following:
```bash
# AI API Keys
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key

# Supabase (for social features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

To enable the recipe sharing features, you need to set up a Supabase database. Follow these steps:

### 1. Create a Supabase Account and Project
1. Go to [supabase.com](https://supabase.com) and sign up for a free account
2. Click "New Project" in your dashboard
3. Choose your organization and enter a project name (e.g., "fridgeiq-recipes")
4. Select a database password (save this securely)
5. Choose a region closest to your users
6. Click "Create new project"

### 2. Set Up the Database Schema
1. Once your project is created, go to the "SQL Editor" tab in your Supabase dashboard
2. Copy the entire contents of the `supabase-setup.sql` file from your project root
3. Paste it into the SQL editor
4. Click "Run" to execute the SQL script

This will create:
- A `recipes` table to store shared recipes
- A `ratings` table for user ratings and comments
- Proper indexes for performance
- Row Level Security (RLS) policies allowing public access for sharing

### 3. Configure Environment Variables
1. In your Supabase dashboard, go to "Settings" → "API"
2. Copy the "Project URL" and "anon public" key
3. Add these to your `.env.local` file (as shown in step 4 above)

### 4. Verify Setup
- After running the dev server, visit your app's feed page (`/feed`) to see if recipes load
- Try creating a new recipe to test the sharing functionality
- Check the Supabase dashboard "Table Editor" to see if data is being stored

### Security Notes
- The current setup allows anonymous recipe sharing and rating
- In production, consider adding user authentication for better spam control
- The rating system uses IP hashing to prevent multiple ratings from the same IP

**5. Run the development server**
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/generate` | Takes ingredients, profile, and optional share flag, returns a recipe |
| POST | `/api/scan` | Takes a base64 image, returns a list of ingredients |
| POST | `/api/recipes` | Creates a new shared recipe |
| GET | `/api/recipes` | Fetches paginated list of shared recipes |
| GET | `/api/recipes/[id]` | Fetches a specific shared recipe |
| POST | `/api/recipes/[id]/rate` | Submits a rating for a shared recipe |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Main page - Upload fridge photo and generate recipes |
| `/feed` | Browse shared recipes from the community |
| `/create-recipe` | Create and share a custom recipe manually |
| `/shared/[id]` | View individual shared recipe with ratings |

## Calling the API from the frontend
```js
// Generate recipe (with optional sharing)
const response = await fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ingredients: [{ name: "eggs", quantity: "3", unit: "pieces" }],
    profile: { dietary_mode: "maintain", allergies: [] },
    share: true  // Optional: share recipe with community
  })
})
const recipe = await response.json()

// Create custom recipe manually
const createResponse = await fetch("/api/recipes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Custom Recipe Title",
    description: "Recipe description",
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    ingredients: [
      { name: "flour", quantity: "2", unit: "cups" },
      { name: "sugar", quantity: "1", unit: "cup" }
    ],
    steps: [
      "Mix dry ingredients",
      "Add wet ingredients",
      "Bake at 350°F for 30 minutes"
    ]
  })
})
const newRecipe = await createResponse.json()

// Fetch shared recipes
const feedResponse = await fetch("/api/recipes?limit=20&offset=0")
const recipes = await feedResponse.json()
```

## Team

| Name | Role |
|------|------|
| Arnob | Backend recipe generation |
| | Backend image scanning |
| | Frontend |