# ⚕️ CDSS — Confidence-Aware Clinical Decision Support System

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![LangGraph](https://img.shields.io/badge/LangGraph-1.2-FF6B35?style=flat)](https://langchain-ai.github.io/langgraph/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

> A **multi-agent AI pipeline** that analyzes patient cases using Retrieval-Augmented Generation (RAG), Knowledge Graph traversal, and adaptive confidence scoring — running **fully locally with zero credentials or data-access approvals required**.

> ⚠️ **Disclaimer**: This is a software engineering prototype built entirely on synthetic and public benchmark data for demonstration purposes. It has no regulatory clearance and is **not for clinical use**.

---

## 📸 What It Does

1. You type a patient case description (symptoms, history, age, etc.)
2. **5 AI agents** collaborate in a LangGraph pipeline:
   - 📝 **Text Clarifier** — Extracts symptoms & conditions from free text
   - 🔍 **RAG Analyzer** — Searches 52+ PubMed abstracts via ChromaDB vector similarity
   - 🕸️ **KG Query Agent** — Traverses a disease–symptom knowledge graph for explainability
   - 🌐 **Web Scanner** — Cross-checks evidence-based clinical guidelines
   - ⚗️ **Data Fusion** — Merges all evidence into a diagnosis with a confidence score
3. If confidence < 65%, the **Adaptive Optimizer** reformulates and re-runs (up to 3 iterations)
4. You see the final diagnosis, confidence score, and full agent execution trace in a beautiful UI

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React 19 Frontend                    │
│          (Vite · Framer Motion · Recharts)              │
└───────────────────┬─────────────────────────────────────┘
                    │ POST /analyze  (X-API-Key: demo-key-123)
┌───────────────────▼─────────────────────────────────────┐
│              FastAPI Backend  :8000                     │
│         (CORS · API Key Auth · Metrics)                 │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│            LangGraph Agent Pipeline                     │
│                                                         │
│  📝 Text Clarifier                                      │
│       └─► 🔍 RAG Analyzer ──► ChromaDB (local)         │
│                └─► 🕸️  KG Agent ──► Neo4j / fallback   │
│                        └─► 🌐 Web Scanner               │
│                                └─► ⚗️ Data Fusion       │
│                                        └─► 📊 Score     │
│                                              │           │
│                                    ┌─────────┴─────────┐│
│                                  ≥65%               <65%││
│                                    │                  │  ││
│                                  Done          🔄 Optimizer│
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite 8, Framer Motion, Recharts, Lucide | Animated UI with page transitions |
| **Backend** | FastAPI, Uvicorn, Pydantic | REST API with auth & metrics |
| **Orchestration** | LangGraph 1.2, LangChain | Multi-agent state machine |
| **LLM Routing** | LiteLLM 1.100 | Provider-agnostic routing with retry/fallback |
| **Vector DB** | ChromaDB (local file) | Semantic search over medical corpus |
| **Embeddings** | `all-MiniLM-L6-v2` (sentence-transformers) | Lightweight, runs on CPU |
| **Knowledge Graph** | Neo4j Community (Docker) / built-in fallback | Disease–symptom relationships |
| **LLM Providers** | Groq (Llama 3.3-70B) + Google Gemini 2.5 Flash | Real inference (optional) |
| **Testing** | pytest | Unit + integration tests |

---

## 🚀 Quick Start (Run in Under 5 Minutes)

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.11+ | [python.org](https://python.org) |
| Node.js + npm | 18+ | [nodejs.org](https://nodejs.org) |
| Git | Any | [git-scm.com](https://git-scm.com) |

> **Docker is optional** — only needed for the full Neo4j Knowledge Graph. The app runs perfectly without it using a built-in structured fallback.

---

### Step 1 — Clone the Repo

```bash
git clone https://github.com/gokulohithmui/Case-Study-on-Presentations-AI_animated-project.git
cd "Case-Study-on-Presentations-AI_animated-project"
```

---

### Step 2 — Python Environment Setup

```powershell
# Windows
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

```bash
# Mac / Linux
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

### Step 3 — Configure Environment

```powershell
copy .env.example .env        # Windows
# cp .env.example .env        # Mac/Linux
```

Open `.env` — the defaults work out of the box:

```env
# Neo4j (optional — only needed if you run Docker)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# LLM API Keys (optional — leave blank to use dry-run mode)
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# NCBI Entrez (optional — for higher PubMed rate limits)
ENTREZ_EMAIL=your_email@example.com

# Set to true = no API keys needed (simulated responses)
ROUTER_DRY_RUN=true
```

> **`ROUTER_DRY_RUN=true`** — The app runs fully offline. All LLM responses are simulated. No API keys required.

---

### Step 4 — Build the Data Pipeline *(one-time setup)*

```powershell
# Download PubMed abstracts + symptom-disease data (saves to data/corpus.json)
.\venv\Scripts\python.exe ingestion/download_corpus.py

# Embed corpus into ChromaDB vector store (saves to data/chroma_db/)
.\venv\Scripts\python.exe ingestion/embed_chroma.py
```

This takes ~1–2 minutes on first run. Subsequent runs are instant (data is cached locally).

---

### Step 5 — Start the App *(open 2 terminals)*

**Terminal 1 — Backend:**

```powershell
.\venv\Scripts\python.exe -m uvicorn backend.api:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

**Terminal 2 — Frontend:**

```powershell
cd frontend
npm install        # first time only
npm run dev
```

You should see:
```
VITE v8.3.0  ready in 654 ms
➜  Local:   http://localhost:5173/
```

---

### Step 6 — Open the App 🎉

| URL | Description |
|-----|-------------|
| **http://localhost:5173** | 🎨 React Frontend (main app) |
| http://127.0.0.1:8000/docs | 📖 Interactive API docs (Swagger UI) |
| http://127.0.0.1:8000/health | ❤️ Backend health check |
| http://127.0.0.1:8000/metrics | 📊 Request metrics (requires API key) |

---

## 🧪 Sample Patient Cases

Try these in the app:

| Condition | Case Description |
|-----------|-----------------|
| **Migraine** | *45M with severe headaches, nausea, photophobia x3 days. HTN history. No fever.* |
| **Hypothyroidism** | *28F with fatigue, weight gain, cold intolerance, dry skin, hair loss x2 months.* |
| **Cardiac Event** | *62M acute chest pain radiating to L arm, diaphoresis, dyspnea. 30-pack-year smoker.* |
| **Lupus** | *35F joint pain, morning stiffness >1hr, butterfly rash, oral ulcers, fatigue.* |

---

## 🔑 API Reference

All endpoints (except `/health`) require the header:
```
X-API-Key: demo-key-123
```
> In production, set `CDSS_API_KEY` in your `.env` to a strong secret.

### `POST /analyze`

Runs the full 5-agent pipeline on a patient case.

**Request:**
```json
{
  "patient_text": "45-year-old male with severe headaches and nausea..."
}
```

**Response:**
```json
{
  "status": "success",
  "latency_s": 0.042,
  "confidence": 0.75,
  "iterations": 1,
  "report": {
    "diagnosis": "Migraine with Aura",
    "confidence": 0.75,
    "report": "Based on the clinical presentation..."
  },
  "trace": { ... }
}
```

### `GET /health`
```json
{ "status": "ok" }
```

### `GET /metrics`  *(requires API key)*
```json
{
  "total_requests": 12,
  "total_errors": 0,
  "average_latency_s": 0.038
}
```

---

## 🧪 Running Tests

```powershell
# Run all tests
.\venv\Scripts\python.exe -m pytest tests/ -v

# Run specific test files
.\venv\Scripts\python.exe -m pytest tests/test_router.py -v
.\venv\Scripts\python.exe -m pytest tests/test_agents.py -v
.\venv\Scripts\python.exe -m pytest tests/test_api.py -v
```

---

## 📊 Evaluation & Ablation Study

```powershell
.\venv\Scripts\python.exe eval/run_eval.py
```

Runs the pipeline against MedQA, PubMedQA, and Synthea synthetic cohort datasets.
Results are saved to `eval/results.md` including agent ablation accuracy drops.

---

## ⚙️ Optional: Real LLM Inference

To use real AI models instead of dry-run mode:

1. Get a **free** Groq API key at [console.groq.com/keys](https://console.groq.com/keys)
2. Get a **free** Gemini API key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
3. Update `.env`:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIxxxxxxxxxxxxxxxxxxxxxxx
ROUTER_DRY_RUN=false
```

The LLM router automatically handles:
- ✅ Provider failover (Groq → Gemini)
- ✅ Exponential backoff with jitter on rate limits
- ✅ Structured JSON logging per agent call

---

## ⚙️ Optional: Neo4j Knowledge Graph (Docker)

```powershell
# Start Neo4j container
docker-compose up -d

# Build the knowledge graph
.\venv\Scripts\python.exe ingestion/build_kg.py
```

Neo4j browser available at: **http://localhost:7474**
Login: `neo4j` / `password`

---

## 📁 Project Structure

```
├── backend/
│   ├── __init__.py
│   ├── api.py           # FastAPI app — /analyze, /health, /metrics endpoints
│   ├── agents.py        # LangGraph pipeline — 5-agent state machine
│   └── router.py        # LiteLLM router — rate-limit aware, with fallback & retry
│
├── ingestion/
│   ├── download_corpus.py    # Fetch PubMed abstracts + HuggingFace datasets
│   ├── embed_chroma.py       # Embed corpus → ChromaDB (all-MiniLM-L6-v2)
│   ├── build_kg.py           # Build Neo4j disease-symptom knowledge graph
│   └── synthea_runner.py     # Generate synthetic patient cases (Synthea)
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            # Root — AnimatePresence page transitions
│       ├── index.css          # Global CSS — dark theme, design tokens
│       ├── components/
│       │   ├── Navbar.jsx     # Fixed top navbar
│       │   └── ParticleField.jsx  # Canvas particle network animation
│       └── pages/
│           ├── HeroPage.jsx      # Landing page with feature cards
│           ├── AnalyzePage.jsx   # Input form + live pipeline visualizer
│           └── ResultsPage.jsx   # Diagnosis card + confidence gauge + agent trace
│
├── tests/
│   ├── test_router.py    # LLM router unit tests (failover, rate limits)
│   ├── test_agents.py    # Agent pipeline unit tests (monkeypatched LLM)
│   └── test_api.py       # FastAPI integration tests
│
├── eval/
│   └── run_eval.py       # Benchmark + ablation evaluation script
│
├── data/                 # Auto-generated — corpus.json, chroma_db/
├── docker-compose.yml    # Neo4j Community Edition setup
├── requirements.txt      # Python dependencies
├── .env.example          # Environment variable template
└── README.md
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.
