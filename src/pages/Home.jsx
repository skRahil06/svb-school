import { useEffect, useRef } from 'react'
import logo from '/logo.jpeg'
import { useNavigate } from 'react-router-dom'

export default function Home() {

  const navigate = useNavigate()
  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          observer.unobserve(e.target)
        }
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
      .forEach(el => observer.observe(el))

    // Nav shadow
    const handleScroll = () => {
      document.getElementById('navbar')
        ?.classList.toggle('scrolled', window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll)

    // Counter animation
    function animateCounter(el, target) {
      let start = 0
      const step = target / (1800 / 16)
      const timer = setInterval(() => {
        start = Math.min(start + step, target)
        el.textContent = Math.floor(start)
        if (start >= target) clearInterval(timer)
      }, 16)
    }
    const statObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target
          const target = parseInt(el.dataset.target)
          if (!isNaN(target)) animateCounter(el, target)
          statObs.unobserve(el)
        }
      })
    }, { threshold: 0.5 })
    document.querySelectorAll('[data-target]').forEach(el => statObs.observe(el))

    // 3D tilt
    const cards = document.querySelectorAll('.feat-card')
    cards.forEach(card => {
      const onMove = e => {
        const r = card.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        card.style.transform = `translateY(-6px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg)`
      }
      const onLeave = () => { card.style.transform = '' }
      card.addEventListener('mousemove', onMove)
      card.addEventListener('mouseleave', onLeave)
    })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap');
        body { font-family: 'Outfit', sans-serif; overflow-x: hidden; }
        .font-display { font-family: 'Cormorant Garamond', serif; }

        .reveal { opacity:0; transform:translateY(32px); transition:opacity 0.65s ease, transform 0.65s ease; }
        .reveal.visible { opacity:1; transform:translateY(0); }
        .reveal-left { opacity:0; transform:translateX(-32px); transition:opacity 0.65s ease, transform 0.65s ease; }
        .reveal-left.visible { opacity:1; transform:translateX(0); }
        .reveal-right { opacity:0; transform:translateX(32px); transition:opacity 0.65s ease, transform 0.65s ease; }
        .reveal-right.visible { opacity:1; transform:translateX(0); }

        .nav { position:fixed; top:0; left:0; right:0; z-index:200; display:flex; align-items:center; justify-content:space-between; padding:12px 20px; background:rgba(255,255,255,0.92); backdrop-filter:blur(12px); border-bottom:1px solid rgba(26,79,160,0.10); transition:box-shadow 0.3s; }
        .nav.scrolled { box-shadow:0 2px 20px rgba(26,79,160,0.12); }
        @media(min-width:768px){ .nav{ padding:14px 40px; } .nav-links{ display:flex !important; } }

        .hero-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(26,79,160,0.18) 1px,transparent 1px),linear-gradient(90deg,rgba(26,79,160,0.18) 1px,transparent 1px); background-size:48px 48px; animation:gridMove 12s linear infinite; }
        @keyframes gridMove { from{background-position:0 0} to{background-position:48px 48px} }

        .orb { position:absolute; border-radius:50%; filter:blur(60px); animation:orbFloat 8s ease-in-out infinite; }
        @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-30px) scale(1.08)} }

        .dot { width:6px; height:6px; border-radius:50%; background:#f0b429; animation:pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }

        @keyframes fadeDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heroUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .hero-badge { animation:fadeDown 0.8s ease both; }
        .hero-h1 { animation:heroUp 0.9s 0.2s ease both; }
        .hero-p { animation:heroUp 0.9s 0.4s ease both; }
        .hero-btns { animation:heroUp 0.9s 0.6s ease both; }
        .scroll-ind { animation:fadeIn 1s 1.2s ease both; }

        .scroll-line { width:1px; height:32px; background:linear-gradient(to bottom,rgba(255,255,255,0.5),transparent); animation:scrollDrop 1.5s ease-in-out infinite; }
        @keyframes scrollDrop { 0%{transform:scaleY(0);transform-origin:top} 50%{transform:scaleY(1);transform-origin:top} 100%{transform:scaleY(0);transform-origin:bottom} }

        .ticker { display:flex; animation:ticker 20s linear infinite; white-space:nowrap; }
        .ticker:hover { animation-play-state:paused; }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        .feat-card { background:#fff; border:1px solid rgba(26,79,160,0.10); border-radius:16px; padding:24px 18px; cursor:default; transition:box-shadow 0.3s,transform 0.3s; transform-style:preserve-3d; position:relative; overflow:hidden; }
        .feat-card:hover { box-shadow:0 16px 48px rgba(26,79,160,0.15); }

        .ann-item:hover { box-shadow:0 6px 24px rgba(26,79,160,0.10); transform:translateX(4px); }
        .portal-card:hover { border-color:#1a4fa0; box-shadow:0 8px 32px rgba(26,79,160,0.12); transform:translateY(-4px); }
        .branch-card:hover { transform:translateY(-4px); box-shadow:0 12px 40px rgba(26,79,160,0.18); }
        .map-btn:hover { background:#153d82; }
      `}</style>

      {/* NAV */}
      <nav className="nav" id="navbar">
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <img src={logo} alt="SVB" style={{width:42,height:42,borderRadius:'50%',objectFit:'cover',border:'2px solid #1a4fa0'}} />
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:13,fontWeight:600,color:'#1a4fa0',lineHeight:1.25,maxWidth:150}}>
            Sree Viswabharathi<br/>EM High School
          </div>
        </div>
        <div className="nav-links" style={{display:'none',gap:24}}>
          {['About','Branches','Announcements','Portals'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              style={{fontSize:14,fontWeight:500,color:'#444',textDecoration:'none',cursor:'pointer'}}>
              {l}
            </a>
          ))}
        </div>
        <button onClick={() => navigate('/login')}
          style={{background:'#1a4fa0',color:'#fff',border:'none',borderRadius:8,padding:'9px 18px',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'Outfit,sans-serif'}}>
          Login →
        </button>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100svh',background:'#0a1628',position:'relative',overflow:'hidden',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',textAlign:'center',padding:'100px 24px 60px'}}>
        <div className="hero-grid" />
        <div className="orb" style={{width:300,height:300,background:'rgba(26,79,160,0.45)',top:-60,right:-60,animationDelay:'0s'}} />
        <div className="orb" style={{width:200,height:200,background:'rgba(37,99,196,0.3)',bottom:80,left:-40,animationDelay:'3s'}} />
        <div className="orb" style={{width:160,height:160,background:'rgba(240,180,41,0.2)',bottom:160,right:60,animationDelay:'6s'}} />

        <div className="hero-badge" style={{position:'relative',zIndex:2,display:'inline-flex',alignItems:'center',gap:6,background:'rgba(240,180,41,0.15)',border:'1px solid rgba(240,180,41,0.4)',color:'#f0b429',fontSize:12,fontWeight:500,padding:'5px 14px',borderRadius:20,marginBottom:24}}>
          <div className="dot" /> Est. 1977 · Venkateswarapurum · English Medium
        </div>

        <h1 className="hero-h1 font-display" style={{position:'relative',zIndex:2,fontSize:'clamp(36px,8vw,68px)',color:'#fff',lineHeight:1.1,marginBottom:16}}>
          Where <span style={{color:'#f0b429'}}>Excellence</span><br/>Meets Character
        </h1>

        <p className="hero-p" style={{position:'relative',zIndex:2,fontSize:'clamp(14px,3.5vw,17px)',color:'rgba(255,255,255,0.65)',maxWidth:480,lineHeight:1.7,marginBottom:36}}>
          Sree Viswabharathi EM High School — nurturing champions in academics, sports, and life since nearly five decades.
        </p>

        <div className="hero-btns" style={{position:'relative',zIndex:2,display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={() => navigate('/login')}
            style={{background:'#f0b429',color:'#0a1628',border:'none',borderRadius:10,padding:'13px 28px',fontSize:15,fontWeight:600,cursor:'pointer',boxShadow:'0 4px 20px rgba(240,180,41,0.35)'}}>
            Parent Portal
          </button>
            <button onClick={() => document.getElementById('about').scrollIntoView({behavior:'smooth'})}
            style={{background:'transparent',color:'#fff',border:'1.5px solid rgba(255,255,255,0.4)',borderRadius:10,padding:'13px 28px',fontSize:15,fontWeight:500,cursor:'pointer'}}>
            Explore School
            </button>
        </div>

        <div className="scroll-ind" style={{position:'absolute',bottom:28,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:6,color:'rgba(255,255,255,0.4)',fontSize:11,zIndex:2}}>
          <div className="scroll-line" />
          <span>scroll</span>
        </div>
      </section>

      {/* STATS */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',background:'#1a4fa0'}}>
        {[{num:47,label:'Years Strong',target:47},{num:2,label:'Branches',target:2},{num:'Play–10',label:'Classes',target:null}].map((s,i) => (
          <div key={i} style={{padding:'22px 12px',textAlign:'center',borderRight:i<2?'1px solid rgba(255,255,255,0.15)':'none'}}>
            <div className="font-display" data-target={s.target||undefined}
              style={{fontSize:'clamp(26px,5vw,36px)',color:'#fff',fontWeight:700}}>
              {s.target ? '0' : s.num}
            </div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.65)',marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* TICKER */}
      <div style={{background:'#1a4fa0',overflow:'hidden',padding:'14px 0',position:'relative'}}>
        <div style={{position:'absolute',top:0,bottom:0,left:0,width:60,background:'linear-gradient(to right,#1a4fa0,transparent)',zIndex:2}} />
        <div style={{position:'absolute',top:0,bottom:0,right:0,width:60,background:'linear-gradient(to left,#1a4fa0,transparent)',zIndex:2}} />
        <div className="ticker">
          {[...Array(2)].map((_,rep) => (
            ['🏆 National Level Sports Participants','🧮 Abacus City Level Winners','🏅 Strong Academic Results','⚽ Dedicated Playground','🎓 47 Years of Educational Excellence','❄️ New Air-Conditioned Branch'].map((item,i) => (
              <span key={`${rep}-${i}`} style={{display:'inline-flex',alignItems:'center',gap:8,padding:'0 32px',fontSize:13,fontWeight:500,color:'#fff'}}>
                {item} <span style={{color:'#f0b429',fontSize:16}}>✦</span>
              </span>
            ))
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div id="about" style={{padding:'60px 20px',maxWidth:960,margin:'0 auto'}}>
        <div className="reveal" style={{fontSize:12,fontWeight:600,color:'#1a4fa0',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>Why SVB?</div>
        <div className="reveal font-display" style={{fontSize:'clamp(28px,5vw,40px)',color:'#0a1628',lineHeight:1.2,marginBottom:10}}>What Makes Us Stand Apart</div>
        <div className="reveal" style={{fontSize:15,color:'#666',lineHeight:1.6,marginBottom:40}}>Four pillars that define the Sree Viswabharathi experience</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
          {[

            {icon:'🎓',title:'Academic Excellence',desc:'Consistent top performers in State Board exams with a strong focus on conceptual learning and student growth.',badge:'State Board'},

            {icon:'🎖️',title:'Strong Discipline',desc:'A values-driven environment where respect, punctuality, and responsibility are instilled from day one.',badge:'Core Value'},

            {icon:'🏃',title:'National Sports',desc:'Our students have proudly represented at national level competitions, driven by passion, training, and team spirit.',badge:'National Level'},

            {icon:'⚽',title:'Spacious Playground',desc:'A dedicated playground where students enjoy structured outdoor activity, sports, and free play every single day.',badge:'Active Learning'},

          ].map((f,i) => (
            <div key={i} className="feat-card reveal" style={{transitionDelay:`${i*0.05+0.05}s`}}>
              <div style={{width:48,height:48,borderRadius:12,background:'#e8f0fe',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,fontSize:24}}>{f.icon}</div>
              <h3 style={{fontSize:14,fontWeight:600,color:'#0a1628',marginBottom:6}}>{f.title}</h3>
              <p style={{fontSize:12,color:'#777',lineHeight:1.6}}>{f.desc}</p>
              <span style={{display:'inline-block',marginTop:10,fontSize:10,fontWeight:600,background:'rgba(240,180,41,0.15)',color:'#b5860a',padding:'3px 8px',borderRadius:4}}>{f.badge}</span>
            </div>
          ))}
        </div>
      </div>

        {/* BRANCHES */}
        <div id="branches" style={{background:'#f7f9ff',padding:'60px 0'}}>
        <div style={{maxWidth:960,margin:'0 auto',padding:'0 20px'}}>
            <div className="reveal" style={{fontSize:12,fontWeight:600,color:'#1a4fa0',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>Locations</div>
            <div className="reveal font-display" style={{fontSize:'clamp(28px,5vw,40px)',color:'#0a1628',lineHeight:1.2,marginBottom:10}}>Our Two Branches</div>
            <div className="reveal" style={{fontSize:15,color:'#666',marginBottom:40}}>Located in the heart of Venkateswarapuram, Nellore</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}>
            {[
                {
                pill:'Main Campus',
                title:'Main Branch',
                sub:'Playclass through Class 10 — complete schooling',
                address:'Venkateswarapuram, Nellore,\nAndhra Pradesh',
                phone:'+91 8500041811',
                email:'info@svbschool.edu.in',
                map:'https://maps.app.goo.gl/x1A9dd6gosiseZJu8',
                bg:'linear-gradient(135deg,#1a4fa0,#2563c4)',
                side:'left'
                },
                {
                pill:'New · AC Campus',
                title:'New AC Branch',
                sub:'Air-conditioned early learning centre',
                address:'Bhagat Singh Colony, Nellore,\nAndhra Pradesh',
                phone:'+91 8500041811',
                email:'info@svbschool.edu.in',
                map:'https://maps.app.goo.gl/VqzNhRen6bJbWzg77',
                bg:'linear-gradient(135deg,#1565c0,#1976d2)',
                side:'right'
                },
            ].map((b,i) => (
                <div key={i} className={`branch-card reveal-${b.side}`} style={{borderRadius:20,overflow:'hidden',boxShadow:'0 4px 24px rgba(26,79,160,0.10)',transition:'transform 0.3s,box-shadow 0.3s',border:'1px solid rgba(26,79,160,0.08)'}}>
                
                {/* Header */}
                <div style={{padding:'28px 24px',background:b.bg,position:'relative',overflow:'hidden'}}>
                    <span style={{display:'inline-block',background:'rgba(255,255,255,0.18)',color:'#fff',fontSize:11,fontWeight:500,padding:'4px 12px',borderRadius:20,marginBottom:12,border:'1px solid rgba(255,255,255,0.25)'}}>{b.pill}</span>
                    <h3 className="font-display" style={{fontSize:22,color:'#fff',marginBottom:4}}>{b.title}</h3>
                    <p style={{fontSize:13,color:'rgba(255,255,255,0.7)'}}>{b.sub}</p>
                </div>

                {/* Body */}
                <div style={{background:'#fff',padding:'20px 24px'}}>
                    <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:16}}>

                    {/* Address */}
                    <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                        <div style={{width:28,height:28,borderRadius:8,background:'#e8f0fe',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:13}}>📍</div>
                        <div>
                        <div style={{fontSize:11,color:'#aaa',fontWeight:500,marginBottom:2}}>Address</div>
                        <span style={{fontSize:13,color:'#333',lineHeight:1.6,whiteSpace:'pre-line'}}>{b.address}</span>
                        </div>
                    </div>

                    {/* Phone */}
                    <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                        <div style={{width:28,height:28,borderRadius:8,background:'#e8f0fe',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:13}}>📞</div>
                        <div>
                        <div style={{fontSize:11,color:'#aaa',fontWeight:500,marginBottom:2}}>Phone</div>
                        <a href={`tel:${b.phone}`} style={{fontSize:13,color:'#333',textDecoration:'none'}}>{b.phone}</a>
                        </div>
                    </div>

                    {/* Email */}
                    <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                        <div style={{width:28,height:28,borderRadius:8,background:'#e8f0fe',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:13}}>✉️</div>
                        <div>
                        <div style={{fontSize:11,color:'#aaa',fontWeight:500,marginBottom:2}}>Email</div>
                        <a href={`mailto:${b.email}`} style={{fontSize:13,color:'#333',textDecoration:'none'}}>{b.email}</a>
                        </div>
                    </div>

                    </div>

                    {/* Map Button */}
                    <a href={b.map} target="_blank" rel="noreferrer"
                    style={{width:'100%',background:'#1a4fa0',color:'#fff',border:'none',borderRadius:10,padding:12,fontSize:14,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,textDecoration:'none'}}
                    className="map-btn">
                    🗺️ Get Directions
                    </a>

                </div>
                </div>
            ))}
            </div>
        </div>
        </div>

      {/* ANNOUNCEMENTS */}
      <div id="announcements" style={{background:'#f7f9ff',padding:'60px 0'}}>
        <div style={{maxWidth:960,margin:'0 auto',padding:'0 20px'}}>
          <div className="reveal" style={{fontSize:12,fontWeight:600,color:'#1a4fa0',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>Latest</div>
          <div className="reveal font-display" style={{fontSize:'clamp(28px,5vw,40px)',color:'#0a1628',lineHeight:1.2,marginBottom:10}}>School Announcements</div>
          <div className="reveal" style={{fontSize:15,color:'#666',marginBottom:28}}>Stay updated with news, events, and schedules</div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {[
              {day:'20',mon:'MAR',title:'Annual Examinations — Class 1 to 10',desc:'Exams begin April 5th. Hall tickets distributed by March 30th.',chip:'Exam',chipColor:'#856404',chipBg:'#fff3cd'},
              {day:'18',mon:'MAR',title:'District Athletics Meet — Students Selected',desc:'8 students selected to represent in the District Athletics Meet 2026.',chip:'Sports',chipColor:'#9d174d',chipBg:'#fce7f3'},
              {day:'30',mon:'MAR',title:'Telugu New Year Holiday — Ugadi',desc:'School closed March 30th. Classes resume April 1st.',chip:'Holiday',chipColor:'#065f46',chipBg:'#d1fae5'},
              {day:'10',mon:'APR',title:'Abacus Inter-School Competition',desc:'Our students participate in the city-level Abacus competition.',chip:'Event',chipColor:'#1e40af',chipBg:'#dbeafe'},
            ].map((a,i) => (
              <div key={i} className="ann-item reveal" style={{transitionDelay:`${i*0.08}s`,display:'flex',gap:16,alignItems:'flex-start',padding:'16px 18px',background:'#fff',borderRadius:14,border:'1px solid rgba(26,79,160,0.08)',transition:'box-shadow 0.25s,transform 0.25s'}}>
                <div style={{background:'#1a4fa0',color:'#fff',borderRadius:10,padding:'8px 10px',textAlign:'center',minWidth:48,flexShrink:0}}>
                  <div style={{fontSize:20,fontWeight:600,lineHeight:1}}>{a.day}</div>
                  <div style={{fontSize:10,marginTop:2,opacity:0.8}}>{a.mon}</div>
                </div>
                <div>
                  <h4 style={{fontSize:14,fontWeight:600,color:'#0a1628',marginBottom:3}}>{a.title}</h4>
                  <p style={{fontSize:12,color:'#777',lineHeight:1.5}}>{a.desc}</p>
                  <span style={{display:'inline-block',fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:4,marginTop:6,background:a.chipBg,color:a.chipColor}}>{a.chip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

{/* SSC TOPPERS */}
<div style={{background:'#0a1628',padding:'60px 20px'}}>
  <div style={{maxWidth:960,margin:'0 auto'}}>

    {/* Header */}
    <div className="reveal" style={{fontSize:12,fontWeight:600,color:'#f0b429',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>
      Hall of Fame
    </div>
    <div className="reveal font-display" style={{fontSize:'clamp(28px,5vw,40px)',color:'#fff',lineHeight:1.2,marginBottom:10}}>
      SSC Board Exam Toppers
    </div>
    <div className="reveal" style={{fontSize:15,color:'rgba(255,255,255,0.5)',marginBottom:32}}>
      Our brightest stars — celebrating excellence since 2014
    </div>

    {/* Horizontal scroll */}
    <div style={{
      display:'flex',
      gap:12,
      overflowX:'auto',
      paddingBottom:16,
      scrollSnapType:'x mandatory',
      WebkitOverflowScrolling:'touch',
      msOverflowStyle:'none',
      scrollbarWidth:'none',
    }}>
      {[
        {year:'2025', name:'Sanavar', score:'584 / 600', best:true},
        {year:'2024', name:'Akshaya', score:'550 / 600', best:true},
        {year:'2023', name:'Devasri', score:'—'},
        {year:'2022', name:'—', score:'Records Pending'},
        {year:'2021', name:'—', score:'No SSC (COVID)'},
        {year:'2020', name:'—', score:'No SSC (COVID)'},
        {year:'2019', name:'Suresh', score:'GPA 9.8'},
        {year:'2018', name:'SK Rahil', score:'GPA 9.8'},
        {year:'2017', name:'Gayathri', score:'GPA 9.7'},
        {year:'2016', name:'K Akhil', score:'GPA 9.5'},
        {year:'2015', name:'B Harika', score:'GPA 9.5'},
        {year:'2014', name:'SK Karishma', score:'GPA 9.7'},
      ].map((t, i) => (
        <div key={i} style={{
          flexShrink:0,
          width:140,
          scrollSnapAlign:'start',
          background: t.name === '—' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
          border:`1px solid ${t.name==='—' ? 'rgba(255,255,255,0.06)' : t.best ? 'rgba(240,180,41,0.4)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius:16,padding:'20px 14px',textAlign:'center',
          opacity: t.name === '—' ? 0.5 : 1,
          transition:'transform 0.3s',
        }}>

          {/* Year badge */}
          <div style={{
            display:'inline-block',
            background: t.name==='—' ? 'rgba(255,255,255,0.05)' : t.best ? 'rgba(240,180,41,0.2)' : 'rgba(255,255,255,0.08)',
            color: t.name==='—' ? 'rgba(255,255,255,0.3)' : t.best ? '#f0b429' : 'rgba(255,255,255,0.6)',
            fontSize:11,fontWeight:700,padding:'3px 10px',
            borderRadius:20,marginBottom:14,letterSpacing:'0.05em'
          }}>
            {t.year}
          </div>

          {/* Avatar */}
          <div style={{
            width:52,height:52,borderRadius:'50%',
            background: t.name==='—' ? 'rgba(255,255,255,0.05)' : t.best ? 'linear-gradient(135deg,#f0b429,#e09020)' : 'linear-gradient(135deg,#1a4fa0,#2563c4)',
            display:'flex',alignItems:'center',justifyContent:'center',
            margin:'0 auto 12px',
            border: t.name==='—' ? '2px solid rgba(255,255,255,0.08)' : t.best ? '2px solid rgba(240,180,41,0.5)' : '2px solid rgba(255,255,255,0.15)',
            fontSize:20
          }}>
            {t.name==='—' ? '?' : t.best ? '🥇' : '🎓'}
          </div>

          {/* Name */}
          <div style={{
            fontSize:13,fontWeight:600,
            color: t.name==='—' ? 'rgba(255,255,255,0.2)' : '#fff',
            marginBottom:6,lineHeight:1.3
          }}>
            {t.name}
          </div>

          {/* Score */}
          <div style={{
            fontSize:11,
            color: t.name==='—' ? 'rgba(255,255,255,0.2)' : t.best ? '#f0b429' : 'rgba(255,255,255,0.5)',
            fontWeight: t.best ? 600 : 400
          }}>
            {t.score}
          </div>

        </div>
      ))}
    </div>

    {/* Scroll hint */}
    <div style={{textAlign:'center',marginTop:8,fontSize:12,color:'rgba(255,255,255,0.25)'}}>
      ← swipe to see older results
    </div>

  </div>
