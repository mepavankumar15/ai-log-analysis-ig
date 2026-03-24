const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

const getGenAI = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

/**
 * Single-pass structured generation to completely bypass rate limits
 * by answering all 6 prompts at the exact same time.
 */
async function analyzeAll(logs) {
    const genAI = getGenAI();
    
    const responseSchema = {
        type: SchemaType.OBJECT,
        properties: {
            issue: { 
                type: SchemaType.STRING, 
                description: "Extract the concise key issue or error message." 
            },
            stack_fingerprint: {
                type: SchemaType.STRING,
                description: "A short normalized, condensed signature (e.g., 'pg_auth_failed' or 'TypeErr_Undefined_React') representing the core stack trace for grouping similar errors."
            },
            hypotheses: {
                type: SchemaType.ARRAY,
                description: "Provide 1 to 3 distinct root-cause hypotheses for this error, ranked by confidence.",
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        root_cause: { type: SchemaType.STRING, description: "Determine the technical root cause hypothesis." },
                        confidence_score: { type: SchemaType.NUMBER, description: "A percentage integer from 0 to 100 representing how confident you are in this hypothesis." },
                        justification: { type: SchemaType.STRING, description: "Why do you believe this is the root cause?" }
                    },
                    required: ["root_cause", "confidence_score", "justification"]
                }
            },
            fixes: { 
                type: SchemaType.ARRAY, 
                items: { type: SchemaType.STRING },
                description: "Array of step-by-step resolution string instructions considering the most likely hypothesis."
            },
            severity: { 
                type: SchemaType.STRING, 
                description: "Exactly one of: Low, Medium, High" 
            },
            explanation_for_beginner: { 
                type: SchemaType.STRING, 
                description: "Explain the issue in simple, beginner-friendly layman terms." 
            }
        },
        required: ["issue", "stack_fingerprint", "hypotheses", "fixes", "severity", "explanation_for_beginner"]
    };

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    const prompt = `You are a Principal Cloud Architect and Systems Engineer. Analyze the following logs and provide a comprehensive, 6-part diagnostic report strictly matching the provided JSON schema.
    
Raw Logs/Traces:
${logs}`;

    const result = await model.generateContent(prompt);
    const jsonStr = result.response.text();
    return JSON.parse(jsonStr);
}

module.exports = {
    analyzeAll
};
