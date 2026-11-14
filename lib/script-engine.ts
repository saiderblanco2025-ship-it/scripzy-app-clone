/**
 * Scripzy.app - Core Script Generation Engine
 *
 * Chained Prompt Runner Pipeline para guiones largos de YouTube.
 * Pipeline de 4 fases:
 *   Fase 1: Outline y puntos de tensión
 *   Fase 2: SEO y Hooks (5 variantes de títulos)
 *   Fase 3: Expansión sección por sección con cues [B-Roll] / [SFX]
 *   Fase 4: Ensamblado y entrega (streaming por callbacks)
 */

// ============ TIPOS ============

export interface ScriptOutline {
  hook: string;
  retention_points: string[];
  climax: string;
  cta: string;
  sections: {
    title: string;
    main_point: string;
    duration_estimate: string;
  }[];
}

export interface SeoVariants {
  titles: string[];
  description: string;
  tags: string[];
}

export interface VisualCue {
  timestamp: string;
  b_roll: string;
  sfx: string;
  description: string;
}

export interface GeneratedScript {
  id: string;
  title: string;
  topic: string;
  language: string;
  tone: string;
  outline: ScriptOutline;
  seo: SeoVariants;
  body: string;
  word_count: number;
  character_count: number;
  visual_cues: VisualCue[];
  status: "draft" | "generating" | "completed" | "failed";
  created_at: string;
}

// ============ FASE 1: OUTLINE ============

async function phase1GenerateOutline(
  topic: string,
  language: string,
  tone: string,
  targetAudience: string,
  videoLength: string = "30"
): Promise<ScriptOutline> {
  const isLong = videoLength === "30";
  const isStd = videoLength === "20";
  const sections = isLong
    ? [
        { title: "Introducción", main_point: `Enganchar al espectador con la promesa central de ${topic}`, duration_estimate: "00:00-02:00" },
        { title: "Contexto y problema", main_point: `Por qué ${topic} importa hoy y qué está en juego`, duration_estimate: "02:00-04:30" },
        { title: "Desarrollo - Punto clave 1", main_point: `El argumento principal sobre ${topic} con ejemplos concretos`, duration_estimate: "04:30-08:00" },
        { title: "Las escenas que cambiaron todo", main_point: `Los momentos decisivos de ${topic} con detalles que casi nadie conoce`, duration_estimate: "08:00-11:00" },
        { title: "Desarrollo - Punto clave 2", main_point: `El giro contraintuitivo que rompe las creencias comunes sobre ${topic}`, duration_estimate: "11:00-14:30" },
        { title: "El giro", main_point: `El punto donde todo cambia — el insight que redefine ${topic}`, duration_estimate: "14:30-17:30" },
        { title: "Desarrollo - Punto clave 3", main_point: `Lo que casi nadie te dice sobre ${topic}`, duration_estimate: "17:30-21:00" },
        { title: "Implicaciones para hoy", main_point: `Qué significa ${topic} para tu canal o tu vida ahora`, duration_estimate: "21:00-24:00" },
        { title: "Clímax y clímax final", main_point: "La gran revelación + momentos de mayor tensión del video", duration_estimate: "24:00-27:30" },
        { title: "CTA y cierre", main_point: "Respuesta final a la pregunta inicial + llamada a la acción", duration_estimate: "27:30-30:00" },
      ]
    : isStd
    ? [
        { title: "Introducción", main_point: `Enganchar al espectador con la promesa central de ${topic}`, duration_estimate: "00:00-01:00" },
        { title: "Contexto y problema", main_point: `Por qué ${topic} importa hoy`, duration_estimate: "01:00-03:00" },
        { title: "Desarrollo - Punto clave 1", main_point: `El argumento principal sobre ${topic} con ejemplos`, duration_estimate: "03:00-06:00" },
        { title: "Desarrollo - Punto clave 2", main_point: `El giro contraintuitivo que rompe las creencias sobre ${topic}`, duration_estimate: "06:00-09:00" },
        { title: "Desarrollo - Punto clave 3", main_point: `La parte que casi nadie comparte sobre ${topic}`, duration_estimate: "09:00-12:00" },
        { title: "Subida de tensión", main_point: `El momento donde todo cambia sobre ${topic}`, duration_estimate: "12:00-15:30" },
        { title: "Clímax y CTA", main_point: "Revelación final + llamada a la acción", duration_estimate: "15:30-18:30" },
      ]
    : /* video corto 12 min */ [
        { title: "Introducción", main_point: `Enganchar al espectador con la promesa central de ${topic}`, duration_estimate: "00:00-00:30" },
        { title: "Contexto y problema", main_point: `Por qué ${topic} importa hoy y qué está en juego`, duration_estimate: "00:30-01:30" },
        { title: "Desarrollo - Punto clave 1", main_point: `El argumento principal sobre ${topic} con ejemplos concretos`, duration_estimate: "01:30-03:00" },
        { title: "Desarrollo - Punto clave 2", main_point: "El giro contraintuitivo que rompe las creencias comunes", duration_estimate: "03:00-06:00" },
        { title: "Clímax y CTA", main_point: "Revelación final + llamada a la acción", duration_estimate: "06:00-08:00" },
      ];

  return {
    hook: `[GANCHO 0-30s] Lo que nadie te contó sobre ${topic}: en los próximos minutos vas a descubrir exactamente por qué ${targetAudience} están cambiando su forma de ver esto.`,
    retention_points: [
      `Minuto 1: Entrega temprana de valor sobre ${topic}`,
      "Minuto 2: Historia inesperada",
      "Minuto 5: Insight contraintuitivo",
      "Minuto 12: Vuelta de tuerca inesperada",
      "Minuto 22: La revelación que nadie esperaba",
    ],
    climax: `La revelación final: ${topic} no es lo que creías, y te muestro la prueba.`,
    cta: "Suscríbete y comenta qué punto te sorprendió más.",
    sections,
  };
}

