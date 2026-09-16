import { motion } from 'framer-motion'
import { Zap, Brain, Network, BarChart3, ArrowRight, BookOpen } from 'lucide-react'

const container = { animate: { transition: { staggerChildren: .1 } } }
const item = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: .55, ease: [.4,0,.2,1] } }
}

const features = [
  { icon: Brain,    color: '#06b6d4', bg: 'rgba(6,182,212,.1)',   title: 'Multi-Agent AI',      desc: '5 specialized agents collaborate: Text Clarifier → RAG → KG → Web Scanner → Fusion' },
  { icon: Network,  color: '#8b5cf6', bg: 'rgba(139,92,246,.1)', title: 'Knowledge Graph',      desc: 'Neo4j-backed disease-symptom graph traversal for explainable diagnostic paths' },
  { icon: Zap,      color: '#10b981', bg: 'rgba(16,185,129,.1)',  title: 'RAG Pipeline',         desc: 'ChromaDB vector search across 52+ PubMed abstracts using MiniLM embeddings' },
  { icon: BarChart3,color: '#f59e0b', bg: 'rgba(245,158,11,.1)',  title: 'Confidence Scoring',   desc: 'Adaptive optimizer loops until diagnosis confidence ≥ 65% (max 3 iterations)' },
]

export default function HeroPage({ onStart }) {
  return (
    <section style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
      <motion.div variants={container} initial="initial" animate="animate" style={{ maxWidth: 900, width: '100%' }}>

        {/* Eyebrow */}
        <motion.div variants={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 50, background: 'rgba(6,182,212,.08)', border: '1px solid rgba(6,182,212,.2)', marginBottom: 32 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 8px #06b6d4', display: 'inline-block', animation: 'pulseGlow 2s infinite' }} />
          <span style={{ color: '#06b6d4', fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>LangGraph · LiteLLM · ChromaDB · FastAPI</span>
        </motion.div>

        {/* Title */}
        <motion.h1 variants={item} style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(44px,8vw,92px)', fontWeight: 800, lineHeight: 1.04, letterSpacing: '-3px', marginBottom: 24 }}>
          Clinical AI<br />
          <span style={{ background: 'linear-gradient(135deg,#06b6d4 0%,#8b5cf6 50%,#06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200%', animation: 'gradFlow 4s ease infinite' }}>
            Decision Support
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={item} style={{ fontSize: 'clamp(15px,2vw,19px)', color: '#94a3b8', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 48px' }}>
          A multi-agent pipeline that analyzes patient cases using RAG, Knowledge Graph traversal,
          and adaptive confidence scoring — all running locally, zero credentials needed.
        </motion.p>

        {/* CTA */}
        <motion.div variants={item} style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 }}>
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(6,182,212,.55)' }}
            whileTap={{ scale: .97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 32px', borderRadius: 50,
              background: 'linear-gradient(135deg,#06b6d4,#0891b2)',
              color: '#030712', fontWeight: 700, fontSize: 15,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(6,182,212,.4)'
            }}
          >
            <Zap size={17} fill="#030712" /> Analyze Patient Case <ArrowRight size={16} />
          </motion.button>
          <motion.a
            href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: .97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 50,
              background: 'transparent', border: '1px solid rgba(148,163,184,.2)',
              color: '#94a3b8', fontWeight: 500, fontSize: 14,
              cursor: 'pointer', textDecoration: 'none'
            }}
          >
            <BookOpen size={16} /> API Docs
          </motion.a>
        </motion.div>

        {/* Feature cards */}
        <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
          {features.map(({ icon: Icon, color, bg, title, desc }) => (
            <motion.div
              key={title}
              whileHover={{ y: -6, borderColor: color + '60', boxShadow: `0 20px 40px rgba(0,0,0,.4), 0 0 0 1px ${color}30` }}
              style={{ padding: '24px 20px', borderRadius: 16, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(148,163,184,.08)', textAlign: 'left', transition: 'all .25s ease', cursor: 'default' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={22} color={color} strokeWidth={2} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>{desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes pulseGlow { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(.8)} }
        @keyframes gradFlow { 0%{background-position:0%} 50%{background-position:100%} 100%{background-position:0%} }
      `}</style>
    </section>
  )
}
