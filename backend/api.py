from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from typing import Dict, Any, List
import time
import os
from fastapi.middleware.cors import CORSMiddleware
from backend.agents import run_pipeline

app = FastAPI(title="CDSS API", description="Multi-Agent RAG + Knowledge Graph CDSS")

# Setup CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def get_api_key(api_key_header: str = Security(api_key_header)):
    # Basic auth protection. In production, use a secure secret manager.
    expected_key = os.getenv("CDSS_API_KEY", "demo-key-123")
    if api_key_header == expected_key:
        return api_key_header
    raise HTTPException(status_code=403, detail="Could not validate credentials")

# Lightweight in-memory metrics (Prometheus-compatible formatting could be added via prometheus_client)
metrics_store = {
    "total_requests": 0,
    "total_errors": 0,
    "latencies": []
}

class AnalyzeRequest(BaseModel):
    patient_text: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/metrics")
def get_metrics(api_key: str = Depends(get_api_key)):
    avg_latency = sum(metrics_store["latencies"]) / len(metrics_store["latencies"]) if metrics_store["latencies"] else 0
    return {
        "total_requests": metrics_store["total_requests"],
        "total_errors": metrics_store["total_errors"],
        "average_latency_s": avg_latency
    }

@app.post("/analyze")
def analyze_case(req: AnalyzeRequest, api_key: str = Depends(get_api_key)):
    """Runs the 5-agent LangGraph pipeline on the patient text."""
    start_time = time.time()
    metrics_store["total_requests"] += 1
    
    try:
        # Run the multi-agent pipeline
        result = run_pipeline(req.patient_text)
        
        latency = time.time() - start_time
        metrics_store["latencies"].append(latency)
        
        return {
            "status": "success",
            "latency_s": latency,
            "report": result.get("final_report", {}),
            "confidence": result.get("confidence_score", 0.0),
            "iterations": result.get("iterations", 1),
            "trace": result # Include full agent state trace for the audit trail
        }
    except Exception as e:
        metrics_store["total_errors"] += 1
        raise HTTPException(status_code=500, detail=str(e))
