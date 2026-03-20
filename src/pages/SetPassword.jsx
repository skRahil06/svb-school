import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import logo from '/logo.jpeg'

const classes = [
  'Class 1','Class 2','Class 3','Class 4','Class 5',
  'Class 6','Class 7','Class 8','Class 9','Class 10'
]

export default function SetPassword() {
  const [step, setStep] = useState(1) // 1=password, 2=profile
  const [role, setRole] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  // Parent fields
  const [childName, setChildName] = useState('')
  const [childClass, setChildClass] = useState('')
  const [rollNumber, setRollNumber] = useState('')

  // Teacher/Admin fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

  const navigate = useNavigate()

useEffect(() => {
  const handleAuth = async () => {
    try {
      // First check URL params for invite token
      const params = new URLSearchParams(window.location.search)
      const tokenHash = params.get('token_hash')
      const type = params.get('type')

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type,
        })
        if (error) { console.log('OTP error:', error.message); return }
      }

      // Check hash for password recovery
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        const hashParams = new URLSearchParams(hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        if (accessToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken ?? ''
          })
          if (error) { console.log('Session error:', error.message); return }
        }
      }

      // Wait a moment for session to establish
      await new Promise(resolve => setTimeout(resolve, 500))

      // Now get user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) { console.log('User error:', userError.message); return }

      if (user?.user_metadata?.role) {
        setRole(user.user_metadata.role)
      }

    } catch (err) {
      console.log('Auth error:', err.message)
    }
  }

  handleAuth()
}, [])

const handleSetPassword = async () => {
  if (password.length < 6) { 
    setError('Password must be at least 6 characters'); return 
  }
  if (password !== confirm) { 
    setError('Passwords do not match!'); return 
  }
  setLoading(true)
  const { error } = await supabase.auth.updateUser({ password })
  if (error) { setError(error.message); setLoading(false); return }
  setLoading(false)
  setStep(2)  // everyone goes to step 2
}