</div>



    {/* PORTALS */}
    <div id="portals" style={{padding:'60px 20px',maxWidth:960,margin:'0 auto'}}>
    <div className="reveal" style={{fontSize:12,fontWeight:600,color:'#1a4fa0',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>Access</div>
    <div className="reveal font-display" style={{fontSize:'clamp(28px,5vw,40px)',color:'#0a1628',lineHeight:1.2,marginBottom:10}}>School Portals</div>
    <div className="reveal" style={{fontSize:15,color:'#666',marginBottom:32}}>Login to your dedicated portal for attendance, marks, and more</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14}}>
        {[
        {icon:'👨‍👩‍👧',title:'Parent Portal',desc:"Your child's academic progress, all in one place.",link:'Login as Parent'},
        {icon:'🧑‍🏫',title:'Teacher Portal',desc:'Manage your classroom, students and daily activities.',link:'Login as Teacher'},
        {icon:'📊',title:'Management',desc:'School administration and management tools.',link:'Login as Admin'},
        ].map((p,i) => (
        <div
            key={i}
            className="portal-card reveal"
            onClick={() => navigate('/login')}
            style={{transitionDelay:`${i*0.08}s`,padding:'28px 22px',borderRadius:16,border:'1.5px solid rgba(26,79,160,0.12)',background:'#fff',cursor:'pointer',transition:'border-color 0.25s,box-shadow 0.25s,transform 0.25s',position:'relative',overflow:'hidden'}}
        >
            <div style={{width:52,height:52,borderRadius:14,background:'#e8f0fe',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:18,fontSize:26}}>{p.icon}</div>
            <h3 style={{fontSize:16,fontWeight:600,color:'#0a1628',marginBottom:6}}>{p.title}</h3>
            <p style={{fontSize:13,color:'#777',lineHeight:1.5,marginBottom:14}}>{p.desc}</p>
            <div style={{fontSize:13,color:'#1a4fa0',fontWeight:600}}>{p.link} →</div>
        </div>
        ))}
    </div>
    </div>

      {/* FOOTER */}
      <footer style={{background:'#0a1628',padding:'48px 20px 28px'}}>
        <div style={{maxWidth:960,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:32,marginBottom:40}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <img src={logo} alt="SVB" style={{width:44,height:44,borderRadius:'50%',objectFit:'cover',border:'2px solid rgba(255,255,255,0.2)'}}/>
                <div className="font-display" style={{fontSize:15,color:'#fff',lineHeight:1.3}}>Sree Viswabharathi<br/>EM High School</div>
              </div>
              <p style={{fontSize:13,color:'rgba(255,255,255,0.45)',lineHeight:1.7}}>Shaping young minds with knowledge, discipline, and the spirit of excellence since 1977.</p>
            </div>
            <div>
              <h4 style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.5)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:14}}>Quick Links</h4>
              {['About','Branches','Announcements','Portals'].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} style={{display:'block',fontSize:13,color:'rgba(255,255,255,0.45)',marginBottom:9,textDecoration:'none'}}>{l}</a>
              ))}
            </div>
            <div>
              <h4 style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.5)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:14}}>Contact</h4>
              {['+91 98765 43210','+91 8885805673','info@svbschool.edu.in','Venkateswarapuram, Nellore'].map(c => (
                <p key={c} style={{fontSize:13,color:'rgba(255,255,255,0.45)',marginBottom:9}}>{c}</p>
              ))}
            </div>
          </div>
          <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:20,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
            <p style={{fontSize:12,color:'rgba(255,255,255,0.25)'}}>© 2026 Sree Viswabharathi EM High School. All rights reserved.</p>
            <p style={{fontSize:12,color:'rgba(255,255,255,0.25)'}}>Est. 1977 · English Medium · State Board</p>
          </div>
        </div>
      </footer>
    </>
  )
}

