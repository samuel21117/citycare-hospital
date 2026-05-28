const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

router.post('/', async (req, res) => {
    try {
        // Dynamically reload dotenv pointing exactly to backend/.env
        require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
        
        const { message } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ 
                error: 'GEMINI_API_KEY is missing from the backend .env file. Please add it to use the AI chatbot.' 
            });
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const systemInstruction = `You are CityCare Health Assistant, a helpful hospital chatbot.
You help patients understand hospital services, suggest departments for their symptoms, and guide them on booking appointments or viewing prescriptions.
Do not provide definitive medical diagnoses, but suggest they book a doctor for serious symptoms.
Keep responses concise, friendly, and easy to read.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: message,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        
        res.json({ text: response.text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: error.message || 'Error generating AI response' });
    }
});

module.exports = router;
