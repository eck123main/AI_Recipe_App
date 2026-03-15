/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signOut: async () => {}
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) setError(error.message)
    setLoading(false)
    return { error }
  }

  const signOut = async () => {
    if (!supabase) return
    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
  }

  const value = useMemo(
    () => ({ user, session, loading, error, signIn, signOut }),
    [user, session, loading, error]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
