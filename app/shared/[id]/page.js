'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function SharedRecipe() {
  const { id } = useParams()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchRecipe = useCallback(async () => {
    try {
      const res = await fetch(`/api/recipes/${id}`)
      if (!res.ok) throw new Error('Recipe not found')
      const data = await res.json()
      setRecipe(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRecipe()
  }, [fetchRecipe])

  const submitRating = async () => {
    if (rating === 0) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/recipes/${id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      })
      if (!res.ok) throw new Error('Failed to submit rating')
      // Refresh recipe data to show updated ratings
      await fetchRecipe()
      setRating(0)
      setComment('')
    } catch (e) {
      alert(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
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
          max-width: 900px;
          margin: 0 auto;
          padding: 0 48px 100px;
        }

        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px 0 64px;
        }

        .back-btn {
          background: rgba(238,234,227,0.06);
          border: 1px solid rgba(238,234,227,0.1);
          color: rgba(238,234,227,0.45);
          padding: 9px 20px;
          border-radius: 100px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .back-btn:hover { background: rgba(238,234,227,0.1); color: #eeeae3; }

        .recipe-card {
          background: rgba(238,234,227,0.03);
          border: 1px solid rgba(238,234,227,0.08);
          border-radius: 16px;
          padding: 48px;
          margin-bottom: 32px;
        }

        .recipe-title {
          font-family: 'Instrument Serif', serif;
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #eeeae3;
        }

        .recipe-description {
          color: rgba(238,234,227,0.7);
          font-size: 18px;
          line-height: 1.6;
          margin-bottom: 48px;
        }

        .section-title {
          font-family: 'Instrument Serif', serif;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 24px;
          color: #eeeae3;
        }

        .ingredients-list {
          display: grid;
          gap: 12px;
        }

        .ingredient-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(238,234,227,0.02);
          border: 1px solid rgba(238,234,227,0.05);
          border-radius: 8px;
        }

        .ingredient-name { color: #eeeae3; }
        .ingredient-quantity { color: rgba(238,234,227,0.6); }

        .instructions-list {
          display: grid;
          gap: 16px;
        }

        .instruction-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .instruction-number {
          background: linear-gradient(145deg, #6ee7a0, #22c55e);
          color: #060608;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .instruction-text {
          color: rgba(238,234,227,0.8);
          line-height: 1.6;
          padding-top: 4px;
        }

        .rating-section {
          margin-top: 64px;
          padding-top: 48px;
          border-top: 1px solid rgba(238,234,227,0.08);
        }

        .rating-stars {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .star-btn {
          background: none;
          border: none;
          font-size: 32px;
          color: rgba(238,234,227,0.3);
          cursor: pointer;
          transition: color 0.2s;
        }
        .star-btn:hover, .star-btn.active { color: #fbbf24; }

        .rating-input {
          width: 100%;
          background: rgba(238,234,227,0.02);
          border: 1px solid rgba(238,234,227,0.08);
          border-radius: 8px;
          padding: 16px;
          color: #eeeae3;
          font-family: 'DM Sans', sans-serif;
          resize: vertical;
          margin-bottom: 24px;
        }
        .rating-input::placeholder { color: rgba(238,234,227,0.4); }
        .rating-input:focus { outline: none; border-color: #4ade80; }

        .submit-btn {
          background: linear-gradient(145deg, #6ee7a0, #22c55e);
          color: #060608;
          border: none;
          padding: 12px 32px;
          border-radius: 100px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(74,222,128,0.3); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ratings-summary {
          margin-top: 32px;
          padding: 24px;
          background: rgba(238,234,227,0.02);
          border: 1px solid rgba(238,234,227,0.05);
          border-radius: 12px;
        }

        .rating-display {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rating-star { color: #fbbf24; }
        .rating-score { font-weight: 600; color: #eeeae3; }
        .rating-count { color: rgba(238,234,227,0.6); }
      `}</style>
      <div className="bg-layer"></div>
      <div className="grain"></div>
      <div className="page">
        <header>
          <Link href="/" className="back-btn">← Back to Home</Link>
        </header>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-lg">Loading recipe...</p>
          </div>
        </div>
      </div>
    </>
  )
  if (error) return (
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
          max-width: 900px;
          margin: 0 auto;
          padding: 0 48px 100px;
        }

        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px 0 64px;
        }

        .back-btn {
          background: rgba(238,234,227,0.06);
          border: 1px solid rgba(238,234,227,0.1);
          color: rgba(238,234,227,0.45);
          padding: 9px 20px;
          border-radius: 100px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .back-btn:hover { background: rgba(238,234,227,0.1); color: #eeeae3; }
      `}</style>
      <div className="bg-layer"></div>
      <div className="grain"></div>
      <div className="page">
        <header>
          <Link href="/" className="back-btn">← Back to Home</Link>
        </header>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-400 text-xl">{error}</p>
        </div>
      </div>
    </>
  )
  if (!recipe) return (
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
          max-width: 900px;
          margin: 0 auto;
          padding: 0 48px 100px;
        }

        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px 0 64px;
        }

        .back-btn {
          background: rgba(238,234,227,0.06);
          border: 1px solid rgba(238,234,227,0.1);
          color: rgba(238,234,227,0.45);
          padding: 9px 20px;
          border-radius: 100px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .back-btn:hover { background: rgba(238,234,227,0.1); color: #eeeae3; }
      `}</style>
      <div className="bg-layer"></div>
      <div className="grain"></div>
      <div className="page">
        <header>
          <Link href="/" className="back-btn">← Back to Home</Link>
        </header>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl">Recipe not found</p>
        </div>
      </div>
    </>
  )

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
          max-width: 900px;
          margin: 0 auto;
          padding: 0 48px 100px;
        }

        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px 0 64px;
        }

        .back-btn {
          background: rgba(238,234,227,0.06);
          border: 1px solid rgba(238,234,227,0.1);
          color: rgba(238,234,227,0.45);
          padding: 9px 20px;
          border-radius: 100px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .back-btn:hover { background: rgba(238,234,227,0.1); color: #eeeae3; }

        .recipe-card {
          background: rgba(238,234,227,0.03);
          border: 1px solid rgba(238,234,227,0.08);
          border-radius: 16px;
          padding: 48px;
          margin-bottom: 32px;
        }

        .recipe-title {
          font-family: 'Instrument Serif', serif;
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #eeeae3;
        }

        .recipe-description {
          color: rgba(238,234,227,0.7);
          font-size: 18px;
          line-height: 1.6;
          margin-bottom: 48px;
        }

        .section-title {
          font-family: 'Instrument Serif', serif;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 24px;
          color: #eeeae3;
        }

        .ingredients-list {
          display: grid;
          gap: 12px;
        }

        .ingredient-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(238,234,227,0.02);
          border: 1px solid rgba(238,234,227,0.05);
          border-radius: 8px;
        }

        .ingredient-name { color: #eeeae3; }
        .ingredient-quantity { color: rgba(238,234,227,0.6); }

        .instructions-list {
          display: grid;
          gap: 16px;
        }

        .instruction-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .instruction-number {
          background: linear-gradient(145deg, #6ee7a0, #22c55e);
          color: #060608;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .instruction-text {
          color: rgba(238,234,227,0.8);
          line-height: 1.6;
          padding-top: 4px;
        }

        .rating-section {
          margin-top: 64px;
          padding-top: 48px;
          border-top: 1px solid rgba(238,234,227,0.08);
        }

        .rating-stars {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .star-btn {
          background: none;
          border: none;
          font-size: 32px;
          color: rgba(238,234,227,0.3);
          cursor: pointer;
          transition: color 0.2s;
        }
        .star-btn:hover, .star-btn.active { color: #fbbf24; }

        .rating-input {
          width: 100%;
          background: rgba(238,234,227,0.02);
          border: 1px solid rgba(238,234,227,0.08);
          border-radius: 8px;
          padding: 16px;
          color: #eeeae3;
          font-family: 'DM Sans', sans-serif;
          resize: vertical;
          margin-bottom: 24px;
        }
        .rating-input::placeholder { color: rgba(238,234,227,0.4); }
        .rating-input:focus { outline: none; border-color: #4ade80; }

        .submit-btn {
          background: linear-gradient(145deg, #6ee7a0, #22c55e);
          color: #060608;
          border: none;
          padding: 12px 32px;
          border-radius: 100px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(74,222,128,0.3); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ratings-summary {
          margin-top: 32px;
          padding: 24px;
          background: rgba(238,234,227,0.02);
          border: 1px solid rgba(238,234,227,0.05);
          border-radius: 12px;
        }

        .rating-display {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rating-star { color: #fbbf24; }
        .rating-score { font-weight: 600; color: #eeeae3; }
        .rating-count { color: rgba(238,234,227,0.6); }
      `}</style>
      <div className="bg-layer"></div>
      <div className="grain"></div>
      <div className="page">
        <header>
          <Link href="/" className="back-btn">← Back to Home</Link>
        </header>

        <div className="recipe-card">
          <h1 className="recipe-title">{recipe.title}</h1>
          <p className="recipe-description">{recipe.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
            <div>
              <h2 className="section-title">Ingredients</h2>
              <div className="ingredients-list">
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="ingredient-item">
                    <span className="ingredient-name">{ing.name}</span>
                    <span className="ingredient-quantity">{ing.quantity} {ing.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="section-title">Instructions</h2>
              <div className="instructions-list">
                {recipe.steps.map((step, i) => (
                  <div key={i} className="instruction-item">
                    <div className="instruction-number">{i + 1}</div>
                    <div className="instruction-text">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rating-section">
            <h3 className="section-title">Rate this recipe</h3>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`star-btn ${rating >= star ? 'active' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional comment..."
              className="rating-input"
              rows={3}
            />
            <button
              onClick={submitRating}
              disabled={rating === 0 || submitting}
              className="submit-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>

          {recipe.ratings_count > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">★</span>
                <span className="font-medium">{recipe.average_rating.toFixed(1)}</span>
                <span className="text-gray-500">({recipe.ratings_count} ratings)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}