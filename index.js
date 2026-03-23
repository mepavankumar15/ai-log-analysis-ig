require('dotenv').config();
const express = require('express');
const cors = require('cors');
const aiService = require('./aiService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// POST /analyze endpoint
app.post('/analyze', async (req, res) => {
    try {
        const { logs } = req.body;
        
        // Input validation
        if (!logs) {
            return res.status(400).json({ error: "Missing 'logs' in request body." });
        }

        // Single-pass deep reasoning pipeline via Structured Outputs
        console.log("Sending single-pass full diagnostic generation to Gemini 2.5 Flash...");
        const result = await aiService.analyzeAll(logs);

        return res.json(result);
    } catch (error) {
        console.error("Error during log analysis:", error.message);
        
        let issue = "Failed to analyze logs via AI.";
        let rootCause = "AI processing error.";
        let fixes = ["Check environment variables and API keys.", "Ensure sufficient quota available."];
        let explanation = "The AI agent encountered a problem trying to process the logs. This usually means a connection issue or misconfiguration.";
        let severity = "Unknown";
        
        if (error.message && error.message.includes("429")) {
            issue = "API Rate Limit Exceeded (429 TOO MANY REQUESTS)";
            rootCause = "The backend submitted 6 consecutive LLM prompts to Gemini 2.5 Flash, exceeding the Free Tier rate limit quota (15 requests per minute).";
            fixes = [
                "Wait 60 seconds for the Gemini API rate limit to reset.",
                "Ensure you don't click 'Execute Analysis' more than twice a minute.",
                "Upgrade to a Google Cloud paid tier for higher API throughput."
            ];
            explanation = "You hit the speed limit! Because our AI does a very deep analysis using 6 distinct steps, it talks to the servers 6 times instantly. The free servers got overwhelmed. Just breathe, wait about a minute, and try again!";
            severity = "Low";
        }

        return res.status(500).json({
            issue,
            root_cause: rootCause,
            fixes,
            severity,
            explanation_for_beginner: explanation,
            confidence: "High",
            error_details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`AI Log Analysis Agent running on http://localhost:${PORT}`);
});
