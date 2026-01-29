
import { GoogleGenAI, Type } from "@google/genai";
import { BlogPost, AdventureMap, ImageStyle, ImageSize, GameRoom } from "../types";

const KIFUSION_KB = `
# MÉTODO KIFUSION: PROTOCOLO TERAPÉUTICO SENIOR
Eres un Terapeuta Holístico experto en Biodecodificación, Kinesiología Holística y Movimientos Sistémicos.

REGLAS CRÍTICAS DE ESCRITURA:
1. PROHIBIDO: Iniciar con saludos como "Hola", "Bienvenidos al espacio", "Es un gusto saludarte", etc.
2. INICIO OBLIGATORIO: El artículo debe empezar con un Título (H1) y la primera frase del cuerpo debe ser: "Lo que percibo con fuerza en el 'aquí y ahora' es una..." seguido de la detección del conflicto.
3. EJERCICIO ÚNICO: Elige SOLO UNA técnica (la más potente para el caso). No des opciones.
4. TONO: Directo, profundo, clínico-espiritual.
`;

export const generateKiFusionPost = async (customContext: string): Promise<BlogPost & { sources?: any[] }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API KEY NO DETECTADA. Selecciona una llave en el panel superior.");
  
  const ai = new GoogleGenAI({ apiKey });
  
  const finalContext = customContext.trim() || "Canaliza un síntoma transgeneracional oculto que necesite salir a la luz hoy.";

  const prompt = `
    Actúa como Terapeuta Senior KiFusion.
    Tema: "${finalContext}".

    ESTRUCTURA DEL POST (SIGUE ESTE ORDEN):
    1. Título (H1): Atractivo y sanador.
    2. Introducción (Párrafo): Empieza exactamente así: "Lo que percibo con fuerza en el 'aquí y ahora' es una..." 
       Continúa analizando el síntoma o conflicto desde la Biodecodificación.
    3. Análisis Profundo: Sentido biológico y capa embrionaria involucrada.
    4. PROTOCOLO DE SANACIÓN (H2):
       - Indica el nombre de la técnica (Sistémica, Kinesiología o MKF).
       - Pasos detallados del 1 al 5.
    5. Afirmación de Cierre.

    REGLAS: Sin introducciones innecesarias. Ve directo al grano.
    ${KIFUSION_KB}
    
    ---
    Escribe exactamente al final: ---IMAGE_PROMPT_START--- seguido de un prompt para generar una imagen artística de sanación.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    const fullText = response.text || "";
    const parts = fullText.split(/---IMAGE_PROMPT_START---/i);
    const content = parts[0].trim();
    const imagePrompt = parts.length > 1 ? parts[1].trim() : `High quality spiritual healing art representing ${finalContext}`;
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Referencia Terapéutica",
      uri: chunk.web?.uri
    })).filter((s: any) => s.uri) || [];

    const title = content.split('\n')[0].replace(/^#\s*/, '') || "Canalización KiFusion";

    return { title, content, imagePrompt, sources };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const generateImageFromPrompt = async (
  prompt: string, 
  style: ImageStyle = 'cinematic', 
  size: ImageSize = '1K'
): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API KEY NO DISPONIBLE.");
  const ai = new GoogleGenAI({ apiKey });
  
  // Modificadores enfocados en LUZ, COLOR y VIBRACIÓN (evitando lo oscuro)
  const styleModifiers = {
    cinematic: "Vibrant colors, high saturation, luminous lighting, sun-drenched, professional photography, ethereal but bright, crystal clear, 8k.",
    abstract: "Explosion of vivid colors, neon energy, rainbow light particles, sacred geometry in bright gold and teal, luminous white background.",
    zen: "Bright daylight, morning sun, peaceful but colorful garden, soft luminous pastels, high key lighting, clear and joyful.",
    anatomical: "Glowing colorful meridians, radiant energy flow, bright anatomical art, luminous chakras with vivid saturation, ethereal white light.",
    watercolor: "Bright and saturated watercolors, vivid hues, cheerful brushstrokes, luminous paper texture, full of life and color."
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: `${prompt}. ${styleModifiers[style]}. Avoid dark tones, avoid black backgrounds, use a cheerful and vibrant color palette.` }] },
      config: { imageConfig: { aspectRatio: "16:9", imageSize: size } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error: any) {
    console.error("Gemini Image Error:", error);
    throw error;
  }
};

export const generateAdventureMap = async (theme: string): Promise<AdventureMap> => {
  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey! });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Genera un mapa de aventura de texto (JSON) sobre el viaje de sanación de: ${theme}. 6 salas.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          intro: { type: Type.STRING },
          startingRoomId: { type: Type.STRING },
          rooms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                exits: { type: Type.OBJECT, properties: { north: { type: Type.STRING }, south: { type: Type.STRING }, east: { type: Type.STRING }, west: { type: Type.STRING } } },
                encounter: { type: Type.STRING },
                item: { type: Type.STRING }
              },
              required: ["id", "name", "description", "exits"]
            }
          }
        },
        required: ["title", "intro", "startingRoomId", "rooms"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const resolveAdventureAction = async (action: string, desc: string, inv: string[], encounter?: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey! });
  const prompt = `Narración de aventura KiFusion. Sala: ${desc}. Obstáculo: ${encounter}. Acción: ${action}. Inventario: ${inv.join(', ')}. Responde de forma mística y breve.`;
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
  return response.text || "La energía fluctúa...";
};
