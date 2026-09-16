import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import HeroPage from './pages/HeroPage'
import AnalyzePage from './pages/AnalyzePage'
import ResultsPage from './pages/ResultsPage'
import ParticleField from './components/ParticleField'
import './index.css'

const pageVariants = {
  initial: { opacity: 0, y: 30, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -20, filter: 'blur(4px)', transition: { duration: 0.3 } }
}

export default function App() {
  const [page, setPage]     = useState('hero')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyze = async (text) => {
    setLoading(true)
    setPage('analyze')
    try {
      const res = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'demo-key-123'   // matches CDSS_API_KEY default in backend
        },
        body: JSON.stringify({ patient_text: text })
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ error: 'Backend unreachable. Start the server with:\n.\\venv\\Scripts\\python.exe -m uvicorn backend.api:app --reload --port 8000' })
    } finally {
      setLoading(false)
      setPage('results')
    }
  }

  const reset = () => { setPage('hero'); setResult(null) }
  const goAnalyze = () => setPage('analyze')

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <ParticleField />
      <Navbar onHome={reset} />
      <main style={{ paddingTop: 68, position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {page === 'hero' && (
            <motion.div key="hero" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <HeroPage onStart={goAnalyze} />
            </motion.div>
          )}
          {page === 'analyze' && (
            <motion.div key="analyze" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <AnalyzePage onAnalyze={analyze} loading={loading} />
            </motion.div>
          )}
          {page === 'results' && (
            <motion.div key="results" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <ResultsPage result={result} onReset={reset} onNewAnalysis={goAnalyze} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
