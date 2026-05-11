'use client'
import { useEffect } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

const CURRICULUM = {
  basic:{name:"Beginner",modules:[
    {title:"Foundational Electronics & Circuit Systems",topics:["Component Familiarization & Functional Exposure","Circuit Behavior & Control Mechanisms","Gaming Circuit 1","Gaming Circuit 2","Electronic Quiz Board"]},
    {title:"Robotics & Motions (Level 1)",topics:["Motion Initiation & Linkage Systems","Energy Transmission & Elastic Mechanics","Rotational Automation Systems","Decorative Motion & Sequential Lighting","Repetitive Striking Mechanisms","Crank & Beam Motion Systems","Mobile Robotics Fundamentals","Gear Systems & Mechanical Advantage"]},
    {title:"Mechanical Robotics & Intelligent Systems (Level 2)",topics:["Robotic Base Architecture & Control Fundamentals","Lifting Mechanisms & Load Handling","Exploration of Gear Trains for Torque and Speed Control","Speed Optimization in Robotic Platforms","Cable Mobility Mechanism","Programmable Motion Control","Sensor-Based Reactive Robotics (IR Systems)","Distance Measurement & Autonomous Response","Touch & Visual Feedback Systems","Multi-Sensor Integration & Smart Systems"]},
    {title:"Creative Animation & Game Logic Design",topics:["Character-Driven Animations with Multiple Motion Behaviors","Directional Logic & Navigation Challenge","Introduction to Scoring Logic & User Input"]},
    {title:"Applied Artificial Intelligence & Smart Coding",topics:["Human Attribute Recognition","Object Recognition & Detection","Gesture-Controlled Systems","Natural Language Processing","Capstone Project – Development of a Complete AI-Based Application"]},
    {title:"Robotic Simulation & Automation",topics:["Geometric Motion Programming","Collision Detection & Reactive Systems","Distance Sensing & Obstacle Avoidance","Location/Position-Based Sensing","Color Path-Tracking Robots","Capstone Project – Self Driving Car"]},
    {title:"Block-Based Programming",topics:["Understanding Sprites, Workspace, and Execution Flow","Motion Logic & Event Control","Variables, Loops & Conditions","Display, Delay and Text Blocks","Adding Extensions"]},
    {title:"Applied Science & Innovation",topics:["DIY Innovation 1","DIY Innovation 2","DIY Innovation 3","DIY Innovation 4","DIY Innovation 5"]},
    {title:"STEM From Home Challenges",topics:["Balloon-Powered Rocket Car","Balloon Hovercraft","Hydraulic Robotic Arm","Air Pressure Water Pump","Rubber Band Powered Car"]},
    {title:"Knowledge & Skill Evaluation",topics:["Assessment 1 – Theory","Assessment 1 – Practical","Assessment 2 – Theory","Assessment 2 – Practical","Assessment 3 – Theory","Assessment 3 – Practical"]}
  ]},
  intermediate:{name:"Intermediate",modules:[
    {title:"Foundational Electronics & Circuit Systems",topics:["Component Familiarization & Functional Exposure","Circuit Behavior & Control Mechanisms","Online Simulation and Testing","Building Circuits & Troubleshooting"]},
    {title:"Robotics (Level 1)",topics:["Fundamentals of Robotics","Customised Robot Base","Bionic Robot 1","Bionic Robot 2","Bionic Robot 3","Bionic Robot 4"]},
    {title:"Mechatronic Robotics & Intelligent Controls (Level 2)",topics:["Robotic Systems & Manual Control Interface","Pulley Systems & Load Handling Mechanisms","Gear Systems & Motion Optimization","Block-Based Control & Directional Programming","Advanced Mobility – Climbing Mechanisms","Infrared Sensing & Reactive Navigation","Ultrasonic Sensing & Autonomous Navigation","Color Detection & Intelligent Tracking Systems"]},
    {title:"Robotics and AI",topics:["Intro to AI and Computer Vision","Ethics of AI & Types","Gesture Controlled Interface","Face Identification Interface","Machine Learning and Quality Training"]},
    {title:"Robotic Simulation & Automation",topics:["Geometric Motion Programming","Collision Detection & Reactive Systems","Distance Sensing & Obstacle Avoidance","Location/Position-Based Sensing","Color Path-Tracking Robots","Capstone Project – Self Driving Car"]},
    {title:"High End Robotics & Coding",topics:["Microcontroller Fundamentals","Display Systems & Input Control Interfaces","PWM","Sensor Integration & Alert Systems","Motor Control & Autonomous Robotics","Wireless Communication","Display Integration","RFID Control Systems"]},
    {title:"Internet of Things (IoT) & Connected Systems",topics:["Fundamentals of IoT Platforms and Cloud Connectivity","Remote Monitoring of Sensor Data through Dashboards","Smart Systems with Real-Time Control","Capstone Project – Smart Satellite"]},
    {title:"Mobile App Development & Sensor-Based Applications",topics:["Mobile App Development Environments and Design Principles","Understanding Multi Page Design","Mobile Sensor Integration","Capstone – Smart App Development"]},
    {title:"Drone Technology & Aerial Systems",topics:["Drone Fundamentals & Flight Principles","Flight Control & Manual Navigation","Basic Flight Maneuvers","Aerial Applications (Surveillance, Delivery, Mapping)"]},
    {title:"Programming & Computational Logic",topics:["Structure and Syntax Design","Understanding Digital Pins and Basic Coding Structure","Control Flow & Decision Making","Iteration & Loop Optimization","Integrating Multiple Logic Blocks into a Complete Program"]},
    {title:"Online AI Tools & Usage",topics:["ChatGPT – Exam + Learning Guide","Claude – Exam + Learning Guide","Gamma.AI – Exam + Learning Guide","Microsoft Maths","InVideo AI – Video + Cartoon","Krikey AI – 3D Animation"]},
    {title:"Knowledge & Skill Evaluation",topics:["Assessment 1 – Theory","Assessment 1 – Practical","Assessment 2 – Theory","Assessment 2 – Practical","Assessment 3 – Theory","Assessment 3 – Practical"]}
  ]},
  advanced:{name:"Expert",modules:[
    {title:"Foundational Electronics & Circuit Systems",topics:["Component Familiarization & Functional Exposure","Circuit Behavior & Control Mechanisms","Online Simulation and Testing","Building Circuits & Troubleshooting"]},
    {title:"Advanced Robotics & Coding",topics:["Digital Interfaces & Development of Basic Applications","Multi-Condition Sensing using IR","Integration of Sensors & Systems","Relay Modules & High-Power Device Control","Motion Detection & Smart Switching Systems","Robotic Motion Control & Navigation","Wireless Communication & Voice Interaction","Master-Slave Communication Architecture","Advanced Sensor Systems & Real-World Applications","Biometric & Security Systems","Servo Motor and Precise Angle Programming","Health & Touch-Based Sensor Systems"]},
    {title:"Internet of Things (IoT) & Connected Systems",topics:["IoT Foundations & Cloud Connectivity","Real-Time Data Tracking using IoT","Video Streaming & Remote Surveillance Systems","Smart Surveillance & Security Systems"]},
    {title:"Artificial Intelligence, Computer Vision & Intelligent Control",topics:["AI Foundations & Model Training","Real-Time Image Processing and Face Tracking","Gesture-Based Control Systems","Object Detection & Autonomous Response Systems","Color Recognition using Computer Vision","Total Object Counting"]},
    {title:"Capstone Projects",topics:["TSOP Based Remote Control Applications","Audio Generation through Trigger System","RF Control Applications"]},
    {title:"Mobile App Development & Sensor-Based Applications",topics:["App Interface Design & User Experience","Understanding Multi Page Design","Mapping User Actions to App Responses","Integrating Multimedia (Images, Audio, Text-to-Speech)","Testing, Debugging, and Optimizing Apps"]},
    {title:"3D Design, Modeling & Additive Manufacturing",topics:["Static Design & Structural Modeling","Dynamic Design & Functional Mechanisms","Replication & Reverse Design Techniques","Duplication, Scaling & Design Optimization"]},
    {title:"Drone Technology & Aerial Systems",topics:["Drone Fundamentals & Flight Principles","Flight Control & Manual Navigation","Basic Flight Maneuvers","Aerial Applications (Surveillance, Delivery, Mapping)"]},
    {title:"Programming & Computational Logic",topics:["Structure and Syntax Design","Understanding Digital Pins and Basic Coding Structure","Control Flow & Decision Making","Iteration & Loop Optimization","Integrating Multiple Logic Blocks into a Complete Program"]},
    {title:"Online AI Tools & Usage",topics:["ChatGPT – Exam + Learning Guide","Claude – Exam + Learning Guide","Gamma.AI – Exam + Learning Guide","Microsoft Maths","InVideo AI – Video + Cartoon","Krikey AI – 3D Animation"]},
    {title:"Knowledge & Skill Evaluation",topics:["Assessment 1 – Theory","Assessment 1 – Practical","Assessment 2 – Theory","Assessment 2 – Practical","Assessment 3 – Theory","Assessment 3 – Practical"]}
  ]}
}

