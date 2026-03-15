/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'

export default function LoginModal({ open, onClose }) {
  const { signIn, loading, error, user } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (user) {
      setSent(false)
      onClose?.()
    }
  }, [user, onClose])

  useEffect(() => {
    if (!open) {
      setEmail('')
      setSent(false)
    }
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSent(false)
    const { error } = await signIn(email.trim())
    if (!error) {
      setSent(true)
    }
  }

  if (!open) return null

  return (
    <div className="modal">
      <div className="backdrop" onClick={onClose} />
      <div className="dialog" role="dialog" aria-modal="true">
        <h2>Login</h2>
        <p className="hint">Enter your email to sign in via magic link.</p>
        <form onSubmit={handleSubmit}>
          <label>
            <span className="label">Email</span>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </label>
          {error && <div className="error">{error}</div>}
          {sent && <div className="success">Check your inbox — magic link sent!</div>}
          <div className="actions">
            <button type="button" className="btn" onClick={onClose}>
              Close
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
        }

        .dialog {
          position: relative;
          background: rgba(6, 6, 8, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          padding: 30px;
          width: min(420px, calc(100% - 48px));
          box-shadow: 0 18px 46px rgba(0, 0, 0, 0.48);
          z-index: 1;
        }

        h2 {
          margin: 0 0 8px;
          font-family: 'Instrument Serif', serif;
          font-size: 24px;
          color: #eeeae3;
        }

        .hint {
          margin: 0 0 18px;
          color: rgba(238, 234, 227, 0.6);
          font-size: 14px;
        }

        label {
          display: grid;
          gap: 8px;
          margin-bottom: 18px;
          color: rgba(238, 234, 227, 0.75);
          font-size: 13px;
        }

        .input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(238, 234, 227, 0.16);
          background: rgba(0, 0, 0, 0.25);
          color: #eeeae3;
          outline: none;
        }

        .input:focus {
          border-color: rgba(74, 222, 128, 0.7);
          box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.1);
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .btn {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: #eeeae3;
          padding: 10px 14px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s ease;
        }

        .btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .btn.primary {
          background: linear-gradient(135deg, #4ade80 0%, #16a34a 100%);
          border: none;
          color: #060608;
        }

        .error {
          margin-top: 10px;
          color: #f87171;
          font-size: 13px;
        }

        .success {
          margin-top: 10px;
          color: #86efac;
          font-size: 13px;
        }
      `}</style>
    </div>
  )
}
