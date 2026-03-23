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
            root_cause: { 
                type: SchemaType.STRING, 
                description: "Determine the technical root cause of the issue." 
            },
            fixes: { 
                type: SchemaType.ARRAY, 
                items: { type: SchemaType.STRING },
                description: "Array of step-by-step resolution string instructions."
            },
            severity: { 
                type: SchemaType.STRING, 
                description: "Exactly one of: Low, Medium, High" 
            },
            explanation_for_beginner: { 
                type: SchemaType.STRING, 
                description: "Explain the root cause in simple, beginner-friendly layman terms." 
            },
            confidence: { 
                type: SchemaType.STRING, 
                description: "Exactly one of: Low, Medium, High based on how sure you are of the diagnosis." 
            }
        },
        required: ["issue", "root_cause", "fixes", "severity", "explanation_for_beginner", "confidence"]
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
