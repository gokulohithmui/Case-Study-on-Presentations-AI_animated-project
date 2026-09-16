from fastapi.testclient import TestClient
from backend.api import app
import backend.api

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_metrics_unauthorized():
    response = client.get("/metrics")
    assert response.status_code == 403

def test_metrics_authorized():
    response = client.get("/metrics", headers={"X-API-Key": "demo-key-123"})
    assert response.status_code == 200
    assert "total_requests" in response.json()

def test_analyze_endpoint(monkeypatch):
    # Mock the pipeline so we don't make real LLM calls
    def mock_run_pipeline(text):
        return {
            "final_report": {"diagnosis": "Mocked", "confidence": 0.99, "report": "Done"},
            "confidence_score": 0.99,
            "iterations": 1,
            "structured_data": {}
        }
        
    monkeypatch.setattr(backend.api, "run_pipeline", mock_run_pipeline)
    
    response = client.post(
        "/analyze",
        headers={"X-API-Key": "demo-key-123"},
        json={"patient_text": "Test"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["confidence"] == 0.99
    assert data["report"]["diagnosis"] == "Mocked"
