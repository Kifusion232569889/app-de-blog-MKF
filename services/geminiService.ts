
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BlogPost, AdventureMap } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// --- KNOWLEDGE BASE FROM PDF (KiFusion Methodology) ---
const KIFUSION_KNOWLEDGE_BASE = `
# FUENTE: "El Salto Cuántico de la Emoción" & "Método KiFusion"

## 1. LAS 4 ETAPAS DE LA BIOLOGÍA (ORIGEN DEL CONFLICTO)
El conflicto se diagnostica según la capa embrionaria afectada:
1. **1ª Etapa (Supervivencia - Tronco Cerebral - Endodermo):** 
   - *Conflictos:* "Atrapar el bocado" (aire, agua, alimento, reproducción). Miedo a morir o no tener lo básico.
   - *Órganos:* Pulmón (aire), Riñón (líquidos/referentes), Digestivo (alimento), Útero/Próstata (reproducción).
2. **2ª Etapa (Protección - Cerebelo - Mesodermo Antiguo):**
   - *Conflictos:* Ataque a la integridad, preocupación por el nido/familia. "Mancha", "Ataque".
   - *Órganos:* Mamas (protección familiar), Dermis, Pericardio, Pleura, Peritoneo.
3. **3ª Etapa (Comparación/Movimiento - Sustancia Blanca - Mesodermo Nuevo):**
   - *Conflictos:* Desvalorización, no ser apto, no rendir suficiente.
   - *Órganos:* Huesos, Músculos, Sangre, Ganglios, Sistema Linfático.
4. **4ª Etapa (Relación/Social - Corteza Cerebral - Ectodermo):**
   - *Conflictos:* Territorio, contacto (separación o contacto indeseado), identidad, comunicación.
   - *Órganos:* Piel (epidermis), Bronquios, Arterias coronarias, Recto, Estómago (curvatura menor).

## 2. LISTADO DE CORRECCIONES KIFUSION (HERRAMIENTAS DE SANACIÓN)
El terapeuta debe sugerir 2 o 3 de estas correcciones específicas según el caso:

1. **Punto Corazón:** Tapping o presión suave en el centro del pecho (VC17/Timo) visualizando el "YO SOY" positivo.
2. **Liberación con Imán:** Pasar un imán (o la mano con intención) desde el entrecejo hasta la nuca/espalda baja 3 veces repitiendo: "Libero esta emoción de todas mis células".
3. **Agradecimientos:** Manos en el corazón agradeciendo la experiencia dolorosa por el aprendizaje, o escribir 10 agradecimientos diarios.
4. **Descanso:** Prescripción de "No hacer nada" o descanso absoluto de una obligación específica.
5. **Fobias o Miedos:** Tapping en puntos hipotalámicos (alrededor de ojos y nariz) afirmando "Aunque tengo miedo, YO SOY TRANQUILO".
6. **LEE (Liberación de Estrés Emocional):** Tocar suavemente las prominencias frontales ("cuernos") hasta sentir el latido acompasado.
7. **Reprogramación Frontal-Occipital:** Una mano en la frente y otra en la nuca, visualizando la nueva realidad deseada.
8. **Puntos de Bennet:** Presión en el centro de las cejas (surco) para corrección emocional general.
9. **Puntos Neuroemocionales:** Tapping o presión en puntos específicos de meridianos según el órgano.
10. **Puntos de Alarma:** Tapping en el órgano afectado mientras el paciente mira las manos del terapeuta haciendo círculos.
11. **Liberación Emocional Respiratoria:** Visualizar la emoción (darle forma, color, temperatura), llevarla a la boca y expulsarla con una exhalación fuerte.
12. **Gran Integración:** Mano derecha en la frente y mano izquierda en el corazón.
13. **Reseteo Ocular:** Movimientos oculares extremos (semicírculo arriba, semicírculo abajo, en X, en infinito) mientras se mantienen puntos de estrés.
14. **Ho’oponopono:** Mantra "Lo siento, perdón, gracias, te amo" visualizando a la persona o situación conflicto.
15. **Honro y Agradezco:** Inclinarse a tocar los pies (honrar ancestros) diciendo "Honro este destino pero no es mío, te lo devuelvo". (Para lealtades familiares).
16. **Flores de Bach:** Recomendar esencias (ej: Mimulus para miedo conocido, Star of Bethlehem para traumas/shock, Pine para culpa).
17. **Pericardio:** Conectar mano en coronilla y pecho (pericardio), pedir permiso y liberar la tensión ("El guardián del corazón").
18. **Respiraciones Conscientes:** 5 minutos de respiración pausada (3s inhalar, 3s pausa, 3s exhalar) enfocada en el corazón.
19. **Desplazamiento del Aura:** "Peinar" el campo energético con las manos para centrarlo y sellar fugas.
20. **Creencias:** Construir afirmaciones en presente ("Yo soy...") y repetirlas durante 21 días.

## 3. PRINCIPIOS DE LA MENTE
- **El Subconsciente es Literal:** No entiende bromas ni negaciones.
- **Vive en Presente:** El trauma de hace 20 años se vive como "ahora".
- **Intención (Física Cuántica):** La intención del observador altera el resultado. Creer es crear.

## 4. DICCIONARIO RÁPIDO DE DOLENCIAS
- **Artritis:** Crítica, rigidez, falta de flexibilidad mental.
- **Adicciones:** Huida de uno mismo, vacío existencial, falta de amor.
- **Garganta:** Miedo a expresarse, "tragar" palabras o emociones.
- **Fibromialgia:** Dolor familiar no expresado, "las cuerdas familiares me aprietan".
- **Migraña:** Conflicto de desvalorización intelectual, querer controlarlo todo.
- **Gastritis:** "No puedo digerir esta situación/persona". Ira contenida.
- **Bronquitis:** Disputas en el territorio, gritos, falta de aire/espacio vital.
- **Cáncer:** Herida profunda, rencor guardado mucho tiempo, pérdida de sentido.
`;

