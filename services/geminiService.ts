import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGiftSuggestions = async (
  recipientName: string,
  interests: string,
  budget: string
): Promise<{ title: string; description: string; estimatedPrice: number }[]> => {
  
  try {
    const prompt = `Suggest 3 unique gift ideas for ${recipientName} who is interested in: ${interests}. The budget is around ${budget}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful social gifting assistant. Provide creative and thoughtful gift suggestions. Return JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              estimatedPrice: { type: Type.NUMBER, description: "Price in USD" }
            },
            required: ["title", "description", "estimatedPrice"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error fetching gift suggestions:", error);
    return [];
  }
};
