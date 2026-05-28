require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function test() {
    console.log("Key exists:", !!process.env.GEMINI_API_KEY);
    if (!process.env.GEMINI_API_KEY) {
        console.log("No API key in .env");
        return;
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const systemInstruction = `You are CityCare Health Assistant, a helpful hospital chatbot.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: 'hello',
            config: {
                systemInstruction: systemInstruction,
            }
        });
        
        console.log("Success:", response.text);
    } catch (err) {
        console.error("ERROR MESSAGE:", err.message);
        console.error("FULL ERROR:", JSON.stringify(err, null, 2));
    }
}
test();
