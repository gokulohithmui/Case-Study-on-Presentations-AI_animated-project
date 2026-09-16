import pytest
from backend.router import LLMRouter
import litellm

def test_router_dry_run_success():
    router = LLMRouter(dry_run=True)
    response = router.invoke(
        agent_name="Clinical_Text_Clarifier",
        messages=[{"role": "user", "content": "Patient presents with headache."}]
    )
    assert response["choices"][0]["message"]["content"] == "DRY RUN MOCK RESPONSE"

def test_router_dry_run_rate_limit_failover():
    router = LLMRouter(dry_run=True)
    
    # Intentionally exhaust the groq quota (limit is 100k, we push 150k estimated tokens)
    large_content = "a " * (150000 * 4) # approx 150k tokens
    
    # The primary is groq, fallback is groq.
    # Since we exhaust groq altogether, both primary and fallback will fail.
    with pytest.raises(Exception) as exc_info:
        router.invoke(
            agent_name="Clinical_Text_Clarifier",
            messages=[{"role": "user", "content": large_content}]
        )
    
    assert "All models and fallbacks failed for agent Clinical_Text_Clarifier" in str(exc_info.value)

def test_router_fallback_on_rate_limit(monkeypatch):
    router = LLMRouter(dry_run=False) # Not dry run, we will mock litellm
    
    call_counts = {"primary": 0, "fallback": 0}
    
    def mock_completion(model, messages, **kwargs):
        if model == "groq/llama-3.3-70b-versatile":
            call_counts["primary"] += 1
            # Always fail with rate limit error
            raise litellm.RateLimitError("Mock Rate Limit", llm_provider="groq", model=model)
        elif model == "groq/llama-3.1-8b-instant":
            call_counts["fallback"] += 1
            return {"choices": [{"message": {"content": "FALLBACK SUCCESS"}}]}
            
    monkeypatch.setattr(litellm, "completion", mock_completion)
    
    # Should automatically retry primary 3 times, then succeed on fallback
    # We patch time.sleep to avoid waiting during tests
    import time
    monkeypatch.setattr(time, "sleep", lambda x: None)
    
    response = router.invoke(
        agent_name="Clinical_Text_Clarifier",
        messages=[{"role": "user", "content": "Test"}]
    )
    
    assert response["choices"][0]["message"]["content"] == "FALLBACK SUCCESS"
    assert call_counts["primary"] == 3 # Max retries
    assert call_counts["fallback"] == 1 # Succeeds on first fallback attempt
