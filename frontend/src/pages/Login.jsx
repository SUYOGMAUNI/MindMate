import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import styles from './Auth.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, token, clearError } = useAuthStore()
  const nav = useNavigate()

  useEffect(() => { if (token) nav('/') }, [token])
  useEffect(() => clearError, [])

  const submit = async e => {
    e.preventDefault()
    const res = await login(email, password)
    if (res.ok) nav('/')
  }

  return (
    <div className={styles.page}>
      <div className="blob-bg" />
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandLeaf}>🌿</span>
          <h1 className={styles.brandName}>MindMate</h1>
        </div>
        <p className={styles.tagline}>A gentle space to think, feel, and reflect.</p>

        <h2 className={styles.heading}>Welcome back</h2>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.label}>
            Email
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </label>
          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Sign in'}
          </button>
        </form>

        <p className={styles.switchText}>
          Don't have an account?{' '}
          <Link className={styles.switchLink} to="/register">Create one</Link>
        </p>
        <p className={styles.madeBy}>
          Made by{' '}
          <a href="https://suyogmauni.com.np" target="_blank" rel="noopener noreferrer">
            Suyog Mauni
          </a>
        </p>
      </div>
    </div>
  )
}