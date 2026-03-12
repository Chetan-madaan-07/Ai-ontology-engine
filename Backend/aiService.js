// aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initializing the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extracts entities and relationships from raw text using Gemini 2.5 Flash.
 */
async function extractOntology(text) {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        // FIX: Upgraded prompt for Entity Resolution and Graph Limiting
        const prompt = `
        You are an expert AI ontology extractor building a geopolitical intelligence graph.
        Analyze the following text and extract the MOST CRITICAL entities and relationships.
        Entities must be categorized strictly as: Location, Organization, Person, Concept.
        
        CRITICAL RULES:
        1. MERGE SYNONYMS: Standardize names. Use "United States" instead of "US" or "USA". Use full official names for people and organizations.
        2. LIMIT OUTPUT: Extract a maximum of 20 high-value nodes and 25 critical relationships. Do not overwhelm the graph.
        3. CLEAN LABELS: Keep relationship labels short, uppercase, and with underscores (e.g., ALLIED_WITH, FUNDS, SANCTIONED).
        
        Return ONLY a valid JSON object in this format:
        {
          "nodes": [{"id": "Standardized Name", "group": "Category"}],
          "links": [{"source": "Standardized Name A", "target": "Standardized Name B", "label": "RELATION"}]
        }
        Text: ${text}`;

        console.log("AI is processing with gemini-2.5-flash... please wait.");
        const result = await model.generateContent(prompt);
        
        let jsonString = result.response.text().trim();
        // Strip markdown backticks just in case
        jsonString = jsonString.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

        try {
            const parsedData = JSON.parse(jsonString);
            console.log("✅ AI Extraction Successful! Nodes found:", parsedData.nodes?.length);
            return parsedData;
        } catch (parseError) {
            console.error("❌ JSON Parsing Error:", parseError.message);
            return null;
        }

    } catch (error) {
        console.error("❌ AI Error:", error.message);
        return null;
    }
}

module.exports = { extractOntology };