'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../components/AuthProvider'

export default function MyRecipes() {
  const { user, session } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setRecipes([])
      return
    }

    const fetchRecipes = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/recipes?mine=1`, {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        })
        if (!res.ok) throw new Error('Failed to fetch your recipes')
        const data = await res.json()
        setRecipes(data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [user, session])

  if (!user) {
    return (
      <div className="page">
        <h1>My recipes</h1>
        <p>Log in to see recipes you shared.</p>
        <Link href="/" className="back-btn">
          Back home
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>My recipes</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && recipes.length === 0 && (
        <p>You haven&apos;t shared any recipes yet. Try generating one from the home page.</p>
      )}
      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <Link key={recipe.id} href={`/shared/${recipe.id}`} className="recipe-card">
            <h2 className="recipe-title">{recipe.title}</h2>
            <p className="recipe-desc">{recipe.description}</p>
            <div className="meta">
              <span>{recipe.servings || 1} servings</span>
              <span>{recipe.prep_time || 0}m prep</span>
              <span>{recipe.cook_time || 0}m cook</span>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .page {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px 100px;
        }

        h1 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(42px, 6vw, 60px);
          margin-bottom: 16px;
          color: #eeeae3;
        }

        p {
          color: rgba(238, 234, 227, 0.7);
          font-size: 16px;
          margin-bottom: 22px;
        }

        .back-btn {
          display: inline-flex;
          padding: 10px 18px;
          border-radius: 999px;
          background: rgba(238, 234, 227, 0.06);
          border: 1px solid rgba(238, 234, 227, 0.1);
          color: rgba(238, 234, 227, 0.75);
          text-decoration: none;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .back-btn:hover {
          background: rgba(238, 234, 227, 0.12);
        }

        .recipes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          margin-top: 24px;
        }

        .recipe-card {
          background: rgba(238, 234, 227, 0.02);
          border: 1px solid rgba(238, 234, 227, 0.08);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
        }

        .recipe-card:hover {
          border-color: rgba(74, 222, 128, 0.25);
          background: rgba(238, 234, 227, 0.04);
          transform: translateY(-4px);
          box-shadow: 0 8px 40px rgba(74, 222, 128, 0.1);
        }

        .recipe-title {
          font-family: 'Instrument Serif', serif;
          font-size: 22px;
          margin-bottom: 10px;
          color: #eeeae3;
        }

        .recipe-desc {
          color: rgba(238, 234, 227, 0.65);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 13px;
          color: rgba(238, 234, 227, 0.55);
        }

        .error {
          color: #f87171;
          margin-top: 12px;
        }
      `}</style>
    </div>
  )
}
