import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import logo from '/logo.jpeg'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [adminName, setAdminName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') { navigate('/login'); return }
    setAdminName(profile.full_name)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const tabs = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'students', icon: '🎓', label: 'Students' },
    { id: 'announcements', icon: '📢', label: 'Announcements' },
  ]

  return (
    <div style={{minHeight:'100vh',background:'#f7f9ff',fontFamily:'Outfit,sans-serif',display:'flex'}}>

      {/* SIDEBAR */}
      <div style={{width:220,background:'#0a1628',display:'flex',flexDirection:'column',position:'fixed',top:0,left:0,bottom:0,zIndex:100}}>

        {/* Logo */}
        <div style={{padding:'24px 20px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <img src={logo} alt="SVB" style={{width:36,height:36,borderRadius:'50%',objectFit:'cover',border:'2px solid rgba(255,255,255,0.2)'}}/>
            <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:12,color:'#fff',lineHeight:1.3}}>
              Sree Viswabharathi<br/>EM High School
            </div>
          </div>
        </div>

        {/* Admin info */}
        <div style={{padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'#1a4fa0',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}>
            <span style={{color:'#fff',fontSize:14}}>📊</span>
          </div>
          <div style={{fontSize:13,color:'#fff',fontWeight:500}}>{adminName || 'Admin'}</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:2}}>Management</div>
        </div>

        {/* Nav tabs */}
        <div style={{flex:1,padding:'12px 0'}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                width:'100%',display:'flex',alignItems:'center',gap:12,
                padding:'12px 20px',border:'none',cursor:'pointer',
                background: activeTab===t.id ? 'rgba(26,79,160,0.4)' : 'transparent',
                color: activeTab===t.id ? '#fff' : 'rgba(255,255,255,0.5)',
                fontSize:14,fontFamily:'Outfit,sans-serif',
                borderLeft: activeTab===t.id ? '3px solid #4a7fd4' : '3px solid transparent',
                transition:'all 0.2s',textAlign:'left'
              }}>
              <span style={{fontSize:16}}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Logout */}
        <div style={{padding:'16px 20px',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
          <button onClick={handleLogout}
            style={{width:'100%',background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.5)',border:'none',borderRadius:8,padding:'10px',fontSize:13,cursor:'pointer',fontFamily:'Outfit,sans-serif',display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{marginLeft:220,flex:1,padding:'32px'}}>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && <DashboardTab />}

        {/* Users Tab */}
        {activeTab === 'users' && <UsersTab />}

        {/* Students Tab */}
        {activeTab === 'students' && <StudentsTab />}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && <AnnouncementsTab />}

      </div>
    </div>
  )
}

