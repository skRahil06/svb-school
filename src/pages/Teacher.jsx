import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import logo from '/logo.jpeg'

export default function Teacher() {
  const [activeTab, setActiveTab] = useState('attendance')
  const [teacherName, setTeacherName] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [classes, setClasses] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    fetchClasses()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'teacher') { navigate('/login'); return }
    setTeacherName(profile.full_name)
  }

  const fetchClasses = async () => {
    const { data } = await supabase
      .from('classes')
      .select('*')
      .order('id')
    setClasses(data || [])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const tabs = [
    { id: 'attendance', icon: '📅', label: 'Attendance' },
    { id: 'marks', icon: '📝', label: 'Marks' },
    { id: 'students', icon: '🎓', label: 'Students' },
  ]

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSidebarOpen(false) // close sidebar on mobile after selecting
  }

  const handleClassChange = (classId) => {
    setSelectedClass(classId)
    setSidebarOpen(false) // close sidebar after selecting class
  }

  return (
    <div style={{minHeight:'100vh',background:'#f7f9ff',fontFamily:'Outfit,sans-serif'}}>

      <style>{`
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 150;
        }
        .sidebar {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 240px;
          background: #0a1628;
          display: flex;
          flex-direction: column;
          z-index: 200;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
.main-content {
    margin-left: 0;
    padding: 76px 16px 90px 16px;
  }

        @media(min-width: 768px) {
          .sidebar {
            transform: translateX(0) !important;
          }
          .sidebar-overlay {
            display: none !important;
          }
    .main-content {
      margin-left: 240px;
      padding: 32px;
    }
          .mobile-topbar {
            display: none !important;
          }
        }

        .sidebar.open {
          transform: translateX(0);
        }
        .sidebar-overlay.open {
          display: block !important;
        }
      `}</style>

      {/* MOBILE TOP BAR */}
      <div className="mobile-topbar" style={{
        position:'fixed',top:0,left:0,right:0,zIndex:100,
        background:'#0a1628',padding:'12px 16px',
        display:'flex',alignItems:'center',justifyContent:'space-between'
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <button onClick={() => setSidebarOpen(true)}
            style={{background:'none',border:'none',cursor:'pointer',padding:4,display:'flex',flexDirection:'column',gap:4}}>
            <span style={{display:'block',width:22,height:2,background:'#fff',borderRadius:2}}/>
            <span style={{display:'block',width:22,height:2,background:'#fff',borderRadius:2}}/>
            <span style={{display:'block',width:22,height:2,background:'#fff',borderRadius:2}}/>
          </button>
          <img src={logo} alt="SVB" style={{width:32,height:32,borderRadius:'50%',objectFit:'cover'}}/>
          <span style={{color:'#fff',fontSize:14,fontWeight:500}}>Teacher Portal</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {/* Class indicator */}
          {selectedClass && (
            <span style={{fontSize:12,color:'rgba(255,255,255,0.7)',background:'rgba(255,255,255,0.1)',padding:'4px 10px',borderRadius:20}}>
              {classes.find(c => c.id == selectedClass)?.class_name}
            </span>
          )}
        </div>
      </div>

      {/* MOBILE TAB BAR — bottom */}
      <div className="mobile-topbar" style={{
        position:'fixed',bottom:0,left:0,right:0,zIndex:100,
        background:'#fff',borderTop:'1px solid #e8f0fe',
        display:'flex',padding:'0'
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => handleTabChange(t.id)}
            style={{
              flex:1,padding:'10px 4px',border:'none',cursor:'pointer',
              background:'transparent',
              color: activeTab===t.id ? '#1a4fa0' : '#888',
              fontSize:10,fontFamily:'Outfit,sans-serif',fontWeight:500,
              borderTop: activeTab===t.id ? '2px solid #1a4fa0' : '2px solid transparent',
              display:'flex',flexDirection:'column',alignItems:'center',gap:3
            }}>
            <span style={{fontSize:20}}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* SIDEBAR OVERLAY */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}/>

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>

        {/* Logo */}
        <div style={{padding:'20px 20px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <img src={logo} alt="SVB" style={{width:36,height:36,borderRadius:'50%',objectFit:'cover',border:'2px solid rgba(255,255,255,0.2)'}}/>
            <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:12,color:'#fff',lineHeight:1.3}}>
              Sree Viswabharathi<br/>EM High School
            </div>
          </div>
        </div>

        {/* Teacher info */}
        <div style={{padding:'14px 20px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'#0891b2',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}>
            <span style={{color:'#fff',fontSize:16}}>🧑‍🏫</span>
          </div>
          <div style={{fontSize:13,color:'#fff',fontWeight:500}}>{teacherName}</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:2}}>Teacher</div>
        </div>

        {/* Class selector */}
        <div style={{padding:'12px 20px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <label style={{fontSize:11,color:'rgba(255,255,255,0.4)',display:'block',marginBottom:6}}>SELECTED CLASS</label>
          <select value={selectedClass} onChange={e => handleClassChange(e.target.value)}
            style={{width:'100%',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,padding:'8px 10px',color:'#fff',fontSize:13,fontFamily:'Outfit,sans-serif',cursor:'pointer',outline:'none'}}>
            <option value="">Select class</option>
            {classes.map(c => (
              <option key={c.id} value={c.id} style={{background:'#0a1628'}}>{c.class_name}</option>
            ))}
          </select>
        </div>

        {/* Nav tabs */}
        <div style={{flex:1,padding:'12px 0'}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => handleTabChange(t.id)}
              style={{
                width:'100%',display:'flex',alignItems:'center',gap:12,
                padding:'12px 20px',border:'none',cursor:'pointer',
                background: activeTab===t.id ? 'rgba(8,145,178,0.3)' : 'transparent',
                color: activeTab===t.id ? '#fff' : 'rgba(255,255,255,0.5)',
                fontSize:14,fontFamily:'Outfit,sans-serif',
                borderLeft: activeTab===t.id ? '3px solid #0891b2' : '3px solid transparent',
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
      <div className="main-content" style={{padding:'20px 16px 80px'}}>
        {!selectedClass && activeTab !== 'students' ? (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'70vh',gap:16,textAlign:'center'}}>
            <div style={{fontSize:48}}>📚</div>
            <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:28,color:'#0a1628'}}>Select a Class</h2>
            <p style={{color:'#888',fontSize:15,marginBottom:8}}>Tap the menu ☰ to select a class</p>
            <button onClick={() => setSidebarOpen(true)}
              style={{background:'#1a4fa0',color:'#fff',border:'none',borderRadius:10,padding:'12px 28px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'Outfit,sans-serif'}}>
              ☰ Open Menu
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'attendance' && selectedClass && <AttendanceTab selectedClass={selectedClass} classes={classes} />}
            {activeTab === 'marks' && selectedClass && <MarksTab selectedClass={selectedClass} classes={classes} />}
            {activeTab === 'students' && <StudentsTab selectedClass={selectedClass} classes={classes} />}
          </>
        )}
      </div>

    </div>
  )
}

// ─── ATTENDANCE TAB ──────────────────────────────
function AttendanceTab({ selectedClass, classes }) {
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [alreadyMarked, setAlreadyMarked] = useState(false)

  useEffect(() => {
    if (selectedClass) {
      fetchStudents()
    }
  }, [selectedClass, date])

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', selectedClass)
      .order('roll_number')

    setStudents(data || [])

    // Check if attendance already marked for this date
    if (data && data.length > 0) {
      const { data: existing } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('date', date)
        .in('student_id', data.map(s => s.id))

        console.log('Existing attendance:', existing)
console.log('Date being checked:', date)

      if (existing && existing.length > 0) {
        setAlreadyMarked(true)
        const att = {}
        existing.forEach(e => att[e.student_id] = e.status)
        setAttendance(att)
      } else {
        setAlreadyMarked(false)
        // Default all present
        const att = {}
        data.forEach(s => att[s.id] = 'present')
        setAttendance(att)
      }
    }
  }

  const toggleAttendance = (studentId) => {
    if (alreadyMarked) return
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }))
  }

