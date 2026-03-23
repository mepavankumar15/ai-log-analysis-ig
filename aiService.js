const { GoogleGenerativeAI } = require("@google/generative-ai");

const getGenAI = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

// Helper for calling the Gemini model
async function callGemini(prompt) {
    const genAI = getGenAI();
    // Using gemini-1.5-flash as it is fast and free
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
}

/**
 * Extract key issues from logs
 */
async function analyzeLogs(logs) {
    const prompt = `You are an expert systems engineer. Analyze the following logs and extract the key issue or error message concisely.
    
Logs:
${logs}

Return only the concise issue extracted.`;
    return await callGemini(prompt);
}

/**
 * Determine root cause
 */
async function findRootCause(analysis) {
    const prompt = `Based on the following log analysis, determine a concise root cause of the issue.

Analysis:
${analysis}

Return only the concise root cause.`;
    return await callGemini(prompt);
}

/**
 * Generate step-by-step fixes
 */
async function generateFixes(rootCause) {
    const prompt = `Based on the following root cause, generate a step-by-step fix. 
Provide the steps as a JSON array of strings ONLY. Do not use markdown blocks, just return a raw JSON array of strings like ["step 1", "step 2"].

Root Cause:
${rootCause}`;
    const rawResult = await callGemini(prompt);
    
    // Safely parse JSON even if the LLM wraps it in markdown blocks
    let jsonStr = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        return [rawResult]; // Fallback if parsing fails
    }
}

/**
 * Return Low / Medium / High severity
 */
async function classifySeverity(analysis) {
    const prompt = `Based on the following log analysis, classify the severity as exactly one of: Low, Medium, High. Return ONLY the word, nothing else.

Analysis:
${analysis}`;
    const result = await callGemini(prompt);
    
    // Clean up response string to match exactly
    const text = result.replace(/[^a-zA-Z]/g, '').trim();
    if (["Low", "Medium", "High"].includes(text)) {
        return text;
    }
    return "Medium"; // Fallback
}

/**
 * Simple explanation
 */
async function explainForBeginner(rootCause) {
    const prompt = `Explain the following root cause in very simple, beginner-friendly terms, as if explaining to someone with no technical background.

Root Cause:
${rootCause}

Return only the simple explanation.`;
    return await callGemini(prompt);
}

/**
 * Assess confidence level
 */
async function assessConfidence(analysis) {
    const prompt = `Based on the following log analysis, how confident are you in this assessment? Return ONLY the word: High, Medium, or Low.

Analysis:
${analysis}`;
    const result = await callGemini(prompt);
    
    const text = result.replace(/[^a-zA-Z]/g, '').trim();
    if (["Low", "Medium", "High"].includes(text)) {
        return text;
    }
    return "High"; // Fallback
}

module.exports = {
    analyzeLogs,
    findRootCause,
    generateFixes,
    classifySeverity,
    explainForBeginner,
    assessConfidence
};
