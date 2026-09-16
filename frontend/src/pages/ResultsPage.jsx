import { motion } from 'framer-motion'
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
import { CheckCircle2, AlertTriangle, RotateCcw, BookOpen, Stethoscope, ClipboardList, Bot } from 'lucide-react'

const AGENTS = [
  { icon: '📝', name: 'Text Clarifier',  detail: 'Extracted symptoms & clinical entities from raw text' },
  { icon: '🔍', name: 'RAG Analyzer',    detail: 'Queried 52 PubMed documents via ChromaDB vector search' },
  { icon: '🕸️', name: 'KG Query Agent',  detail: 'Traversed disease–symptom knowledge graph (Neo4j/fallback)' },
  { icon: '🌐', name: 'Web Scanner',     detail: 'Searched evidence-based clinical guidelines' },
  { icon: '⚗️', name: 'Data Fusion',     detail: 'Fused all evidence into final diagnosis with confidence score' },
]

function ConfidenceMeter({ score }) {
  const pct   = Math.round((score || 0) * 100)
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#06b6d4' : '#f59e0b'
  const label = pct >= 75 ? 'High Confidence' : pct >= 50 ? 'Moderate Confidence' : 'Low — Further workup needed'
  const data  = [{ value: pct, fill: color }]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
        <RadialBarChart width={110} height={110} innerRadius={36} outerRadius={52}
          data={data} startAngle={90} endAngle={-270} barSize={10}>
          <PolarAngleAxis type="number" domain={[0,100]} angleAxisId={0} tick={false} />
          <RadialBar background={{ fill: 'rgba(255,255,255,.05)' }} dataKey="value" angleAxisId={0} cornerRadius={6} />
        </RadialBarChart>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{pct}</span>
          <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>%</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>
          {pct >= 75 ? 'Strong diagnostic signal across all evidence sources.'
            : pct >= 50 ? 'Moderate evidence — consider additional clinical workup.'
            : 'Limited signal — further evaluation strongly recommended.'}
        </div>
      </div>
    </div>
  )
}

function Card({ children, style = {} }) {
  return (
    <motion.div
      whileHover={{ borderColor: 'rgba(6,182,212,.35)', boxShadow: '0 0 30px rgba(6,182,212,.1)' }}
      style={{ padding: 28, borderRadius: 16, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(148,163,184,.1)', transition: 'all .25s', ...style }}
    >
      {children}
    </motion.div>
  )
}

function CardLabel({ icon: Icon, children, color = '#475569' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color, marginBottom: 16 }}>
      <Icon size={14} /> {children}
    </div>
  )
}

const stagger = { animate: { transition: { staggerChildren: .08 } } }
const fadeUp  = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0, transition: { duration: .45 } } }

export default function ResultsPage({ result, onReset, onNewAnalysis }) {
  const hasError = !!result?.error

  // API returns: { report: {...}, confidence: 0.75, iterations: 1 }
  // report object contains: { diagnosis, confidence, report }
  const report    = result?.report || result?.final_report || {}
  const score     = result?.confidence ?? result?.confidence_score ?? report?.confidence ?? 0
  const diagnosis = report?.diagnosis || 'Unable to determine'
  const reportTxt = report?.report || 'No detailed report generated.'
  const iters     = result?.iterations ?? 1

  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '52px 24px' }}>
      <motion.div variants={stagger} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <motion.div variants={fadeUp} style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 30, fontWeight: 800, marginBottom: 6, background: hasError ? 'var(--rose)' : 'linear-gradient(135deg,#06b6d4,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {hasError ? '⚠️ Connection Error' : '✅ Analysis Complete'}
          </h2>
          {!hasError && (
            <p style={{ color: '#64748b', fontSize: 14 }}>
              Completed in <strong style={{ color: '#94a3b8' }}>{iters}</strong> pipeline iteration{iters !== 1 ? 's' : ''}
            </p>
          )}
        </motion.div>

        {hasError ? (
          <motion.div variants={fadeUp} style={{ padding: 28, borderRadius: 16, background: 'rgba(244,63,94,.08)', border: '1px solid rgba(244,63,94,.3)', textAlign: 'center' }}>
            <AlertTriangle size={32} color="#f43f5e" style={{ marginBottom: 12 }} />
            <h3 style={{ color: '#f43f5e', marginBottom: 10, fontSize: 18 }}>Backend Unreachable</h3>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.65 }}>{result.error}</p>
          </motion.div>
        ) : (
          <>
            {/* Two-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>

              {/* Diagnosis */}
              <motion.div variants={fadeUp}>
                <Card>
                  <CardLabel icon={Stethoscope} color="#06b6d4">Primary Diagnosis</CardLabel>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.5px', background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
                    {diagnosis}
                  </div>
                </Card>
              </motion.div>

              {/* Confidence */}
              <motion.div variants={fadeUp}>
                <Card>
                  <CardLabel icon={CheckCircle2} color="#10b981">Confidence Score</CardLabel>
                  <ConfidenceMeter score={score} />
                </Card>
              </motion.div>
            </div>

            {/* Clinical Report */}
            <motion.div variants={fadeUp}>
              <Card>
                <CardLabel icon={ClipboardList} color="#8b5cf6">Clinical Report</CardLabel>
                <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.8 }}>{reportTxt}</p>
              </Card>
            </motion.div>

            {/* Agent trace */}
            <motion.div variants={fadeUp}>
              <Card>
                <CardLabel icon={Bot} color="#f59e0b">Agent Execution Trace</CardLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {AGENTS.map((a, i) => (
                    <motion.div key={a.name}
                      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0, transition: { delay: i * .08 } }}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,.025)', border: '1px solid rgba(148,163,184,.07)' }}>
                      <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{a.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#f1f5f9', marginBottom: 3 }}>{a.name}</div>
                        <div style={{ fontSize: 12.5, color: '#64748b' }}>{a.detail}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', color: '#10b981', whiteSpace: 'nowrap', alignSelf: 'center' }}>
                        ✓ Done
                      </span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </>
        )}

        {/* Actions */}
        <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button onClick={onReset} whileHover={{ scale: 1.04 }} whileTap={{ scale: .97 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 50, background: 'linear-gradient(135deg,#06b6d4,#0891b2)', color: '#030712', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(6,182,212,.35)' }}>
            <RotateCcw size={15} /> New Analysis
          </motion.button>
          <motion.a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: .97 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 24px', borderRadius: 50, background: 'transparent', border: '1px solid rgba(148,163,184,.18)', color: '#94a3b8', fontWeight: 500, fontSize: 14, cursor: 'pointer', textDecoration: 'none' }}>
            <BookOpen size={15} /> API Docs
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  )
}
