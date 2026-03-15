'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

export default function Feed() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [offset, setOffset] = useState(0)
  const limit = 20

  const fetchRecipes = useCallback(async () => {
    try {
      const res = await fetch(`/api/recipes?limit=${limit}&offset=${offset}`)
      if (!res.ok) throw new Error('Failed to fetch recipes')
      const data = await res.json()
      setRecipes(prev => offset === 0 ? data : [...prev, ...data])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [offset])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  const loadMore = () => {
    setOffset(prev => prev + limit)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          background: #060608;
          color: #eeeae3;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        .bg-layer {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .bg-layer::before {
          content: '';
          position: absolute;
          top: -30%;
          left: -10%;
          width: 70%;
          height: 70%;
          background: radial-gradient(ellipse, rgba(74,222,128,0.09) 0%, transparent 65%);
          filter: blur(40px);
        }

        .bg-layer::after {
          content: '';
          position: absolute;
          bottom: -20%;
          right: -10%;
          width: 60%;
          height: 60%;
          background: radial-gradient(ellipse, rgba(250,204,21,0.055) 0%, transparent 65%);
          filter: blur(40px);
        }

        .grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 160px;
        }

        .page {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px 100px;
        }

        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px 0 64px;
        }

        .logo { display: flex; align-items: center; gap: 12px; }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(145deg, #6ee7a0, #22c55e);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 0 28px rgba(74,222,128,0.35), 0 2px 8px rgba(0,0,0,0.4);
        }

        .logo-name {
          font-family: 'Instrument Serif', serif;
          font-size: 24px;
          letter-spacing: -0.4px;
          color: #eeeae3;
        }

        .logo-name em { font-style: normal; color: #4ade80; }

        .create-btn {
          padding: 12px 24px;
          border-radius: 16px;
          background: linear-gradient(135deg, #4ade80 0%, #16a34a 100%);
          color: #060608;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border: none;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 4px 32px rgba(74,222,128,0.28), 0 1px 0 rgba(255,255,255,0.1) inset;
          letter-spacing: -0.3px;
          position: relative;
          overflow: hidden;
        }
        .create-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          pointer-events: none;
        }
        .create-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(74,222,128,0.4), 0 1px 0 rgba(255,255,255,0.1) inset; }

        .hero { margin-bottom: 52px; }

        .hero h1 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(52px, 7vw, 80px);
          line-height: 1.0;
          letter-spacing: -2px;
          margin-bottom: 16px;
          color: #eeeae3;
        }

        .hero h1 em {
          font-style: italic;
          color: #4ade80;
          text-shadow: 0 0 60px rgba(74,222,128,0.3);
        }

        .hero p {
          color: rgba(238,234,227,0.4);
          font-size: 18px;
          font-weight: 300;
          letter-spacing: -0.2px;
        }

        .recipes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }

        .recipe-card {
          background: rgba(238,234,227,0.02);
          border: 1px solid rgba(238,234,227,0.08);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .recipe-card:hover {
          border-color: rgba(74,222,128,0.25);
          background: rgba(238,234,227,0.04);
          transform: translateY(-4px);
          box-shadow: 0 8px 40px rgba(74,222,128,0.1);
        }

        .recipe-title {
          font-family: 'Instrument Serif', serif;
          font-size: 20px;
          font-weight: 500;
          letter-spacing: -0.5px;
          color: #eeeae3;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .recipe-desc {
          color: rgba(238,234,227,0.6);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .recipe-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: rgba(238,234,227,0.4);
        }

        .recipe-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #fbbf24;
        }

        .load-more-btn {
          width: 100%;
          padding: 18px;
          border-radius: 16px;
          border: 1px solid rgba(238,234,227,0.1);
          background: rgba(238,234,227,0.03);
          color: rgba(238,234,227,0.6);
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 24px;
        }
        .load-more-btn:hover {
          background: rgba(238,234,227,0.07);
          border-color: rgba(238,234,227,0.18);
          color: #eeeae3;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: rgba(238,234,227,0.3);
        }

        .empty-state h3 {
          font-family: 'Instrument Serif', serif;
          font-size: 28px;
          margin-bottom: 12px;
          color: rgba(238,234,227,0.5);
        }

        .loading-text {
          text-align: center;
          padding: 40px;
          color: rgba(238,234,227,0.3);
          font-size: 16px;
        }

        .error {
          color: #fca5a5;
          font-size: 14px;
          text-align: center;
          margin-bottom: 24px;
          padding: 12px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px;
        }

        @media (max-width: 640px) {
          .page { padding: 0 20px 80px; }
          .recipes-grid { grid-template-columns: 1fr; gap: 16px; }
          .recipe-card { padding: 20px; }
        }
      `}</style>

      <div className="bg-layer" />
      <div className="grain" />

      <div className="page">
        <header>
          <Link href="/" className="logo">
            <div className="logo-icon">🧊</div>
            <span className="logo-name">Fridge<em>IQ</em></span>
          </Link>
          <Link href="/create-recipe" className="create-btn">
            Create Recipe
          </Link>
        </header>

        <div className="hero">
          <h1>Discover<br /><em>recipes</em></h1>
          <p>Explore culinary creations shared by the community</p>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="recipes-grid">
          {recipes.map(recipe => (
            <Link key={recipe.id} href={`/shared/${recipe.id}`} className="recipe-card">
              <h2 className="recipe-title">{recipe.title}</h2>
              <p className="recipe-desc">{recipe.description}</p>
              <div className="recipe-meta">
                <span>{recipe.servings} servings • {recipe.prep_time + recipe.cook_time} min</span>
                {recipe.ratings_count > 0 && (
                  <div className="recipe-rating">
                    <span>★</span>
                    <span>{recipe.average_rating.toFixed(1)} ({recipe.ratings_count})</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {loading && <div className="loading-text">Loading recipes...</div>}

        {!loading && recipes.length >= limit && (
          <button onClick={loadMore} className="load-more-btn">
            Load More Recipes
          </button>
        )}

        {!loading && recipes.length === 0 && (
          <div className="empty-state">
            <h3>No recipes yet</h3>
            <p>Be the first to share a recipe with the community!</p>
          </div>
        )}
      </div>
    </>
  )
}