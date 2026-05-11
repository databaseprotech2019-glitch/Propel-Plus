'use client'
import { useEffect, useRef } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

const CURRICULUM = {
  basic:{modules:[
    {title:"Foundational Electronics & Circuit Systems",topics:["Component Familiarization & Functional Exposure","Circuit Behavior & Control Mechanisms","Gaming Circuit 1","Gaming Circuit 2","Electronic Quiz Board"]},
    {title:"Robotics & Motions (Level 1)",topics:["Motion Initiation & Linkage Systems","Energy Transmission & Elastic Mechanics","Rotational Automation Systems","Decorative Motion & Sequential Lighting","Repetitive Striking Mechanisms","Crank & Beam Motion Systems","Mobile Robotics Fundamentals","Gear Systems & Mechanical Advantage"]},
    {title:"Mechanical Robotics & Intelligent Systems (Level 2)",topics:["Robotic Base Architecture & Control Fundamentals","Lifting Mechanisms & Load Handling","Exploration of Gear Trains for Torque and Speed Control","Speed Optimization in Robotic Platforms","Cable Mobility Mechanism","Programmable Motion Control","Sensor-Based Reactive Robotics (IR Systems)","Distance Measurement & Autonomous Response","Touch & Visual Feedback Systems","Multi-Sensor Integration & Smart Systems"]},
    {title:"Creative Animation & Game Logic Design",topics:["Character-Driven Animations","Directional Logic & Navigation Challenge","Introduction to Scoring Logic & User Input"]},
    {title:"Applied Artificial Intelligence & Smart Coding",topics:["Human Attribute Recognition","Object Recognition & Detection","Gesture-Controlled Systems","Natural Language Processing","Capstone Project – AI-Based Application"]},
    {title:"Robotic Simulation & Automation",topics:["Geometric Motion Programming","Collision Detection & Reactive Systems","Distance Sensing & Obstacle Avoidance","Location/Position-Based Sensing","Color Path-Tracking Robots","Capstone Project – Self Driving Car"]},
    {title:"Block-Based Programming",topics:["Understanding Sprites, Workspace, and Execution Flow","Motion Logic & Event Control","Variables, Loops & Conditions","Display, Delay and Text Blocks","Adding Extensions"]},
    {title:"Applied Science & Innovation",topics:["DIY Innovation 1","DIY Innovation 2","DIY Innovation 3","DIY Innovation 4","DIY Innovation 5"]},
    {title:"STEM From Home Challenges",topics:["Balloon-Powered Rocket Car","Balloon Hovercraft","Hydraulic Robotic Arm","Air Pressure Water Pump","Rubber Band Powered Car"]},
    {title:"Knowledge & Skill Evaluation",topics:["Assessment 1 – Theory","Assessment 1 – Practical","Assessment 2 – Theory","Assessment 2 – Practical","Assessment 3 – Theory","Assessment 3 – Practical"]}
  ]},
  intermediate:{modules:[
    {title:"Foundational Electronics & Circuit Systems",topics:["Component Familiarization","Circuit Behavior & Control Mechanisms","Online Simulation and Testing","Building Circuits & Troubleshooting"]},
    {title:"Robotics (Level 1)",topics:["Fundamentals of Robotics","Customised Robot Base","Bionic Robot 1","Bionic Robot 2","Bionic Robot 3","Bionic Robot 4"]},
    {title:"Mechatronic Robotics & Intelligent Controls",topics:["Robotic Systems & Manual Control Interface","Pulley Systems & Load Handling","Gear Systems & Motion Optimization","Block-Based Control & Directional Programming","Advanced Mobility – Climbing Mechanisms","Infrared Sensing & Reactive Navigation","Ultrasonic Sensing & Autonomous Navigation","Color Detection & Intelligent Tracking"]},
    {title:"Robotics and AI",topics:["Intro to AI and Computer Vision","Ethics of AI & Types","Gesture Controlled Interface","Face Identification Interface","Machine Learning and Quality Training"]},
    {title:"Robotic Simulation & Automation",topics:["Geometric Motion Programming","Collision Detection","Distance Sensing & Obstacle Avoidance","Location/Position-Based Sensing","Color Path-Tracking Robots","Self Driving Car"]},
    {title:"High End Robotics & Coding",topics:["Microcontroller Fundamentals","Display Systems & Input Control","PWM","Sensor Integration & Alert Systems","Motor Control & Autonomous Robotics","Wireless Communication","Display Integration","RFID Control Systems"]},
    {title:"Internet of Things (IoT)",topics:["Fundamentals of IoT Platforms","Remote Monitoring of Sensor Data","Smart Systems with Real-Time Control","Capstone Project – Smart Satellite"]},
    {title:"Mobile App Development",topics:["App Development Environments","Understanding Multi Page Design","Mobile Sensor Integration","Capstone – Smart App Development"]},
    {title:"Drone Technology",topics:["Drone Fundamentals & Flight Principles","Flight Control & Manual Navigation","Basic Flight Maneuvers","Aerial Applications"]},
    {title:"Programming & Computational Logic",topics:["Structure and Syntax Design","Understanding Digital Pins","Control Flow & Decision Making","Iteration & Loop Optimization","Integrating Multiple Logic Blocks"]},
    {title:"Online AI Tools & Usage",topics:["ChatGPT – Exam + Learning Guide","Claude – Exam + Learning Guide","Gamma.AI – Exam + Learning Guide","Microsoft Maths","InVideo AI – Video + Cartoon","Krikey AI – 3D Animation"]},
    {title:"Knowledge & Skill Evaluation",topics:["Assessment 1 – Theory","Assessment 1 – Practical","Assessment 2 – Theory","Assessment 2 – Practical","Assessment 3 – Theory","Assessment 3 – Practical"]}
  ]},
  advanced:{modules:[
    {title:"Foundational Electronics & Circuit Systems",topics:["Component Familiarization","Circuit Behavior & Control Mechanisms","Online Simulation and Testing","Building Circuits & Troubleshooting"]},
    {title:"Advanced Robotics & Coding",topics:["Digital Interfaces & Basic Applications","Multi-Condition Sensing using IR","Integration of Sensors & Systems","Relay Modules & High-Power Device Control","Motion Detection & Smart Switching","Robotic Motion Control & Navigation","Wireless Communication & Voice Interaction","Master-Slave Communication Architecture","Advanced Sensor Systems","Biometric & Security Systems","Servo Motor and Precise Angle Programming","Health & Touch-Based Sensor Systems"]},
    {title:"Internet of Things (IoT)",topics:["IoT Foundations & Cloud Connectivity","Real-Time Data Tracking using IoT","Video Streaming & Remote Surveillance","Smart Surveillance & Security Systems"]},
    {title:"Artificial Intelligence & Computer Vision",topics:["AI Foundations & Model Training","Real-Time Image Processing and Face Tracking","Gesture-Based Control Systems","Object Detection & Autonomous Response","Color Recognition using Computer Vision","Total Object Counting"]},
    {title:"Capstone Projects",topics:["TSOP Based Remote Control Applications","Audio Generation through Trigger System","RF Control Applications"]},
    {title:"Mobile App Development",topics:["App Interface Design & User Experience","Understanding Multi Page Design","Mapping User Actions to App Responses","Integrating Multimedia","Testing, Debugging, and Optimizing Apps"]},
    {title:"3D Design, Modeling & Additive Manufacturing",topics:["Static Design & Structural Modeling","Dynamic Design & Functional Mechanisms","Replication & Reverse Design Techniques","Duplication, Scaling & Design Optimization"]},
    {title:"Drone Technology",topics:["Drone Fundamentals & Flight Principles","Flight Control & Manual Navigation","Basic Flight Maneuvers","Aerial Applications"]},
    {title:"Programming & Computational Logic",topics:["Structure and Syntax Design","Understanding Digital Pins","Control Flow & Decision Making","Iteration & Loop Optimization","Integrating Multiple Logic Blocks"]},
    {title:"Online AI Tools & Usage",topics:["ChatGPT – Exam + Learning Guide","Claude – Exam + Learning Guide","Gamma.AI – Exam + Learning Guide","Microsoft Maths","InVideo AI – Video + Cartoon","Krikey AI – 3D Animation"]},
    {title:"Knowledge & Skill Evaluation",topics:["Assessment 1 – Theory","Assessment 1 – Practical","Assessment 2 – Theory","Assessment 2 – Practical","Assessment 3 – Theory","Assessment 3 – Practical"]}
  ]}
}