export const generateKiFusionPost = async (
  customContext: string, 
  mode: 'standard' | 'news' | 'analysis' = 'standard',
  referenceUrl?: string
): Promise<BlogPost> => {
  const ai = getClient();
  
  let dynamicPrompt = "";

  if (mode === 'news') {
    dynamicPrompt = `
      MODE: NEWS & TRENDS (SEO + GEO OPTIMIZED)
      TASK:
      1. USE GOOGLE SEARCH to find LATEST news/trends on: Biodescodificación, Epigenética, or Quantum Healing.
      2. Write a post analyzing this trend using "Método KiFusion".
      3. Focus on high authority and current events.
    `;
  } else if (mode === 'analysis' && referenceUrl) {
    dynamicPrompt = `
      MODE: STYLE CLONING & SUCCESS ANALYSIS
      
      REFERENCE URL: ${referenceUrl}
      
      TASK:
      1. USE GOOGLE SEARCH to read and analyze the content, structure, tone, and formatting of the article at: "${referenceUrl}".
      2. Identify WHY it works (hooks, emotional connection, keyword density, simplicity).
      3. Write a NEW blog post about the topic: "${customContext || 'Bienestar Integral'}" mimicking exactly that successful style and structure.
      
      IMPORTANT: Do not copy the text. Copy the *formula* (e.g., if the original uses a story intro, use a story intro. If it uses scientific data, use scientific data).
    `;
  } else {
    dynamicPrompt = `
      MODE: STANDARD EDUCATIONAL
      TASK: Write an educational blog post about a specific pain point or topic.
      ${customContext ? `FOCUS TOPIC: ${customContext}` : ''}
    `;
  }
  
  const basePrompt = `
    ROL: Actúa como un Terapeuta Holístico experto en el Método KiFusion (Integración de Kinesiología, Biodescodificación y Cuántica).
    
    TONO Y ESTILO:
    - **Profesional, Sobrio y Cercano:** Usa un lenguaje claro, maduro y empático, pero firme.
    - **PROHIBIDO:** Usar saludos cliché del tipo "Hola alma valiente", "Ser de luz", "Hermano cósmico" o excesivos diminutivos.
    - **Enfoque:** Dirígete al lector de "tú" con respeto. Céntrate en la toma de consciencia, la responsabilidad adulta y la explicación lógica/biológica de las emociones.
    - **Autoridad:** Escribe como alguien que domina la técnica y ofrece soluciones tangibles, no solo palabras bonitas.
    
    BASE DE CONOCIMIENTO (BIBLIA KIFUSION):
    Usa la siguiente información técnica para dar diagnósticos precisos y soluciones prácticas.
    
    ${KIFUSION_KNOWLEDGE_BASE}
    
    INSTRUCCIONES DE REDACCIÓN:
    ${dynamicPrompt}

    # ESTRUCTURA DEL ARTÍCULO (Adaptar según el modo)
    1. **Título (H1):** Emocional, directo y optimizado para SEO.
    2. **Intro:** Conecta con el conflicto real del lector sin rodeos místicos excesivos.
    3. **Diagnóstico KiFusion:** 
       - Identifica la **Etapa Biológica** afectada.
       - Explica el **Conflicto Emocional** (Biodescodificación) con claridad.
    4. **Solución Práctica (Correcciones):**
       - Elige 2 o 3 herramientas del "LISTADO DE CORRECCIONES" que mejor se adapten al problema.
       - Explica paso a paso cómo hacerlas de forma técnica pero sencilla.
    5. **Conclusión:** Mensaje de empoderamiento y acción ("Yo soy...").
    6. **Formato:** Markdown limpio.

    # PROMPT DE IMAGEN
    Al final, genera un separador "---IMAGE_PROMPT_START---" seguido de un prompt en inglés para generar una imagen. Estilo: "Ethereal, Quantum, High Tech Wellness, Soft Lighting, Abstract representation of the emotion".
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: basePrompt,
    config: {
      tools: [{ googleSearch: {} }], 
      systemInstruction: "You are 'KiFusion Guide'. You are a professional holistic therapist. You explain physical ailments through their emotional roots (Biodecoding) and offer energetic corrections (Kinesiology/Quantum). Your tone is grounded, professional, and empathetic, avoiding 'new age' clichés.",
    }
  });

  const fullText = response.text || "";

  // Extract content and prompt
  const parts = fullText.split("---IMAGE_PROMPT_START---");
  const content = parts[0].trim();
  const imagePrompt = parts.length > 1 ? parts[1].trim() : "Abstract energy healing visualization, soft colors, ethereal, 4k";

  // Extract title
  const lines = content.split('\n');
  const titleLine = lines.find(l => l.startsWith('# ')) || lines[0] || "Método KiFusion";
  const title = titleLine.replace(/^#\s*/, '').replace(/\*/g, '').trim();

  return {
    title,
    content,
    imagePrompt
  };
};

export const generateImageFromPrompt = async (prompt: string): Promise<string | null> => {
  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;

  } catch (error) {
    console.error("Image generation error:", error);
    throw new Error("Failed to generate image.");
  }
};

// --- ADVENTURE GAME SERVICES (UNCHANGED) ---
export const generateAdventureMap = async (theme: string): Promise<AdventureMap> => {
  const ai = getClient();
  const prompt = `Create a procedural text adventure map based on: "${theme}". KiFusion metaphor. 6-9 rooms. JSON output.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          intro: { type: Type.STRING },
          startingRoomId: { type: Type.STRING },
          rooms: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: {type:Type.STRING}, name:{type:Type.STRING}, description:{type:Type.STRING}, exits:{type:Type.OBJECT, properties:{north:{type:Type.STRING, nullable:true},south:{type:Type.STRING, nullable:true},east:{type:Type.STRING, nullable:true},west:{type:Type.STRING, nullable:true}}}, encounter:{type:Type.STRING, nullable:true}, item:{type:Type.STRING, nullable:true}}, required: ["id", "name", "description", "exits"] } }
        },
        required: ["title", "intro", "startingRoomId", "rooms"]
      }
    }
  });
  if (!response.text) throw new Error("Failed");
  return JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, '').trim()) as AdventureMap;
};

export const resolveAdventureAction = async (action: string, desc: string, inv: string[], enc?: string): Promise<string> => {
  const ai = getClient();
  const prompt = `Narrate holistic adventure. Room: ${desc}. Action: ${action}. Keep it mystical.`;
  const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
  return response.text || "Nothing happens.";
};
