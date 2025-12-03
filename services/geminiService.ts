import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ResearchResult, SourceItem, SourceType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to parse JSON from text that might contain markdown code blocks
const extractJson = (text: string): any => {
  try {
    // Try direct parse
    return JSON.parse(text);
  } catch (e) {
    // Try to find markdown block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e2) {
        console.error("Failed to parse extracted JSON block", e2);
        return null;
      }
    }
    return null;
  }
};

export const searchHumanitiesSources = async (query: string, category: SourceType): Promise<ResearchResult> => {
  const modelId = "gemini-2.5-flash"; // Good balance of speed and reasoning for search
  
  let typeContext = "";
  switch (category) {
    case SourceType.BIBLIOGRAPHIC:
      typeContext = "Concentrati su paper accademici, libri di testo, e pubblicazioni universitarie.";
      break;
    case SourceType.HISTORICAL:
      typeContext = "Concentrati su fonti primarie, archivi storici, cronache e analisi storiografiche.";
      break;
    case SourceType.LITERARY:
      typeContext = "Concentrati su opere letterarie, critica letteraria, saggi e antologie.";
      break;
    default:
      typeContext = "Cerca un mix equilibrato di fonti bibliografiche, storiche e letterarie.";
  }

  const prompt = `
    Agisci come un assistente di ricerca universitario per studi umanistici.
    L'utente sta cercando informazioni su: "${query}".
    ${typeContext}
    
    Usa Google Search per trovare fonti reali e affidabili.
    
    Il tuo output DEVE essere un array JSON puro contenente oggetti con questa struttura esatta:
    [
      {
        "title": "Titolo della fonte",
        "author": "Autore/i",
        "year": "Anno (se disponibile)",
        "type": "Tipo (es. Libro, Articolo, Documento d'archivio)",
        "description": "Breve descrizione del contenuto (max 2 frasi)",
        "citation": "Citazione formale in stile Chicago o APA",
        "url": "Link diretto se disponibile (altrimenti lascia vuoto)"
      }
    ]
    
    Trova almeno 4-6 fonti rilevanti. Non includere testo prima o dopo il JSON.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType is not allowed with googleSearch, so we parse manually
      },
    });

    const text = response.text || "[]";
    const items: SourceItem[] = extractJson(text) || [];
    
    // Add unique IDs
    const itemsWithIds = items.map((item, index) => ({
      ...item,
      id: `source-${Date.now()}-${index}`
    }));

    // Extract grounding links
    const groundingLinks: { title: string; url: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        groundingLinks.push({
          title: chunk.web.title,
          url: chunk.web.uri
        });
      }
    });

    return {
      items: itemsWithIds,
      groundingLinks,
      rawText: text
    };

  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw new Error("Impossibile completare la ricerca. Riprova più tardi.");
  }
};

export const synthesizeSource = async (source: SourceItem, userQuery: string): Promise<string> => {
  const modelId = "gemini-2.5-flash";
  
  const prompt = `
    Sei un professore universitario esperto in sintesi.
    
    Analizza i seguenti metadati di una fonte trovata per la ricerca: "${userQuery}".
    
    Dati Fonte:
    Titolo: ${source.title}
    Autore: ${source.author}
    Descrizione: ${source.description}
    Tipo: ${source.type}
    
    Genera una sintesi critica (massimo 150 parole) che spieghi perché questa fonte è rilevante per lo studente e quali concetti chiave potrebbe contenere. Usa un tono accademico ma chiaro.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Impossibile generare la sintesi.";
  } catch (error) {
    console.error("Gemini Synthesis Error:", error);
    return "Si è verificato un errore durante la generazione della sintesi.";
  }
};
