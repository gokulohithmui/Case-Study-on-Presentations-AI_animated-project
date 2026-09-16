import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Search, Share2, Globe, FlaskConical, CheckCircle, Loader2, Sparkles } from 'lucide-react'

const STEPS = [
  { id: 0, icon: FileText,    label: 'Text Clarifier',  color: '#06b6d4' },
  { id: 1, icon: Search,      label: 'RAG Analyzer',    color: '#8b5cf6' },
  { id: 2, icon: Share2,      label: 'KG Query',        color: '#10b981' },
  { id: 3, icon: Globe,       label: 'Web Scanner',     color: '#f59e0b' },
  { id: 4, icon: FlaskConical,label: 'Data Fusion',     color: '#f43f5e' },
]

const SAMPLES = [
  { label: 'Neurological', text: '45M with severe headaches, nausea, photophobia x3 days. HTN history. No fever.' },
  { label: 'Endocrine',    text: '28F with fatigue, weight gain, cold intolerance, dry skin, hair loss x2 months.' },
  { label: 'Cardiac',      text: '62M acute chest pain radiating to L arm, diaphoresis, dyspnea. 30-pack-year smoker.' },
  { label: 'Autoimmune',   text: '35F joint pain, morning stiffness >1hr, butterfly rash, oral ulcers, fatigue.' },
]

export default function AnalyzePage({ onAnalyze, loading }) {
  const [text, setText] = useState('')
  const [activeStep, setActiveStep] = useState(-1)
  const [doneSteps, setDoneSteps] = useState([])

  useEffect(() => {
    if (!loading) { setActiveStep(-1); setDoneSteps([]); return }
    let i = 0
    setActiveStep(0)
    const iv = setInterval(() => {
      setDoneSteps(p => [...p, i])
      i++
      if (i < STEPS.length) setActiveStep(i)
      else { setActiveStep(-1); clearInterval(iv) }
    }, 1100)
    return () => clearInterval(iv)
  }, [loading])

  return (
    <section style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 34, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>
          🩺 Patient Case Analysis
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: .1 } }}
          style={{ color: '#64748b', fontSize: 15 }}>
          Describe the patient's symptoms, history, and presentation
        </motion.p>
      </div>

      {/* Input card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: .15 } }}
        style={{ padding: 28, borderRadius: 16, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(148,163,184,.1)' }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#06b6d4', marginBottom: 12 }}>
          Patient Case Description
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={loading}
          placeholder="e.g. 45-year-old male presenting with severe headaches, nausea, sensitivity to light for 3 days. History of hypertension. No recent fever or trauma..."
          style={{
            width: '100%', minHeight: 160, padding: 16,
            background: 'rgba(255,255,255,.025)', border: '1px solid rgba(148,163,184,.1)',
            borderRadius: 10, color: '#f1f5f9', fontSize: 15,
            fontFamily: 'Inter,sans-serif', lineHeight: 1.65,
            resize: 'vertical', outline: 'none', transition: 'border-color .2s',
          }}
          onFocus={e => e.target.style.borderColor = '#06b6d4'}
          onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,.1)'}
        />
      </motion.div>

      {/* Quick samples */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: .25 } }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
          Quick Examples
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SAMPLES.map(s => (
            <motion.button key={s.label}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: .97 }}
              onClick={() => setText(s.text)}
              disabled={loading}
              style={{
                padding: '7px 14px', borderRadius: 50, fontSize: 13, fontWeight: 500,
                background: 'rgba(6,182,212,.07)', border: '1px solid rgba(6,182,212,.2)',
                color: '#06b6d4', cursor: 'pointer', transition: 'all .2s'
              }}
            >
              {s.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Pipeline visualizer */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: .3 } }}
        style={{ padding: '24px 28px', borderRadius: 16, background: 'rgba(255,255,255,.025)', border: '1px solid rgba(148,163,184,.08)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#475569', marginBottom: 20 }}>
          Agent Pipeline
        </div>
        <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', gap: 0 }}>
          {STEPS.map((step, idx) => {
            const Icon = step.icon
            const isDone   = doneSteps.includes(idx)
            const isActive = activeStep === idx
            return (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, minWidth: 80 }}>
                  <motion.div
                    animate={isActive ? { boxShadow: [`0 0 0px ${step.color}00`, `0 0 20px ${step.color}99`, `0 0 0px ${step.color}00`] } : {}}
                    transition={isActive ? { duration: 1.2, repeat: Infinity } : {}}
                    style={{
                      width: 48, height: 48, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDone ? step.color + '20' : isActive ? step.color + '15' : 'rgba(255,255,255,.04)',
                      border: `2px solid ${isDone ? step.color : isActive ? step.color : 'rgba(148,163,184,.12)'}`,
                      transition: 'all .4s ease', position: 'relative', zIndex: 1
                    }}
                  >
                    {isDone
                      ? <CheckCircle size={20} color={step.color} strokeWidth={2.5} />
                      : isActive
                        ? <Loader2 size={20} color={step.color} style={{ animation: 'spin .8s linear infinite' }} />
                        : <Icon size={18} color={isDone || isActive ? step.color : '#475569'} strokeWidth={1.8} />
                    }
                  </motion.div>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: isDone ? step.color : isActive ? step.color : '#475569', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div style={{ height: 2, flex: '0 0 28px', marginTop: -22,
                    background: doneSteps.includes(idx) ? `linear-gradient(90deg,${step.color},${STEPS[idx+1].color})` : 'rgba(148,163,184,.1)',
                    transition: 'background .5s ease' }} />
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Submit */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: .35 } }} style={{ display: 'flex', justifyContent: 'center' }}>
        <motion.button
          onClick={() => text.trim() && onAnalyze(text.trim())}
          disabled={loading || !text.trim()}
          whileHover={!loading && text.trim() ? { scale: 1.04, boxShadow: '0 8px 32px rgba(6,182,212,.5)' } : {}}
          whileTap={!loading && text.trim() ? { scale: .97 } : {}}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '15px 40px', borderRadius: 50, minWidth: 220,
            background: loading || !text.trim() ? 'rgba(6,182,212,.3)' : 'linear-gradient(135deg,#06b6d4,#0891b2)',
            color: '#030712', fontWeight: 700, fontSize: 15,
            border: 'none', cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 20px rgba(6,182,212,.35)', transition: 'all .25s'
          }}
        >
          {loading
            ? <><Loader2 size={18} style={{ animation: 'spin .8s linear infinite' }} /> Running Pipeline…</>
            : <><Sparkles size={17} /> Run CDSS Pipeline</>
          }
        </motion.button>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </section>
  )
}
