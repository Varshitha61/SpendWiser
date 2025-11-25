import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptAnalysisResult } from '../types';

// Initialize the client with the environment variable directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeReceiptImage = async (base64Image: string): Promise<ReceiptAnalysisResult> => {
  // Clean base64 string if it has the prefix
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64
          }
        },
        {
          text: "Analyze this receipt. Extract the merchant name, the total amount, the date (YYYY-MM-DD format), and suggest a category (Food, Transport, Housing, Entertainment, Shopping, Health, Other). Also provide a short description."
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          merchant: { type: Type.STRING },
          date: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          currency: { type: Type.STRING }
        },
        required: ["merchant", "amount", "category"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as ReceiptAnalysisResult;
  }
  throw new Error("Failed to analyze receipt");
};

export const getSpendingInsights = async (transactions: any[]): Promise<string> => {
  const simplifiedTx = JSON.stringify(transactions.slice(0, 50).map(t => ({
    date: t.date,
    amount: t.amount,
    category: t.category,
    type: t.type
  })));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Here is a JSON list of recent transactions: ${simplifiedTx}. 
    Provide a brief, friendly financial insight summary (max 3 sentences). 
    Highlight any spending trends or areas to save. Address the user directly.`,
  });

  return response.text || "No insights available.";
};
