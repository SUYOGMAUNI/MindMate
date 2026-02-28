import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import client from '../api/client'
import styles from './Chat.module.css'

/* ── Crisis keywords (mirrors backend) ── */
const CRISIS_WORDS = /\b(suicide|suicidal|kill myself|end my life|self.harm|cut myself|don't want to live|want to die)\b/i

const STARTERS = [
  "I've been feeling anxious lately…",
  "I'm struggling to sleep and my mind won't stop.",
  "I need to talk about something that's been bothering me.",
  "Help me understand why I feel this way.",
]

function CrisisBanner() {
  return (
    <div className={styles.crisis}>
      <span className={styles.crisisIcon}>🆘</span>
      <div>
        <strong>You're not alone.</strong> If you're in crisis, please reach out:
        <br />
        <span>Nepal: <a href="tel:1166">1166</a></span>
        {' · '}
        <span>International (988 Lifeline): <a href="tel:988">988</a></span>
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div className={`${styles.bubble} ${styles.bubbleAI} ${styles.typingBubble}`}>
      <div className={styles.dots}>
        <span /><span /><span />
      </div>
    </div>
  )
}

function Message({ msg, showCrisis }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`${styles.msgRow} ${isUser ? styles.msgRowUser : styles.msgRowAI}`}>
      {!isUser && (
        <div className={styles.avatar} aria-hidden="true">🌿</div>
      )}
      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAI}`}>
        <p className={styles.msgText}>{msg.content}</p>
        {showCrisis && <CrisisBanner />}
      </div>
    </div>
  )
}

export default function Chat() {
  const { logout } = useAuthStore()
  const nav = useNavigate()

  const [sessions, setSessions] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [crisisIndices, setCrisisIndices] = useState(new Set())
  const [deleting, setDeleting] = useState(null)

  const endRef = useRef(null)
  const textareaRef = useRef(null)

  /* scroll to bottom */
  const scrollBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollBottom() }, [messages, typing])

  /* fetch sessions */
  useEffect(() => {
    client.get('/sessions')
      .then(r => { setSessions(r.data); setLoadingSessions(false) })
      .catch(() => setLoadingSessions(false))
  }, [])

  /* load messages when session changes */
  useEffect(() => {
    if (!activeId) { setMessages([]); return }
    client.get(`/sessions/${activeId}/messages`)
      .then(r => setMessages(r.data))
      .catch(console.error)
  }, [activeId])

  /* auto-resize textarea */
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [input])

  const createSession = async () => {
    const { data } = await client.post('/sessions')
    setSessions(prev => [data, ...prev])
    setActiveId(data.id)
    setMessages([])
  }

  const deleteSession = async (id, e) => {
    e.stopPropagation()
    setDeleting(id)
    try {
      await client.delete(`/sessions/${id}`)
      setSessions(prev => prev.filter(s => s.id !== id))
      if (activeId === id) { setActiveId(null); setMessages([]) }
    } finally { setDeleting(null) }
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || typing) return

    let sid = activeId
    if (!sid) {
      const { data } = await client.post('/sessions')
      setSessions(prev => [data, ...prev])
      setActiveId(data.id)
      sid = data.id
    }

    const userMsg = { id: Date.now(), role: 'user', content: text }
    const showCrisis = CRISIS_WORDS.test(text)
    if (showCrisis) setCrisisIndices(p => new Set([...p, userMsg.id]))

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    try {
      const { data } = await client.post('/chat', { session_id: sid, message: text })

      /* update session title if it changed */
      setSessions(prev => prev.map(s =>
        s.id === sid ? { ...s, title: data.session_title || s.title } : s
      ))

      const aiMsg = { id: Date.now() + 1, role: 'assistant', content: data.reply }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      const errMsg = { id: Date.now() + 1, role: 'assistant', content: '⚠️ Something went wrong. Please try again.' }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setTyping(false)
    }
  }

  const onKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const handleLogout = () => { logout(); nav('/login') }

  const activeSession = sessions.find(s => s.id === activeId)

  return (
    <div className={styles.layout}>
      <div className="blob-bg" />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <span>🌿</span>
            <span className={styles.brandName}>MindMate</span>
          </div>
          <button className={styles.iconBtn} onClick={() => setSidebarOpen(o => !o)} title="Toggle sidebar" aria-label="Toggle sidebar">
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <button className={styles.newChatBtn} onClick={createSession}>
          <span>+</span> New conversation
        </button>

        <nav className={styles.sessionList} aria-label="Conversations">
          {loadingSessions && (
            <div className={styles.sessionLoading}>
              {[1,2,3].map(i => <div key={i} className={styles.sessionSkeleton} />)}
            </div>
          )}
          {!loadingSessions && sessions.length === 0 && (
            <p className={styles.emptyHint}>No conversations yet.<br />Start one above.</p>
          )}
          {sessions.map(s => (
            <div
              key={s.id}
              className={`${styles.sessionItem} ${s.id === activeId ? styles.sessionActive : ''}`}
              onClick={() => setActiveId(s.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setActiveId(s.id)}
            >
              <span className={styles.sessionIcon}>💬</span>
              <span className={styles.sessionTitle}>{s.title || 'New conversation'}</span>
              <button
                className={styles.deleteBtn}
                onClick={e => deleteSession(s.id, e)}
                title="Delete"
                aria-label="Delete conversation"
                disabled={deleting === s.id}
              >
                {deleting === s.id ? '…' : '✕'}
              </button>
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            ↩ Sign out
          </button>
          <p className={styles.madeBy}>
            Made by{' '}
            <a href="https://suyogmauni.com.np" target="_blank" rel="noopener noreferrer">
              Suyog Mauni
            </a>
          </p>
        </div>
      </aside>

      {/* Main chat area */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            {!sidebarOpen && (
              <button className={styles.iconBtn} onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">☰</button>
            )}
            <h1 className={styles.headerTitle}>
              {activeSession?.title || (activeId ? 'Conversation' : 'MindMate')}
            </h1>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.statusDot} title="AI ready" />
            <span className={styles.statusLabel}>AI ready</span>
          </div>
        </header>

        {/* Messages */}
        <section className={styles.messages} aria-live="polite" aria-label="Conversation">
          {/* Empty state */}
          {messages.length === 0 && !typing && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🌿</div>
              <h2 className={styles.emptyHeading}>Hello, I'm here for you</h2>
              <p className={styles.emptyBody}>
                This is a safe, private space. Share what's on your mind — or pick a prompt to get started.
              </p>
              <div className={styles.starters}>
                {STARTERS.map(s => (
                  <button key={s} className={styles.starterChip} onClick={() => { setInput(s); textareaRef.current?.focus() }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <Message
              key={msg.id}
              msg={msg}
              showCrisis={crisisIndices.has(msg.id)}
            />
          ))}

          {typing && <TypingDots />}
          <div ref={endRef} />
        </section>

        {/* Input */}
        <footer className={styles.inputArea}>
          <div className={styles.inputWrap}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Share what's on your mind… (Shift+Enter for new line)"
              rows={1}
              aria-label="Message input"
            />
            <button
              className={styles.sendBtn}
              onClick={sendMessage}
              disabled={!input.trim() || typing}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className={styles.inputHint}>
            MindMate provides emotional support, not professional mental health advice.
            {' '}In an emergency, contact <strong>1166</strong> (Nepal) or <strong>988</strong> (international).
          </p>
        </footer>
      </main>
    </div>
  )
}