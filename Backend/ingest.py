import json
import time
import logging
import os
# Import our custom modules
from database import get_db, insert_graph_data
from llm import extract_graph_from_text

# 1. Setup Heavy Logging
logger = logging.getLogger("ontology_backend.ingest")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

def run_ingestion():
    logger.info("Starting Global Ontology Engine Ingestion Pipeline...")
    
    # 2. Verify Database Connection
    db_driver = get_db()
    if not db_driver:
        logger.error("CRITICAL FAILURE: Cannot connect to the database. Aborting ingestion.")
        return

    # 3. Load Sample Data
    data_file_path = "sample_data.json"
    if not os.path.exists(data_file_path):
        logger.error(f"CRITICAL FAILURE: Could not find {data_file_path}")
        return

    logger.info(f"Loading data from {data_file_path}...")
    with open(data_file_path, "r", encoding="utf-8") as f:
        articles = json.load(f)
        
    logger.info(f"Successfully loaded {len(articles)} articles for processing.")

    # 4. Process Each Article
    total_successful = 0
    
    for index, article in enumerate(articles):
        text = article.get("text", "")
        if not text:
            logger.warning(f"Skipping article at index {index} because it has no text.")
            continue
            
        logger.info(f"--- Processing Article {index + 1} of {len(articles)} ---")
        
        # Step A: Extract
        logger.info("Extracting entities and relationships via LLM...")
        graph_data = extract_graph_from_text(text)
        
        # Check if the LLM returned valid data
        if not graph_data.get("nodes") and not graph_data.get("edges"):
            logger.warning(f"Failed to extract any graph data from Article {index + 1}. Skipping database insertion.")
            continue
            
        # Step B: Insert into Database
        logger.info("Inserting extracted data into Neo4j...")
        success = insert_graph_data(db_driver, graph_data)
        
        if success:
            logger.info(f"SUCCESS: Article {index + 1} fully ingested into the Intelligence Graph.")
            total_successful += 1
        else:
            logger.error(f"FAILURE: Could not insert data for Article {index + 1}.")
            
        # Step C: Rate Limit Protection
        # If this isn't the last article, pause for 15 seconds to respect free-tier API limits
        if index < len(articles) - 1:
            logger.info("Pausing for 15 seconds to respect Gemini API rate limits... DO NOT KILL THE SCRIPT.")
            time.sleep(15)

    logger.info("==================================================")
    logger.info(f"INGESTION COMPLETE. Successfully processed {total_successful} out of {len(articles)} articles.")
    logger.info("==================================================")

if __name__ == "__main__":
    run_ingestion()