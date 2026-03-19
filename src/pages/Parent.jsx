import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import logo from '/logo.jpeg'

export default function Parent() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [parentName, setParentName] = useState('')
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
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

    if (profile?.role !== 'parent') { navigate('/login'); return }
    setParentName(profile.full_name)

    // Get child details
    const { data: studentData } = await supabase
      .from('students')
      .select('*, classes(class_name)')
      .eq('parent_id', user.id)
      .single()

    setStudent(studentData)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const tabs = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'attendance', icon: '📅', label: 'Attendance' },
    { id: 'marks', icon: '📝', label: 'Marks' },
    { id: 'announcements', icon: '📢', label: 'Announcements' },
  ]

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Outfit,sans-serif',background:'#f7f9ff'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:12}}>⏳</div>
        <p style={{color:'#888'}}>Loading your portal...</p>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f7f9ff',fontFamily:'Outfit,sans-serif'}}>

      {/* TOP NAV — Mobile friendly */}
      <div style={{background:'#0a1628',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <img src={logo} alt="SVB" style={{width:36,height:36,borderRadius:'50%',objectFit:'cover',border:'2px solid rgba(255,255,255,0.2)'}}/>
          <div>
            <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:13,color:'#fff',fontWeight:600}}>SVB School</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>Parent Portal</div>
          </div>
        </div>
        <button onClick={handleLogout}
          style={{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.7)',border:'none',borderRadius:8,padding:'7px 14px',fontSize:12,cursor:'pointer',fontFamily:'Outfit,sans-serif'}}>
          Logout
        </button>
      </div>

      {/* CHILD INFO BANNER */}
      {student && (
        <div style={{background:'linear-gradient(135deg,#1a4fa0,#2563c4)',padding:'20px',margin:'0'}}>
          <div style={{maxWidth:680,margin:'0 auto',display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:52,height:52,borderRadius:'50%',background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>
              🎓
            </div>
            <div>
              <div style={{fontSize:18,fontWeight:600,color:'#fff',fontFamily:'Cormorant Garamond,serif'}}>{student.full_name}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.7)',marginTop:2}}>
                {student.classes?.class_name} · Roll No. {student.roll_number}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB BAR — Mobile bottom style */}
      <div style={{background:'#fff',borderBottom:'1px solid #e8f0fe',position:'sticky',top:64,zIndex:99}}>
        <div style={{maxWidth:680,margin:'0 auto',display:'flex'}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                flex:1,padding:'12px 4px',border:'none',cursor:'pointer',
                background:'transparent',
                color: activeTab===t.id ? '#1a4fa0' : '#888',
                fontSize:11,fontFamily:'Outfit,sans-serif',fontWeight:500,
                borderBottom: activeTab===t.id ? '2px solid #1a4fa0' : '2px solid transparent',
                transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:4
              }}>
              <span style={{fontSize:18}}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:680,margin:'0 auto',padding:'20px 16px'}}>
        {activeTab === 'dashboard' && <DashboardTab student={student} />}
        {activeTab === 'attendance' && <AttendanceTab student={student} />}
        {activeTab === 'marks' && <MarksTab student={student} />}
        {activeTab === 'announcements' && <AnnouncementsTab />}
      </div>

    </div>
  )
}

