# Backend - Global Ontology Engine

This is the backend for the Global Ontology Engine. It's built with **FastAPI** to expose APIs that process raw intelligence text or fetch live global news using a **Google Gemini Large Language Model** via the `google-genai` library. This pipeline extracts dynamic entity (node) and relationship (edge) data into a structured JSON format. The structured data is then merged into a **Neo4j** graph database using Cypher queries. It also features endpoints to query graph intelligence and an AI Analyst Brief generator that creates situational reports based on the extracted context.

## Capabilities
- **Intelligence Extraction**: Parses raw text into structured knowledge graphs via the Google Gemini LLM API, validated by Pydantic schemas.
- **Neo4j Integration**: Inserts and updates structured knowledge securely into a Neo4j database using a singleton driver instance and sanitized Cypher queries. Supports graph search via name queries.
- **AI Analyst Briefs**: Generates multi-paragraph, AI-authored analyst briefs (including key risks) using extracted graphs.
- **Live News Fetching**: Uses the GDELT DOC API (no key required) to pull real-time global news articles on a given topic, normalizing them into a text corpus for intelligence extraction.
- **Bulk Data Ingestion**:
  - `ingest.py`: A script to load `sample_data.json` through the LLM pipeline, complete with API rate-limit controls.
  - `csv_ingest.py`: A script mapping structured datasets (`crypto_hacks.csv`) to specific Neo4j nodes (Protocol, Blockchain, ThreatActor) and edges (HACKED_BY, DEPLOYED_ON), complete with source provenance URLs.

## Setup & Run Instructions

### Prerequisites
- **Python 3.9+**
- A **Neo4j AuraDB instance** (or local instance) with its connection URI, username, and password.
- A **Google Gemini API Key**.

### 1. Create a Virtual Environment
In the root directory of this repository, create and activate a Python virtual environment:

```bash
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

### 2. Install Dependencies
Install the required packages using the `requirements.txt` file in the root repository.

```bash
pip install -r ../requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the `Backend` directory and define your credentials:

```ini
NEO4J_URI=bolt://your-neo4j-uri
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_secure_password
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Running the Backend Server
Start the FastAPI server using `uvicorn`:

```bash
uvicorn main:app --reload
```
The server will now be listening on `http://127.0.0.1:8000`.

### 5. Running Ingestion Scripts (Optional)
If you wish to process the sample JSON dataset into the database via the LLM pipeline:
```bash
python ingest.py
```

If you wish to ingest the included structured CSV dataset:
```bash
python csv_ingest.py
```

---
## Note about the Frontend
The companion Next.js React frontend (located in `../Frontend/ai-onto-globe`) provides a modern dashboard interface that dynamically displays these real-time entity extraction graphs. The frontend renders this structured data using an interactive D3-force layout, allowing users to customize physics components like node repulsion and link distances via real-time sliders. It also interfaces with the Search, News, and Alert streams provided by the API endpoints.

You can refer to the [Frontend README](../Frontend/README.md) for its specific capabilities and setup/run instructions.