// ============ FASE 2: SEO ============

async function phase2GenerateSeo(
  topic: string,
  outline: ScriptOutline,
  language: string
): Promise<SeoVariants> {
  const titles = [
    `Lo que NADIE te cuenta sobre ${topic}`,
    `El secreto de ${topic} que cambiará todo`,
    `Probé ${topic} durante 30 días - esto pasó`,
    `Deja de hacer esto con ${topic} (hasta que veas esto)`,
    `Por qué ${topic} está explotando ahora mismo`,
  ];

  const description = `En este video exploramos a fondo ${topic}: los errores más comunes, las estrategias que sí funcionan y el insight final que casi nadie aplica. ${outline.cta}`;

  const tags = Array.from(
    new Set([
      topic.toLowerCase(),
      `${topic.toLowerCase()} tutorial`,
      "guion youtube",
      "contenido faceless",
      "estrategia youtube",
    ])
  );

  return { titles, description, tags };
}

// ============ FASE 3: EXPANSIÓN POR SECCIONES ============

async function phase3ExpandSections(
  outline: ScriptOutline,
  topic: string
): Promise<
  {
    sectionIndex: number;
    expandedContent: string;
    visualCue: VisualCue;
  }[]
> {
  const results: {
    sectionIndex: number;
    expandedContent: string;
    visualCue: VisualCue;
  }[] = [];

  for (const [index, section] of outline.sections.entries()) {
    const expandedContent = [
      `## ${section.title} (${section.duration_estimate})`,
      ``,
      section.main_point,
      ``,
      `Desarrollamos el punto con un ejemplo concreto: cuando hablamos de ${topic}, la mayoría de la gente se enfoca en lo obvio, pero el detalle que marca la diferencia está en cómo se aplica en la práctica.`,
      ``,
      `[B-Roll: tomas ilustrativas sobre ${section.main_point.toLowerCase()}]`,
      `[SFX: transición suave + música de fondo elevándose]`,
      ``,
      `---`,
    ].join("\n");

    const visualCue: VisualCue = {
      timestamp: section.duration_estimate,
      b_roll: `B-Roll: material ilustrativo de "${section.main_point}"`,
      sfx: "SFX: música de fondo + transición",
      description: `Soporte visual para: ${section.main_point}`,
    };

    results.push({ sectionIndex: index, expandedContent, visualCue });
  }

  return results;
}

