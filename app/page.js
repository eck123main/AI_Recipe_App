"use client";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";

const DIETARY_MODES = ["maintain", "bulk", "cut", "vegetarian", "vegan", "keto"];
const COMMON_ALLERGIES = ["Gluten", "Dairy", "Nuts", "Eggs", "Soy", "Shellfish"];

export default function Home() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [dietaryMode, setDietaryMode] = useState("maintain");
  const [allergies, setAllergies] = useState([]);
  const [step, setStep] = useState("upload");
  const [error, setError] = useState(null);
  const [shareRecipe, setShareRecipe] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleImage = (file) => {
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setStep("upload");
    setIngredients([]);
    setRecipe(null);
  };

  const toggleAllergy = (allergy) => {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleImage(file);
  }, []);

  const scanFridge = async () => {
    if (!image) return;
    setStep("scanning");
    setError(null);
    try {
      const base64 = await toBase64(image);
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setIngredients(data.ingredients || []);
      setStep("ingredients");
    } catch (e) {
      setError(e.message);
      setStep("upload");
    }
  };

  const generateRecipe = async () => {
    setStep("generating");
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          profile: { dietary_mode: dietaryMode, allergies },
          share: shareRecipe,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setRecipe(data);
      setStep("recipe");
    } catch (e) {
      setError(e.message);
      setStep("ingredients");
    }
  };

  const reset = () => {
    setImage(null);
    setImagePreview(null);
    setIngredients([]);
    setRecipe(null);
    setStep("upload");
    setError(null);
  };

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

        .dropzone {
          border: 1.5px dashed rgba(238,234,227,0.13);
          border-radius: 24px;
          background: rgba(238,234,227,0.02);
          min-height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s;
          overflow: hidden;
          margin-bottom: 16px;
          position: relative;
        }

        .dropzone:hover {
          border-color: rgba(74,222,128,0.35);
          background: rgba(74,222,128,0.025);
        }

        .dropzone.drag {
          border-color: rgba(74,222,128,0.6);
          background: rgba(74,222,128,0.05);
          box-shadow: 0 0 60px rgba(74,222,128,0.08);
        }

        .dropzone-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 48px;
          color: rgba(238,234,227,0.2);
          text-align: center;
        }

        .dz-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: rgba(238,234,227,0.04);
          border: 1px solid rgba(238,234,227,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          margin-bottom: 6px;
        }

        .dz-title { font-size: 15px; color: rgba(238,234,227,0.35); }
        .dz-sub { font-size: 13px; color: rgba(238,234,227,0.18); }

        .preview-img { width: 100%; height: 320px; object-fit: cover; display: block; }

        .preview-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(6,6,8,0.55) 0%, transparent 50%);
          display: flex;
          align-items: flex-end;
          padding: 20px;
        }

        .preview-badge {
          background: rgba(6,6,8,0.75);
          border: 1px solid rgba(74,222,128,0.25);
          backdrop-filter: blur(12px);
          padding: 7px 14px;
          border-radius: 100px;
          font-size: 13px;
          color: #4ade80;
        }

        .btn-upload {
          width: 100%;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid rgba(238,234,227,0.1);
          background: rgba(238,234,227,0.03);
          color: rgba(238,234,227,0.55);
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 40px;
          letter-spacing: -0.1px;
        }
        .btn-upload:hover {
          background: rgba(238,234,227,0.07);
          border-color: rgba(238,234,227,0.18);
          color: #eeeae3;
        }

        .section { margin-bottom: 40px; }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: rgba(238,234,227,0.28);
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .pills { display: flex; flex-wrap: wrap; gap: 9px; }

        .pill {
          padding: 9px 20px;
          border-radius: 100px;
          border: 1px solid rgba(238,234,227,0.11);
          background: transparent;
          color: rgba(238,234,227,0.4);
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: capitalize;
          letter-spacing: -0.1px;
        }
        .pill:hover { border-color: rgba(238,234,227,0.28); color: rgba(238,234,227,0.85); }
        .pill.active-diet { background: #eeeae3; color: #060608; border-color: #eeeae3; font-weight: 500; }
        .pill.active-allergy { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.35); color: #fca5a5; }

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

        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 24px;
          text-align: center;
        }

        .spinner {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: rgba(74,222,128,0.07);
          border: 1.5px solid rgba(74,222,128,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          animation: breathe 2s ease-in-out infinite;
          box-shadow: 0 0 40px rgba(74,222,128,0.1);
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(74,222,128,0.1); }
          50% { transform: scale(1.06); box-shadow: 0 0 60px rgba(74,222,128,0.2); }
        }

        .loading-screen h2 { font-family: 'Instrument Serif', serif; font-size: 32px; letter-spacing: -0.8px; }
        .loading-screen p { color: rgba(238,234,227,0.3); font-size: 15px; }

        .progress-track { width: 180px; height: 2px; background: rgba(238,234,227,0.07); border-radius: 2px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #4ade80, #86efac); border-radius: 2px; animation: slide 2.2s ease-in-out infinite; }

        @keyframes slide {
          0% { width: 5%; margin-left: 0; }
          50% { width: 60%; }
          100% { width: 5%; margin-left: 95%; }
        }

        .ingredients-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 40px; }

        .ingredient-card {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(238,234,227,0.03);
          border: 1px solid rgba(238,234,227,0.07);
          border-radius: 14px;
          padding: 13px 16px;
          animation: fadeUp 0.35s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ing-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; flex-shrink: 0; box-shadow: 0 0 8px rgba(74,222,128,0.5); }
        .ingredient-card span { font-size: 13px; color: rgba(238,234,227,0.7); text-transform: capitalize; }

        .recipe-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #4ade80;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .recipe-eyebrow::after { content: ''; flex: 1; height: 1px; background: rgba(74,222,128,0.2); }

        .recipe-title { font-family: 'Instrument Serif', serif; font-size: clamp(36px, 5vw, 56px); letter-spacing: -1.5px; line-height: 1.05; margin-bottom: 12px; }
        .recipe-desc { color: rgba(238,234,227,0.4); font-size: 16px; font-weight: 300; margin-bottom: 48px; line-height: 1.6; }

        .recipe-cols { display: grid; grid-template-columns: 1fr 2fr; gap: 48px; margin-bottom: 40px; }
        .recipe-section-label { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: rgba(238,234,227,0.28); text-transform: uppercase; margin-bottom: 16px; }

        .ing-list { list-style: none; }
        .ing-list li { display: flex; gap: 10px; padding: 9px 0; border-bottom: 1px solid rgba(238,234,227,0.05); font-size: 14px; color: rgba(238,234,227,0.7); line-height: 1.5; }
        .ing-list li:last-child { border-bottom: none; }
        .ing-dash { color: rgba(238,234,227,0.15); flex-shrink: 0; }

        .steps-list { list-style: none; }
        .step-item { display: flex; gap: 20px; margin-bottom: 24px; animation: fadeUp 0.4s ease both; }
        .step-num { font-family: 'Instrument Serif', serif; font-size: 22px; color: rgba(238,234,227,0.12); min-width: 32px; line-height: 1.4; }
        .step-text { font-size: 14px; color: rgba(238,234,227,0.7); line-height: 1.75; }

        .recipe-raw { font-size: 14px; color: rgba(238,234,227,0.65); line-height: 1.85; white-space: pre-wrap; }

        .btn-ghost { width: 100%; padding: 17px; border-radius: 16px; border: 1px solid rgba(238,234,227,0.09); background: transparent; color: rgba(238,234,227,0.35); font-size: 15px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; margin-top: 12px; }
        .btn-ghost:hover { background: rgba(238,234,227,0.05); color: rgba(238,234,227,0.65); }

        input[type="file"] { display: none; }

        @media (max-width: 640px) {
          .page { padding: 0 20px 80px; }
          .ingredients-grid { grid-template-columns: 1fr 1fr; }
          .recipe-cols { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>

      <div className="bg-layer" />
      <div className="grain" />

      <div className="page">
        <header>
          <div className="logo">
            <div className="logo-icon">🧊</div>
            <span className="logo-name">Fridge<em>IQ</em></span>
          </div>
          <div className="flex gap-4">
            <Link href="/feed" className="text-blue-500 hover:underline">Browse shared recipes</Link>
            <Link href="/create-recipe" className="text-green-500 hover:underline">Create custom recipe</Link>
          </div>
          {step !== "upload" && (
            <button className="back-btn" onClick={reset}>← Start over</button>
          )}
        </header>

        {step === "upload" && (
          <div>
            <div className="hero">
              <h1>What's in your<br /><em>fridge?</em></h1>
              <p>Upload a photo — we'll figure out the recipe.</p>
            </div>

            <div
              className={`dropzone${dragging ? " drag" : ""}`}
              onClick={() => !imagePreview && fileInputRef.current.click()}
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Fridge" className="preview-img" />
                  <div className="preview-overlay">
  <span className="preview-badge">✓ Photo ready — click Scan to continue</span>
  <button
    onClick={(e) => { e.stopPropagation(); setImage(null); setImagePreview(null); }}
    style={{
      position: "absolute", top: 12, right: 12,
      background: "rgba(6,6,8,0.75)", border: "1px solid rgba(238,234,227,0.15)",
      color: "rgba(238,234,227,0.7)", borderRadius: "100px",
      padding: "6px 14px", fontSize: "13px", cursor: "pointer"
    }}
  >
    ✕ Remove
  </button>
</div>
                </>
              ) : (
                <div className="dropzone-inner">
                  <div className="dz-icon">📷</div>
                  <p className="dz-title">Drop your fridge photo here</p>
                  <p className="dz-sub">or use the button below</p>
                </div>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleImage(e.target.files[0])} onClick={(e) => { e.target.value = null; }} />

            <button className="btn-upload" onClick={() => fileInputRef.current.click()}>
              📁 Upload photo
            </button>

            <div className="section">
              <p className="section-label">Dietary goal</p>
              <div className="pills">
                {DIETARY_MODES.map((mode) => (
                  <button key={mode} className={`pill${dietaryMode === mode ? " active-diet" : ""}`} onClick={() => setDietaryMode(mode)}>{mode}</button>
                ))}
              </div>
            </div>

            <div className="section">
              <p className="section-label">Allergies</p>
              <div className="pills">
                {COMMON_ALLERGIES.map((a) => (
                  <button key={a} className={`pill${allergies.includes(a) ? " active-allergy" : ""}`} onClick={() => toggleAllergy(a)}>{a}</button>
                ))}
              </div>
            </div>

            {error && <p className="error">{error}</p>}

            <button className="btn-primary" onClick={scanFridge} disabled={!image}>
              Scan my fridge →
            </button>
          </div>
        )}

        {step === "scanning" && (
          <div className="loading-screen">
            <div className="spinner">🔍</div>
            <h2>Scanning your fridge...</h2>
            <p>Gemini is identifying your ingredients</p>
            <div className="progress-track"><div className="progress-fill" /></div>
          </div>
        )}

        {step === "ingredients" && (
          <div>
            <div className="hero">
              <h1>Found <em>{ingredients.length}</em><br />ingredients</h1>
              <p>Looking good — ready to generate your recipe?</p>
            </div>
            <div className="ingredients-grid">
              {ingredients.map((ing, i) => (
                <div className="ingredient-card" key={i} style={{ animationDelay: `${i * 35}ms` }}>
                  <div className="ing-dot" />
                  <span>{typeof ing === "string" ? ing : `${ing.name}${ing.quantity ? ` · ${ing.quantity}${ing.unit || ""}` : ""}`}</span>
                </div>
              ))}
            </div>
            {error && <p className="error">{error}</p>}
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={shareRecipe}
                  onChange={(e) => setShareRecipe(e.target.checked)}
                  className="rounded"
                />
                <span>Share this recipe with the community</span>
              </label>
            </div>
            <button className="btn-primary" onClick={generateRecipe}>Generate my recipe →</button>
          </div>
        )}

        {step === "generating" && (
          <div className="loading-screen">
            <div className="spinner">👨‍🍳</div>
            <h2>Crafting your recipe...</h2>
            <p>Groq is cooking something up</p>
            <div className="progress-track"><div className="progress-fill" /></div>
          </div>
        )}

        {step === "recipe" && recipe && (
          <div>
            <p className="recipe-eyebrow">✦ Your recipe</p>
            <h2 className="recipe-title">{recipe.title || recipe.name || "Here's your recipe"}</h2>
            {recipe.description && <p className="recipe-desc">{recipe.description}</p>}

            <div className="recipe-cols">
              {recipe.ingredients && (
                <div>
                  <p className="recipe-section-label">Ingredients</p>
                  <ul className="ing-list">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i}>
                        <span className="ing-dash">—</span>
                        {typeof ing === "string" ? ing : `${ing.amount ?? ""} ${ing.unit ?? ""} ${ing.name ?? ing}`.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.steps && (
                <div>
                  <p className="recipe-section-label">Instructions</p>
                  <ol className="steps-list">
                    {recipe.steps.map((s, i) => (
                      <li className="step-item" key={i} style={{ animationDelay: `${i * 60}ms` }}>
                        <span className="step-num">{String(i + 1).padStart(2, "0")}</span>
                        <span className="step-text">{typeof s === "string" ? s : s.instruction || s.description}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {typeof recipe === "string" && <p className="recipe-raw">{recipe}</p>}
            {recipe.raw && <p className="recipe-raw">{recipe.raw}</p>}

            {recipe.sharedId && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">✅ Recipe shared! <a href={`/shared/${recipe.sharedId}`} className="underline">View shared recipe</a></p>
              </div>
            )}

            <button className="btn-primary" onClick={reset}>🔄 Scan another fridge</button>
            <button className="btn-ghost" onClick={reset}>Start over</button>
          </div>
        )}
      </div>
    </>
  );
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}