import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import logo from '/logo.jpeg'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Legend
} from 'recharts'

export default function Management() {
  const [activeTab, setActiveTab] = useState('overview')
  const [adminName, setAdminName] = useState('')
  const navigate = useNavigate()

  useEffect(() => { checkAuth() }, [])

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
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'attendance', icon: '📅', label: 'Attendance' },
    { id: 'marks', icon: '📝', label: 'Marks' },
    { id: 'students', icon: '🎓', label: 'Students' },
    { id: 'teachers', icon: '🧑‍🏫', label: 'Teachers' },
    { id: 'yearly', icon: '📈', label: 'Yearly' }, 
  ]

  return (
    <div style={{minHeight:'100vh',background:'#f7f9ff',fontFamily:'Outfit,sans-serif',display:'flex'}}>

      {/* SIDEBAR */}
      <div style={{width:220,background:'#0a1628',display:'flex',flexDirection:'column',position:'fixed',top:0,left:0,bottom:0,zIndex:100}}>
        <div style={{padding:'24px 20px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <img src={logo} alt="SVB" style={{width:36,height:36,borderRadius:'50%',objectFit:'cover',border:'2px solid rgba(255,255,255,0.2)'}}/>
            <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:12,color:'#fff',lineHeight:1.3}}>
              Sree Viswabharathi<br/>EM High School
            </div>
          </div>
        </div>

        <div style={{padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}>
            <span style={{color:'#fff',fontSize:16}}>📊</span>
          </div>
          <div style={{fontSize:13,color:'#fff',fontWeight:500}}>{adminName || 'Management'}</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:2}}>Administrator</div>
        </div>

        <div style={{flex:1,padding:'12px 0'}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                width:'100%',display:'flex',alignItems:'center',gap:12,
                padding:'12px 20px',border:'none',cursor:'pointer',
                background: activeTab===t.id ? 'rgba(124,58,237,0.3)' : 'transparent',
                color: activeTab===t.id ? '#fff' : 'rgba(255,255,255,0.5)',
                fontSize:14,fontFamily:'Outfit,sans-serif',
                borderLeft: activeTab===t.id ? '3px solid #7c3aed' : '3px solid transparent',
                transition:'all 0.2s',textAlign:'left'
              }}>
              <span style={{fontSize:16}}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{padding:'16px 20px',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
          <button onClick={handleLogout}
            style={{width:'100%',background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.5)',border:'none',borderRadius:8,padding:'10px',fontSize:13,cursor:'pointer',fontFamily:'Outfit,sans-serif',display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{marginLeft:220,flex:1,padding:'32px'}}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'attendance' && <AttendanceTab />}
        {activeTab === 'marks' && <MarksTab />}
        {activeTab === 'students' && <StudentsTab />}
        {activeTab === 'teachers' && <TeachersTab />}
        {activeTab === 'yearly' && <YearlyTab />}
      </div>
    </div>
  )
}