export default function CoursePage() {
  const { currentUser, loading, DB, saveDB } = useDB()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
  }, [loading, currentUser])

  if (loading || !currentUser) return null

  const isAdmin = currentUser.role === 'admin'
  const level = isAdmin ? 'basic' : currentUser.level
  const modules = CURRICULUM[level]?.modules || []

  function getProgress(email, level) {
    return DB.progress?.[email]?.[level] || []
  }

  function isTopicComplete(email, level, modIdx, topicIdx) {
    return getProgress(email, level).includes(modIdx + '_' + topicIdx)
  }

  async function toggleTopic(email, level, modIdx, topicIdx) {
    const newDB = { ...DB }
    if (!newDB.progress[email]) newDB.progress[email] = {}
    if (!newDB.progress[email][level]) newDB.progress[email][level] = []
    const key = modIdx + '_' + topicIdx
    const idx = newDB.progress[email][level].indexOf(key)
    if (idx === -1) newDB.progress[email][level].push(key)
    else newDB.progress[email][level].splice(idx, 1)
    await saveDB(newDB)
  }

  const targetEmail = currentUser.email
  const done = getProgress(targetEmail, level).length
  const total = modules.reduce((s, m) => s + m.topics.length, 0)
  const pct = total ? Math.round(done / total * 100) : 0
  const levelColor = level === 'basic' ? '#2ECC71' : level === 'intermediate' ? '#1E88E5' : '#8E44AD'
  const levelLabel = level === 'basic' ? 'Beginner' : level === 'intermediate' ? 'Intermediate' : 'Expert'

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>My Course</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>Curriculum & learning topics</div>

        {/* Header Card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20,
          padding: '18px 22px', background: 'var(--card)',
          border: '1px solid var(--border)', borderRadius: 14,
          borderLeft: `4px solid ${levelColor}`, boxShadow: 'var(--shadow)'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 3 }}>
              Master Research Course – {levelLabel}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{modules.length} modules · {total} topics</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'Cabinet Grotesk' }}>{pct}%</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>{done}/{total} done</div>
          </div>
        </div>

        {/* Info Banner */}
        <div style={{
          padding: '9px 14px', borderRadius: 8, marginBottom: 16, fontSize: 12, fontWeight: 700,
          background: isAdmin ? 'rgba(245,124,0,.07)' : 'rgba(30,136,229,.07)',
          border: `1px solid ${isAdmin ? 'rgba(245,124,0,.2)' : 'rgba(30,136,229,.2)'}`,
          color: isAdmin ? '#F57C00' : '#1E88E5'
        }}>
          {isAdmin ? 'Admin Mode – Click checkboxes to mark topics as learned' : 'View Only – Your trainer marks topics as completed'}
        </div>

        {/* Modules */}
        {modules.map((mod, modIdx) => {
          const modDone = mod.topics.filter((_, ti) => isTopicComplete(targetEmail, level, modIdx, ti)).length
          const modPct = mod.topics.length ? Math.round(modDone / mod.topics.length * 100) : 0

          return (
            <ModuleCard
              key={modIdx}
              mod={mod}
              modIdx={modIdx}
              modDone={modDone}
              modPct={modPct}
              levelColor={levelColor}
              isAdmin={isAdmin}
              targetEmail={targetEmail}
              level={level}
              isTopicComplete={isTopicComplete}
              toggleTopic={toggleTopic}
              defaultOpen={modIdx === 0}
            />
          )
        })}
      </div>
    </AppLayout>
  )
}

