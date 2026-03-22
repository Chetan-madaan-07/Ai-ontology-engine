# Global Ontology Engine

## Main Goal
The main goal of this project is to create an AI-powered "Global Ontology Engine" that acts as a real-time entity extraction and intelligence mapping tool. It takes raw text inputs (like news articles or intelligence briefs), uses a Large Language Model (Google Gemini via `google-genai`) to extract a dynamic knowledge graph (entities/nodes and their relationships/edges), and stores this graph in a Neo4j graph database. The frontend provides a Next.js-based interactive visualization of this knowledge graph using `react-force-graph-2d` and allows users to request an AI-generated analyst brief based on the extracted situational context.

## What is Done and Capabilities
- **Backend API**: A FastAPI server that exposes main endpoints:
  - `POST /api/extract`: Receives raw text, calls the Gemini LLM to extract nodes (entities) and edges (relationships), and saves the resulting graph into a Neo4j AuraDB graph database using Cypher queries.
  - `POST /api/insights`: Receives a topic and graph context, and uses the Gemini LLM to generate a concise analyst brief summarizing the situation and outlining key risks.
  - `POST /api/news`: Fetches live news articles using the GDELT DOC API based on a topic, converts them to a text corpus, and extracts a knowledge graph.
  - `GET /api/search`: Searches the Neo4j database for nodes matching a query and returns the matching nodes and their immediate relationships.
- **LLM Integration**: Uses the `google-genai` SDK with fallback models (`gemini-2.5-flash`, etc.) and structured JSON output generation via Pydantic schemas to ensure accurate and reliable graph extraction.
- **Database Connection**: Seamlessly connects to Neo4j with a singleton driver instance to run queries securely.
- **Ingestion Scripts**:
  - `ingest.py`: A standalone script to bulk-process articles from `sample_data.json` with rate-limiting baked in.
  - `csv_ingest.py`: A script to parse and ingest CSV data (like `crypto_hacks.csv`) into the Neo4j database, mapping specific columns to nodes (Protocol, ThreatActor, Blockchain) and relationships (HACKED_BY, DEPLOYED_ON, USED_CHAIN).
- **News Fetcher**: `news_fetcher.py` uses the GDELT DOC API to fetch real-time news articles without requiring an API key.
- **Frontend App**: A Next.js application built with React and styled with Tailwind CSS (`lucide-react` for icons).
- **Interactive Graph Visualization**: Uses `react-force-graph-2d` (rendered via Canvas/D3.js) to dynamically display the knowledge graph. Nodes are color-coded dynamically based on their category labels.
- **Graph Physics Controls**: Custom sliders allow the user to tweak D3 force-directed physics (repulsion and link distance) in real-time.
- **Alert Stream**: Displays real-time critical alerts extracted from the knowledge graph.
- **Evidence Panel**: Shows provenance and source articles for extracted entities, linking directly to the news sources.

## Complete Project Structure (Except `node_modules`, `.git`, `.next`, `__pycache__`)

```
/ (Root Folder)
├── prompt.md
├── README.md
├── requirements.txt
├── Backend/
│   ├── .gitignore
│   ├── Chetan's Task List.md
│   ├── README.md
│   ├── crypto_hacks.csv
│   ├── csv_ingest.py
│   ├── database.py
│   ├── ingest.py
│   ├── llm.py
│   ├── main.py
│   ├── news_fetcher.py
│   └── sample_data.json
└── Frontend/
    ├── README.md
    └── ai-onto-globe/
        ├── .gitignore
        ├── AGENTS.md
        ├── CLAUDE.md
        ├── README.md
        ├── eslint.config.mjs
        ├── jsconfig.json
        ├── next.config.mjs
        ├── package-lock.json
        ├── package.json
        ├── postcss.config.mjs
        ├── app/
        │   ├── favicon.ico
        │   ├── globals.css
        │   ├── layout.js
        │   └── page.js
        ├── components/
        │   ├── AlertStream.js
        │   ├── CustomSlider.js
        │   ├── EvidencePanel.js
        │   └── KnowledgeGraph.js
        ├── lib/
        │   └── api.js
        └── public/
            ├── file.svg
            ├── globe.svg
            ├── next.svg
            ├── vercel.svg
            └── window.svg
```

## Directory and File Details

### `/ (Root Folder)`
The main workspace containing both backend and frontend codebases, top-level documentation, and dependencies.
- `prompt.md`: This file, detailing the project overview, structure, capabilities, and file descriptions, with the original prompt appended at the end.
- `README.md`: The root documentation file outlining the entire project and linking to frontend and backend specific READMEs.
- `requirements.txt`: Contains the Python dependencies required for the backend (`fastapi`, `uvicorn`, `neo4j`, `google-genai`, `pydantic`, `python-dotenv`, `requests`, `python-multipart`).

