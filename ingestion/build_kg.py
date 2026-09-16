import os
import json
import spacy
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

class Neo4jBuilder:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        
    def close(self):
        self.driver.close()
        
    def create_entity(self, label, name, source):
        with self.driver.session() as session:
            session.execute_write(self._create_node_tx, label, name, source)
            
    def create_relationship(self, entity1, label1, entity2, label2, rel_type):
        with self.driver.session() as session:
            session.execute_write(self._create_rel_tx, entity1, label1, entity2, label2, rel_type)
            
    @staticmethod
    def _create_node_tx(tx, label, name, source):
        # We use MERGE to avoid duplicates
        query = f"MERGE (e:{label} {{name: $name}}) SET e.source = $source"
        tx.run(query, name=name, source=source)
        
    @staticmethod
    def _create_rel_tx(tx, entity1, label1, entity2, label2, rel_type):
        query = f"""
        MATCH (a:{label1} {{name: $name1}})
        MATCH (b:{label2} {{name: $name2}})
        MERGE (a)-[r:{rel_type}]->(b)
        """
        tx.run(query, name1=entity1, name2=entity2)


def build_knowledge_graph():
    if not os.path.exists("data/corpus.json"):
        print("data/corpus.json not found. Run download_corpus.py first.")
        return
        
    print("Loading scispaCy NER model (en_core_sci_sm)...")
    try:
        nlp = spacy.load("en_core_sci_sm")
    except OSError:
        print("Model 'en_core_sci_sm' not found. Please run: pip install https://s3-us-west-2.amazonaws.com/ai2-s2-scispacy/releases/v0.5.1/en_core_sci_sm-0.5.1.tar.gz")
        return

    neo4j_uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    neo4j_user = os.getenv("NEO4J_USER", "neo4j")
    neo4j_password = os.getenv("NEO4J_PASSWORD", "password")

    try:
        builder = Neo4jBuilder(neo4j_uri, neo4j_user, neo4j_password)
    except Exception as e:
        print(f"Failed to connect to Neo4j. Is the Docker container running? Error: {e}")
        return

    with open("data/corpus.json", "r", encoding="utf-8") as f:
        corpus = json.load(f)

    print(f"Processing {len(corpus)} documents into Knowledge Graph...")

    for item in corpus:
        doc = nlp(item["content"])
        
        # In a real CDSS, we would classify entities into Disease/Symptom/Treatment
        # using a more specialized model like en_ner_bc5cdr_md.
        # Here we do a basic extraction:
        
        main_entity = item["title"]
        builder.create_entity("Disease", main_entity, item["source"])
        
        for ent in doc.ents:
            ent_text = ent.text.lower()
            if ent_text != main_entity.lower():
                builder.create_entity("Concept", ent_text, item["source"])
                builder.create_relationship(main_entity, "Disease", ent_text, "Concept", "ASSOCIATED_WITH")
                
    builder.close()
    print("Finished building Knowledge Graph.")

if __name__ == "__main__":
    build_knowledge_graph()