export default function ProgressPage() {
  const { currentUser, loading, DB } = useDB()
  const router = useRouter()
  const chartRef1 = useRef(null)
  const chartRef2 = useRef(null)
  const chart1 = useRef(null)
  const chart2 = useRef(null)

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
  }, [loading, currentUser])

  useEffect(() => {
    if (!currentUser || loading) return
    initCharts()
    return () => {
      chart1.current?.destroy()
      chart2.current?.destroy()
    }
  }, [currentUser, DB, loading])

  if (loading || !currentUser) return null

  const level = currentUser.level
  const modules = CURRICULUM[level]?.modules || []

  function getProgress() {
    return DB.progress?.[currentUser.email]?.[level] || []
  }

  function isTopicComplete(modIdx, topicIdx) {
    return getProgress().includes(modIdx + '_' + topicIdx)
  }

  const done = getProgress().length
  const total = modules.reduce((s, m) => s + m.topics.length, 0)
  const pct = total ? Math.round(done / total * 100) : 0

  function getAttnStats() {
    const a = DB.attendance?.[currentUser.email] || {}
    let present = 0, absent = 0
    for (let w = 1; w <= 10; w++)
      for (let d = 0; d < 4; d++) {
        const k = `W${w}D${d}`
        if (a[k] === 'present') present++
        else if (a[k] === 'absent') absent++
      }
    return { present, absent, unmarked: 40 - present - absent }
  }

  const attn = getAttnStats()
  const attnPct = Math.round(attn.present / 40 * 100)
  const levelColor = level === 'basic' ? 'rgb(46,204,113)' : level === 'intermediate' ? 'rgb(30,136,229)' : 'rgb(142,68,173)'
  const levelLabel = level === 'basic' ? 'Beginner' : level === 'intermediate' ? 'Intermediate' : 'Expert'

  function initCharts() {
    if (typeof window === 'undefined') return
    const Chart = window.Chart
    if (!Chart) return

    if (chart1.current) chart1.current.destroy()
    if (chart2.current) chart2.current.destroy()

    if (chartRef1.current) {
      chart1.current = new Chart(chartRef1.current, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Remaining'],
          datasets: [{ data: [done, total - done], backgroundColor: [levelColor, 'rgba(0,0,0,.06)'], borderWidth: 0 }]
        },
        options: { cutout: '70%', plugins: { legend: { labels: { color: '#636E72', font: { size: 11 } } } } }
      })
    }

    if (chartRef2.current) {
      chart2.current = new Chart(chartRef2.current, {
        type: 'doughnut',
        data: {
          labels: ['Present', 'Absent', 'Unmarked'],
          datasets: [{ data: [attn.present, attn.absent, attn.unmarked], backgroundColor: ['rgb(46,204,113)', 'rgb(229,57,53)', 'rgba(0,0,0,.06)'], borderWidth: 0 }]
        },
        options: { cutout: '70%', plugins: { legend: { labels: { color: '#636E72', font: { size: 11 } } } } }
      })
    }
  }

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>My Progress</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>Track your learning journey</div>

        {/* Level Card */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderLeft: `4px solid ${levelColor}`,
          borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: 'var(--shadow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 900, fontFamily: 'Cabinet Grotesk',
              background: `${levelColor.replace('rgb', 'rgba').replace(')', ',.1)')}`,
              color: levelColor, flexShrink: 0
            }}>{levelLabel[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 2 }}>{levelLabel}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{total} Topics Total</div>
            </div>
            <span style={{
              background: `${levelColor.replace('rgb', 'rgba').replace(')', ',.1)')}`,
              color: levelColor, border: `1px solid ${levelColor.replace('rgb', 'rgba').replace(')', ',.25)')}`,
              borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase'
            }}>{pct}% complete</span>
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 14 }}>
            {[
              { val: done, label: 'Completed', color: '#27AE60' },
              { val: total - done, label: 'Remaining', color: 'var(--text2)' },
              { val: `${attn.present}/40`, label: 'Attendance', color: '#FF8F00' },
              { val: `${attnPct}%`, label: 'Attn Rate', color: '#1E88E5' }
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.05em', marginBottom: 5, textTransform: 'uppercase' }}>Course</div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: levelColor, borderRadius: 3, transition: 'width .7s' }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.05em', marginBottom: 5, textTransform: 'uppercase' }}>Attendance</div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${attnPct}%`, background: '#FF8F00', borderRadius: 3, transition: 'width .7s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, fontFamily: 'Cabinet Grotesk' }}>Course Completion</div>
            <canvas ref={chartRef1} height={180} />
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, fontFamily: 'Cabinet Grotesk' }}>Attendance Breakdown</div>
            <canvas ref={chartRef2} height={180} />
          </div>
        </div>

        {/* Module Progress */}
        <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 14, fontFamily: 'Cabinet Grotesk' }}>Module Progress</div>
        {modules.map((mod, modIdx) => {
          const modDone = mod.topics.filter((_, ti) => isTopicComplete(modIdx, ti)).length
          const modPct = mod.topics.length ? Math.round(modDone / mod.topics.length * 100) : 0
          return (
            <div key={modIdx} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '14px 18px', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow)'
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, background: 'var(--bg)',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--text2)', flexShrink: 0
              }}>{String(modIdx + 1).padStart(2, '0')}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mod.title}</div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${modPct}%`, background: levelColor, borderRadius: 3 }} />
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 900, fontFamily: 'Cabinet Grotesk' }}>{modPct}%</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>{modDone}/{mod.topics.length}</div>
              </div>
            </div>
          )
        })}
      </div>
    </AppLayout>
  )
}