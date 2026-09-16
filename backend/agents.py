import json
import re
from typing import Dict, Any, List, TypedDict
from langgraph.graph import StateGraph, END
from backend.router import LLMRouter

class AgentState(TypedDict):
    raw_text: str
    structured_data: Dict[str, Any]
    rag_candidates: List[Dict[str, Any]]
    kg_candidates: List[Dict[str, Any]]
    web_evidence: List[Dict[str, Any]]
    final_report: Dict[str, Any]
    confidence_score: float
    iterations: int
    feedback: str

router = LLMRouter()

def clean_json(text: str) -> str:
    """Removes markdown backticks from LLM output."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def text_clarifier_node(state: AgentState):
    prompt = f"Extract symptoms, conditions, and history from the following text into a JSON object with keys 'symptoms' (list) and 'conditions' (list):\n{state['raw_text']}"
    if state.get("feedback"):
        prompt += f"\nFeedback from previous iteration: {state['feedback']}"
        
    response = router.invoke("Clinical_Text_Clarifier", [{"role": "user", "content": prompt}])
    content = clean_json(response["choices"][0]["message"]["content"])
    
    try:
        data = json.loads(content)
    except Exception as e:
        data = {"symptoms": ["unknown"], "conditions": []}
    
    return {"structured_data": data}

def rag_analyzer_node(state: AgentState):
    # In a full implementation, we embed structured_data and query Chroma DB.
    prompt = f"Analyze these extracted clinical entities and provide candidate diagnoses based on typical medical knowledge. Output in plain text: {json.dumps(state['structured_data'])}"
    response = router.invoke("Symptom_RAG_Analyzer", [{"role": "user", "content": prompt}])
    content = response["choices"][0]["message"]["content"]
    
    return {"rag_candidates": [{"diagnosis": "RAG Inference", "evidence": content}]}

def kg_query_node(state: AgentState):
    # In a full implementation, we query Neo4j using the extracted entities.
    return {"kg_candidates": [{"diagnosis": "KG Inference", "path": "(Symptom)-[:ASSOCIATED_WITH]->(Disease)"}]}

def web_scanner_node(state: AgentState):
    prompt = f"Search medical knowledge guidelines for context around these RAG candidates: {json.dumps(state['rag_candidates'])}"
    response = router.invoke("Evidence_Based_Scanner", [{"role": "user", "content": prompt}])
    content = response["choices"][0]["message"]["content"]
    
    return {"web_evidence": [{"source": "web_search", "summary": content}]}

def fusion_node(state: AgentState):
    prompt = f"""Fuse the following data and provide a final diagnosis with a confidence score (0.0 to 1.0).
You MUST output a valid JSON object with keys 'diagnosis' (string), 'confidence' (float), and 'report' (string).
RAG: {state['rag_candidates']}
KG: {state['kg_candidates']}
Web: {state['web_evidence']}"""
    
    response = router.invoke("Clinical_Data_Fusion", [{"role": "user", "content": prompt}])
    content = clean_json(response["choices"][0]["message"]["content"])
    
    try:
        result = json.loads(content)
        score = float(result.get("confidence", 0.5))
    except:
        result = {"diagnosis": "Unknown", "confidence": 0.5, "report": "Failed to parse JSON."}
        score = 0.5
        
    return {"final_report": result, "confidence_score": score}

def optimizer_node(state: AgentState):
    iters = state.get("iterations", 0) + 1
    # Stop if confidence is high enough or we reached max iterations
    if state["confidence_score"] >= 0.65 or iters >= 3:
        return {"iterations": iters, "feedback": "STOP"}
        
    prompt = f"The previous diagnosis had low confidence ({state['confidence_score']}). Provide feedback on what other symptoms to consider or what to broaden in the search based on this report: {json.dumps(state['final_report'])}"
    response = router.invoke("Adaptive_Optimizer", [{"role": "user", "content": prompt}])
    
    return {"iterations": iters, "feedback": response["choices"][0]["message"]["content"]}

def should_continue(state: AgentState):
    if state.get("feedback") == "STOP":
        return END
    return "text_clarifier_node"

def build_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("text_clarifier_node", text_clarifier_node)
    workflow.add_node("rag_analyzer_node", rag_analyzer_node)
    workflow.add_node("kg_query_node", kg_query_node)
    workflow.add_node("web_scanner_node", web_scanner_node)
    workflow.add_node("fusion_node", fusion_node)
    workflow.add_node("optimizer_node", optimizer_node)
    
    workflow.set_entry_point("text_clarifier_node")
    
    workflow.add_edge("text_clarifier_node", "rag_analyzer_node")
    workflow.add_edge("rag_analyzer_node", "kg_query_node")
    workflow.add_edge("kg_query_node", "web_scanner_node")
    workflow.add_edge("web_scanner_node", "fusion_node")
    workflow.add_edge("fusion_node", "optimizer_node")
    
    workflow.add_conditional_edges(
        "optimizer_node",
        should_continue,
    )
    
    return workflow.compile()
    
def run_pipeline(patient_text: str):
    app = build_graph()
    initial_state = {
        "raw_text": patient_text,
        "iterations": 0,
        "confidence_score": 0.0,
        "feedback": ""
    }
    result = app.invoke(initial_state)
    return result

if __name__ == "__main__":
    # Test with a hardcoded synthetic case (enabling dry_run via env var for testing)
    import os
    os.environ["ROUTER_DRY_RUN"] = "true"
    
    test_case = "Patient is a 45-year-old male presenting with severe headaches, nausea, and sensitivity to light."
    print("Running CDSS LangGraph pipeline for test case...")
    final_state = run_pipeline(test_case)
    
    print(f"\nCompleted in {final_state['iterations']} iterations.")
    print("--- FINAL REPORT ---")
    print(json.dumps(final_state.get("final_report", {}), indent=2))
