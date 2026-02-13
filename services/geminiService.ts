
import { GoogleGenAI } from "@google/genai";

export const generateDescription = async (deviceName: string, category: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate a professional, technical maintenance log description for a medical device named "${deviceName}" in the "${category}" category. Include typical components to check and common maintenance steps. Keep it under 100 words.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating description. Please write manually.";
  }
};