const handleSubmit = async () => {
  setLoading(true)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Add null check
  if (!user) {
    setLoading(false)
    alert('Session expired! Please login again.')
    return
  }

  const records = students.map(s => ({
    student_id: s.id,
    date,
    status: attendance[s.id] || 'present',
    marked_by: user.id
  }))

  const { error } = await supabase.from('attendance').insert(records)

  if (error) {
    console.log(error)
    setLoading(false)
    return
  }

  setSuccess('✅ Attendance saved successfully!')
  setAlreadyMarked(true)
  setLoading(false)
  setTimeout(() => setSuccess(''), 3000)
}

  const className = classes.find(c => c.id == selectedClass)?.class_name
  const presentCount = Object.values(attendance).filter(v => v === 'present').length
  const absentCount = Object.values(attendance).filter(v => v === 'absent').length

  return (
    <div>
      <div style={{marginBottom:28}}>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:32,color:'#0a1628',marginBottom:4}}>
          Attendance — {className}
        </h1>
        <p style={{fontSize:14,color:'#888'}}>Mark daily attendance for your students</p>
      </div>

      {/* Date + Stats */}
      <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24,flexWrap:'wrap'}}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{border:'1px solid #e0e7ff',borderRadius:8,padding:'8px 12px',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif',cursor:'pointer'}}/>
        <div style={{background:'#d1fae5',color:'#065f46',padding:'6px 14px',borderRadius:20,fontSize:13,fontWeight:500}}>
          ✅ Present: {presentCount}
        </div>
        <div style={{background:'#fee2e2',color:'#991b1b',padding:'6px 14px',borderRadius:20,fontSize:13,fontWeight:500}}>
          ❌ Absent: {absentCount}
        </div>
        {alreadyMarked && (
          <div style={{background:'#fef3c7',color:'#92400e',padding:'6px 14px',borderRadius:20,fontSize:13,fontWeight:500}}>
            ⚠️ Already marked for this date
          </div>
        )}
      </div>

      {/* Students list */}
      <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)',marginBottom:20}}>
        {students.length === 0 ? (
          <p style={{color:'#aaa',textAlign:'center',padding:'20px 0'}}>No students in this class yet</p>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {students.map(s => (
              <div key={s.id}
                onClick={() => toggleAttendance(s.id)}
                style={{
                  display:'flex',alignItems:'center',justifyContent:'space-between',
                  padding:'14px 16px',borderRadius:10,cursor: alreadyMarked ? 'default' : 'pointer',
                  background: attendance[s.id] === 'present' ? '#f0fdf4' : '#fff5f5',
                  border: `1px solid ${attendance[s.id] === 'present' ? '#86efac' : '#fca5a5'}`,
                  transition:'all 0.2s'
                }}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:32,height:32,borderRadius:'50%',
                    background: attendance[s.id] === 'present' ? '#22c55e' : '#ef4444',
                    display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:14}}>
                    {attendance[s.id] === 'present' ? '✓' : '✗'}
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,color:'#0a1628'}}>{s.full_name}</div>
                    <div style={{fontSize:12,color:'#888'}}>Roll No. {s.roll_number}</div>
                  </div>
                </div>
                <span style={{fontSize:13,fontWeight:600,
                  color: attendance[s.id] === 'present' ? '#16a34a' : '#dc2626'}}>
                  {attendance[s.id] === 'present' ? 'Present' : 'Absent'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {success && <p style={{fontSize:13,color:'#065f46',marginBottom:12,background:'#d1fae5',padding:'10px 14px',borderRadius:8}}>{success}</p>}

      {!alreadyMarked && students.length > 0 && (
        <button onClick={handleSubmit} disabled={loading}
          style={{background:'#0a1628',color:'#fff',border:'none',borderRadius:10,padding:'13px 32px',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:'Outfit,sans-serif',opacity:loading?0.7:1}}>
          {loading ? 'Saving...' : '💾 Save Attendance'}
        </button>
      )}
    </div>
  )
}

