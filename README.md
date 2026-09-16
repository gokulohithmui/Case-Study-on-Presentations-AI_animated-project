# Confidence-Aware Clinical Decision Support System (CDSS)

A production-engineered prototype of a multi-agent clinical decision support system. This system takes a patient case, retrieves supporting evidence from a biomedical vector database (RAG) and a knowledge graph (Neo4j), cross-checks the two, and produces a confidence-scored diagnosis. If confidence is low, an adaptive optimizer agent automatically reformulates the query and re-runs the pipeline.

**Design Advantage**: This project is fully reproducible from a clean clone with zero approval steps. There is no credentialing or data-access required. All patient-case data is synthetic (via Synthea) or public benchmark data. No real, identifiable, or protected health information (PHI) is used anywhere in this project.

## Architecture

- **Backend**: FastAPI (Python)
- **Vector DB**: Chroma (Local)
- **Knowledge Graph**: Neo4j Community Edition (Docker)
- **Embeddings**: `pritamdeka/BioBERT` (Local sentence-transformers)
- **NER**: `scispaCy` (`en_core_sci_sm`)
- **Web Search**: DuckDuckGo Search + NCBI Entrez E-utilities
- **Orchestration**: LangGraph
- **LLMs**: Multi-provider routing (Groq and Google Gemini) via a custom rate-limit-aware router.

## Setup Instructions

### 1. Prerequisites
- Docker and Docker Compose
- Python 3.11+
- Git

### 2. Environment Setup
Clone the repository and install dependencies:
```bash
git clone <repo-url>
cd cdss-prototype
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Install scispaCy model manually
pip install https://s3-us-west-2.amazonaws.com/ai2-s2-scispacy/releases/v0.5.1/en_core_sci_sm-0.5.1.tar.gz
```

### 3. API Keys (Free Tier)
This project uses strictly free-tier LLM providers.
1. Get a free API key from [Groq](https://console.groq.com/keys).
2. Get a free API key from [Google AI Studio (Gemini)](https://aistudio.google.com/app/apikey).
3. Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

### 4. Start Infrastructure
Start the Neo4j Knowledge Graph:
```bash
docker-compose up -d
```

### 5. Data Ingestion
Run the ingestion pipeline to generate synthetic data, download public datasets, and build the databases:
```bash
python ingestion/synthea_runner.py
python ingestion/download_corpus.py
python ingestion/embed_chroma.py
python ingestion/build_kg.py
```

### 6. Run the Server & UI
Start the FastAPI backend:
```bash
uvicorn backend.api:app --reload
```
Once the server is running, simply open `frontend/index.html` in your web browser to access the CDSS Dashboard.

## Running Tests & Evaluation
To run the automated test suite:
```bash
pytest tests/
```

To run the benchmarking and ablation evaluation scripts:
```bash
python eval/run_eval.py
```
This will output a performance report to `eval/results.md`.

## Disclaimer
This is a software engineering prototype. It has no regulatory clearance, no clinical validation, and is explicitly **not ready for patient use**. It is built entirely on synthetic and public benchmark data for demonstration purposes only.