// ─── DASHBOARD TAB ───────────────────────────────
function DashboardTab({ student }) {
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 })
  const [recentMarks, setRecentMarks] = useState([])
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    if (student) {
      fetchStats()
      fetchRecentMarks()
      fetchAnnouncements()
    }
  }, [student])

  const fetchStats = async () => {
    const { data } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', student.id)

    const present = data?.filter(a => a.status === 'present').length || 0
    const absent = data?.filter(a => a.status === 'absent').length || 0
    setStats({ present, absent, total: present + absent })
  }

  const fetchRecentMarks = async () => {
    const { data } = await supabase
      .from('marks')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })
      .limit(6)
    setRecentMarks(data || [])
  }

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
    setAnnouncements(data || [])
  }

  const attendancePct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
  const pctColor = attendancePct >= 75 ? '#16a34a' : attendancePct >= 60 ? '#d97706' : '#dc2626'
  const pctBg = attendancePct >= 75 ? '#f0fdf4' : attendancePct >= 60 ? '#fffbeb' : '#fff5f5'

  return (
    <div>
      {/* Attendance summary card */}
      <div style={{background:'#fff',borderRadius:16,padding:'20px',marginBottom:16,boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
        <div style={{fontSize:13,fontWeight:600,color:'#888',marginBottom:14,textTransform:'uppercase',letterSpacing:'0.05em'}}>Attendance Overview</div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:pctBg,border:`3px solid ${pctColor}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <span style={{fontSize:18,fontWeight:700,color:pctColor}}>{attendancePct}%</span>
          </div>
          <div style={{flex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:13,color:'#555'}}>Present</span>
              <span style={{fontSize:13,fontWeight:600,color:'#16a34a'}}>{stats.present} days</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{fontSize:13,color:'#555'}}>Absent</span>
              <span style={{fontSize:13,fontWeight:600,color:'#dc2626'}}>{stats.absent} days</span>
            </div>
            <div style={{height:6,background:'#f0f0f0',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${attendancePct}%`,background:pctColor,borderRadius:3,transition:'width 0.5s'}}/>
            </div>
          </div>
        </div>
        {attendancePct < 75 && stats.total > 0 && (
          <div style={{marginTop:12,background:'#fff5f5',borderRadius:8,padding:'8px 12px',fontSize:12,color:'#dc2626'}}>
            ⚠️ Attendance below 75% — please ensure regular attendance
          </div>
        )}
      </div>

      {/* Recent marks */}
      {recentMarks.length > 0 && (
        <div style={{background:'#fff',borderRadius:16,padding:'20px',marginBottom:16,boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
          <div style={{fontSize:13,fontWeight:600,color:'#888',marginBottom:14,textTransform:'uppercase',letterSpacing:'0.05em'}}>Recent Marks</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {recentMarks.map(m => (
              <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:'#f7f9ff',borderRadius:8}}>
                <div>
                  <div style={{fontSize:14,fontWeight:500,color:'#0a1628'}}>{m.subject}</div>
                  <div style={{fontSize:11,color:'#888',marginTop:1}}>{m.term}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:18,fontWeight:700,color: m.score >= 35 ? '#16a34a' : '#dc2626',fontFamily:'Cormorant Garamond,serif'}}>{m.score}</div>
                  <div style={{fontSize:11,color:'#888'}}>out of {m.max_score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <div style={{background:'#fff',borderRadius:16,padding:'20px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
          <div style={{fontSize:13,fontWeight:600,color:'#888',marginBottom:14,textTransform:'uppercase',letterSpacing:'0.05em'}}>Latest Announcements</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {announcements.map(a => (
              <div key={a.id} style={{padding:'10px 12px',background:'#f7f9ff',borderRadius:8,borderLeft:'3px solid #1a4fa0'}}>
                <div style={{fontSize:14,fontWeight:500,color:'#0a1628',marginBottom:3}}>{a.title}</div>
                <div style={{fontSize:12,color:'#666'}}>{a.content}</div>
                <div style={{fontSize:11,color:'#aaa',marginTop:4}}>{new Date(a.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ATTENDANCE TAB ──────────────────────────────
function AttendanceTab({ student }) {
  const [attendance, setAttendance] = useState([])
  const [month, setMonth] = useState(new Date().getMonth())
  const [year] = useState(new Date().getFullYear())

  useEffect(() => {
    if (student) fetchAttendance()
  }, [student, month])

  const fetchAttendance = async () => {
    const startDate = new Date(year, month, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', student.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date')

    setAttendance(data || [])
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const present = attendance.filter(a => a.status === 'present').length
  const absent = attendance.filter(a => a.status === 'absent').length

  // Build calendar
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const attMap = {}
  attendance.forEach(a => {
    const day = new Date(a.date).getDate()
    attMap[day] = a.status
  })

  return (
    <div>
      <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:26,color:'#0a1628',marginBottom:16}}>Attendance</h2>

      {/* Month selector */}
      <div style={{display:'flex',gap:8,marginBottom:20,overflowX:'auto',paddingBottom:4}}>
        {months.map((m, i) => (
          <button key={i} onClick={() => setMonth(i)}
            style={{padding:'6px 14px',borderRadius:20,border:'1px solid',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'Outfit,sans-serif',whiteSpace:'nowrap',flexShrink:0,
              background: month===i ? '#1a4fa0' : '#fff',
              color: month===i ? '#fff' : '#666',
              borderColor: month===i ? '#1a4fa0' : '#e0e7ff'}}>
            {m}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}>
        {[
          {label:'Present',value:present,color:'#16a34a',bg:'#f0fdf4'},
          {label:'Absent',value:absent,color:'#dc2626',bg:'#fff5f5'},
          {label:'Total',value:present+absent,color:'#1a4fa0',bg:'#eff6ff'},
        ].map(s => (
          <div key={s.label} style={{background:s.bg,borderRadius:12,padding:'14px',textAlign:'center'}}>
            <div style={{fontSize:24,fontWeight:700,color:s.color,fontFamily:'Cormorant Garamond,serif'}}>{s.value}</div>
            <div style={{fontSize:11,color:'#888',marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div style={{background:'#fff',borderRadius:16,padding:'20px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:8}}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{textAlign:'center',fontSize:11,color:'#aaa',fontWeight:600,padding:'4px 0'}}>{d}</div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
          {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1
            const status = attMap[day]
            return (
              <div key={day} style={{
                aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center',
                borderRadius:8,fontSize:12,fontWeight:500,
                background: status === 'present' ? '#dcfce7' : status === 'absent' ? '#fee2e2' : '#f7f9ff',
                color: status === 'present' ? '#16a34a' : status === 'absent' ? '#dc2626' : '#aaa',
                border: status ? 'none' : '1px solid #f0f0f0'
              }}>
                {day}
              </div>
            )
          })}
        </div>
        <div style={{display:'flex',gap:16,marginTop:14,justifyContent:'center'}}>
          {[{color:'#dcfce7',text:'#16a34a',label:'Present'},{color:'#fee2e2',text:'#dc2626',label:'Absent'},{color:'#f7f9ff',text:'#aaa',label:'No data'}].map(l => (
            <div key={l.label} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#666'}}>
              <div style={{width:14,height:14,borderRadius:3,background:l.color}}/>
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MARKS TAB ───────────────────────────────────
function MarksTab({ student }) {
  const [marks, setMarks] = useState([])
  const [term, setTerm] = useState('all')
  const terms = ['FA1','FA2','FA3','FA4','SA1','SA2']
  const subjects = ['Maths','Science','Social Studies','English','Telugu','Hindi']

  useEffect(() => {
    if (student) fetchMarks()
  }, [student, term])

  const fetchMarks = async () => {
    let query = supabase
      .from('marks')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })

    if (term !== 'all') query = query.eq('term', term)
    const { data } = await query
    setMarks(data || [])
  }

  const getMarkForSubject = (subj, t) =>
    marks.find(m => m.subject === subj && (term === 'all' ? true : m.term === t))

  const filteredTerms = term === 'all' ? ['FA1','FA2','FA3','FA4','SA1','SA2'] : [term]

  return (
    <div>
      <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:26,color:'#0a1628',marginBottom:16}}>Marks</h2>

      {/* Term filter */}
      <div style={{display:'flex',gap:8,marginBottom:20,overflowX:'auto',paddingBottom:4}}>
        {terms.map(t => (
          <button key={t} onClick={() => setTerm(t)}
            style={{padding:'6px 14px',borderRadius:20,border:'1px solid',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'Outfit,sans-serif',whiteSpace:'nowrap',flexShrink:0,
              background: term===t ? '#1a4fa0' : '#fff',
              color: term===t ? '#fff' : '#666',
              borderColor: term===t ? '#1a4fa0' : '#e0e7ff'}}>
            {t === 'all' ? 'All Terms' : t}
          </button>
        ))}
      </div>

      {marks.length === 0 ? (
        <div style={{background:'#fff',borderRadius:16,padding:'40px 20px',textAlign:'center',boxShadow:'0 2px 12px rgba(26,79,160,0.08)'}}>
          <div style={{fontSize:36,marginBottom:12}}>📝</div>
          <p style={{color:'#aaa',fontSize:14}}>No marks available yet</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {subjects.map(subj => {
            const subjectMarks = marks.filter(m => m.subject === subj)
            if (subjectMarks.length === 0) return null
            return (
              <div key={subj} style={{background:'#fff',borderRadius:16,padding:'20px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
                <div style={{fontSize:15,fontWeight:600,color:'#0a1628',marginBottom:12}}>{subj}</div>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {subjectMarks.map(m => (
                    <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:'#f7f9ff',borderRadius:8}}>
                      <span style={{fontSize:13,color:'#555'}}>{m.term}</span>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:16,fontWeight:700,color: m.score >= 35 ? '#16a34a' : '#dc2626',fontFamily:'Cormorant Garamond,serif'}}>{m.score}/{m.max_score}</span>
                        <span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:10,
                          background: m.score >= 35 ? '#dcfce7' : '#fee2e2',
                          color: m.score >= 35 ? '#16a34a' : '#dc2626'}}>
                          {m.score >= 35 ? 'Pass' : 'Fail'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── ANNOUNCEMENTS TAB ────────────────────────────
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => { fetchAnnouncements() }, [])

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .in('target_role', ['all', 'parent'])
      .order('created_at', { ascending: false })
    setAnnouncements(data || [])
  }

  return (
    <div>
      <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:26,color:'#0a1628',marginBottom:16}}>Announcements</h2>
      {announcements.length === 0 ? (
        <div style={{background:'#fff',borderRadius:16,padding:'40px 20px',textAlign:'center',boxShadow:'0 2px 12px rgba(26,79,160,0.08)'}}>
          <div style={{fontSize:36,marginBottom:12}}>📢</div>
          <p style={{color:'#aaa',fontSize:14}}>No announcements yet</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {announcements.map(a => (
            <div key={a.id} style={{background:'#fff',borderRadius:16,padding:'20px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)',borderLeft:'4px solid #1a4fa0'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <h4 style={{fontSize:15,fontWeight:600,color:'#0a1628'}}>{a.title}</h4>
                <span style={{fontSize:11,color:'#aaa',whiteSpace:'nowrap',marginLeft:12}}>
                  {new Date(a.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                </span>
              </div>
              <p style={{fontSize:13,color:'#666',lineHeight:1.6}}>{a.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}