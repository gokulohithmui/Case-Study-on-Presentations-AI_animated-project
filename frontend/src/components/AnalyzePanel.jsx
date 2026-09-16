import { useState, useEffect } from 'react'

const PIPELINE_STEPS = [
  { id: 'clarifier', icon: '📝', label: 'Text Clarifier' },
  { id: 'rag',       icon: '🔍', label: 'RAG Analyzer' },
  { id: 'kg',        icon: '🕸️', label: 'KG Query' },
  { id: 'web',       icon: '🌐', label: 'Web Scanner' },
  { id: 'fusion',    icon: '⚗️', label: 'Fusion' },
]

const SAMPLE_CASES = [
  '45M with severe headaches, nausea, photophobia for 3 days. History of hypertension.',
  '28F presenting with fatigue, weight gain, cold intolerance, and dry skin for 2 months.',
  '62M acute chest pain radiating to left arm, diaphoresis, dyspnea. Smoker.',
  '35F with joint pain, morning stiffness, butterfly rash across cheeks.',
]

export default function AnalyzePanel({ onAnalyze, loading }) {
  const [text, setText] = useState('')
  const [activeStep, setActiveStep] = useState(-1)
  const [doneSteps, setDoneSteps] = useState([])

  // Simulate pipeline animation while loading
  useEffect(() => {
    if (!loading) {
      setActiveStep(-1)
      setDoneSteps([])
      return
    }
    let step = 0
    setActiveStep(0)
    const interval = setInterval(() => {
      setDoneSteps(prev => [...prev, step])
      step++
      if (step < PIPELINE_STEPS.length) {
        setActiveStep(step)
      } else {
        setActiveStep(-1)
        clearInterval(interval)
      }
    }, 1200)
    return () => clearInterval(interval)
  }, [loading])

  const handleSubmit = () => {
    if (text.trim()) onAnalyze(text.trim())
  }

  return (
    <section className="analyze-panel">
      <h2 className="panel-title">
        🩺 Analyze Patient Case
      </h2>
      <p className="panel-subtitle">
        Describe the patient's symptoms, history, and presentation below
      </p>

      <div className="input-card">
        <label className="input-label">Patient Case Description</label>
        <textarea
          className="patient-textarea"
          placeholder="e.g. 45-year-old male presenting with severe headaches, nausea, sensitivity to light for 3 days. History of hypertension. No recent fever..."
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="sample-cases">
        <div className="sample-label">Quick Examples</div>
        <div className="sample-pills">
          {SAMPLE_CASES.map((c, i) => (
            <button
              key={i}
              className="sample-pill"
              onClick={() => setText(c)}
              disabled={loading}
            >
              {c.substring(0, 42)}…
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline visualizer */}
      <div className="pipeline-container">
        <div className="pipeline-title">Agent Pipeline</div>
        <div className="pipeline-steps">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div className="pipeline-step">
                <div className={`step-circle ${activeStep === i ? 'active' : ''} ${doneSteps.includes(i) ? 'done' : ''}`}>
                  {doneSteps.includes(i) ? '✓' : step.icon}
                </div>
                <span className={`step-label ${activeStep === i ? 'active' : ''} ${doneSteps.includes(i) ? 'done' : ''}`}>
                  {step.label}
                </span>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div className={`step-connector ${doneSteps.includes(i) ? 'done' : ''}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        style={{ minWidth: 200 }}
      >
        {loading ? (
          <>
            <div className="spinner" />
            Running Pipeline…
          </>
        ) : (
          <>⚡ Run CDSS Pipeline</>
        )}
      </button>
    </section>
  )
}