// ─── DASHBOARD TAB ───────────────────────────────
function DashboardTab() {
  const [stats, setStats] = useState({ students: 0, teachers: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      const { count: students } = await supabase
        .from('students').select('*', { count: 'exact', head: true })
      const { data: teachers } = await supabase
        .from('profiles').select('role').eq('role', 'teacher')
      setStats({
        students: students || 0,
        teachers: teachers?.length || 0
      })
    }
    fetchStats()
  }, [])

  const cards = [
    { icon:'🎓', label:'Total Students', value: stats.students, color:'#1a4fa0' },
    { icon:'🧑‍🏫', label:'Teachers', value: stats.teachers, color:'#0891b2' },
  ]

  return (
    <div>
      <div style={{marginBottom:28}}>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:32,color:'#0a1628',marginBottom:4}}>Dashboard</h1>
        <p style={{fontSize:14,color:'#888'}}>Overview of Sree Viswabharathi EM High School</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:32}}>
        {cards.map(c => (
          <div key={c.label} style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
            <div style={{fontSize:28,marginBottom:12}}>{c.icon}</div>
            <div style={{fontSize:32,fontWeight:700,color:c.color,fontFamily:'Cormorant Garamond,serif'}}>{c.value}</div>
            <div style={{fontSize:13,color:'#888',marginTop:4}}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── USERS TAB ───────────────────────────────────
function UsersTab() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('parent')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [users, setUsers] = useState([])

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
  }

    const handleInvite = async () => {
    if (!email) { setError('Please enter an email'); return }
    setLoading(true)
    setError('')
    setSuccess('')

    try {
        const { data: { session } } = await supabase.auth.getSession()
        
        const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`,
        {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ email, role })
        }
        )

        const data = await response.json()

        if (!response.ok || data.error) {
        setError(data.error || 'Failed to send invite')
        setLoading(false)
        return
        }

        setSuccess(`✅ Invite sent to ${email}!`)
        setEmail('')
        fetchUsers()

    } catch (err) {
        setError(err.message)
    }

    setLoading(false)
    }

  const roleColors = {
    admin: { bg:'#fee2e2', color:'#991b1b' },
    teacher: { bg:'#dbeafe', color:'#1e40af' },
    parent: { bg:'#d1fae5', color:'#065f46' },
  }

  return (
    <div>
      <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:32,color:'#0a1628',marginBottom:4}}>Users</h1>
      <p style={{fontSize:14,color:'#888',marginBottom:28}}>Invite and manage school portal users</p>

      {/* Invite Form */}
      <div style={{background:'#fff',borderRadius:16,padding:'28px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)',marginBottom:28}}>
        <h3 style={{fontSize:16,fontWeight:600,color:'#0a1628',marginBottom:20}}>➕ Invite New User</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:12,alignItems:'end'}}>

          <div>
            <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:6}}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@gmail.com"
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
              style={{width:'100%',border:'1px solid #e0e7ff',borderRadius:8,padding:'10px 12px',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif'}}
            />
          </div>

          <div>
            <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:6}}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              style={{width:'100%',border:'1px solid #e0e7ff',borderRadius:8,padding:'10px 12px',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif',background:'#fff',cursor:'pointer'}}>
              <option value="parent">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button onClick={handleInvite} disabled={loading}
            style={{background:'#1a4fa0',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'Outfit,sans-serif',opacity:loading?0.7:1,whiteSpace:'nowrap'}}>
            {loading ? 'Sending...' : 'Send Invite'}
          </button>

        </div>

        {success && <p style={{fontSize:13,color:'#065f46',marginTop:12,background:'#d1fae5',padding:'8px 12px',borderRadius:8}}>{success}</p>}
        {error && <p style={{fontSize:13,color:'#991b1b',marginTop:12,background:'#fee2e2',padding:'8px 12px',borderRadius:8}}>{error}</p>}
      </div>

      {/* Users List */}
      <div style={{background:'#fff',borderRadius:16,padding:'28px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
        <h3 style={{fontSize:16,fontWeight:600,color:'#0a1628',marginBottom:20}}>👥 All Users ({users.length})</h3>
        {users.length === 0 ? (
          <p style={{color:'#aaa',fontSize:14,textAlign:'center',padding:'20px 0'}}>No users yet — invite your first user above!</p>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {users.map(u => (
              <div key={u.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'#f7f9ff',borderRadius:10,border:'1px solid rgba(26,79,160,0.06)'}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'#e8f0fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>
                    {u.role==='admin'?'📊':u.role==='teacher'?'🧑‍🏫':'👨‍👩‍👧'}
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,color:'#0a1628'}}>{u.full_name}</div>
                    <div style={{fontSize:12,color:'#888',marginTop:1}}>Joined {new Date(u.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
                <span style={{fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:20,...(roleColors[u.role]||roleColors.parent)}}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── STUDENTS TAB ─────────────────────────────────
function StudentsTab() {
  const [students, setStudents] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchStudents() }, [])

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select('*, classes(class_name)')
      .order('created_at', { ascending: false })
    setStudents(data || [])
  }

  const filtered = filter === 'all' ? students :
    students.filter(s => s.classes?.class_name === filter)

  const classOptions = ['all', ...Array.from(new Set(students.map(s => s.classes?.class_name).filter(Boolean)))]

  return (
    <div>
      <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:32,color:'#0a1628',marginBottom:4}}>Students</h1>
      <p style={{fontSize:14,color:'#888',marginBottom:28}}>All enrolled students across classes</p>

      {/* Filter */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {classOptions.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            style={{padding:'6px 14px',borderRadius:20,border:'1px solid',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'Outfit,sans-serif',
              background: filter===c ? '#1a4fa0' : '#fff',
              color: filter===c ? '#fff' : '#666',
              borderColor: filter===c ? '#1a4fa0' : '#e0e7ff'
            }}>
            {c === 'all' ? 'All Classes' : c}
          </button>
        ))}
      </div>

      <div style={{background:'#fff',borderRadius:16,padding:'28px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
        {filtered.length === 0 ? (
          <p style={{color:'#aaa',fontSize:14,textAlign:'center',padding:'20px 0'}}>No students found</p>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'2px solid #e8f0fe'}}>
                {['Roll No','Student Name','Class'].map(h => (
                  <th key={h} style={{textAlign:'left',padding:'10px 12px',fontSize:12,fontWeight:600,color:'#1a4fa0',textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s,i) => (
                <tr key={s.id} style={{borderBottom:'1px solid #f0f4ff',background: i%2===0 ? '#fff' : '#fafbff'}}>
                  <td style={{padding:'12px',fontSize:13,color:'#888'}}>{s.roll_number}</td>
                  <td style={{padding:'12px',fontSize:14,fontWeight:500,color:'#0a1628'}}>{s.full_name}</td>
                  <td style={{padding:'12px',fontSize:13,color:'#555'}}>{s.classes?.class_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── ANNOUNCEMENTS TAB ────────────────────────────
function AnnouncementsTab() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [target, setTarget] = useState('all')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => { fetchAnnouncements() }, [])

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
    setAnnouncements(data || [])
  }

  const handlePost = async () => {
    if (!title || !content) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('announcements').insert({
      title, content,
      target_role: target,
      created_by: user.id
    })
    setTitle(''); setContent('')
    setSuccess('✅ Announcement posted!')
    setLoading(false)
    fetchAnnouncements()
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div>
      <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:32,color:'#0a1628',marginBottom:4}}>Announcements</h1>
      <p style={{fontSize:14,color:'#888',marginBottom:28}}>Post updates for parents, teachers or everyone</p>

      {/* Post form */}
      <div style={{background:'#fff',borderRadius:16,padding:'28px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)',marginBottom:28}}>
        <h3 style={{fontSize:16,fontWeight:600,color:'#0a1628',marginBottom:20}}>📢 New Announcement</h3>

        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:6}}>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. School closed for Ugadi"
            style={{width:'100%',border:'1px solid #e0e7ff',borderRadius:8,padding:'10px 12px',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif'}}/>
        </div>

        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:6}}>Message</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Type your announcement here..."
            rows={3}
            style={{width:'100%',border:'1px solid #e0e7ff',borderRadius:8,padding:'10px 12px',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif',resize:'vertical'}}/>
        </div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <div>
            <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:6}}>Send To</label>
            <select value={target} onChange={e => setTarget(e.target.value)}
              style={{border:'1px solid #e0e7ff',borderRadius:8,padding:'10px 12px',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif',background:'#fff',cursor:'pointer'}}>
              <option value="all">Everyone</option>
              <option value="parent">Parents only</option>
              <option value="teacher">Teachers only</option>
            </select>
          </div>
          <button onClick={handlePost} disabled={loading||!title||!content}
            style={{background:'#1a4fa0',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'Outfit,sans-serif',opacity:loading||!title||!content?0.6:1}}>
            {loading ? 'Posting...' : 'Post Announcement'}
          </button>
        </div>
        {success && <p style={{fontSize:13,color:'#065f46',marginTop:12,background:'#d1fae5',padding:'8px 12px',borderRadius:8}}>{success}</p>}
      </div>

      {/* List */}
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {announcements.map(a => (
          <div key={a.id} style={{background:'#fff',borderRadius:12,padding:'20px',boxShadow:'0 2px 8px rgba(26,79,160,0.06)',border:'1px solid rgba(26,79,160,0.06)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <h4 style={{fontSize:15,fontWeight:600,color:'#0a1628'}}>{a.title}</h4>
              <span style={{fontSize:11,background:'#e8f0fe',color:'#1a4fa0',padding:'2px 10px',borderRadius:20,fontWeight:500,whiteSpace:'nowrap',marginLeft:12}}>
                {a.target_role === 'all' ? 'Everyone' : a.target_role}
              </span>
            </div>
            <p style={{fontSize:13,color:'#666',lineHeight:1.6,marginBottom:8}}>{a.content}</p>
            <p style={{fontSize:11,color:'#aaa'}}>{new Date(a.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</p>
          </div>
        ))}
      </div>
    </div>
  )
}