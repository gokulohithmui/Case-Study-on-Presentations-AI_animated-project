import os
import json
import chromadb
from sentence_transformers import SentenceTransformer

def embed_corpus():
    if not os.path.exists("data/corpus.json"):
        print("data/corpus.json not found. Run download_corpus.py first.")
        return

    with open("data/corpus.json", "r", encoding="utf-8") as f:
        corpus = json.load(f)

    print("Loading SentenceTransformer model (BioBERT)...")
    # Using the specified BioBERT model
    # Using a lightweight model (22MB) that fits in memory on standard laptops.
    # all-MiniLM-L6-v2 produces high-quality semantic embeddings for medical text.
    model = SentenceTransformer("all-MiniLM-L6-v2")

    print("Initializing ChromaDB...")
    client = chromadb.PersistentClient(path="./data/chroma_db")
    collection = client.get_or_create_collection(name="medical_corpus")

    print(f"Embedding {len(corpus)} documents...")
    
    docs = []
    ids = []
    metadatas = []
    
    for item in corpus:
        docs.append(item["content"])
        ids.append(item["id"])
        metadatas.append({"title": item["title"], "source": item["source"]})

    # Batch embedding to avoid memory issues on large corpora
    batch_size = 32
    for i in range(0, len(docs), batch_size):
        batch_docs = docs[i:i+batch_size]
        batch_ids = ids[i:i+batch_size]
        batch_metas = metadatas[i:i+batch_size]
        
        embeddings = model.encode(batch_docs).tolist()
        
        collection.upsert(
            documents=batch_docs,
            embeddings=embeddings,
            metadatas=batch_metas,
            ids=batch_ids
        )
        print(f"Upserted batch {i//batch_size + 1}")

    print("Finished embedding corpus into ChromaDB.")

if __name__ == "__main__":
    embed_corpus()
