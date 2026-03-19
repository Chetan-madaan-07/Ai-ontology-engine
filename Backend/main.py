from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# Import our custom modules
from database import get_db, insert_graph_data
from llm import extract_graph_from_text, generate_analyst_brief

# 1. Setup Heavy Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("ontology_backend.main")

logger.info("Initializing Global Ontology Engine API...")

# 2. Initialize FastAPI app
app = FastAPI(title="Global Ontology Engine MVP")

# 3. Setup CORS
logger.info("Configuring CORS middleware...")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Define Request Models
class ExtractRequest(BaseModel):
    text: str

class InsightRequest(BaseModel):
    topic: str
    context: str

# 5. Core Endpoints
@app.get("/")
def read_root():
    logger.info("Health check endpoint '/' was called.")
    return {"status": "success", "message": "Global Ontology Engine API is running!"}

@app.post("/api/extract")
def extract_entities(request: ExtractRequest):
    logger.info(f"Endpoint '/api/extract' called. Text length: {len(request.text)} characters.")
    if not request.text.strip():
        logger.warning("Empty text provided for extraction.")
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
        
    try:
        # Step 1: Extract graph data using LLM
        logger.info("Calling LLM for graph extraction...")
        graph_data = extract_graph_from_text(request.text)
        
        # Step 2: Insert this into Neo4j
        logger.info("Attempting to insert extracted data into Neo4j...")
        db_driver = get_db()
        insertion_success = insert_graph_data(db_driver, graph_data)
        
        if insertion_success:
            logger.info("SUCCESS: Data successfully saved to Neo4j.")
        else:
            logger.error("FAILURE: Data extraction succeeded, but database insertion failed.")
            raise HTTPException(status_code=500, detail="Failed to save graph data to the database.")

        logger.info(f"Extraction and insertion complete. Returning {len(graph_data.get('nodes', []))} nodes.")
        return {
            "status": "success",
            "message": "Data extracted and saved to database.",
            "data": graph_data
        }
    except Exception as e:
        logger.error(f"FAILURE in /api/extract: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/insights")
def get_insights(request: InsightRequest):
    logger.info(f"Endpoint '/api/insights' called for topic: {request.topic}")
    try:
        logger.info("Calling LLM for analyst brief generation...")
        brief = generate_analyst_brief(request.topic, request.context)
        logger.info("Brief generated successfully.")
        return {
            "status": "success",
            "brief": brief
        }
    except Exception as e:
        logger.error(f"FAILURE in /api/insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

logger.info("Backend endpoints configured. Ready to receive requests.")