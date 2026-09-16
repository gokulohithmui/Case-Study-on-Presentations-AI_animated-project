# ⚕️ CDSS — Confidence-Aware Clinical Decision Support System

A **multi-agent AI pipeline** that analyzes patient cases using Retrieval-Augmented Generation (RAG), Knowledge Graph traversal, and adaptive confidence scoring — running fully locally with **zero credentials or data-access approvals required**.

> ⚠️ **Disclaimer**: This is a software engineering prototype built on synthetic and public benchmark data. It has no regulatory clearance and is **not for clinical use**.

---

## 🏗️ Architecture

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite + Framer Motion + Recharts |
| **Backend API** | FastAPI + Uvicorn |
| **Agent Orchestration** | LangGraph |
| **LLM Routing** | LiteLLM (dry-run mode, no keys needed) |
| **Vector Database** | ChromaDB (local file-based) |
| **Embeddings** | `all-MiniLM-L6-v2` via sentence-transformers |
| **Knowledge Graph** | Neo4j (optional via Docker) / built-in fallback |
| **Web Search** | DuckDuckGo + NCBI Entrez E-utilities |

### Agent Pipeline

```
Patient Text
    │
    ▼
📝 Text Clarifier  →  🔍 RAG Analyzer  →  🕸️ KG Query  →  🌐 Web Scanner  →  ⚗️ Data Fusion
                                                                                      │
                                                                                      ▼
                                                                           📊 Confidence Score
                                                                                      │
                                                                         ┌────────────┴────────────┐
                                                                     ≥ 65%                      < 65%
                                                                         │                         │
                                                                    ✅ Report              🔄 Optimizer (retry)
```

---

## 🚀 How to Run

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and **npm**
- **Git**

> Docker is **optional** (only needed for Neo4j KG — the app runs fine without it using the built-in fallback).

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/gokulohithmui/Case-Study-on-Presentations-AI_animated-project.git
cd "Case-Study-on-Presentations-AI_animated-project"
```

---

### Step 2 — Backend Setup

```powershell
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # Mac/Linux

# Install Python dependencies
pip install -r requirements.txt
```

---

### Step 3 — Configure Environment

```powershell
copy .env.example .env
```

The default `.env` has `ROUTER_DRY_RUN=true` — **no API keys needed**. The LLM calls are simulated locally.

---

### Step 4 — Build the Data Pipeline (one-time setup)

```powershell
# Download PubMed abstracts + symptom-disease data
python ingestion/download_corpus.py

# Embed corpus into ChromaDB vector store
python ingestion/embed_chroma.py
```

---

### Step 5 — Start the Backend

Open **Terminal 1** and run:

```powershell
.\venv\Scripts\python.exe -m uvicorn backend.api:app --reload --port 8000
```

✅ You'll see:
```
INFO: Uvicorn running on http://127.0.0.1:8000
```

---

### Step 6 — Start the Frontend

Open **Terminal 2** and run:

```powershell
cd frontend
npm install      # first time only
npm run dev
```

✅ You'll see:
```
VITE v8.3.0  ready in 654 ms
➜  Local:   http://localhost:5173/
```

---

### Step 7 — Open the App 🎉

| Service | URL |
|---------|-----|
| 🎨 React Frontend | **http://localhost:5173** |
| 📖 API Swagger Docs | http://127.0.0.1:8000/docs |
| ❤️ Health Check | http://127.0.0.1:8000/health |

---

## 🧪 Try a Sample Case

Paste this into the app and click **Run CDSS Pipeline**:

> *"45-year-old male presenting with severe headaches, nausea, and sensitivity to light for 3 days. History of hypertension. No recent fever or trauma."*

---

## 🧬 Running Tests & Evaluation

```powershell
# Run the test suite
.\venv\Scripts\python.exe -m pytest tests/ -v

# Run the benchmarking & ablation evaluation
.\venv\Scripts\python.exe eval/run_eval.py
```

The evaluation report will be saved to `eval/results.md`.

---

## 📁 Project Structure

```
├── backend/
│   ├── api.py          # FastAPI endpoints
│   ├── agents.py       # LangGraph agent pipeline
│   └── router.py       # Custom LiteLLM rate-limit router
├── ingestion/
│   ├── download_corpus.py   # PubMed + HuggingFace data fetch
│   ├── embed_chroma.py      # Embed corpus → ChromaDB
│   └── build_kg.py          # Build Neo4j Knowledge Graph
├── frontend/
│   └── src/
│       ├── pages/       # HeroPage, AnalyzePage, ResultsPage
│       └── components/  # Navbar, ParticleField
├── tests/               # pytest unit + integration tests
├── eval/                # Benchmarking & ablation scripts
├── data/                # Local corpus + ChromaDB store
├── docker-compose.yml   # Optional Neo4j setup
├── requirements.txt     # Python dependencies
└── .env.example         # Environment template
```

---

## ⚙️ Optional: Neo4j Knowledge Graph (Docker)

If you have Docker Desktop installed:

```powershell
docker-compose up -d
```

This starts Neo4j at `bolt://localhost:7687`. Then run:

```powershell
.\venv\Scripts\python.exe ingestion/build_kg.py
```

Without Docker, the KG agent uses a built-in structured fallback automatically.
