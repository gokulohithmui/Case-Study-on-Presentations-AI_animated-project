import os
import json
import time
import logging
import random
from typing import List, Dict, Any, Optional
import litellm

# Configure structured JSON logging
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage()
        }
        # Inject custom fields if they exist
        for field in ["agent_name", "provider", "model", "latency_ms", "success", "retry_count"]:
            if hasattr(record, field):
                log_record[field] = getattr(record, field)
        return json.dumps(log_record)

logger = logging.getLogger("cdss_router")
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setFormatter(JSONFormatter())
logger.addHandler(ch)

# Define configurations for agents
AGENT_ROUTING_CONFIG = {
    "Clinical_Text_Clarifier": {
        "primary": "groq/llama-3.3-70b-versatile",
        "fallbacks": ["groq/llama-3.1-8b-instant"]
    },
    "Symptom_RAG_Analyzer": {
        "primary": "gemini/gemini-2.5-flash",
        "fallbacks": ["groq/llama-3.3-70b-versatile"]
    },
    "Evidence_Based_Scanner": {
        "primary": "groq/llama-3.3-70b-versatile",
        "fallbacks": ["groq/llama-3.1-8b-instant"]
    },
    "Clinical_Data_Fusion": {
        "primary": "gemini/gemini-2.5-flash",
        "fallbacks": ["groq/llama-3.3-70b-versatile"]
    },
    "Adaptive_Optimizer": {
        "primary": "groq/llama-3.1-8b-instant",
        "fallbacks": []
    }
}

class LLMRouter:
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run or (os.getenv("ROUTER_DRY_RUN", "false").lower() == "true")
        self.config = AGENT_ROUTING_CONFIG
        self.daily_usage_simulation = {}

    def get_provider(self, model_name: str) -> str:
        if "/" in model_name:
            return model_name.split("/")[0]
        return "unknown"
        
    def _simulate_rate_limit(self, provider: str, estimated_tokens: int):
        """Simulate a rate limit error if quota is exceeded in dry run mode."""
        # Simulated limits for testing
        limit = 100000 if provider == "groq" else 50000
        current = self.daily_usage_simulation.get(provider, 0)
        
        if current + estimated_tokens > limit:
            raise litellm.RateLimitError(
                message=f"Simulated rate limit exceeded for {provider}",
                llm_provider=provider,
                model=""
            )
        self.daily_usage_simulation[provider] = current + estimated_tokens

    def invoke(self, agent_name: str, messages: List[Dict[str, str]], **kwargs) -> Any:
        if agent_name not in self.config:
            raise ValueError(f"Agent {agent_name} not found in routing config.")

        primary_model = self.config[agent_name]["primary"]
        fallbacks = self.config[agent_name]["fallbacks"]
        models_to_try = [primary_model] + fallbacks

        max_retries = 3
        retry_count = 0
        start_time = time.time()

        for model in models_to_try:
            provider = self.get_provider(model)
            for attempt in range(max_retries):
                try:
                    if self.dry_run:
                        estimated_tokens = sum(len(m.get("content", "")) for m in messages) // 4
                        self._simulate_rate_limit(provider, estimated_tokens)
                        latency = (time.time() - start_time) * 1000
                        logger.info(
                            f"DRY RUN: Agent {agent_name} called {model}",
                            extra={
                                "agent_name": agent_name,
                                "provider": provider,
                                "model": model,
                                "latency_ms": latency,
                                "success": True,
                                "retry_count": retry_count
                            }
                        )
                        # Return dummy response object similar to litellm response
                        return {"choices": [{"message": {"content": "DRY RUN MOCK RESPONSE"}}]}

                    # Actual API call using LiteLLM
                    response = litellm.completion(
                        model=model,
                        messages=messages,
                        **kwargs
                    )
                    
                    latency = (time.time() - start_time) * 1000
                    logger.info(
                        f"Agent {agent_name} call succeeded",
                        extra={
                            "agent_name": agent_name,
                            "provider": provider,
                            "model": model,
                            "latency_ms": latency,
                            "success": True,
                            "retry_count": retry_count
                        }
                    )
                    return response

                except litellm.RateLimitError as e:
                    retry_count += 1
                    latency = (time.time() - start_time) * 1000
                    logger.warning(
                        f"Rate limit error for {model}. Attempt {attempt + 1}/{max_retries}.",
                        extra={
                            "agent_name": agent_name,
                            "provider": provider,
                            "model": model,
                            "latency_ms": latency,
                            "success": False,
                            "retry_count": retry_count
                        }
                    )
                    if attempt < max_retries - 1:
                        # Exponential backoff with jitter
                        sleep_time = (2 ** attempt) + random.uniform(0, 1)
                        if not self.dry_run:
                            time.sleep(sleep_time)
                    else:
                        break # Move to fallback model
                        
                except Exception as e:
                    retry_count += 1
                    latency = (time.time() - start_time) * 1000
                    logger.error(
                        f"Error calling {model}: {str(e)}",
                        extra={
                            "agent_name": agent_name,
                            "provider": provider,
                            "model": model,
                            "latency_ms": latency,
                            "success": False,
                            "retry_count": retry_count
                        }
                    )
                    break # Don't retry on non-rate-limit errors, immediately move to fallback

        raise Exception(f"All models and fallbacks failed for agent {agent_name}")