// ─── MARKS TAB ───────────────────────────────────
function MarksTab({ selectedClass, classes }) {
  const [students, setStudents] = useState([])
  const [marks, setMarks] = useState({})
  const [subject, setSubject] = useState('Maths')
  const [term, setTerm] = useState('FA1')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [alreadyEntered, setAlreadyEntered] = useState(false)

  const subjects = ['Maths','Science','Social Studies','English','Telugu','Hindi']
  const terms = ['FA1','FA2','FA3','FA4','SA1','SA2']

  useEffect(() => {
    if (selectedClass) fetchStudents()
  }, [selectedClass, subject, term])

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', selectedClass)
      .order('roll_number')
    setStudents(data || [])

    // Check if marks already entered
    if (data && data.length > 0) {
      const { data: existing } = await supabase
        .from('marks')
        .select('student_id, score')
        .eq('subject', subject)
        .eq('term', term)
        .in('student_id', data.map(s => s.id))

      if (existing && existing.length > 0) {
        setAlreadyEntered(true)
        const m = {}
        existing.forEach(e => m[e.student_id] = e.score)
        setMarks(m)
      } else {
        setAlreadyEntered(false)
        setMarks({})
      }
    }
  }

const handleSubmit = async () => {
  // Check if all students have marks entered
  const missingMarks = students.filter(s => 
    marks[s.id] === undefined || marks[s.id] === '' || marks[s.id] === null
  )

  if (missingMarks.length > 0) {
    alert(`Please enter marks for all students!\n\nMissing: ${missingMarks.map(s => s.full_name).join(', ')}`)
    return
  }

  setLoading(true)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    setLoading(false)
    alert('Session expired! Please login again.')
    return
  }

  const records = students.map(s => ({
    student_id: s.id,
    subject,
    score: parseInt(marks[s.id]),
    max_score: 100,
    term,
    academic_year: '2025-26',
    created_by: user.id
  }))

  const { error } = await supabase.from('marks').insert(records)

  if (error) {
    alert('Error saving marks: ' + error.message)
    setLoading(false)
    return
  }

  setSuccess('✅ Marks saved successfully!')
  setAlreadyEntered(true)
  setLoading(false)
  setTimeout(() => setSuccess(''), 3000)
}

  const className = classes.find(c => c.id == selectedClass)?.class_name

  return (
    <div>
      <div style={{marginBottom:28}}>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:32,color:'#0a1628',marginBottom:4}}>
          Marks — {className}
        </h1>
        <p style={{fontSize:14,color:'#888'}}>Enter exam marks for your students</p>
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        <div>
          <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:4}}>Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)}
            style={{border:'1px solid #e0e7ff',borderRadius:8,padding:'8px 12px',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif',background:'#fff',cursor:'pointer'}}>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:4}}>Term</label>
          <select value={term} onChange={e => setTerm(e.target.value)}
            style={{border:'1px solid #e0e7ff',borderRadius:8,padding:'8px 12px',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif',background:'#fff',cursor:'pointer'}}>
            {terms.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        {alreadyEntered && (
          <div style={{display:'flex',alignItems:'flex-end'}}>
            <div style={{background:'#fef3c7',color:'#92400e',padding:'8px 14px',borderRadius:8,fontSize:13,fontWeight:500}}>
              ⚠️ Marks already entered for {subject} — {term}
            </div>
          </div>
        )}
      </div>

      {/* Students marks input */}
      <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)',marginBottom:20}}>
        {students.length === 0 ? (
          <p style={{color:'#aaa',textAlign:'center',padding:'20px 0'}}>No students in this class yet</p>
        ) : (
          <>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12,padding:'0 16px'}}>
              <span style={{fontSize:12,fontWeight:600,color:'#1a4fa0',textTransform:'uppercase',letterSpacing:'0.05em'}}>Student</span>
              <span style={{fontSize:12,fontWeight:600,color:'#1a4fa0',textTransform:'uppercase',letterSpacing:'0.05em'}}>Score / 100</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {students.map(s => (
                <div key={s.id} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,alignItems:'center',padding:'10px 16px',background:'#f7f9ff',borderRadius:8}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,color:'#0a1628'}}>{s.full_name}</div>
                    <div style={{fontSize:12,color:'#888'}}>Roll No. {s.roll_number}</div>
                  </div>
                    <input
                      type="number" min="0" max="100"
                      value={marks[s.id] ?? ''}
                      onChange={e => {
                        const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                        setMarks(prev => ({...prev, [s.id]: val}))
                      }}
                      disabled={alreadyEntered}
                      placeholder="0-100"
                      style={{
                        border: `1px solid ${marks[s.id] === undefined || marks[s.id] === '' ? '#fca5a5' : '#e0e7ff'}`,
                        borderRadius:8, padding:'8px 12px', fontSize:14, outline:'none',
                        fontFamily:'Outfit,sans-serif', width:100,
                        background: alreadyEntered ? '#f0f4ff' : marks[s.id] === undefined ? '#fff5f5' : '#fff'
                      }}
                    />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {success && <p style={{fontSize:13,color:'#065f46',marginBottom:12,background:'#d1fae5',padding:'10px 14px',borderRadius:8}}>{success}</p>}

      {!alreadyEntered && students.length > 0 && (
        <button onClick={handleSubmit} disabled={loading}
          style={{background:'#0a1628',color:'#fff',border:'none',borderRadius:10,padding:'13px 32px',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:'Outfit,sans-serif',opacity:loading?0.7:1}}>
          {loading ? 'Saving...' : '💾 Save Marks'}
        </button>
      )}
    </div>
  )
}

// ─── STUDENTS TAB ─────────────────────────────────
function StudentsTab({ selectedClass, classes }) {
  const [students, setStudents] = useState([])
  const [filter, setFilter] = useState(selectedClass || 'all')

  useEffect(() => {
    fetchStudents()
  }, [filter])

  const fetchStudents = async () => {
    let query = supabase
      .from('students')
      .select('*, classes(class_name)')
      .order('roll_number')

    if (filter !== 'all') query = query.eq('class_id', filter)

    const { data } = await query
    setStudents(data || [])
  }

  return (
    <div>
      <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:32,color:'#0a1628',marginBottom:4}}>Students</h1>
      <p style={{fontSize:14,color:'#888',marginBottom:24}}>View all students across your classes</p>

      {/* Filter */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        <button onClick={() => setFilter('all')}
          style={{padding:'6px 14px',borderRadius:20,border:'1px solid',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'Outfit,sans-serif',
            background: filter==='all' ? '#0a1628' : '#fff',
            color: filter==='all' ? '#fff' : '#666',
            borderColor: filter==='all' ? '#0a1628' : '#e0e7ff'}}>
          All Classes
        </button>
        {classes.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)}
            style={{padding:'6px 14px',borderRadius:20,border:'1px solid',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'Outfit,sans-serif',
              background: filter==c.id ? '#0a1628' : '#fff',
              color: filter==c.id ? '#fff' : '#666',
              borderColor: filter==c.id ? '#0a1628' : '#e0e7ff'}}>
            {c.class_name}
          </button>
        ))}
      </div>

      <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
        {students.length === 0 ? (
          <p style={{color:'#aaa',textAlign:'center',padding:'20px 0'}}>No students found</p>
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
              {students.map((s,i) => (
                <tr key={s.id} style={{borderBottom:'1px solid #f0f4ff',background:i%2===0?'#fff':'#fafbff'}}>
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