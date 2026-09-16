import { useEffect, useRef } from 'react'

const AGENT_STEPS = [
  { icon: '📝', name: 'Text Clarifier', detail: 'Extracted symptoms & conditions from raw text' },
  { icon: '🔍', name: 'RAG Analyzer',   detail: 'Queried ChromaDB vector store for similar cases' },
  { icon: '🕸️', name: 'KG Query Agent', detail: 'Traversed disease–symptom knowledge graph' },
  { icon: '🌐', name: 'Web Scanner',    detail: 'Searched evidence-based medical guidelines' },
  { icon: '⚗️', name: 'Data Fusion',    detail: 'Fused all evidence into final diagnosis' },
]

function ConfidenceGauge({ score }) {
  const pct = Math.round((score || 0) * 100)
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#00d4ff' : '#f59e0b'
  const levelText = pct >= 75 ? 'High Confidence' : pct >= 50 ? 'Moderate Confidence' : 'Low Confidence'
  const levelDesc = pct >= 75
    ? 'Strong diagnostic signal detected across multiple evidence sources.'
    : pct >= 50
    ? 'Moderate evidence — consider additional workup.'
    : 'Limited evidence — further evaluation strongly recommended.'

  return (
    <div className="confidence-wrapper">
      <div className="gauge-ring">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle className="gauge-bg" cx="45" cy="45" r={radius} />
          <circle
            className="gauge-fill"
            cx="45" cy="45" r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="gauge-text" style={{ color }}>{pct}%</div>
      </div>
      <div className="confidence-info">
        <div className="confidence-level" style={{ color }}>{levelText}</div>
        <div className="confidence-desc">{levelDesc}</div>
      </div>
    </div>
  )
}

export default function ResultsPanel({ result, onReset }) {
  const report = result?.final_report || {}
  const confidence = result?.confidence_score ?? report?.confidence ?? 0
  const diagnosis = report?.diagnosis || 'No diagnosis available'
  const reportText = report?.report || 'No detailed report generated.'
  const iterations = result?.iterations ?? 1
  const hasError = !!result?.error

  return (
    <section className="results-panel">
      <div className="results-header">
        <div className="results-title">
          {hasError ? '⚠️ Connection Error' : '✅ Analysis Complete'}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          {hasError ? 'Could not reach the backend server' : `Completed in ${iterations} pipeline iteration${iterations !== 1 ? 's' : ''}`}
        </p>
      </div>

      {hasError ? (
        <div className="error-card" style={{ width: '100%' }}>
          <h3>⚠️ Backend Unreachable</h3>
          <p>{result.error}</p>
          <div style={{ marginTop: 16 }}>
            <code style={{ fontSize: 13, color: 'var(--accent-cyan)', background: 'rgba(0,212,255,0.08)', padding: '8px 16px', borderRadius: 8, display: 'inline-block' }}>
              .\venv\Scripts\python.exe -m uvicorn backend.api:app --reload --port 8000
            </code>
          </div>
        </div>
      ) : (
        <div className="results-grid">
          {/* Diagnosis */}
          <div className="result-card">
            <div className="result-card-label">🎯 Primary Diagnosis</div>
            <div className="diagnosis-name">{diagnosis}</div>
          </div>

          {/* Confidence */}
          <div className="result-card">
            <div className="result-card-label">📊 Confidence Score</div>
            <ConfidenceGauge score={confidence} />
          </div>

          {/* Report */}
          <div className="result-card result-card-full">
            <div className="result-card-label">📋 Clinical Report</div>
            <p className="report-text">{reportText}</p>
          </div>

          {/* Agent Trace */}
          <div className="result-card result-card-full">
            <div className="result-card-label">🤖 Agent Execution Trace</div>
            <div className="agent-steps">
              {AGENT_STEPS.map((step) => (
                <div key={step.name} className="agent-step-row">
                  <span className="agent-step-icon">{step.icon}</span>
                  <div className="agent-step-info">
                    <div className="agent-step-name">{step.name}</div>
                    <div className="agent-step-detail">{step.detail}</div>
                  </div>
                  <span className="agent-step-badge">✓ Done</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn-primary" onClick={onReset}>
          🔄 New Analysis
        </button>
        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
        >
          📖 API Docs
        </a>
      </div>
    </section>
  )
}
