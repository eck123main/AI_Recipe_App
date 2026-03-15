'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from './AuthProvider'
import LoginModal from './LoginModal'

export default function Header() {
  const { user, signOut } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  return (
    <header className="app-header">
      <div className="logo">
        <Link href="/" className="logo-link">
          <div className="logo-icon">🥣</div>
          <div className="logo-name">
            fridge<em>IQ</em>
          </div>
        </Link>
      </div>

      <nav className="nav">
        <Link href="/feed" className="nav-link">
          Feed
        </Link>
        <Link href="/create-recipe" className="nav-link">
          Create
        </Link>
        {user && (
          <Link href="/my-recipes" className="nav-link">
            My recipes
          </Link>
        )}
      </nav>

      <div className="actions">
        {user ? (
          <>
            <span className="user">{user.email || user.id}</span>
            <button className="btn" onClick={() => signOut()}>
              Logout
            </button>
          </>
        ) : (
          <button className="btn" onClick={() => setShowLogin(true)}>
            Login
          </button>
        )}
      </div>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />

      <style jsx>{`
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 32px;
          background: rgba(6, 6, 8, 0.8);
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: linear-gradient(145deg, #6ee7a0, #22c55e);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 22px rgba(74, 222, 128, 0.32);
        }

        .logo-name {
          font-family: 'Instrument Serif', serif;
          font-size: 22px;
          letter-spacing: -0.4px;
          color: #eeeae3;
        }

        .logo-name em {
          font-style: normal;
          color: #4ade80;
        }

        .nav {
          display: flex;
          gap: 18px;
        }

        .nav-link {
          color: rgba(238, 234, 227, 0.7);
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 12px;
          transition: background 0.2s ease, color 0.2s ease;
          font-weight: 500;
        }

        .nav-link:hover {
          background: rgba(238, 234, 227, 0.08);
          color: #eeeae3;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user {
          font-size: 14px;
          color: rgba(238, 234, 227, 0.75);
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          background: linear-gradient(135deg, #4ade80 0%, #16a34a 100%);
          border: none;
          color: #060608;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(74, 222, 128, 0.25);
        }
      `}</style>
    </header>
  )
}