### `/Backend/`
Contains the Python FastAPI backend application that handles data extraction, database interaction, and AI brief generation.
- `.gitignore`: Specifies intentionally untracked files to ignore for Git.
- `Chetan's Task List.md`: A markdown file tracking tasks, likely for a team member named Chetan.
- `README.md`: Backend specific documentation and setup/run instructions.
- `crypto_hacks.csv`: A dataset containing information about various cryptocurrency hacks, used by `csv_ingest.py`.
- `csv_ingest.py`: A standalone script that reads `crypto_hacks.csv` and ingests the data into the Neo4j database, creating nodes (Protocol, ThreatActor, Blockchain) and relationships (HACKED_BY, DEPLOYED_ON, USED_CHAIN).
- `database.py`: Handles the Neo4j database connection using the official neo4j driver. Provides a global database driver and includes functions like `insert_graph_data` to merge nodes and relationships using Cypher queries, and `search_nodes_by_name` to perform graph searches.
- `ingest.py`: A standalone utility script to load JSON data from `sample_data.json` and bulk ingest it through the LLM extraction pipeline and into the Neo4j database, complete with rate-limiting pauses.
- `llm.py`: Manages the Google Gemini API integration using the `google-genai` library. Defines Pydantic schemas (`Node`, `Edge`, `KnowledgeGraphSchema`) to enforce structured JSON output. Contains `extract_graph_from_text` to parse text into a graph and `generate_analyst_brief` for situation reports.
- `main.py`: The entry point for the FastAPI application. Sets up CORS middleware, global logging, and defines the RESTful endpoints (`/api/extract`, `/api/insights`, `/api/news`, `/api/search`) that wire together the LLM, DB, and news fetching logic.
- `news_fetcher.py`: Uses the GDELT DOC API to fetch recent news articles for a given topic. Includes functions to normalize the API response and convert articles to a text corpus suitable for LLM processing.
- `sample_data.json`: A sample dataset (JSON array of text objects) used by `ingest.py` for testing bulk ingestions.

### `/Frontend/`
Contains the frontend project.
- `README.md`: Documentation holding information about the frontend and how to set it up and run it.

### `/Frontend/ai-onto-globe/`
Contains the Next.js React frontend application.
- `.gitignore`: Next.js specific git ignore rules.
- `AGENTS.md` & `CLAUDE.md` & `README.md`: Markdown files for agent/human instructions and project documentation.
- `eslint.config.mjs`: Configuration file for ESLint linting.
- `jsconfig.json`: JavaScript configuration for the Next.js project, setting up compiler options and path aliases.
- `next.config.mjs`: Next.js build and runtime configuration.
- `package-lock.json` & `package.json`: Defines npm dependencies (like `react`, `next`, `axios`, `react-force-graph-2d`, `tailwindcss`, `lucide-react`) and scripts (`dev`, `build`, etc.).
- `postcss.config.mjs`: PostCSS configuration for processing Tailwind CSS.

#### `/Frontend/ai-onto-globe/app/`
The Next.js App Router directory.
- `favicon.ico`: The application's favicon.
- `globals.css`: Global CSS file, integrating Tailwind CSS styles and custom utility classes like `.custom-scrollbar`.
- `layout.js`: The root layout wrapper for the Next.js application, defining HTML structure, global metadata, and fonts (e.g., GeistSans, GeistMono).
- `page.js`: The main dashboard page component. Handles complex state for input text, extracted graph data, the AI brief, physics slider values, search queries, and live news fetching. Manages API calls via the `lib/api.js` layer and orchestrates the child components (`KnowledgeGraph`, `CustomSlider`, `AlertStream`, `EvidencePanel`).

#### `/Frontend/ai-onto-globe/components/`
Reusable React components.
- `AlertStream.js`: Displays a stream of critical alerts (e.g., High-Risk entities) extracted from the knowledge graph data.
- `CustomSlider.js`: A specialized slider input component used to control D3 graph physics parameters (like repulsion and link distance).
- `EvidencePanel.js`: Shows provenance and source articles for the currently selected node or the overall graph, linking directly to external news sources or matched data.
- `KnowledgeGraph.js`: The core visualization component. It dynamically imports `react-force-graph-2d` (to avoid SSR issues), maps node labels to dynamic colors, and hooks the React state into the D3 simulation engine to update forces (repulsion and link distance) in real-time. Also handles node click events to populate the Evidence Panel.

#### `/Frontend/ai-onto-globe/lib/`
Utility libraries and API client wrappers.
- `api.js`: Wraps Axios to make API calls to the backend endpoints (`/api/extract`, `/api/insights`, `/api/search`, `/api/news`). Configured to use the `NEXT_PUBLIC_API_URL` environment variable or fallback to `http://127.0.0.1:8000`.

#### `/Frontend/ai-onto-globe/public/`
Static assets served directly by Next.js.
- `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`: Various SVG icons and logos used within the project.

---

update prompt.md file in root folder containing everything, our main goal, complete project structure in detail including every file and folder (except node_modules), what is done in the project and what can it do, its capabilities and first read every file then define each file in detail about what it does and define each folder about what it does and in the end of the file copy this prompt

and create readme.md files, one for backend folder, one for frontend folder, one for root folder
readme in root folder hold the overview of the whole project
readme in frontend holds information about frontend and also how to setup and run frontend
readme in backend folder holds information about the frontend and also how to setup and run backend


---

update prompt.md file in root folder containing everything, our main goal, complete project structure in detail including every file and folder (except node_modules), what is done in the project and what can it do, its capabilities and first read every file then define each file in detail about what it does and define each folder about what it does and in the end of the file copy this prompt

and create readme.md files, one for backend folder, one for frontend folder, one for root folder
readme in root folder hold the overview of the whole project
readme in frontend holds information about frontend and also how to setup and run frontend
readme in backend folder holds information about the frontend and also how to setup and run backend