function ModuleCard({ mod, modIdx, modDone, modPct, levelColor, isAdmin, targetEmail, level, isTopicComplete, toggleTopic, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 12, marginBottom: 10, overflow: 'hidden',
      boxShadow: 'var(--shadow)'
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', cursor: 'pointer', userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'var(--bg)',
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--text2)', flexShrink: 0
          }}>{String(modIdx + 1).padStart(2, '0')}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{mod.title}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{modDone}/{mod.topics.length} topics · {modPct}%</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 70 }}>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${modPct}%`, background: levelColor, borderRadius: 3 }} />
            </div>
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 700, transition: '.3s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</div>
        </div>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {mod.topics.map((topic, topicIdx) => {
            const isChecked = isTopicComplete(targetEmail, level, modIdx, topicIdx)
            return (
              <div key={topicIdx} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 18px', borderBottom: '1px solid var(--border)',
                transition: '.15s', cursor: isAdmin ? 'pointer' : 'default'
              }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', fontFamily: 'Fira Code', width: 24, flexShrink: 0 }}>
                  {String(topicIdx + 1).padStart(2, '0')}
                </div>
                <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: isChecked ? '#27AE60' : 'var(--text2)' }}>
                  {topic}
                </div>
                <div
                  onClick={() => isAdmin && toggleTopic(targetEmail, level, modIdx, topicIdx)}
                  style={{
                    width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                    border: isChecked ? '1.5px solid #2ECC71' : '1.5px solid var(--border2)',
                    borderStyle: isAdmin ? 'solid' : 'dashed',
                    background: isChecked ? 'rgba(46,204,113,.12)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#27AE60',
                    cursor: isAdmin ? 'pointer' : 'default'
                  }}
                >
                  {isChecked ? '✓' : ''}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'