// ─── OVERVIEW TAB ────────────────────────────────
function OverviewTab() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, avgAttendance: 0, avgMarks: 0 })
  const [classStrength, setClassStrength] = useState([])
  const [attendanceByClass, setAttendanceByClass] = useState([])

  useEffect(() => {
    fetchStats()
    fetchClassStrength()
    fetchAttendanceByClass()
  }, [])

  const fetchStats = async () => {
    const { count: students } = await supabase
      .from('students').select('*', { count: 'exact', head: true })

    const { data: teachers } = await supabase
      .from('profiles').select('role').eq('role', 'teacher')

    const { data: att } = await supabase
      .from('attendance').select('status')

    const { data: marks } = await supabase
      .from('marks').select('score')

    const presentCount = att?.filter(a => a.status === 'present').length || 0
    const totalAtt = att?.length || 1
    const avgAtt = Math.round((presentCount / totalAtt) * 100)

    const avgM = marks?.length > 0
      ? Math.round(marks.reduce((sum, m) => sum + m.score, 0) / marks.length)
      : 0

    setStats({
      students: students || 0,
      teachers: teachers?.length || 0,
      avgAttendance: avgAtt,
      avgMarks: avgM
    })
  }

  const fetchClassStrength = async () => {
    const { data } = await supabase
      .from('students')
      .select('class_id, classes(class_name)')

    const grouped = {}
    data?.forEach(s => {
      const name = s.classes?.class_name || 'Unknown'
      grouped[name] = (grouped[name] || 0) + 1
    })

    setClassStrength(
      Object.entries(grouped)
        .map(([name, count]) => ({ name: name.replace('Class ', 'Cls '), count }))
        .sort((a, b) => a.name.localeCompare(b.name))
    )
  }

  const fetchAttendanceByClass = async () => {
    const { data: students } = await supabase
      .from('students')
      .select('id, classes(class_name)')

    const { data: att } = await supabase
      .from('attendance')
      .select('student_id, status')

    const classAtt = {}
    students?.forEach(s => {
      const name = s.classes?.class_name?.replace('Class ', 'Cls ') || 'Unknown'
      if (!classAtt[name]) classAtt[name] = { present: 0, total: 0 }
      const studentAtt = att?.filter(a => a.student_id === s.id) || []
      classAtt[name].present += studentAtt.filter(a => a.status === 'present').length
      classAtt[name].total += studentAtt.length
    })

    setAttendanceByClass(
      Object.entries(classAtt)
        .map(([name, d]) => ({
          name,
          attendance: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    )
  }

  const statCards = [
    { icon:'🎓', label:'Total Students', value: stats.students, color:'#1a4fa0' },
    { icon:'🧑‍🏫', label:'Teachers', value: stats.teachers, color:'#0891b2' },
    { icon:'📅', label:'Avg Attendance', value: `${stats.avgAttendance}%`, color:'#16a34a' },
    { icon:'📝', label:'Avg Marks', value: `${stats.avgMarks}/100`, color:'#7c3aed' },
  ]

  const COLORS = ['#1a4fa0','#0891b2','#16a34a','#7c3aed','#f59e0b','#ef4444','#ec4899','#14b8a6','#f97316','#6366f1']

  return (
    <div>
      <div style={{marginBottom:28}}>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:32,color:'#0a1628',marginBottom:4}}>Management Overview</h1>
        <p style={{fontSize:14,color:'#888'}}>School performance at a glance</p>
      </div>

      {/* Stat Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:28}}>
        {statCards.map(c => (
          <div key={c.label} style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
            <div style={{fontSize:28,marginBottom:10}}>{c.icon}</div>
            <div style={{fontSize:30,fontWeight:700,color:c.color,fontFamily:'Cormorant Garamond,serif'}}>{c.value}</div>
            <div style={{fontSize:13,color:'#888',marginTop:4}}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>

        {/* Class Strength Bar Chart */}
        <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
          <h3 style={{fontSize:15,fontWeight:600,color:'#0a1628',marginBottom:20}}>Students per Class</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={classStrength} margin={{top:0,right:0,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" fontSize={11} tick={{fill:'#888'}}/>
              <YAxis fontSize={11} tick={{fill:'#888'}}/>
              <Tooltip contentStyle={{borderRadius:8,border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}/>
              <Bar dataKey="count" fill="#1a4fa0" radius={[4,4,0,0]} name="Students"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance by Class */}
        <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
          <h3 style={{fontSize:15,fontWeight:600,color:'#0a1628',marginBottom:20}}>Attendance % by Class</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceByClass} margin={{top:0,right:0,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" fontSize={11} tick={{fill:'#888'}}/>
              <YAxis domain={[0,100]} fontSize={11} tick={{fill:'#888'}}/>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{borderRadius:8,border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}/>
              <Bar dataKey="attendance" radius={[4,4,0,0]} name="Attendance %" >
                {attendanceByClass.map((_, i) => (
                  <Cell key={i} fill={_ .attendance >= 75 ? '#16a34a' : '#ef4444'}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ─── ATTENDANCE TAB ──────────────────────────────
function AttendanceTab() {
  const [classData, setClassData] = useState([])
  const [selectedClass, setSelectedClass] = useState('all')
  const [classes, setClasses] = useState([])
  const [lowAttendance, setLowAttendance] = useState([])

  useEffect(() => {
    fetchClasses()
    fetchAttendanceData()
    fetchLowAttendance()
  }, [])

  const fetchClasses = async () => {
    const { data } = await supabase.from('classes').select('*').order('id')
    setClasses(data || [])
  }

  const fetchAttendanceData = async () => {
    const { data: students } = await supabase
      .from('students')
      .select('id, full_name, classes(class_name)')

    const { data: att } = await supabase
      .from('attendance')
      .select('student_id, status')

    const result = students?.map(s => {
      const sAtt = att?.filter(a => a.student_id === s.id) || []
      const present = sAtt.filter(a => a.status === 'present').length
      const total = sAtt.length
      return {
        ...s,
        present,
        absent: total - present,
        total,
        pct: total > 0 ? Math.round((present / total) * 100) : 0
      }
    }) || []

    setClassData(result)
  }

  const fetchLowAttendance = async () => {
    const { data: students } = await supabase
      .from('students')
      .select('id, full_name, classes(class_name)')

    const { data: att } = await supabase
      .from('attendance')
      .select('student_id, status')

    const result = students?.map(s => {
      const sAtt = att?.filter(a => a.student_id === s.id) || []
      const present = sAtt.filter(a => a.status === 'present').length
      const total = sAtt.length
      const pct = total > 0 ? Math.round((present / total) * 100) : 0
      return { ...s, pct, total }
    }).filter(s => s.pct < 75 && s.total > 0)
      .sort((a, b) => a.pct - b.pct) || []

    setLowAttendance(result)
  }

  const filtered = selectedClass === 'all'
    ? classData
    : classData.filter(s => s.classes?.class_name === selectedClass)

  // Pie chart data
  const totalPresent = filtered.reduce((sum, s) => sum + s.present, 0)
  const totalAbsent = filtered.reduce((sum, s) => sum + s.absent, 0)
  const pieData = [
    { name: 'Present', value: totalPresent },
    { name: 'Absent', value: totalAbsent }
  ]

  return (
    <div>
      <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:32,color:'#0a1628',marginBottom:4}}>Attendance Analysis</h1>
      <p style={{fontSize:14,color:'#888',marginBottom:24}}>Monitor attendance across all classes</p>

      {/* Class filter */}
      <div style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
        <button onClick={() => setSelectedClass('all')}
          style={{padding:'6px 14px',borderRadius:20,border:'1px solid',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'Outfit,sans-serif',
            background: selectedClass==='all'?'#0a1628':'#fff',
            color: selectedClass==='all'?'#fff':'#666',
            borderColor: selectedClass==='all'?'#0a1628':'#e0e7ff'}}>
          All Classes
        </button>
        {classes.map(c => (
          <button key={c.id} onClick={() => setSelectedClass(c.class_name)}
            style={{padding:'6px 14px',borderRadius:20,border:'1px solid',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'Outfit,sans-serif',
              background: selectedClass===c.class_name?'#0a1628':'#fff',
              color: selectedClass===c.class_name?'#fff':'#666',
              borderColor: selectedClass===c.class_name?'#0a1628':'#e0e7ff'}}>
            {c.class_name}
          </button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
        {/* Pie chart */}
        <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
          <h3 style={{fontSize:15,fontWeight:600,color:'#0a1628',marginBottom:16}}>Present vs Absent</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                <Cell fill="#16a34a"/>
                <Cell fill="#ef4444"/>
              </Pie>
              <Tooltip contentStyle={{borderRadius:8,border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}/>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Low attendance warning */}
        <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
          <h3 style={{fontSize:15,fontWeight:600,color:'#dc2626',marginBottom:16}}>⚠️ Low Attendance (Below 75%)</h3>
          {lowAttendance.length === 0 ? (
            <p style={{color:'#16a34a',fontSize:14}}>✅ All students above 75%!</p>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:8,maxHeight:180,overflowY:'auto'}}>
              {lowAttendance.map(s => (
                <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 10px',background:'#fff5f5',borderRadius:8}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:500,color:'#0a1628'}}>{s.full_name}</div>
                    <div style={{fontSize:11,color:'#888'}}>{s.classes?.class_name}</div>
                  </div>
                  <span style={{fontSize:14,fontWeight:700,color:'#dc2626'}}>{s.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Student attendance table */}
      <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
        <h3 style={{fontSize:15,fontWeight:600,color:'#0a1628',marginBottom:16}}>Student-wise Attendance</h3>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'2px solid #e8f0fe'}}>
              {['Student','Class','Present','Absent','Percentage'].map(h => (
                <th key={h} style={{textAlign:'left',padding:'10px 12px',fontSize:12,fontWeight:600,color:'#1a4fa0',textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} style={{borderBottom:'1px solid #f0f4ff',background:i%2===0?'#fff':'#fafbff'}}>
                <td style={{padding:'12px',fontSize:14,fontWeight:500,color:'#0a1628'}}>{s.full_name}</td>
                <td style={{padding:'12px',fontSize:13,color:'#555'}}>{s.classes?.class_name}</td>
                <td style={{padding:'12px',fontSize:13,color:'#16a34a',fontWeight:500}}>{s.present}</td>
                <td style={{padding:'12px',fontSize:13,color:'#dc2626',fontWeight:500}}>{s.absent}</td>
                <td style={{padding:'12px'}}>
                  <span style={{fontSize:13,fontWeight:600,padding:'3px 10px',borderRadius:20,
                    background: s.pct >= 75 ? '#dcfce7' : '#fee2e2',
                    color: s.pct >= 75 ? '#16a34a' : '#dc2626'}}>
                    {s.pct}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── MARKS TAB ───────────────────────────────────
function MarksTab() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('Maths')
  const [selectedTerm, setSelectedTerm] = useState('FA1')
  const [marksData, setMarksData] = useState([])
  const [topScorers, setTopScorers] = useState([])

  const subjects = ['Maths','Science','Social Studies','English','Telugu','Hindi']
  const terms = ['FA1','FA2','FA3','FA4','SA1','SA2']

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    fetchMarksData()
    fetchTopScorers()
  }, [selectedClass, selectedSubject, selectedTerm])

  const fetchClasses = async () => {
    const { data } = await supabase.from('classes').select('*').order('id')
    setClasses(data || [])
  }

  const fetchMarksData = async () => {
    let query = supabase
      .from('marks')
      .select('*, students(full_name, roll_number, classes(class_name))')
      .eq('subject', selectedSubject)
      .eq('term', selectedTerm)
      .order('score', { ascending: false })

    const { data } = await query
    let filtered = data || []

    if (selectedClass !== 'all') {
      filtered = filtered.filter(m => m.students?.classes?.class_name === selectedClass)
    }

    setMarksData(filtered)
  }

  const fetchTopScorers = async () => {
    const { data } = await supabase
      .from('marks')
      .select('score, subject, term, students(full_name, classes(class_name))')
      .eq('term', selectedTerm)
      .order('score', { ascending: false })
      .limit(5)

    setTopScorers(data || [])
  }

  const avg = marksData.length > 0
    ? Math.round(marksData.reduce((sum, m) => sum + m.score, 0) / marksData.length)
    : 0

  const passed = marksData.filter(m => m.score >= 35).length
  const failed = marksData.filter(m => m.score < 35).length

  const chartData = marksData.slice(0, 15).map(m => ({
    name: m.students?.full_name?.split(' ')[0] || '',
    score: m.score
  }))

  return (
    <div>
      <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:32,color:'#0a1628',marginBottom:4}}>Marks Analysis</h1>
      <p style={{fontSize:14,color:'#888',marginBottom:24}}>Track academic performance across subjects</p>

      {/* Filters */}
      <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        <div>
          <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:4}}>Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
            style={{border:'1px solid #e0e7ff',borderRadius:8,padding:'8px 12px',fontSize:13,outline:'none',fontFamily:'Outfit,sans-serif',background:'#fff',cursor:'pointer'}}>
            <option value="all">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
          </select>
        </div>
        <div>
          <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:4}}>Subject</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
            style={{border:'1px solid #e0e7ff',borderRadius:8,padding:'8px 12px',fontSize:13,outline:'none',fontFamily:'Outfit,sans-serif',background:'#fff',cursor:'pointer'}}>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:4}}>Term</label>
          <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}
            style={{border:'1px solid #e0e7ff',borderRadius:8,padding:'8px 12px',fontSize:13,outline:'none',fontFamily:'Outfit,sans-serif',background:'#fff',cursor:'pointer'}}>
            {terms.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginBottom:24}}>
        {[
          {label:'Average Score', value:`${avg}/100`, color:'#1a4fa0'},
          {label:'Passed', value:passed, color:'#16a34a'},
          {label:'Failed', value:failed, color:'#dc2626'},
          {label:'Total Students', value:marksData.length, color:'#7c3aed'},
        ].map(s => (
          <div key={s.label} style={{background:'#fff',borderRadius:12,padding:'16px',boxShadow:'0 2px 8px rgba(26,79,160,0.06)',border:'1px solid rgba(26,79,160,0.06)',textAlign:'center'}}>
            <div style={{fontSize:24,fontWeight:700,color:s.color,fontFamily:'Cormorant Garamond,serif'}}>{s.value}</div>
            <div style={{fontSize:12,color:'#888',marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20,marginBottom:24}}>
        {/* Bar chart */}
        <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
          <h3 style={{fontSize:15,fontWeight:600,color:'#0a1628',marginBottom:16}}>{selectedSubject} — {selectedTerm}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{top:0,right:0,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" fontSize={10} tick={{fill:'#888'}}/>
              <YAxis domain={[0,100]} fontSize={11} tick={{fill:'#888'}}/>
              <Tooltip contentStyle={{borderRadius:8,border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}/>
              <Bar dataKey="score" radius={[4,4,0,0]} name="Score">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.score >= 35 ? '#1a4fa0' : '#ef4444'}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top scorers */}
        <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
          <h3 style={{fontSize:15,fontWeight:600,color:'#0a1628',marginBottom:16}}>🏆 Top Scorers</h3>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {topScorers.map((m, i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:'#f7f9ff',borderRadius:8}}>
                <div style={{width:24,height:24,borderRadius:'50%',
                  background: i===0?'#f59e0b':i===1?'#94a3b8':i===2?'#b45309':'#e8f0fe',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:11,fontWeight:700,color: i<3?'#fff':'#1a4fa0',flexShrink:0}}>
                  {i+1}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:'#0a1628'}}>{m.students?.full_name}</div>
                  <div style={{fontSize:11,color:'#888'}}>{m.subject}</div>
                </div>
                <span style={{fontSize:14,fontWeight:700,color:'#1a4fa0',fontFamily:'Cormorant Garamond,serif'}}>{m.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marks table */}
      <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
        <h3 style={{fontSize:15,fontWeight:600,color:'#0a1628',marginBottom:16}}>All Students — {selectedSubject} ({selectedTerm})</h3>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'2px solid #e8f0fe'}}>
              {['Rank','Student','Class','Score','Status'].map(h => (
                <th key={h} style={{textAlign:'left',padding:'10px 12px',fontSize:12,fontWeight:600,color:'#1a4fa0',textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {marksData.map((m, i) => (
              <tr key={m.id} style={{borderBottom:'1px solid #f0f4ff',background:i%2===0?'#fff':'#fafbff'}}>
                <td style={{padding:'12px',fontSize:13,color:'#888'}}>#{i+1}</td>
                <td style={{padding:'12px',fontSize:14,fontWeight:500,color:'#0a1628'}}>{m.students?.full_name}</td>
                <td style={{padding:'12px',fontSize:13,color:'#555'}}>{m.students?.classes?.class_name}</td>
                <td style={{padding:'12px',fontSize:14,fontWeight:700,color:'#0a1628',fontFamily:'Cormorant Garamond,serif'}}>{m.score}/100</td>
                <td style={{padding:'12px'}}>
                  <span style={{fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:20,
                    background: m.score >= 35 ? '#dcfce7' : '#fee2e2',
                    color: m.score >= 35 ? '#16a34a' : '#dc2626'}}>
                    {m.score >= 35 ? 'Pass' : 'Fail'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── STUDENTS TAB ─────────────────────────────────
function StudentsTab() {
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchClasses()
    fetchStudents()
  }, [])

  const fetchClasses = async () => {
    const { data } = await supabase.from('classes').select('*').order('id')
    setClasses(data || [])
  }

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select('*, classes(class_name), profiles(phone, email)')
      .order('class_id')
    setStudents(data || [])
  }

  const filtered = students
    .filter(s => selectedClass === 'all' || s.classes?.class_name === selectedClass)
    .filter(s => s.full_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:32,color:'#0a1628',marginBottom:4}}>All Students</h1>
      <p style={{fontSize:14,color:'#888',marginBottom:24}}>Complete student directory with parent contact</p>

      {/* Search + Filter */}
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <input
          type="text" value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search student name..."
          style={{border:'1px solid #e0e7ff',borderRadius:8,padding:'8px 12px',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif',minWidth:200}}
        />
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
          style={{border:'1px solid #e0e7ff',borderRadius:8,padding:'8px 12px',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif',background:'#fff',cursor:'pointer'}}>
          <option value="all">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
        </select>
      </div>

      <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
        <div style={{marginBottom:12,fontSize:13,color:'#888'}}>Showing {filtered.length} students</div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'2px solid #e8f0fe'}}>
              {['Roll No','Student Name','Class','Parent Phone','Parent Email'].map(h => (
                <th key={h} style={{textAlign:'left',padding:'10px 12px',fontSize:12,fontWeight:600,color:'#1a4fa0',textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} style={{borderBottom:'1px solid #f0f4ff',background:i%2===0?'#fff':'#fafbff'}}>
                <td style={{padding:'12px',fontSize:13,color:'#888'}}>{s.roll_number}</td>
                <td style={{padding:'12px',fontSize:14,fontWeight:500,color:'#0a1628'}}>{s.full_name}</td>
                <td style={{padding:'12px',fontSize:13,color:'#555'}}>{s.classes?.class_name}</td>
                <td style={{padding:'12px',fontSize:13,color:'#555'}}>
                  {s.profiles?.phone ? (
                    <a href={`tel:${s.profiles.phone}`}
                      style={{color:'#1a4fa0',textDecoration:'none',fontWeight:500}}>
                      📞 {s.profiles.phone}
                    </a>
                  ) : (
                    <span style={{color:'#ccc'}}>Not added</span>
                  )}
                </td>
                <td style={{padding:'12px',fontSize:13,color:'#555'}}>
                  {s.profiles?.email ? (
                    <a href={`mailto:${s.profiles.email}`}
                      style={{color:'#1a4fa0',textDecoration:'none'}}>
                      {s.profiles.email}
                    </a>
                  ) : (
                    <span style={{color:'#ccc'}}>Not added</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── YEARLY ANALYSIS TAB ─────────────────────────
function YearlyTab() {
  const [allYears, setAllYears] = useState([])
  const [yearlyStrength, setYearlyStrength] = useState([])
  const [classComparison, setClassComparison] = useState([])
  const [compareYear1, setCompareYear1] = useState('')
  const [compareYear2, setCompareYear2] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchYearlyData()
  }, [])

  useEffect(() => {
    if (compareYear1 && compareYear2) {
      buildClassComparison()
    }
  }, [compareYear1, compareYear2, yearlyStrength])

  const fetchYearlyData = async () => {
    const { data: students } = await supabase
      .from('students')
      .select('*, classes(class_name)')

    if (!students) return

    // Get all unique years dynamically
    const years = [...new Set(students.map(s => s.academic_year).filter(Boolean))].sort()
    setAllYears(years)

    // Set default comparison — last 2 years
    if (years.length >= 2) {
      setCompareYear1(years[years.length - 2])
      setCompareYear2(years[years.length - 1])
    } else if (years.length === 1) {
      setCompareYear1(years[0])
      setCompareYear2(years[0])
    }

    // Build yearly strength data for line chart
    const strengthData = years.map(year => {
      const yearStudents = students.filter(s => s.academic_year === year)
      return {
        year,
        students: yearStudents.length
      }
    })
    setYearlyStrength(strengthData)

    // Store all students for comparison
    setClassComparison(students)
    setLoading(false)
  }

  const buildClassComparison = () => {
    const classes = ['Class 1','Class 2','Class 3','Class 4','Class 5',
                     'Class 6','Class 7','Class 8','Class 9','Class 10']

    return classes.map(cls => {
      const y1Count = classComparison.filter(s =>
        s.academic_year === compareYear1 && s.classes?.class_name === cls
      ).length
      const y2Count = classComparison.filter(s =>
        s.academic_year === compareYear2 && s.classes?.class_name === cls
      ).length
      const diff = y2Count - y1Count
      return {
        name: cls.replace('Class ', 'Cls '),
        fullName: cls,
        [compareYear1]: y1Count,
        [compareYear2]: y2Count,
        diff,
        trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same'
      }
    }).filter(c => c[compareYear1] > 0 || c[compareYear2] > 0)
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <p style={{color:'#888'}}>Loading yearly data...</p>
    </div>
  )

  const comparison = buildClassComparison()
  const y1Total = yearlyStrength.find(y => y.year === compareYear1)?.students || 0
  const y2Total = yearlyStrength.find(y => y.year === compareYear2)?.students || 0
  const totalDiff = y2Total - y1Total
  const droppedClasses = comparison.filter(c => c.trend === 'down')
  const gainedClasses = comparison.filter(c => c.trend === 'up')

  return (
    <div>
      <div style={{marginBottom:28}}>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:32,color:'#0a1628',marginBottom:4}}>
          Yearly Analysis
        </h1>
        <p style={{fontSize:14,color:'#888'}}>
          School strength across {allYears.length} academic year{allYears.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Overall strength line chart — all years */}
      {allYears.length > 1 && (
        <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)',marginBottom:24}}>
          <h3 style={{fontSize:15,fontWeight:600,color:'#0a1628',marginBottom:20}}>
            📈 Overall Strength — All Years
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={yearlyStrength} margin={{top:0,right:20,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="year" fontSize={12} tick={{fill:'#888'}}/>
              <YAxis fontSize={11} tick={{fill:'#888'}}/>
              <Tooltip contentStyle={{borderRadius:8,border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}/>
              <Line
                type="monotone"
                dataKey="students"
                stroke="#1a4fa0"
                strokeWidth={3}
                dot={{fill:'#1a4fa0',strokeWidth:2,r:5}}
                activeDot={{r:7}}
                name="Students"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Year selector for comparison */}
      <div style={{background:'#fff',borderRadius:16,padding:'20px 24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)',marginBottom:24}}>
        <h3 style={{fontSize:15,fontWeight:600,color:'#0a1628',marginBottom:16}}>🔍 Compare Two Years</h3>
        <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <div>
            <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:4}}>From Year</label>
            <select value={compareYear1} onChange={e => setCompareYear1(e.target.value)}
              style={{border:'1px solid #e0e7ff',borderRadius:8,padding:'8px 12px',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif',background:'#fff',cursor:'pointer'}}>
              {allYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div style={{fontSize:20,color:'#888',marginTop:16}}>→</div>
          <div>
            <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:4}}>To Year</label>
            <select value={compareYear2} onChange={e => setCompareYear2(e.target.value)}
              style={{border:'1px solid #e0e7ff',borderRadius:8,padding:'8px 12px',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif',background:'#fff',cursor:'pointer'}}>
              {allYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:16,marginBottom:24}}>
        <div style={{background:'#fff',borderRadius:16,padding:'20px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
          <div style={{fontSize:11,fontWeight:600,color:'#888',marginBottom:8,textTransform:'uppercase'}}>{compareYear1}</div>
          <div style={{fontSize:32,fontWeight:700,color:'#94a3b8',fontFamily:'Cormorant Garamond,serif'}}>{y1Total}</div>
          <div style={{fontSize:12,color:'#888',marginTop:4}}>Total Students</div>
        </div>

        <div style={{background:'#fff',borderRadius:16,padding:'20px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
          <div style={{fontSize:11,fontWeight:600,color:'#888',marginBottom:8,textTransform:'uppercase'}}>{compareYear2}</div>
          <div style={{fontSize:32,fontWeight:700,color:'#1a4fa0',fontFamily:'Cormorant Garamond,serif'}}>{y2Total}</div>
          <div style={{fontSize:12,color:'#888',marginTop:4}}>Total Students</div>
        </div>

        <div style={{background: totalDiff >= 0 ? '#f0fdf4' : '#fff5f5',borderRadius:16,padding:'20px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:`1px solid ${totalDiff >= 0 ? '#86efac' : '#fca5a5'}`}}>
          <div style={{fontSize:11,fontWeight:600,color:'#888',marginBottom:8,textTransform:'uppercase'}}>Change</div>
          <div style={{fontSize:32,fontWeight:700,fontFamily:'Cormorant Garamond,serif',
            color: totalDiff > 0 ? '#16a34a' : totalDiff < 0 ? '#dc2626' : '#888'}}>
            {totalDiff > 0 ? `+${totalDiff}` : totalDiff}
          </div>
          <div style={{fontSize:12,marginTop:4,color: totalDiff > 0 ? '#16a34a' : totalDiff < 0 ? '#dc2626' : '#888'}}>
            {totalDiff > 0 ? '📈 Gained' : totalDiff < 0 ? '📉 Lost' : '➡️ No change'}
          </div>
        </div>

        <div style={{background:'#fff',borderRadius:16,padding:'20px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
          <div style={{fontSize:11,fontWeight:600,color:'#888',marginBottom:8,textTransform:'uppercase'}}>Classes Dropped</div>
          <div style={{fontSize:32,fontWeight:700,fontFamily:'Cormorant Garamond,serif',
            color: droppedClasses.length === 0 ? '#16a34a' : '#dc2626'}}>
            {droppedClasses.length}
          </div>
          <div style={{fontSize:12,color:'#888',marginTop:4}}>
            {droppedClasses.length === 0 ? '✅ None!' : '⚠️ Need attention'}
          </div>
        </div>
      </div>

      {/* Class comparison bar chart */}
      <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)',marginBottom:24}}>
        <h3 style={{fontSize:15,fontWeight:600,color:'#0a1628',marginBottom:20}}>
          Class-wise Comparison — {compareYear1} vs {compareYear2}
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={comparison} margin={{top:0,right:20,left:-20,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
            <XAxis dataKey="name" fontSize={11} tick={{fill:'#888'}}/>
            <YAxis fontSize={11} tick={{fill:'#888'}}/>
            <Tooltip contentStyle={{borderRadius:8,border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}/>
            <Legend />
            <Bar dataKey={compareYear1} fill="#94a3b8" radius={[4,4,0,0]}/>
            <Bar dataKey={compareYear2} fill="#1a4fa0" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gained and dropped */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
        <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
          <h3 style={{fontSize:15,fontWeight:600,color:'#dc2626',marginBottom:16}}>📉 Classes Dropped</h3>
          {droppedClasses.length === 0 ? (
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <div style={{fontSize:32,marginBottom:8}}>🎉</div>
              <p style={{color:'#16a34a',fontSize:14,fontWeight:500}}>No classes dropped!</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {droppedClasses.map(c => (
                <div key={c.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:'#fff5f5',borderRadius:8,border:'1px solid #fca5a5'}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,color:'#0a1628'}}>{c.fullName}</div>
                    <div style={{fontSize:12,color:'#888'}}>{c[compareYear1]} → {c[compareYear2]} students</div>
                  </div>
                  <span style={{fontSize:14,fontWeight:700,color:'#dc2626'}}>{c.diff}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
          <h3 style={{fontSize:15,fontWeight:600,color:'#16a34a',marginBottom:16}}>📈 Classes Gained</h3>
          {gainedClasses.length === 0 ? (
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <p style={{color:'#aaa',fontSize:14}}>No classes gained</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {gainedClasses.map(c => (
                <div key={c.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:'#f0fdf4',borderRadius:8,border:'1px solid #86efac'}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,color:'#0a1628'}}>{c.fullName}</div>
                    <div style={{fontSize:12,color:'#888'}}>{c[compareYear1]} → {c[compareYear2]} students</div>
                  </div>
                  <span style={{fontSize:14,fontWeight:700,color:'#16a34a'}}>+{c.diff}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full table */}
      <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
        <h3 style={{fontSize:15,fontWeight:600,color:'#0a1628',marginBottom:16}}>Complete Summary</h3>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'2px solid #e8f0fe'}}>
              {['Class', compareYear1, compareYear2, 'Change', 'Trend'].map(h => (
                <th key={h} style={{textAlign:'left',padding:'10px 12px',fontSize:12,fontWeight:600,color:'#1a4fa0',textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.map((c, i) => (
              <tr key={c.name} style={{borderBottom:'1px solid #f0f4ff',background:i%2===0?'#fff':'#fafbff'}}>
                <td style={{padding:'12px',fontSize:14,fontWeight:500,color:'#0a1628'}}>{c.fullName}</td>
                <td style={{padding:'12px',fontSize:14,color:'#555'}}>{c[compareYear1]}</td>
                <td style={{padding:'12px',fontSize:14,color:'#555'}}>{c[compareYear2]}</td>
                <td style={{padding:'12px',fontSize:14,fontWeight:600,
                  color: c.diff > 0 ? '#16a34a' : c.diff < 0 ? '#dc2626' : '#888'}}>
                  {c.diff > 0 ? `+${c.diff}` : c.diff}
                </td>
                <td style={{padding:'12px',fontSize:18}}>
                  {c.trend === 'up' ? '📈' : c.trend === 'down' ? '📉' : '➡️'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TeachersTab() {
  const [teachers, setTeachers] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => { fetchTeachers() }, [])

  const fetchTeachers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher')
      .order('full_name')
    setTeachers(data || [])
  }

  const filtered = teachers.filter(t =>
    t.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:32,color:'#0a1628',marginBottom:4}}>Teachers</h1>
      <p style={{fontSize:14,color:'#888',marginBottom:24}}>All teaching staff and their contact details</p>

      {/* Search */}
      <div style={{marginBottom:20}}>
        <input
          type="text" value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search teacher name..."
          style={{border:'1px solid #e0e7ff',borderRadius:8,padding:'8px 12px',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif',minWidth:220}}
        />
      </div>

      <div style={{background:'#fff',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
        <div style={{marginBottom:12,fontSize:13,color:'#888'}}>
          {filtered.length} teacher{filtered.length !== 1 ? 's' : ''} found
        </div>

        {filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px 0'}}>
            <div style={{fontSize:36,marginBottom:12}}>🧑‍🏫</div>
            <p style={{color:'#aaa',fontSize:14}}>No teachers found</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {filtered.map((t, i) => (
              <div key={t.id}
                style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                  padding:'16px 20px',background: i%2===0 ? '#f7f9ff' : '#fff',
                  borderRadius:10,border:'1px solid rgba(26,79,160,0.06)',
                  flexWrap:'wrap',gap:12}}>

                {/* Left — Name */}
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:42,height:42,borderRadius:'50%',
                    background:'#e0f2fe',display:'flex',alignItems:'center',
                    justifyContent:'center',fontSize:18,flexShrink:0}}>
                    🧑‍🏫
                  </div>
                  <div>
                    <div style={{fontSize:15,fontWeight:600,color:'#0a1628'}}>{t.full_name}</div>
                    <div style={{fontSize:11,color:'#aaa',marginTop:2}}>
                      Joined {new Date(t.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </div>
                  </div>
                </div>

                {/* Right — Contact */}
                <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                  {t.phone ? (
                    <a href={`tel:${t.phone}`}
                      style={{display:'flex',alignItems:'center',gap:6,
                        fontSize:13,color:'#1a4fa0',textDecoration:'none',
                        background:'#e8f0fe',padding:'6px 12px',borderRadius:8,fontWeight:500}}>
                      📞 {t.phone}
                    </a>
                  ) : (
                    <span style={{fontSize:13,color:'#ccc',padding:'6px 12px'}}>No phone</span>
                  )}

                  {t.email ? (
                    <a href={`mailto:${t.email}`}
                      style={{display:'flex',alignItems:'center',gap:6,
                        fontSize:13,color:'#1a4fa0',textDecoration:'none',
                        background:'#e8f0fe',padding:'6px 12px',borderRadius:8}}>
                      ✉️ {t.email}
                    </a>
                  ) : (
                    <span style={{fontSize:13,color:'#ccc',padding:'6px 12px'}}>No email</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function UsersTab() {
  const [activeSection, setActiveSection] = useState('invite')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('parent')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [users, setUsers] = useState([])
  const [bulkEmails, setBulkEmails] = useState('')
  const [bulkRole, setBulkRole] = useState('parent')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkResults, setBulkResults] = useState([])
  const [deleteLoading, setDeleteLoading] = useState(null)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
  }

  const sendInvite = async (emailAddr, roleVal) => {
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
        body: JSON.stringify({ email: emailAddr, role: roleVal })
      }
    )
    const data = await response.json()
    if (!response.ok || data.error) throw new Error(data.error || 'Failed')
    return true
  }

  // Single invite
  const handleSingleInvite = async () => {
    if (!email) { setError('Please enter an email'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      await sendInvite(email, role)
      setSuccess(`✅ Invite sent to ${email}!`)
      setEmail('')
      fetchUsers()
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  // Bulk invite
  const handleBulkInvite = async () => {
    const emails = bulkEmails
      .split('\n')
      .map(e => e.trim())
      .filter(e => e && e.includes('@'))

    if (emails.length === 0) { setError('Please enter valid emails'); return }

    setBulkLoading(true)
    setBulkResults([])
    setError('')

    const results = []
    for (const emailAddr of emails) {
      try {
        await sendInvite(emailAddr, bulkRole)
        results.push({ email: emailAddr, status: 'success' })
      } catch (err) {
        results.push({ email: emailAddr, status: 'error', message: err.message })
      }
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500))
    }

    setBulkResults(results)
    setBulkLoading(false)
    fetchUsers()
  }

  // Delete user
const handleDelete = async (userId, userName) => {
  if (!confirm(`Are you sure you want to remove ${userName}?`)) return
  setDeleteLoading(userId)

  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    console.log('Session:', session?.access_token ? 'exists' : 'missing')
    console.log('URL:', `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`)

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ userId })
      }
    )

    console.log('Response status:', response.status)
    const data = await response.json()
    console.log('Response data:', data)

    if (!response.ok || data.error) {
      alert('Failed: ' + (data.error || 'Unknown error'))
      setDeleteLoading(null)
      return
    }

    fetchUsers()
  } catch (err) {
    console.log('Catch error:', err)
    alert('Error: ' + err.message)
  }

  setDeleteLoading(null)
}

  const roleColors = {
    admin: { bg:'#fee2e2', color:'#991b1b' },
    teacher: { bg:'#dbeafe', color:'#1e40af' },
    parent: { bg:'#d1fae5', color:'#065f46' },
  }

  const sections = [
    { id:'invite', label:'➕ Single Invite' },
    { id:'bulk', label:'📋 Bulk Invite' },
    { id:'list', label:'👥 All Users' },
  ]

  return (
    <div>
      <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:32,color:'#0a1628',marginBottom:4}}>User Management</h1>
      <p style={{fontSize:14,color:'#888',marginBottom:24}}>Invite, manage and remove school portal users</p>

      {/* Section tabs */}
      <div style={{display:'flex',gap:8,marginBottom:24,background:'#fff',padding:6,borderRadius:12,width:'fit-content',boxShadow:'0 2px 8px rgba(26,79,160,0.06)'}}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            style={{padding:'8px 18px',borderRadius:8,border:'none',cursor:'pointer',
              fontFamily:'Outfit,sans-serif',fontSize:13,fontWeight:500,transition:'all 0.2s',
              background: activeSection===s.id ? '#1a4fa0' : 'transparent',
              color: activeSection===s.id ? '#fff' : '#666'}}>
            {s.label}
          </button>
        ))}
      </div>

      {/* SINGLE INVITE */}
      {activeSection === 'invite' && (
        <div style={{background:'#fff',borderRadius:16,padding:'28px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)',maxWidth:600}}>
          <h3 style={{fontSize:16,fontWeight:600,color:'#0a1628',marginBottom:6}}>Invite Single User</h3>
          <p style={{fontSize:13,color:'#888',marginBottom:20}}>For new admissions or lateral entries</p>

          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:6}}>Email Address</label>
            <input type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@gmail.com"
              onKeyDown={e => e.key === 'Enter' && handleSingleInvite()}
              style={{width:'100%',border:'1px solid #e0e7ff',borderRadius:8,padding:'10px 12px',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif'}}
            />
          </div>

          <div style={{marginBottom:20}}>
            <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:6}}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              style={{width:'100%',border:'1px solid #e0e7ff',borderRadius:8,padding:'10px 12px',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif',background:'#fff',cursor:'pointer'}}>
              <option value="parent">👨‍👩‍👧 Parent</option>
              <option value="teacher">🧑‍🏫 Teacher</option>
              <option value="admin">📊 Admin</option>
            </select>
          </div>

          {success && <p style={{fontSize:13,color:'#065f46',marginBottom:12,background:'#d1fae5',padding:'8px 12px',borderRadius:8}}>{success}</p>}
          {error && <p style={{fontSize:13,color:'#991b1b',marginBottom:12,background:'#fee2e2',padding:'8px 12px',borderRadius:8}}>{error}</p>}

          <button onClick={handleSingleInvite} disabled={loading}
            style={{background:'#1a4fa0',color:'#fff',border:'none',borderRadius:8,padding:'11px 28px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'Outfit,sans-serif',opacity:loading?0.7:1}}>
            {loading ? 'Sending...' : 'Send Invite ✉️'}
          </button>
        </div>
      )}

      {/* BULK INVITE */}
      {activeSection === 'bulk' && (
        <div style={{background:'#fff',borderRadius:16,padding:'28px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)',maxWidth:600}}>
          <h3 style={{fontSize:16,fontWeight:600,color:'#0a1628',marginBottom:6}}>Bulk Invite Users</h3>
          <p style={{fontSize:13,color:'#888',marginBottom:20}}>Invite multiple users at once — paste one email per line</p>

          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:6}}>
              Email Addresses (one per line)
            </label>
            <textarea
              value={bulkEmails}
              onChange={e => setBulkEmails(e.target.value)}
              placeholder={`parent1@gmail.com\nparent2@gmail.com\nparent3@gmail.com`}
              rows={8}
              style={{width:'100%',border:'1px solid #e0e7ff',borderRadius:8,padding:'10px 12px',fontSize:13,outline:'none',fontFamily:'Outfit,sans-serif',resize:'vertical',lineHeight:1.8}}
            />
            <p style={{fontSize:11,color:'#888',marginTop:4}}>
              {bulkEmails.split('\n').filter(e => e.trim() && e.includes('@')).length} valid emails detected
            </p>
          </div>

          <div style={{marginBottom:20}}>
            <label style={{fontSize:11,color:'#1a4fa0',fontWeight:500,display:'block',marginBottom:6}}>Role for all</label>
            <select value={bulkRole} onChange={e => setBulkRole(e.target.value)}
              style={{width:'100%',border:'1px solid #e0e7ff',borderRadius:8,padding:'10px 12px',fontSize:14,outline:'none',fontFamily:'Outfit,sans-serif',background:'#fff',cursor:'pointer'}}>
              <option value="parent">👨‍👩‍👧 Parent</option>
              <option value="teacher">🧑‍🏫 Teacher</option>
              <option value="admin">📊 Admin</option>
            </select>
          </div>

          {error && <p style={{fontSize:13,color:'#991b1b',marginBottom:12,background:'#fee2e2',padding:'8px 12px',borderRadius:8}}>{error}</p>}

          <button onClick={handleBulkInvite} disabled={bulkLoading}
            style={{background:'#1a4fa0',color:'#fff',border:'none',borderRadius:8,padding:'11px 28px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'Outfit,sans-serif',opacity:bulkLoading?0.7:1,marginBottom:20}}>
            {bulkLoading ? '⏳ Sending invites...' : '📨 Send All Invites'}
          </button>

          {/* Bulk results */}
          {bulkResults.length > 0 && (
            <div>
              <div style={{fontSize:13,fontWeight:600,color:'#0a1628',marginBottom:10}}>
                Results: {bulkResults.filter(r => r.status === 'success').length} sent,{' '}
                {bulkResults.filter(r => r.status === 'error').length} failed
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6,maxHeight:240,overflowY:'auto'}}>
                {bulkResults.map((r, i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                    padding:'8px 12px',borderRadius:8,
                    background: r.status === 'success' ? '#f0fdf4' : '#fff5f5',
                    border: `1px solid ${r.status === 'success' ? '#86efac' : '#fca5a5'}`}}>
                    <span style={{fontSize:13,color:'#555'}}>{r.email}</span>
                    <span style={{fontSize:12,fontWeight:600,
                      color: r.status === 'success' ? '#16a34a' : '#dc2626'}}>
                      {r.status === 'success' ? '✅ Sent' : `❌ ${r.message}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ALL USERS LIST */}
      {activeSection === 'list' && (
        <div style={{background:'#fff',borderRadius:16,padding:'28px',boxShadow:'0 2px 12px rgba(26,79,160,0.08)',border:'1px solid rgba(26,79,160,0.06)'}}>
          <h3 style={{fontSize:16,fontWeight:600,color:'#0a1628',marginBottom:20}}>
            All Users ({users.length})
          </h3>
          {users.length === 0 ? (
            <p style={{color:'#aaa',fontSize:14,textAlign:'center',padding:'20px 0'}}>No users yet</p>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {users.map(u => (
                <div key={u.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                  padding:'14px 16px',background:'#f7f9ff',borderRadius:10,
                  border:'1px solid rgba(26,79,160,0.06)',flexWrap:'wrap',gap:10}}>

                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:38,height:38,borderRadius:'50%',background:'#e8f0fe',
                      display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
                      {u.role==='admin'?'📊':u.role==='teacher'?'🧑‍🏫':'👨‍👩‍👧'}
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:500,color:'#0a1628'}}>{u.full_name}</div>
                      <div style={{fontSize:12,color:'#888',marginTop:1}}>{u.email}</div>
                    </div>
                  </div>

                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:20,
                      ...(roleColors[u.role] || roleColors.parent)}}>
                      {u.role}
                    </span>
                    <button
                      onClick={() => handleDelete(u.id, u.full_name)}
                      disabled={deleteLoading === u.id}
                      style={{background:'#fee2e2',color:'#991b1b',border:'none',borderRadius:8,
                        padding:'6px 12px',fontSize:12,fontWeight:500,cursor:'pointer',
                        fontFamily:'Outfit,sans-serif',opacity:deleteLoading===u.id?0.6:1}}>
                      {deleteLoading === u.id ? '...' : '🗑️ Remove'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}