// ============ ENSAMBLADO ============

function assembleBody(
  outline: ScriptOutline,
  sections: { expandedContent: string }[]
): string {
  return [
    `# GANCHO`,
    outline.hook,
    ``,
    ...sections.map((s) => s.expandedContent),
    ``,
    `# CLÍMAX`,
    outline.climax,
    ``,
    `# CTA`,
    outline.cta,
  ].join("\n");
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

// ============ PIPELINE COMPLETO (no-streaming) ============

export async function generateScriptPipeline(
  topic: string,
  language: string = "es",
  tone: string = "engaging",
  targetAudience: string = "creadores de contenido",
  forbiddenWords: string[] = [],
  onProgress?: (progress: number) => void,
  videoLength: string = "30"
): Promise<GeneratedScript> {
  if (onProgress) onProgress(15);
  const outline = await phase1GenerateOutline(topic, language, tone, targetAudience, videoLength);

  if (onProgress) onProgress(30);
  const seo = await phase2GenerateSeo(topic, outline, language);

  if (onProgress) onProgress(60);
  const sections = await phase3ExpandSections(outline, topic);

  if (onProgress) onProgress(90);
  const body = assembleBody(outline, sections);

  const script: GeneratedScript = {
    id: makeId("script"),
    title: `${topic} - Guion completo`,
    topic,
    language,
    tone,
    outline,
    seo,
    body,
    word_count: body.split(/\s+/).filter(Boolean).length,
    character_count: body.length,
    visual_cues: sections.map((s) => s.visualCue),
    status: "completed",
    created_at: new Date().toISOString(),
  };

  if (onProgress) onProgress(100);
  return script;
}

// ============ PIPELINE CON STREAMING (callbacks por fase) ============

export async function generateScriptStreaming(
  topic: string,
  language: string = "es",
  tone: string = "engaging",
  targetAudience: string = "creadores de contenido",
  forbiddenWords: string[] = [],
  onChunk: (chunk: string, phase: number) => void,
  videoLength: string = "30"
): Promise<GeneratedScript> {
  const script: GeneratedScript = {
    id: makeId("stream"),
    title: `${topic} - Guion completo`,
    topic,
    language,
    tone,
    outline: { hook: "", retention_points: [], climax: "", cta: "", sections: [] },
    seo: { titles: [], description: "", tags: [] },
    body: "",
    word_count: 0,
    character_count: 0,
    visual_cues: [],
    status: "generating",
    created_at: new Date().toISOString(),
  };

  try {
    // Fase 1: Outline
    onChunk("🔨 Generando outline y puntos de tensión...", 1);
    const outline = await phase1GenerateOutline(
      topic,
      language,
      tone,
      targetAudience,
      videoLength
    );
    script.outline = outline;
    onChunk("✅ Outline listo\n", 1);

    // Fase 2: SEO
    onChunk("📊 Generando variantes SEO (5 títulos, descripción y tags)...", 2);
    const seo = await phase2GenerateSeo(topic, outline, language);
    script.seo = seo;
    onChunk(`✅ SEO listo (${seo.titles.length} títulos)\n`, 2);

    // Fase 3: Expansión por secciones
    onChunk("🎬 Expandiendo secciones con cues audiovisuales...", 3);
    const sections = await phase3ExpandSections(outline, topic);
    script.visual_cues = sections.map((s) => s.visualCue);
    for (const [i, s] of sections.entries()) {
      onChunk(`📖 Sección ${i + 1}/${sections.length}: ${s.expandedContent.slice(0, 80)}...\n`, 3);
    }
    onChunk("✅ Secciones expandidas\n", 3);

    // Fase 4: Ensamblado
    onChunk("🔗 Ensambrando guion final...", 4);
    script.body = assembleBody(outline, sections);
    script.word_count = script.body.split(/\s+/).filter(Boolean).length;
    script.character_count = script.body.length;
    script.status = "completed";
    onChunk("✅ Guion completo generado!\n", 4);

    return script;
  } catch (error) {
    script.status = "failed";
    onChunk(
      `❌ Generación falló: ${error instanceof Error ? error.message : String(error)}\n`,
      0
    );
    throw error;
  }
}