const handleSaveProfile = async () => {
  if (role === 'parent') {
    if (!childName || !childClass || !rollNumber) {
      setError('Please fill all fields'); return
    }
    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10 digit phone number'); return
    }
  } else if (role === 'teacher') {
    if (!firstName || !lastName) {
      setError('Please fill all fields'); return
    }
    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10 digit phone number'); return
    }
  }
  // admin — no phone validation needed!

  setLoading(true)
  const { data: { user } } = await supabase.auth.getUser()

  if (role === 'parent') {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: childName,
        role: 'parent',
        phone: phone,
        email: user.email
      })
    if (profileError) { setError(profileError.message); setLoading(false); return }

    const { data: classData } = await supabase
      .from('classes')
      .select('id')
      .eq('class_name', childClass)
      .single()

    const { error: studentError } = await supabase
      .from('students')
      .insert({
        full_name: childName,
        class_id: classData?.id,
        roll_number: parseInt(rollNumber),
        parent_id: user.id
      })
    if (studentError) { setError(studentError.message); setLoading(false); return }

  } else {
    // teacher or admin
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: firstName + ' ' + lastName,
        role: role,
        phone: phone || null,  // null for admin, filled for teacher
        email: user.email
      })
    if (profileError) { setError(profileError.message); setLoading(false); return }
  }

  setLoading(false)
  setDone(true)
  setTimeout(() => navigate('/login'), 2000)
}

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#e8f0fe,#c7d9fc)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:'Outfit,sans-serif'}}>
      <div style={{background:'#fff',borderRadius:20,padding:'40px 36px',maxWidth:440,width:'100%',boxShadow:'0 20px 60px rgba(26,79,160,0.15)'}}>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:28}}>
          <img src={logo} alt="SVB" style={{width:56,height:56,borderRadius:'50%',objectFit:'cover',border:'2px solid #1a4fa0',marginBottom:12}}/>
          <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:26,color:'#0a1628',marginBottom:4}}>
            {done ? '🎉 All Set!' : step === 1 ? 'Set Your Password' : 'Complete Your Profile'}
          </h2>
          <p style={{fontSize:13,color:'#aaa'}}>
            {done ? 'Redirecting to login...' : step === 1 ? 'Create a secure password for your account' : `Welcome! Just a few more details`}
          </p>
        </div>

        {/* Step indicator */}
        {!done && (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:28}}>
            {[1,2].map(s => (
              <div key={s} style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{
                  width:28,height:28,borderRadius:'50%',
                  background: step >= s ? '#1a4fa0' : '#e8f0fe',
                  color: step >= s ? '#fff' : '#aaa',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:12,fontWeight:600,transition:'all 0.3s'
                }}>{s}</div>
                {s < 2 && <div style={{width:40,height:2,background: step > s ? '#1a4fa0' : '#e8f0fe',transition:'all 0.3s'}}/>}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1 — Password */}
        {!done && step === 1 && (
          <>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:4}}>New Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Minimum 6 characters"
                style={{width:'100%',border:'none',borderBottom:'1.5px solid #ddd',padding:'10px 0',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif'}}
              />
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:4}}>Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError('') }}
                placeholder="Re-enter your password"
                onKeyDown={e => e.key === 'Enter' && handleSetPassword()}
                style={{width:'100%',border:'none',borderBottom:'1.5px solid #ddd',padding:'10px 0',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif'}}
              />
            </div>
            {error && <p style={{fontSize:12,color:'#e53935',marginBottom:12}}>{error}</p>}
            <button onClick={handleSetPassword} disabled={loading}
              style={{width:'100%',background:'#1a4fa0',color:'#fff',border:'none',borderRadius:10,padding:13,fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:'Outfit,sans-serif',opacity:loading?0.7:1}}>
              {loading ? 'Setting...' : 'Set Password →'}
            </button>
          </>
        )}

        {/* STEP 2 — Profile */}
{/* STEP 2 — Profile */}
{!done && step === 2 && (
  <>
    {/* PARENT FORM */}
    {role === 'parent' && (
      <>
        <div style={{background:'#f0f4ff',borderRadius:10,padding:'10px 14px',marginBottom:20,fontSize:13,color:'#1a4fa0'}}>
          👨‍👩‍👧 Please enter your child's details
        </div>

        {/* Child Name */}
        <div style={{marginBottom:16}}>
          <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:4}}>Child's Full Name</label>
          <input type="text" value={childName}
            onChange={e => { setChildName(e.target.value); setError('') }}
            placeholder="e.g. Arjun Sharma"
            style={{width:'100%',border:'none',borderBottom:'1.5px solid #ddd',padding:'10px 0',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif'}}
          />
        </div>

        {/* Roll Number */}
        <div style={{marginBottom:16}}>
          <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:4}}>Roll Number</label>
          <input type="number" value={rollNumber}
            onChange={e => { setRollNumber(e.target.value); setError('') }}
            placeholder="e.g. 12"
            style={{width:'100%',border:'none',borderBottom:'1.5px solid #ddd',padding:'10px 0',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif'}}
          />
        </div>

        {/* Class */}
        <div style={{marginBottom:16}}>
          <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:4}}>Child's Class</label>
          <select value={childClass} onChange={e => setChildClass(e.target.value)}
            style={{width:'100%',border:'none',borderBottom:'1.5px solid #ddd',padding:'10px 0',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif',background:'transparent',cursor:'pointer'}}>
            <option value="">Select class</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Phone */}
        <div style={{marginBottom:20}}>
          <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:4}}>Phone Number</label>
          <input type="tel" value={phone}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '')
              if (val.length <= 10) setPhone(val)
            }}
            placeholder="e.g. 9876543210"
            maxLength={10}
            style={{width:'100%',border:'none',borderBottom:'1.5px solid #ddd',padding:'10px 0',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif'}}
          />
          {phone && phone.length < 10 && phone.length > 0 &&
            <p style={{fontSize:11,color:'#e53935',marginTop:4}}>Phone must be 10 digits</p>
          }
        </div>
      </>
    )}

    {/* TEACHER FORM ONLY */}
    {role === 'teacher' && (
      <>
        <div style={{background:'#f0f4ff',borderRadius:10,padding:'10px 14px',marginBottom:20,fontSize:13,color:'#1a4fa0'}}>
          🧑‍🏫 Please enter your details
        </div>

        {/* First Name */}
        <div style={{marginBottom:16}}>
          <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:4}}>First Name</label>
          <input type="text" value={firstName}
            onChange={e => { setFirstName(e.target.value); setError('') }}
            placeholder="e.g. Ravi"
            style={{width:'100%',border:'none',borderBottom:'1.5px solid #ddd',padding:'10px 0',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif'}}
          />
        </div>

        {/* Last Name */}
        <div style={{marginBottom:16}}>
          <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:4}}>Last Name</label>
          <input type="text" value={lastName}
            onChange={e => { setLastName(e.target.value); setError('') }}
            placeholder="e.g. Kumar"
            style={{width:'100%',border:'none',borderBottom:'1.5px solid #ddd',padding:'10px 0',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif'}}
          />
        </div>

        {/* Phone */}
        <div style={{marginBottom:20}}>
          <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:4}}>Phone Number</label>
          <input type="tel" value={phone}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '')
              if (val.length <= 10) setPhone(val)
            }}
            placeholder="e.g. 9876543210"
            maxLength={10}
            style={{width:'100%',border:'none',borderBottom:'1.5px solid #ddd',padding:'10px 0',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif'}}
          />
          {phone && phone.length < 10 && phone.length > 0 &&
            <p style={{fontSize:11,color:'#e53935',marginTop:4}}>Phone must be 10 digits</p>
          }
        </div>
      </>
    )}

    {/* No role found */}
    {!role && (
      <div style={{textAlign:'center',color:'#aaa',fontSize:14,padding:'20px 0'}}>
        Loading your profile type...
      </div>
    )}

    {error && <p style={{fontSize:12,color:'#e53935',marginBottom:12}}>{error}</p>}

    {role && (
      <button onClick={handleSaveProfile} disabled={loading}
        style={{width:'100%',background:'#1a4fa0',color:'#fff',border:'none',borderRadius:10,padding:13,fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:'Outfit,sans-serif',opacity:loading?0.7:1}}>
        {loading ? 'Saving...' : 'Save & Continue →'}
      </button>
    )}
  </>
)}

{/* DONE */}
{done && (
  <div style={{textAlign:'center',padding:'20px 0'}}>
    <div style={{fontSize:48,marginBottom:12}}>🎉</div>
    <p style={{fontSize:14,color:'#555'}}>Your account is ready!</p>
    <p style={{fontSize:13,color:'#aaa',marginTop:4}}>Redirecting to login...</p>
  </div>
)}

      </div>
    </div>
  )
}