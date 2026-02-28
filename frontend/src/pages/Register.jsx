import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import styles from './Auth.module.css'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState('')
  const { register, loading, error, token, clearError } = useAuthStore()
  const nav = useNavigate()

  useEffect(() => { if (token) nav('/') }, [token])
  useEffect(() => clearError, [])

  const submit = async e => {
    e.preventDefault()
    setLocalError('')
    if (password !== confirm) { setLocalError('Passwords do not match'); return }
    if (password.length < 8)  { setLocalError('Password must be at least 8 characters'); return }
    const res = await register(email, password)
    if (res.ok) nav('/')
  }

  const displayError = localError || error

  return (
    <div className={styles.page}>
      <div className="blob-bg" />
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandLeaf}>🌿</span>
          <h1 className={styles.brandName}>MindMate</h1>
        </div>
        <p className={styles.tagline}>Begin your journey toward clarity.</p>

        <h2 className={styles.heading}>Create your account</h2>

        {displayError && <div className={styles.errorBanner}>{displayError}</div>}

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
              placeholder="at least 8 characters"
              required
            />
          </label>
          <label className={styles.label}>
            Confirm password
            <input
              className={styles.input}
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Create account'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link className={styles.switchLink} to="/login">Sign in</Link>
        </p>

        <p className={styles.disclaimer}>
          This app provides AI-based emotional support and is not a substitute for professional mental health care.
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