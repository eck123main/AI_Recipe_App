'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../components/AuthProvider'

export default function CreateRecipe() {
  const router = useRouter()
  const { session } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    ingredients: [{ name: '', quantity: '', unit: '' }],
    steps: ['']
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index][field] = value
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }))
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }]
    }))
  }

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }))
    }
  }

  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps]
    newSteps[index] = value
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }))
  }

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }))
  }

  const removeStep = (index) => {
    if (formData.steps.length > 1) {
      setFormData(prev => ({
        ...prev,
        steps: prev.steps.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Filter out empty ingredients and steps
      const cleanedIngredients = formData.ingredients.filter(ing =>
        ing.name.trim() || ing.quantity.trim() || ing.unit.trim()
      )
      const cleanedSteps = formData.steps.filter(step => step.trim())

      const recipeData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        prepTime: parseInt(formData.prepTime) || 0,
        cookTime: parseInt(formData.cookTime) || 0,
        servings: parseInt(formData.servings) || 1,
        ingredients: cleanedIngredients,
        steps: cleanedSteps
      }

      const headers = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers,
        body: JSON.stringify(recipeData)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create recipe')
      }

      const data = await res.json()
      router.push(`/shared/${data.id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
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
        }
        .back-btn:hover { background: rgba(238,234,227,0.1); color: #eeeae3; }

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

        .form-container {
          background: rgba(238,234,227,0.02);
          border: 1px solid rgba(238,234,227,0.08);
          border-radius: 24px;
          padding: 48px;
          backdrop-filter: blur(20px);
        }

        .form-section { margin-bottom: 40px; }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: rgba(238,234,227,0.28);
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .form-group { margin-bottom: 24px; }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: rgba(238,234,227,0.7);
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 16px 20px;
          background: rgba(238,234,227,0.03);
          border: 1px solid rgba(238,234,227,0.1);
          border-radius: 16px;
          color: #eeeae3;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: rgba(74,222,128,0.4);
          background: rgba(238,234,227,0.06);
          box-shadow: 0 0 0 3px rgba(74,222,128,0.1);
        }
        .form-input::placeholder { color: rgba(238,234,227,0.25); }

        .form-textarea {
          min-height: 120px;
          resize: vertical;
        }

        .ingredient-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          align-items: center;
        }

        .ingredient-input {
          flex: 1;
          padding: 12px 16px;
          background: rgba(238,234,227,0.03);
          border: 1px solid rgba(238,234,227,0.1);
          border-radius: 12px;
          color: #eeeae3;
          font-size: 14px;
          transition: all 0.2s;
        }
        .ingredient-input:focus {
          outline: none;
          border-color: rgba(74,222,128,0.4);
          background: rgba(238,234,227,0.06);
        }
        .ingredient-input::placeholder { color: rgba(238,234,227,0.25); }

        .quantity-input { width: 80px; }
        .unit-input { width: 70px; }

        .remove-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .remove-btn:hover { background: rgba(239,68,68,0.2); }

        .add-btn {
          padding: 10px 20px;
          border-radius: 12px;
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.3);
          color: #4ade80;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }
        .add-btn:hover { background: rgba(74,222,128,0.2); }

        .step-row {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          align-items: flex-start;
        }

        .step-num {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(74,222,128,0.15);
          border: 1px solid rgba(74,222,128,0.3);
          color: #4ade80;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .step-textarea {
          flex: 1;
          min-height: 80px;
          padding: 12px 16px;
          background: rgba(238,234,227,0.03);
          border: 1px solid rgba(238,234,227,0.1);
          border-radius: 12px;
          color: #eeeae3;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          resize: vertical;
          transition: all 0.2s;
        }
        .step-textarea:focus {
          outline: none;
          border-color: rgba(74,222,128,0.4);
          background: rgba(238,234,227,0.06);
        }
        .step-textarea::placeholder { color: rgba(238,234,227,0.25); }

        .btn-primary {
          width: 100%;
          padding: 20px;
          border-radius: 18px;
          background: linear-gradient(135deg, #4ade80 0%, #16a34a 100%);
          color: #060608;
          font-size: 17px;
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
        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          pointer-events: none;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(74,222,128,0.4), 0 1px 0 rgba(255,255,255,0.1) inset; }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.2; cursor: not-allowed; transform: none; box-shadow: none; }

        .error {
          color: #fca5a5;
          font-size: 13px;
          text-align: center;
          margin-bottom: 16px;
          padding: 12px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px;
        }

        @media (max-width: 640px) {
          .page { padding: 0 20px 80px; }
          .form-container { padding: 32px 24px; }
          .ingredient-row { flex-direction: column; gap: 8px; }
          .step-row { flex-direction: column; gap: 8px; }
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
          <Link href="/feed" className="back-btn">Browse recipes</Link>
        </header>

        <div className="hero">
          <h1>Create your own<br /><em>recipe</em></h1>
          <p>Share your culinary creations with the community</p>
        </div>

        <div className="form-container">
          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-label">Basic Information</h3>

              <div className="form-group">
                <label className="form-label">Recipe Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Grandma's Chocolate Chip Cookies"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="form-input form-textarea"
                  placeholder="A brief description of your recipe..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Prep Time (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.prepTime}
                    onChange={(e) => handleInputChange('prepTime', e.target.value)}
                    className="form-input"
                    placeholder="15"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cook Time (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cookTime}
                    onChange={(e) => handleInputChange('cookTime', e.target.value)}
                    className="form-input"
                    placeholder="30"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Servings</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.servings}
                    onChange={(e) => handleInputChange('servings', e.target.value)}
                    className="form-input"
                    placeholder="4"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 className="section-label">Ingredients</h3>
                <button type="button" onClick={addIngredient} className="add-btn">
                  + Add Ingredient
                </button>
              </div>

              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-row">
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    className="ingredient-input"
                    placeholder="Ingredient name"
                  />
                  <input
                    type="text"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                    className="ingredient-input quantity-input"
                    placeholder="Qty"
                  />
                  <input
                    type="text"
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    className="ingredient-input unit-input"
                    placeholder="Unit"
                  />
                  {formData.ingredients.length > 1 && (
                    <button type="button" onClick={() => removeIngredient(index)} className="remove-btn">
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="form-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 className="section-label">Instructions</h3>
                <button type="button" onClick={addStep} className="add-btn">
                  + Add Step
                </button>
              </div>

              {formData.steps.map((step, index) => (
                <div key={index} className="step-row">
                  <div className="step-num">{index + 1}</div>
                  <textarea
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    className="step-textarea"
                    placeholder={`Step ${index + 1}...`}
                  />
                  {formData.steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(index)} className="remove-btn" style={{ marginTop: '2px' }}>
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating Recipe...' : 'Share Recipe'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}