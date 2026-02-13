
import { GoogleGenAI } from "@google/genai";

export const generateDescription = async (deviceName: string, category: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Buatkan deskripsi log maintenance profesional untuk alat medis "${deviceName}" kategori "${category}". Sertakan poin-poin pengecekan umum dan langkah pemeliharaan teknis. Maksimal 80 kata dalam bahasa Indonesia.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Deskripsi tidak dapat dibuat otomatis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan koneksi AI. Silakan tulis manual.";
  }
};
