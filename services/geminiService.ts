import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BlogPost, AdventureMap } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// --- KNOWLEDGE BASE FROM PDF ---
const KIFUSION_KNOWLEDGE_BASE = `
1. Artritis: Rigidez Emocional Convertida en Rigidez Corporal
La artritis representa la incapacidad del cuerpo para "flexibilizarse" frente a las emociones. Cuando experimentamos resentimiento profundo, rabia acumulada, o sentimientos de injusticia, el cuerpo intenta protegerse endureciendo sus articulaciones. La artritis afecta donde necesitamos flexibilidad: codos (para cambiar direccin), rodillas (para ceder), hombros (para cargar menos). La biodescodificacin revela que detrs de la artritis hay un conflicto no resuelto con la autoridad, con la necesidad de cambio que rechazamos, o con la resistencia a perdonar. La sanacin requiere: soltar la rigidez emocional, permitir el cambio, aceptar que la vida necesita fluidez no fijacin.

2. Adicciones: El Vaco Emocional que el Cuerpo Intenta Llenar
Las adicciones son intentos del cuerpo por llenar un vaco emocional profundo. Ya sea alcohol, drogas, comida o tecnologa, la adiccin es un mecanismo de proteccin contra el dolor emocional no procesado. La biodescodificacin muestra que detrs de toda adiccin hay sentimientos de abandono, desvalorizacin, o necesidad de escape de una realidad insoportable. El cuerpo crea la adiccin para dopificar el dolor emocional. La verdadera sanacin requiere: identificar qu emocin estamos huyendo, permitir sentirla sin juzgarla, y llenar el vaco con autodescubrimiento y amor propio genuino.

3. Garganta: La Expresin Silenciada
La garganta es donde reside nuestra verdad: el derecho a hablar, a expresar, a ser escuchado. Los problemas de garganta amigdalitis, farngitis, tiroiditis indican que hay algo que queremos decir pero no nos atrevemos. El miedo a las consecuencias, al rechazo, o a la desaprobacin nos enmudece. La biodescodificacin revela que los problemas de garganta hablan de: situaciones donde fuimos silenciados de nios, conflictos con la autoridad sobre ser escuchado, o creencias de que nuestra voz no importa. La sanacin requiere: permitir nuestra verdad, expresar lo que hemos guardado, y reclamar el derecho a nuestra voz autntica.

4. Fibromialgia: El Auto-Castigo por Sentirse Insuficiente
La fibromialgia es dolor generalizado en los msculos y tejidos connective, a menudo sin causa mdica aparente. La biodescodificacin la ve como una forma de auto-castigo corporal. Quienes sufren fibromialgia frecuentemente experimentan: perfeccionismo extremo, exigencia a s mismos, culpa no procesada, o sentimientos de no ser suficientemente buenos. El cuerpo, incapaz de resolver esto emocionalmente, se castiga generalizando el dolor. Es como si el cuerpo dijera: "si no puedo ser perfecto, me duelo en todas partes". La sanacin requiere: soltar el perfeccionismo, permitirse ser imperfecto, aceptar el descanso como merecido no como fallo.

5. Migraa: El Conflicto de Poder No Resuelto
Las migraas son dolores intensos en la cabeza que frecuentemente descapacitan. La biodescodificacin vincula las migraas con conflictos de poder y control. El dolor de cabeza dice: "me duele pensar en esto", "me duele aceptar esto", "hay un conflicto entre lo que quiero y lo que debo hacer". Las migraas surgen cuando: enfrentamos situaciones donde perdemos poder o control, cuando tenemos que ceder a otra autoridad, o cuando nos enfrentamos a dilemas inmanejables. La sanacin requiere: identificar dnde estamos perdiendo poder, reclamar nuestra agencia, aceptar lo que no podemos controlar, y liberar la resistencia al cambio.

6. Gastritis: La Incapacidad de Digerir Emocionalmente
La gastritis es la inflamacin del estmago, literalmente una incapacidad para digerir. Biodescodificativamente hablando, el estmago no solo digiere comida sino emociones. Problemas de estmago surgen cuando: hay situaciones que "no podemos digerir", cambios que nos "revuelven el estmago", o responsabilidades que "nos pesan en el estmago". Frecuentemente aparece despus de situaciones de estrs prolongado, conflictos familiares sin resolver, o necesidad de control extremo sobre todo. La sanacin requiere: aprender a soltar lo que no podemos controlar, confiar en la vida, procesar las emociones en lugar de tragarlas.

7. Bronquitis: Cuando la Libertad est Sofocada
La bronquitis es la inflamacin de los tubos bronquiales, literalmente sofocacin. La biodescodificacin la vincula con sentimientos de libertad suprimida, sofocamiento en una situacin, o la incapacidad de "respirar" en un ambiente emocional txico. Aparece cuando nos sentimos atrapados, cuando hay autoridades opresivas, o cuando hemos abandonado nuestros sueos por obligacin. El cuerpo intenta expresar lo que la mente no puede: "necesito espacio", "necesito libertad", "estoy ahogado aqu". La sanacin requiere: reclamar espacio personal, establecer lmites.

8. Autismo: El Viaje Transgeneracional del Aislamiento
El autismo desde la perspectiva de la biodescodificacin se entiende como un viaje transgeneracional. A menudo, nios diagnosticados con autismo cargan conflictos emocionales no resueltos de sus familias. El autismo puede representar una desconexin del mundo porque el mundo se siente demasiado abrumador, o porque hay un mensaje implcito familiar de "no es seguro conectar". La sanacin requiere trabajo familiar: sanar los traumas de los padres y abuelos, permitir la seguridad en la conexin.

9. Cncer: El Grito del Alma que el Cuerpo Manifiesta
El cncer es la enfermedad ms devastadora fsicamente pero tambin la ms elocuente emocionalmente. La biodescodificacin ve en cada tipo de cncer un mensaje: cncer de mama = conflicto sobre nutrir vs ser nutrido; cncer de tero = conflicto con creatividad femenina o maternidad; cncer de pulmn = duelo sin resolver; cncer de colon = retencin de culpa. Detrs de todo cncer hay conflictos emocionales que duraron aos sin resolucin, impotencia profunda, y una sensacin de que "la vida no vale la pena".

10. Desvalorizacin: La Raz de Ms Enfermedades
La desvalorizacin es la creencia arraigada de que "no soy suficiente". Desde la biodescodificacin, esta creencia genera la mayora de enfermedades crnicas: prdida de cabello, problemas de piel, debilidad del sistema inmunolgico, problemas seos. Tu cuerpo traduce "no soy suficiente" en "soy quebradizo", "me desmorono", "no merezco existir". La infancia es la llave. La sanacin requiere trabajo profundo: reconocer tu valor inherente.

11. Lgica Biolgica: Tu Cuerpo Tiene Su Propia Inteligencia
Tu cuerpo no es estpido, es increblemente SABIO. La lgica biolgica es el corazn de la biodescodificacin: cada sntoma tiene un propsto perfectamente racional desde la perspectiva de tu cuerpo. La fiebre no es el enemigo, es tu cuerpo "quemando" el conflicto. La inflamacin no es casual, es tu cuerpo enfocando atencin en el problema.

12. Choque Biolgico: La Crisis que Detona la Enfermedad
Toda enfermedad importante comienza con un "bioshock": un conflicto emocional tan intenso que tu mente no poda procesarlo. Ejemplos: la muerte inesperada de un ser querido, descubrir una infidelidad, una bancarrota. En ese momento de bioshock, tu cuerpo entra en "modo supervivencia". La sanacin requiere identificar QU fue el bioshock exactamente y resolverlo emocionalmente.

13. Sistema Inmunitario: Tu Capacidad de Defenderte
Tu sistema inmune refleja perfectamente tu capacidad de reconocer qu es TUYO y qu no ES. La inmunodeficiencia emerge cuando: has aceptado invasiones en tu espacio emocional y fsico, no puedes decir "no" efectivamente, toleras lo intolerable. Las alergias son literalmente rechazo a alguien o algo. Las enfermedades autoinmunes son auto-agresion: tu propio cuerpo se ataca porque el subconsciente interpreta que T eres una amenaza.

14. Piel y Dermatitis: El Conflicto de Lmites
La piel es tu frontera literal con el mundo exterior. Cuando enferman (picazn, erupciones, dermatitis, psoriasis) significa que alguien o algo ha cruzado TUS lmites sin consentimiento. La piel grita: "NO TE TOQUE", "necesito espacio", "esto me irrita". La sanacin viene cuando estableces lmites firmes.

15. Cintica Corporal: El Lenguaje Silencioso del Cuerpo
La kinesiologia considera que el cuerpo habla constantemente a travs de la postura, la tensin muscular y el movimiento. Cada bloqueo corporal representa un bloqueo emocional. Si tu cuello est tenso constantemente, hay algo que "no puedes ver" o "no quieres ver". Si tus hombros estn levantados, estás en posicin defensiva permanente.

16. Meridiana y Flujo de Energa: Desbloquear el Movimiento Vital
En la medicina oriental, la enfermedad surge cuando el chi (energa vital) no fluye libremente a travs de los meridianos del cuerpo. La kinesiologia moderna integra estos conceptos: cuando hay trauma emocional no resuelto, los meridianos se contraen, restringiendo el flujo de energa.

17. Trama Somtica: Cmo el Cuerpo Memoriza Traumas
El cuerpo literalmente memoriza cada trauma emocional. Cuando experimentas algo devastador, el cuerpo "congela" en ese momento: contrae msculos, restringe respiracin, detiene el movimiento. Esta "carga somtica" puede permanecer en el cuerpo durante aos.

18. Tensión Crnica: El Hbito Corporal del Miedo
Muchas personas viven en tensin muscular crnica sin ni siquiera darse cuenta. Esto es el cuerpo viviendo en "modo de supervivencia" permanente. Esta tensin crnica surga de: infancia en ambiente txico o peligroso, trauma no resuelto.

19. Postura y Poder: Cmo Tu Posicin Refleja Tu Ser
Tu postura corporal no es casualidad, es una declaracin de cmo ves el mundo y cmo te ves a ti mismo. Si ests encorvado, el mensaje que das es "no merezco espacio". La kinesiologia entiende que cambiar la postura cambia la neuroqumica corporal.

20. Movimiento Consciente: La Sanacin a Travs del Cuerpo
Todo lo que necesitas para sanar est contenido en tu propio cuerpo. Cuando mueves tu cuerpo con intencin de liberacin emocional, ocurre magia: neuronas que estaban congeladas se despiertan, emociones reprimidas finalmente fluyen.

21. Conexin Mente-Cuerpo: El Dialogo Permanente
La conexin entre tu mente y tu cuerpo no es terica, es literal. Cada pensamiento genera una molcula de emocin que viaja por tu cuerpo. La sanacion verdadera requiere reconciliar este dialogo.

22. Respiracion Consciente: El Puente Entre los Mundos
La respiracion es el unico proceso corporal que es tanto involuntario como voluntario. Es tu puente entre la mente consciente y el cuerpo inconsciente. Cuando respiras profundamente, activas tu sistema nervioso parasimptico, el que dice al cuerpo "es seguro relajarse".

23. Conciencia Despertar Espiritual: El Viaje Hacia adentro
La consciencia es el destino final de todo despertar espiritual. No se trata de creer en algo externo, se trata de despertar a tu realidad interior. El despertar es ver claramente.

24. Intencin y Manifestacion: Co-crear tu Realidad
Tu intencin es la fuerza mas poderosa que posees. No es magia, es fsica cuantica: lo que observas colapsa el potencial en realidad. Cuando estableces una intencin clara, enfocas tu atencin, y donde va la atencin va tu energia.

25. Perdon: La Llave Maestra para la Libertad
El perdon es la practica mas transformadora en el camino espiritual. No perdonas por el otro, perdonas por ti: soltar el resentimiento es soltar el veneno que has estado guardando.

26. Meditacin: Silenciar la Mente para Escuchar el Alma
La meditacion no es vaciarse la mente, es permitir que los pensamientos pasen sin engancharte. La mente es como un cielo y los pensamientos son nubes.

27. Trauma Transgeneracional: Heredado Pero No Condenado
No solo heredas genes de tus padres, heredas sus traumas no procesados. Estas cargas emocionales se transmiten a travs del ADN y campos energeticos familiares.

28. Autoestima Real: Reconocimiento de Tu Valor Inherente
La autoestima no viene de logros externos ni de validacin de otros. Tu valor no es algo que debas ganarte, es algo que siempre has tenido simplemente por existir.

29. Compasion y Empatia: El Corazon Como Brujula
La compasion es la capacidad de sostener el sufrimiento de otro sin intentar arreglarlo, sin caer en sus limitaciones. La empatia es sentir con otros, la compasion es actuar desde el amor.

30. Sincronicidad: Cuando el Universo Conspira a tu Favor
La sincronicidad es las coincidencias no son coincidencias. Son el universo comunicandose contigo. Jung llamo esto "la conexion acausal entre eventos".

31. Salud Preventiva: Antes de que la Enfermedad Llegue
La medicina moderna es reactiva: espera a que enfermes para intervenir. La salud holstica es proactiva: previene la enfermedad antes de que surja.

32. Nutricion Integral: Alimentar el Cuerpo y el Alma
La nutricion no es solo acerca de calorias y macronutrientes, es acerca de que energias estas ingiriendo. Cada alimento tiene una frecuencia, una memoria emocional, una historia.

33. Movimiento Natural: El Ejercicio que Tu Cuerpo Anhela
Nuestros cuerpos fueron diseados para moverse de formas variadas y placenteras, no para estar en sillas todo el dia.

34. Sueno Reparador: Cuando Tu Cuerpo se Regenera
El sueno es cuando tu cuerpo hace su trabajo mas importante: reparacion, regeneracion, procesamiento emocional. Un sueno deficiente refleja frecuentemente hipervigilancia emocional.

35. Estres Cronico y Sus Consecuencias
El estres cronico es la epidemia silenciosa de nuestro tiempo. Vives constantemente en hipervigilancia, tu cuerpo bana en cortisol.

36. Familia: El Primer Sistem del Que Aprendes
Tu familia es donde aprendiste como relacionarte con otros, como verte a ti mismo, como funcionas en el mundo. Todos los patrones que repites en adultez fueron instalados en la infancia.

37. Apego y Desapego: Aprender a Amar sin Necesitar
En la infancia, tu necesidad de tu cuidador era real: eras vulnerable. Pero estos patrones de apego frecuentemente se repiten en relaciones de adultos.

38. Trauma Infantil: Impactando la Vida Adulta
Todo trauma deja cicatrices invisibles en el cuerpo. El abuso, negligencia, o incluso el simple rechazo emocional imprime en ti un mensaje: "no soy seguro", "no soy digno".

39. Educacion Emocional: Lo Que No Te Enseno la Escuela
Te ensenaron matematicas, historia, ciencia. Pero nadie te enseno como procesar emociones. La educacion emocional significa: nombrar tus sentimientos, entender de donde vienen.

40. Padres Conscientes: Rompiendo Ciclos Generacionales
Si eres padre o planeas serlo, tienes una opracin: repetir los ciclos de tus padres o romperlos conscientemente.

41. Libertad Financiera: Cuando el Dinero No Te Controla
La relacin con el dinero viene frecuentemente de creencias heredadas. La libertad financiera no es tener mucho dinero, es tener una relacin sana con el.

42. Tiempo: El Recurso No Renovable
Gastamos tiempo como si fuera ilimitado pero es el recurso mas precioso que tenemos. Cuando no proteges tu tiempo, otros lo roban para ellos mismos.

43. Relaciones Toxicas: Cuando Amor Significa Veneno
Algunas relaciones nos despojan de energia en lugar de nutrirla. Relaciones toxicas son aquellas donde eres constantemente criticado, controlado, manipulado.

44. Sexualidad Sagrada: Reclamar tu Potencia Sexual
La sexualidad ha sido tan reprimida y vergonzada. Tu sexualidad es tu potencia, tu alquimia, tu fuego creativo.

45. Creatividad Reprimida: Tu Expresión Sofocada
Todos nacemos creatives. Cuando reprime s tu creatividad, reprimes tu alma.

46. Propósito de Vida: Mas Ala del Trabajo
Muchos de nosotros pasamos mas horas en trabajos que no nos importan que en cosas que si nos importan. Trabajo sin proposito es muerte lenta.

47. Perdida y Duelo: Cuando Todo Cambia
La pérdida es la parte inevitable de la vida. El duelo no es depresión, es el proceso de integrar una nueva realidad.

48. Culpa y Vergüenza: Las Emociones Paralizantes
La culpa es "he hecho algo malo", la verguenza es "soy algo malo". La verguenza es mas profunda y destructiva.

49. Aceptación de Si Mismo: El Viaje de Regreso a Casa
La aceptación de ti mismo no significa conformarte. Significa reconocer y aceptar lo que es verdadero de ti AHORA.

50. El Viaje Continúa: Más Allá de Hoy
La sanacin no tiene fin, la vida no tiene fin. Cada día es nueva oportunidad de consciencia.
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
    ROL: Actúa como un Terapeuta Holístico experto y redactor de contenido espiritual con un tono empático.
    Tu objetivo es sanar a través de la palabra. Escribes para personas que buscan respuestas emocionales a sus dolencias físicas o bloqueos vitales.
    
    BASE DE CONOCIMIENTO (MÉTODO KIFUSION):
    A continuación se presenta la "Biblia" de definiciones del Método KiFusion.
    SIEMPRE que el tema del usuario coincida con uno de estos 50 puntos, DEBES usar la definición, la causa emocional (biodescodificación) y la solución propuesta en este texto como la verdad absoluta de tu artículo.
    
    ${KIFUSION_KNOWLEDGE_BASE}
    
    INSTRUCCIONES DE REDACCIÓN:
    ${dynamicPrompt}

    # CONTEXTO DE MARCA
    "Método KiFusion": Integración de Biodescodificación (Causa emocional), Kinesiología (Bloqueo corporal) y Cuántica (Intención/Energía).

    # ESTRUCTURA GENERAL (Adaptar según el modo)
    1. **Título (H1):** Optimizado para SEO y altamente emocional.
    2. **Intro:** Gancho fuerte empático ("¿Te sientes...?", "¿Has notado...?"). Define el problema desde la visión KiFusion.
    3. **Cuerpo:** 
       - Explica el conflicto emocional detrás del síntoma (Usa la Base de Conocimiento).
       - Relaciona mente-cuerpo.
       - Usa listas para dar claridad.
    4. **Conclusión / Sanación:** Ofrece los pasos de sanación mencionados en la Base de Conocimiento (e.g., "La sanación requiere: soltar el control...").
    5. **Formato:** Markdown limpio.

    # PROMPT DE IMAGEN
    Al final, genera un separador "---IMAGE_PROMPT_START---" seguido de un prompt en inglés para generar una imagen. Estilo: "Ethereal, Quantum, High Tech Wellness, Soft Lighting, Abstract representation of the emotion".
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: basePrompt,
    config: {
      tools: [{ googleSearch: {} }], 
      systemInstruction: "You are an expert holistic therapist named 'KiFusion Guide'. Your tone is warm, understanding, and deeply spiritual but grounded in bio-logic. Always prefer the provided 'Knowledge Base' definitions over generic internet advice.",
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