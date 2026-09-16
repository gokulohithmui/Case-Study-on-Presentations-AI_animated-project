import { Activity } from 'lucide-react'
import { motion } from 'framer-motion'

const navStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
  height: 68,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 32px',
  background: 'rgba(3,7,18,.8)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(148,163,184,.08)',
}

export default function Navbar({ onHome }) {
  return (
    <nav style={navStyle}>
      <motion.button
        onClick={onHome}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: .97 }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Activity size={18} color="#fff" strokeWidth={2.5} />
        </div>
        <span style={{
          fontFamily: "'Space Grotesk',sans-serif",
          fontWeight: 700, fontSize: 18, color: '#f1f5f9', letterSpacing: '-.5px'
        }}>
          CDSS <span style={{ background: 'linear-gradient(90deg,#06b6d4,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
        </span>
      </motion.button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank" rel="noreferrer"
          style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
          onMouseEnter={e => e.target.style.color = '#06b6d4'}
          onMouseLeave={e => e.target.style.color = '#94a3b8'}
        >
          API Docs ↗
        </a>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '1px',
          padding: '4px 10px', borderRadius: 20,
          background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.35)',
          color: '#f59e0b'
        }}>
          DRY RUN
        </span>
      </div>
    </nav>
  )
}
