import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import logo from '/logo.jpeg'


const CHARS = ["pink", "teal", "blue"]

const charConfig = {
  pink: { bodyColor: "#f48fb1", legColor: "#f48fb1", eyeSize: 16, pupilSize: 8, bodyW: 60, bodyH: 75, mouthColor: "#c2185b", legs: 2, legW: 10, legH: 20, legGap: 8 },
  teal: { bodyColor: "#4dd0c4", legColor: "#4dd0c4", eyeSize: 13, pupilSize: 7, bodyW: 54, bodyH: 54, mouthColor: "#00897b", legs: 2, legW: 9, legH: 16, legGap: 6 },
  blue: { bodyColor: "#42a5f5", legColor: "#42a5f5", eyeSize: 12, pupilSize: 6, bodyW: 46, bodyH: 46, mouthColor: "#1565c0", legs: 2, legW: 8, legH: 14, legGap: 6 },
}

function Char({ name, pupilOffset, mood, lookAway, lean, bounce }) {
  const c = charConfig[name]
  const isTeal = name === "teal"

  const getMouth = () => {
    if (mood === "happy") return { borderBottom: `4px solid ${c.mouthColor}`, borderTop: "none", borderRadius: "0 0 18px 18px", width: 28, height: 14, borderLeft: "none", borderRight: "none" }
    if (mood === "sad") return { borderTop: `3px solid ${c.mouthColor}`, borderBottom: "none", borderRadius: "12px 12px 0 0", width: 20, height: 10, borderLeft: "none", borderRight: "none" }
    if (mood === "curious") return { border: `3px solid ${c.mouthColor}`, borderRadius: "50%", width: 14, height: 14 }
    if (mood === "shy") return { borderBottom: `2px solid ${c.mouthColor}`, borderRadius: "0 0 8px 8px", width: 12, height: 6, borderTop: "none", borderLeft: "none", borderRight: "none" }
    return { borderBottom: `3px solid ${c.mouthColor}`, borderRadius: "0 0 12px 12px", width: name === "pink" ? 22 : 16, height: name === "pink" ? 10 : 8, borderTop: "none", borderLeft: "none", borderRight: "none" }
  }

  const bodyTransform = lookAway
    ? "rotate(-18deg)"
    : lean
    ? `rotate(${name === "pink" ? lean * 0.8 : name === "teal" ? lean * 0.6 : lean * 0.5}deg) translateX(${lean > 0 ? 4 : -4}px)`
    : bounce
    ? `translateY(${bounce}px)`
    : "none"

  const mouth = getMouth()

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          width: c.bodyW, height: c.bodyH,
          background: c.bodyColor,
          borderRadius: name === "pink" ? "50% 50% 30% 30% / 60% 60% 40% 40%" : "50%",
          position: "relative",
          transform: bodyTransform,
          transition: "transform 0.3s ease",
          boxShadow: isTeal ? `-8px -8px 0 4px ${c.bodyColor}, 8px -10px 0 3px ${c.bodyColor}, -14px 0px 0 2px ${c.bodyColor}, 14px 2px 0 2px ${c.bodyColor}, -6px -14px 0 3px ${c.bodyColor}, 6px -14px 0 4px ${c.bodyColor}` : "none",
        }}
      >
        {/* Eyes */}
        {[{ side: "left", pos: name === "pink" ? 10 : name === "teal" ? 10 : 8 }, { side: "right", pos: name === "pink" ? 10 : name === "teal" ? 10 : 8 }].map(({ side, pos }) => (
          <div key={side} style={{
            width: c.eyeSize, height: c.eyeSize,
            background: "#fff", borderRadius: "50%",
            position: "absolute",
            top: name === "pink" ? 22 : name === "teal" ? 16 : 12,
            [side]: pos,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            <div style={{
              width: c.pupilSize, height: c.pupilSize,
              background: "#1a1a1a", borderRadius: "50%",
              transform: lookAway
                ? "translate(-3px, 0px)"
                : `translate(${(side === "left" ? 1 : -1) * pupilOffset.x * 0.4 + pupilOffset.x * 0.6}px, ${pupilOffset.y}px)`,
              transition: lookAway ? "transform 0.3s" : "transform 0.12s ease",
              position: "relative",
            }}>
              <div style={{ position: "absolute", top: 1, left: 1, width: c.pupilSize * 0.35, height: c.pupilSize * 0.35, background: "#fff", borderRadius: "50%" }} />
            </div>
          </div>
        ))}

        {/* Cover eyes when looking away */}
        {lookAway && (
          <div style={{ position: "absolute", top: name === "pink" ? 18 : name === "teal" ? 12 : 8, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 6px" }}>
            {[0, 1].map(i => (
              <div key={i} style={{ width: c.eyeSize + 4, height: c.eyeSize + 4, background: c.bodyColor, borderRadius: "50%" }} />
            ))}
          </div>
        )}

        {/* Tears */}
        {mood === "sad" && (
          <>
            <div style={{ position: "absolute", left: 14, top: name === "pink" ? 32 : 24, width: 4, height: 8, background: "rgba(100,150,255,0.8)", borderRadius: "0 0 4px 4px", animation: "tearDrop 0.6s ease infinite" }} />
            <div style={{ position: "absolute", right: 14, top: name === "pink" ? 32 : 24, width: 4, height: 8, background: "rgba(100,150,255,0.8)", borderRadius: "0 0 4px 4px", animation: "tearDrop 0.6s ease infinite 0.2s" }} />
          </>
        )}

        {/* Mouth */}
        <div style={{ position: "absolute", bottom: name === "pink" ? 14 : 10, left: "50%", transform: "translateX(-50%)", ...mouth, transition: "all 0.3s" }} />
      </div>
      {/* Legs */}
      <div style={{ display: "flex", gap: c.legGap, marginTop: 3 }}>
        {[0, 1].map(i => (
          <div key={i} style={{ width: c.legW, height: c.legH, background: c.legColor, borderRadius: 5 }} />
        ))}
      </div>
    </div>
  )
}

export default function Login() {
  const [rememberMe, setRememberMe] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [role, setRole] = useState('parent')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [passVisible, setPassVisible] = useState(false)
  const [mood, setMood] = useState('normal')
  const [lookAway, setLookAway] = useState(false)
  const [lean, setLean] = useState(0)
  const [bounce, setBounce] = useState(0)
  const [stars, setStars] = useState([])
  const [loginState, setLoginState] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 })
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)
  const cartoonRef = useRef(null)
  const bounceRef = useRef(null)
  const navigate = useNavigate()


  useEffect(() => {
    const handleMove = (e) => {
      if (lookAway || mood === "sad") return
      const el = cartoonRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const max = 3.5
      setPupilOffset({
        x: Math.max(-max, Math.min(max, (dx / dist) * max)),
        y: Math.max(-max, Math.min(max, (dy / dist) * max)),
      })
    }
    window.addEventListener("mousemove", handleMove)
    return () => window.removeEventListener("mousemove", handleMove)
  }, [lookAway, mood])

  useEffect(() => {
  const savedEmail = localStorage.getItem('svb_remembered_email')
  if (savedEmail) {
    setEmail(savedEmail)
    setRememberMe(true)
  }
}, [])

  // BOUNCE animation
  const doBounce = () => {
    let count = 0
    clearInterval(bounceRef.current)
    bounceRef.current = setInterval(() => {
      setBounce(count % 2 === 0 ? -12 : 0)
      count++
      if (count > 6) { clearInterval(bounceRef.current); setBounce(0) }
    }, 160)
  }

  const doStars = () => {
    const emojis = ["🎉", "⭐", "✨", "🌟", "💫", "🎊"]
    const newStars = Array.from({ length: 10 }, (_, i) => ({
      id: i, emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: 10 + Math.random() * 80, y: 10 + Math.random() * 60,
      delay: i * 0.1,
    }))
    setStars(newStars)
    setTimeout(() => setStars([]), 1200)
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail) { setForgotError('Please enter your email'); return }
    setForgotLoading(true)
    setForgotError('')

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/set-password`
    })

    if (error) {
      setForgotError(error.message)
      setForgotLoading(false)
      return
    }

    setForgotSuccess('✅ Reset link sent! Check your email.')
    setForgotLoading(false)
  }

const handleLogin = async () => {
  if (!email || !pass) {
    setShake(true)
    setTimeout(() => setShake(false), 400)
    return
  }

  setLoading(true)
  setErrorMsg('')

  // Set session persistence based on remember me
  await supabase.auth.setSession({
    access_token: '',
    refresh_token: '',
  })

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
    options: {
      // If remember me is checked — session persists for 30 days
      // If not — session expires when browser closes
    }
  })

  if (error) {
    setLoading(false)
    setMood('sad')
    setErrorMsg('Incorrect email or password. Try again!')
    setShake(true)
    setTimeout(() => setShake(false), 400)
    setTimeout(() => { setMood('normal'); setErrorMsg('') }, 2500)
    return
  }

  // Save email if remember me checked
  if (rememberMe) {
    localStorage.setItem('svb_remembered_email', email)
  } else {
    localStorage.removeItem('svb_remembered_email')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  setLoading(false)
  setMood('happy')
  setLoginState('success')
  doStars()
  doBounce()

  setTimeout(() => {
    if (profile?.role === 'admin') navigate('/admin')
    else if (profile?.role === 'teacher') navigate('/teacher')
    else navigate('/parent')
  }, 1500)
}
  const handleRoleChange = (r) => {
    setRole(r)
    doBounce()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap');
        @keyframes tearDrop { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(14px)} }
        @keyframes starPop { 0%{opacity:0;transform:scale(0) translateY(0)} 50%{opacity:1;transform:scale(1.3) translateY(-20px)} 100%{opacity:0;transform:scale(0.8) translateY(-44px)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        .input-underline { border:none; border-bottom:1.5px solid #ddd; background:transparent; outline:none; width:100%; padding:14px 32px 6px 0; font-size:14px; font-family:'Outfit',sans-serif; color:#0a1628; transition:border-color 0.2s; }
        .input-underline:focus { border-bottom-color:#1a4fa0; }
        .role-btn { flex:1; padding:9px 4px; font-size:12px; font-weight:500; border:none; border-radius:8px; cursor:pointer; background:transparent; color:#666; transition:all 0.2s; font-family:'Outfit',sans-serif; }
        .role-btn.active { background:#1a4fa0; color:#fff; box-shadow:0 2px 10px rgba(26,79,160,0.3); }
        .login-main-btn { width:100%; background:#1a4fa0; color:#fff; border:none; border-radius:10px; padding:13px; font-size:15px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; transition:background 0.2s,transform 0.15s; }
        .login-main-btn:hover { background:#153d82; }
        .login-main-btn.success { background:#22c55e; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#e8f0fe,#c7d9fc)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Outfit',sans-serif" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "window.innerWidth < 600 ? '1fr' : '1fr 1fr'",
          maxWidth: 820, width: "100%",
          background: "#fff", borderRadius: 24,
          boxShadow: "0 24px 80px rgba(26,79,160,0.18)",
          overflow: "hidden",
        }}>
          <style>{`
            @media(max-width:600px){ .login-grid{ grid-template-columns:1fr !important; } .cartoon-panel{ min-height:200px !important; } }
          `}</style>
          <div className="login-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%" }}>

            {/* CARTOON PANEL */}
            <div className="cartoon-panel" style={{ background: "linear-gradient(160deg,#e8f0fe,#c7d9fc)", position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center", minHeight: 360 }}>
              {/* Stars */}
              {stars.map(s => (
                <div key={s.id} style={{ position: "absolute", left: s.x + "%", top: s.y + "%", fontSize: 20, animation: `starPop 0.9s ${s.delay}s ease forwards`, opacity: 0, zIndex: 10 }}>{s.emoji}</div>
              ))}

              {/* Characters */}
              <div ref={cartoonRef} style={{ position: "absolute", bottom: 52, left: 0, right: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 14 }}>
                {CHARS.map(name => (
                  <Char key={name} name={name} pupilOffset={pupilOffset} mood={mood} lookAway={lookAway} lean={lean} bounce={bounce} />
                ))}
              </div>

              {/* Ground */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 52, background: "#c7d9fc" }} />

            </div>

            {/* FORM PANEL */}
            <div style={{ padding: "36px 28px", display: "flex", flexDirection: "column", justifyContent: "center", animation: shake ? "shake 0.4s ease" : "none" }}>

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <img 
                src={logo} 
                alt="SVB" 
                style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid #1a4fa0", flexShrink: 0 }} 
            />
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, fontWeight: 600, color: "#1a4fa0", lineHeight: 1.3 }}>
                Sree Viswabharathi<br />EM High School
            </div>
            </div>

              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#0a1628", marginBottom: 3 }}>Welcome back!</div>
              <div style={{ fontSize: 12, color: "#aaa", marginBottom: 20 }}>Please enter your details</div>

              {/* Email */}
              <div style={{ position: "relative", marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 11, color: "#1a4fa0", marginBottom: 4, fontWeight: 500 }}>Email</label>
                <input
                  className="input-underline"
                  type="email"
                  placeholder={`${role}@svbschool.edu.in`}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => { setLean(10); setMood("curious") }}
                  onBlur={() => { setLean(0); setMood("normal") }}
                />
              </div>

              {/* Password */}
              <div style={{ position: "relative", marginBottom: 8 }}>
                <label style={{ display: "block", fontSize: 11, color: "#1a4fa0", marginBottom: 4, fontWeight: 500 }}>Password</label>
                <input
                  className="input-underline"
                  type={passVisible ? "text" : "password"}
                  placeholder="••••••••"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  onFocus={() => { if (!passVisible) { setLean(10); setMood("curious") } else { setLookAway(true); setMood("shy") } }}
                  onBlur={() => { if (!passVisible) { setLean(0); setMood("normal") } }}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
                <button
                  onClick={() => {
                    const nv = !passVisible
                    setPassVisible(nv)
                    if (nv) { setLookAway(true); setMood("shy"); setLean(0) }
                    else { setLookAway(false); setMood("normal") }
                  }}
                  style={{ position: "absolute", right: 0, top: 22, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#aaa", padding: 4 }}
                >
                  {passVisible ? "🙈" : "👁"}
                </button>
              </div>

              {errorMsg && <div style={{ fontSize: 11, color: "#e53935", marginBottom: 8 }}>{errorMsg}</div>}

              {/* Remember / Forgot */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 4 }}>
                <label style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#888',cursor:'pointer'}}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{accentColor:'#1a4fa0'}}
                  />
                  Remember me
                </label>
                <span
                  onClick={() => setShowForgot(!showForgot)}
                  style={{fontSize:12,color:'#1a4fa0',cursor:'pointer',fontWeight:500}}>
                  Forgot password?
                </span>
              </div>

            <button
            className={`login-main-btn ${loginState === "success" ? "success" : ""}`}
            onClick={handleLogin}
            disabled={loading}
            >
            {loginState === "success" ? "🎉 Welcome!" : loading ? "Signing in..." : "Log in"}
            </button>

            {/* Forgot Password Form */}
            {showForgot && (
              <div style={{
                marginTop:20,padding:'16px',
                background:'#f0f4ff',borderRadius:12,
                border:'1px solid #e0e7ff'
              }}>
                <p style={{fontSize:13,fontWeight:600,color:'#0a1628',marginBottom:12}}>
                  Reset Password
                </p>
                <p style={{fontSize:12,color:'#888',marginBottom:12}}>
                  Enter your registered email — we'll send a reset link!
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => { setForgotEmail(e.target.value); setForgotError('') }}
                  placeholder="your@email.com"
                  onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                  style={{
                    width:'100%',border:'none',
                    borderBottom:'1.5px solid #ddd',
                    padding:'10px 0',fontSize:14,
                    outline:'none',fontFamily:'Outfit,sans-serif',
                    background:'transparent',marginBottom:12
                  }}
                />
                {forgotError && <p style={{fontSize:12,color:'#e53935',marginBottom:8}}>{forgotError}</p>}
                {forgotSuccess && <p style={{fontSize:12,color:'#16a34a',marginBottom:8}}>{forgotSuccess}</p>}
                <button
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                  style={{
                    width:'100%',background:'#1a4fa0',color:'#fff',
                    border:'none',borderRadius:8,padding:'10px',
                    fontSize:14,fontWeight:600,cursor:'pointer',
                    fontFamily:'Outfit,sans-serif',opacity:forgotLoading?0.7:1
                  }}>
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}