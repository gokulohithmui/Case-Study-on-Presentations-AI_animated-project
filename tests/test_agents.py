import pytest
from backend.agents import text_clarifier_node, fusion_node, optimizer_node, run_pipeline
import backend.agents

def test_text_clarifier_node(monkeypatch):
    def mock_invoke(agent_name, messages, **kwargs):
        return {"choices": [{"message": {"content": '{"symptoms": ["headache"], "conditions": []}'}}]}
    
    monkeypatch.setattr(backend.agents.router, "invoke", mock_invoke)
    
    state = {"raw_text": "Patient has a headache"}
    result = text_clarifier_node(state)
    assert "headache" in result["structured_data"]["symptoms"]

def test_fusion_node(monkeypatch):
    def mock_invoke(agent_name, messages, **kwargs):
        return {"choices": [{"message": {"content": '{"diagnosis": "Migraine", "confidence": 0.9, "report": "Confirmed"}'}}]}
    
    monkeypatch.setattr(backend.agents.router, "invoke", mock_invoke)
    
    state = {
        "rag_candidates": [],
        "kg_candidates": [],
        "web_evidence": []
    }
    result = fusion_node(state)
    assert result["confidence_score"] == 0.9
    assert result["final_report"]["diagnosis"] == "Migraine"

def test_optimizer_node_stops_on_high_confidence(monkeypatch):
    state = {
        "confidence_score": 0.8,
        "iterations": 1,
        "final_report": {}
    }
    result = optimizer_node(state)
    assert result["feedback"] == "STOP"

def test_optimizer_node_retries_on_low_confidence(monkeypatch):
    def mock_invoke(agent_name, messages, **kwargs):
        return {"choices": [{"message": {"content": "Try looking for fever."}}]}
    
    monkeypatch.setattr(backend.agents.router, "invoke", mock_invoke)
    
    state = {
        "confidence_score": 0.5,
        "iterations": 1,
        "final_report": {}
    }
    result = optimizer_node(state)
    assert result["feedback"] == "Try looking for fever."
    assert result["iterations"] == 2

def test_run_pipeline_end_to_end(monkeypatch):
    # Mock the router for the whole pipeline
    def mock_invoke(agent_name, messages, **kwargs):
        if agent_name == "Clinical_Text_Clarifier":
            return {"choices": [{"message": {"content": '{"symptoms": ["cough"]}'}}]}
        elif agent_name == "Symptom_RAG_Analyzer":
            return {"choices": [{"message": {"content": "Could be cold"}}]}
        elif agent_name == "Evidence_Based_Scanner":
            return {"choices": [{"message": {"content": "Web says rest"}}]}
        elif agent_name == "Clinical_Data_Fusion":
            # Return high confidence to prevent loops
            return {"choices": [{"message": {"content": '{"diagnosis": "Cold", "confidence": 0.85, "report": "Good"}'}}]}
        elif agent_name == "Adaptive_Optimizer":
            return {"choices": [{"message": {"content": "STOP"}}]}
    
    monkeypatch.setattr(backend.agents.router, "invoke", mock_invoke)
    
    result = run_pipeline("Patient has a cough")
    assert result["confidence_score"] == 0.85
    assert result["final_report"]["diagnosis"] == "Cold"
