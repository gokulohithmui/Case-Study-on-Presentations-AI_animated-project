export default function Hero({ onStart }) {
  const features = [
    { icon: '🧠', title: 'Multi-Agent AI', desc: '5 specialized agents collaborating on your clinical case' },
    { icon: '🔍', title: 'RAG Analysis', desc: 'Searches 52+ medical documents using semantic embeddings' },
    { icon: '🕸️', title: 'Knowledge Graph', desc: 'Traverses disease-symptom relationships for explainability' },
    { icon: '📊', title: 'Confidence Scoring', desc: 'Adaptive loop runs until diagnosis confidence ≥ 65%' },
  ]

  return (
    <section className="hero">
      <div className="hero-eyebrow">
        <span className="hero-eyebrow-dot" />
        Powered by LangGraph + LiteLLM
      </div>

      <h1 className="hero-title">
        Clinical AI<br />
        <span className="hero-title-gradient">Decision Support</span>
      </h1>

      <p className="hero-description">
        A multi-agent system that analyzes patient cases using Retrieval-Augmented Generation,
        Knowledge Graph traversal, and adaptive confidence scoring to assist clinical decisions.
      </p>

      <div className="hero-cta">
        <button className="btn-primary" onClick={onStart}>
          ⚡ Analyze Patient Case
        </button>
        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
        >
          📖 View API Docs
        </a>
      </div>

      <div className="hero-features">
        {features.map((f) => (
          <div key={f.title} className="hero-feature-card">
            <span className="hero-feature-icon">{f.icon}</span>
            <div className="hero-feature-title">{f.title}</div>
            <div className="hero-feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
