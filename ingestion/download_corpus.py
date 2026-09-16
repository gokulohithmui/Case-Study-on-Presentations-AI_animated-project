import os
import json
import requests
from datasets import load_dataset
from dotenv import load_dotenv

load_dotenv()

def fetch_pubmed_abstracts(query="diagnosis AND treatment", max_results=50):
    """Fetches PubMed abstracts using NCBI E-utilities (no API key required for low volume)."""
    email = os.getenv("ENTREZ_EMAIL", "example@example.com")
    print(f"Fetching {max_results} PubMed abstracts for query: {query}...")
    
    # Search
    search_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={query}&retmax={max_results}&retmode=json&email={email}"
    res = requests.get(search_url)
    data = res.json()
    ids = data.get("esearchresult", {}).get("idlist", [])
    
    if not ids:
        return []
        
    # Fetch details
    id_str = ",".join(ids)
    fetch_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={id_str}&retmode=json&email={email}"
    res = requests.get(fetch_url)
    details = res.json().get("result", {})
    
    abstracts = []
    for p_id in ids:
        info = details.get(p_id)
        if info:
            abstracts.append({
                "source": "pubmed",
                "id": p_id,
                "title": info.get("title", ""),
                "content": f"Title: {info.get('title', '')}. " # We use title as summary here due to esummary limits. Real implementation would use efetch.
            })
    return abstracts

def fetch_symptom_disease_dataset():
    """Fetches a public symptom-disease dataset from HuggingFace."""
    print("Fetching symptom-disease dataset from HuggingFace...")
    try:
        # Using a well-known HF dataset as an example.
        dataset = load_dataset("duxtecblic/symptom-disease-dataset", split="train[:100]")
        records = []
        for i, row in enumerate(dataset):
            symptoms = row.get("Symptoms", row.get("symptoms", ""))
            disease = row.get("Disease", row.get("disease", ""))
            records.append({
                "source": "hf_symptom_disease",
                "id": f"hf_{i}",
                "title": disease,
                "content": f"Disease: {disease}. Symptoms: {symptoms}"
            })
        return records
    except Exception as e:
        print(f"Failed to load HF dataset: {e}. Generating mock data.")
        # Fallback mock data for prototype
        return [
            {"source": "mock", "id": "1", "title": "Influenza", "content": "Disease: Influenza. Symptoms: fever, chills, muscle aches, cough, congestion, runny nose, headaches, and fatigue."},
            {"source": "mock", "id": "2", "title": "Migraine", "content": "Disease: Migraine. Symptoms: severe throbbing pain or a pulsing sensation, usually on one side of the head, nausea, vomiting, and extreme sensitivity to light and sound."}
        ]

if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    
    pubmed_data = fetch_pubmed_abstracts()
    symptom_data = fetch_symptom_disease_dataset()
    
    corpus = pubmed_data + symptom_data
    with open("data/corpus.json", "w", encoding="utf-8") as f:
        json.dump(corpus, f, indent=2)
        
    print(f"Saved {len(corpus)} corpus documents to data/corpus.json")
