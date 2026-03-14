# FridgeIQ

An AI-powered recipe generator. Take a photo of your fridge, and the app identifies your ingredients and generates a personalised recipe based on your dietary preferences.

## How it works

1. User takes a photo of their fridge
2. Gemini AI identifies the ingredients
3. Groq AI generates a recipe based on those ingredients and the user's dietary preferences
4. Recipe is displayed to the user

## Tech Stack

- **Next.js** — full stack framework (frontend + backend in one project)
- **Groq + Llama 3.3 70B** — recipe generation
- **Gemini 1.5 Flash** — ingredient detection from photos
- **Tailwind CSS** — styling

## Project Structure
```
app/
├── api/
│   ├── generate/route.js   ← recipe generation (Groq)
│   └── scan/route.js       ← image scanning (Gemini)
├── page.jsx                ← home page
components/                 ← reusable UI components
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

Create a `.env.local` file in the root of the project and add the following — get the actual keys from the team Discord:
```bash
GROQ_API_KEY=
GEMINI_API_KEY=
```

**5. Run the development server**
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/generate` | Takes ingredients and user profile, returns a recipe |
| POST | `/api/scan` | Takes a base64 image, returns a list of ingredients |

## Calling the API from the frontend
```js
const response = await fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ingredients: [{ name: "eggs", quantity: "3", unit: "pieces" }],
    profile: { dietary_mode: "maintain", allergies: [] }
  })
})
const recipe = await response.json()
```

## Team

| Name | Role |
|------|------|
| Arnob | Backend recipe generation |
| | Backend image scanning |
| | Frontend |