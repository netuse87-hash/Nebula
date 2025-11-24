import { GoogleGenAI } from "@google/genai";
import { SearchResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const performSmartSearch = async (query: string, mode: 'SEARCH' | 'BROWSE' = 'SEARCH'): Promise<SearchResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  try {
    let prompt = "";
    let systemInstruction = "";

    if (mode === 'BROWSE') {
      prompt = `Visit the website "${query}". 
      Act as a secure, text-based browser engine. 
      Render the content of this page in rich, structured Markdown.
      
      Guidelines:
      1. Capture the main essence of the page (Headlines, Hero text, Main purpose).
      2. List key navigation links or categories found on the page.
      3. Summarize any main articles or featured products.
      4. DO NOT execute or describe ads, trackers, or popups.
      5. If it is a complex web app (like Maps or a Game), describe its purpose and interface rather than trying to run it.
      
      Format the output to look like a clean, readable document. Use headers, bullet points, and bold text effectively.`;
      
      systemInstruction = "You are Nebula's secure rendering engine. Your goal is to provide a safe, tracking-free, and ad-free reading experience of any website using your browsing tools.";
    } else {
      prompt = `Search query: ${query}. Provide a comprehensive summary of the search results with formatting. If it's a navigational query (e.g., 'amazon', 'facebook'), describe the site briefly and provide the official link clearly.`;
      systemInstruction = "You are an intelligent browser assistant. Format your response in clean Markdown. Always extract and list the source URLs provided by the search tool.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: systemInstruction,
      },
    });

    const text = response.text || "No content returned.";
    
    // Extract grounding metadata safely
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map(chunk => chunk.web)
      .filter(web => web !== undefined && web !== null)
      .map(web => ({
        uri: web.uri || '',
        title: web.title || 'Source'
      }));

    return { text, sources };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: "## Connection Error\nUnable to reach Nebula AI services. Please check your internet connection.",
      sources: []
    };
  }
};