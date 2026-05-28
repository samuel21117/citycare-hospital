const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: 'dummy' });

async function run() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: 'hello',
        });
        console.log(response);
    } catch (err) {
        console.error("ERROR:", err.message);
    }
}
run();
