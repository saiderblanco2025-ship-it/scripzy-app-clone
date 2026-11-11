/**
 * Scripzy.app - Core Script Generation Engine
 * 
 * Chained Prompt Runner Pipeline for long-form YouTube script generation.
 * Implements 4-phase pipeline:
 *   Phase 1: Outline & Tension generation
 *   Phase 2: SEO & Hooks generation (5 title variants)
 *   Phase 3: Section-by-section iteration with B-Roll/SFX cues
 *   Phase 4: Streaming to client via ReadableStream
 */

import {
  AnthropicVertex,
  HfInference,
} from "openai-edge";
import { Buffer } from "buffer";

// Type definitions for the pipeline
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
  outline: ScriptOutline;
  seo: SeoVariants;
  body: string;
  word_count: number;
  visual_cues: VisualCue[];
  status: "draft" | "generating" | "completed" | "failed";
  created_at: Date;
}

/**
 * Phase 1: Generate the script outline and tension points
 */
async function phase1GenerateOutline(
  topic: string,
  language: string,
  tone: string,
  targetAudience: string,
  forbiddenWords: string[]
): Promise<ScriptOutline> {
  // In a real implementation, this would call Anthropic or OpenAI
  // For now, we return a structured placeholder
  return {
    hook: `[Hook generated for ${topic} in ${language}]`,
    retention_points: [
      "Retention point 1: Early value delivery",
      "Retention point 2: Story transition",
      "Retention point 3: Unexpected insight",
    ],
    climax: "The climactic revelation or main takeaway",
    cta: "Subscribe and comment with your thoughts",
    sections: [
      { title: "Introduction", main_point: "Set the stage and hook the viewer", duration_estimate: "00:00-00:30" },
      { title: "Main Content - Point 1", main_point: "First key argument", duration_estimate: "00:30-01:30" },
      { title: "Main Content - Point 2", main_point: "Second key argument", duration_estimate: "01:30-02:30" },
      { title: "Main Content - Point 3", main_point: "Third key argument", duration_estimate: "02:30-03:30" },
      { title: "Climax & CTA", main_point: "Final revelation and call to action", duration_estimate: "03:30-04:00" },
    ],
  };
}

/**
 * Phase 2: Generate SEO variants - 5 title variants, description, and tags
 */
async function phase2GenerateSeo(
  topic: string,
  outline: ScriptOutline,
  language: string
): Promise<SeoVariants> {
  const titles = [
    `You Won't Believe What Happened With ${topic}`,
    "The Secret Most People Miss About ${topic}",
    "Why ${topic} Will Change Everything",
    "My ${topic} Experiment: 30 Days Later",
    "Stop Doing ${topic} Until You Watch This",
  ].map((t) => t.replace("${topic}", topic));

  const description = `In this video, we dive deep into ${topic}. Discover the unexpected insights and game-changing strategies that will transform your approach. Watch until the end for the ultimate CTA!`;

  const tags = [
    topic.toLowerCase(),
    ...new Set(["youtube", "tutorial", "strategy", "analysis"]),
  ];

  return { titles, description, tags };
}

/**
 * Phase 3: Iterate through sections and expand content with visual cues
 */
async function phase3ExpandSections(
  outline: ScriptOutline,
  language: string,
  forbiddenWords: string[]
): Promise<{
  sectionIndex: number;
  expandedContent: string;
  visualCue: VisualCue;
}[]> {
  const results: Array<{
    sectionIndex: number;
    expandedContent: string;
    visualCue: VisualCue;
  }> = [];

  for (const section of outline.sections) {
    // Generate expanded content for each section
    const expandedContent = `[Section: ${section.title}]\n${section.main_point}\n\n[Transition to next section]`;

    // Generate visual cue for this section
    const visualCue: VisualCue = {
      timestamp: section.duration_estimate,
      b_roll: `B-Roll illustrating: ${section.main_point}`,
      sfx: "Background music swell or subtle SFX",
      description: `Visual support for: ${section.main_point}`,
    };

    results.push({
      sectionIndex: results.length,
      expandedContent,
      visualCue,
    });
  }

  return results;
}

/**
 * Phase 4: Stream the generated script to the client
 * Uses ReadableStream and TextEncoder for real-time delivery
 */
function* scriptGenerator(
  phases: AsyncGenerator<any>[]
): AsyncGenerator<string> {
  // Execute phases sequentially, yielding partial results
  for (const phase of phases) {
    const phaseResult = await phase.next();
    if (phaseResult.done) continue;

    const items = phaseResult.value;
    for (const item of items) {
      yield item;
    }
  }
}

/**
 * Main entry point: Run the complete chained prompt pipeline
 * 
 * @param topic The script topic
 * @param language Language code (en, es, fr, etc.)
 * @param tone Tone of the script (engaging, educational, persuasive, entertaining)
 * @param targetAudience Description of the target audience
 * @param forbiddenWords Words to avoid in the script
 * @param onProgress Callback for progress updates (0-100)
 * @returns Promise resolving to the complete GeneratedScript
 */
export async function generateScriptPipeline(
  topic: string,
  language: string = "en",
  tone: string = "engaging",
  targetAudience: string = "content creators",
  forbiddenWords: string[] = [],
  onProgress?: (progress: number) => void
): Promise<GeneratedScript> {
  const scriptId = `script_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 11)}`;
  let currentProgress = 0;

  // Phase 1: Outline generation
  if (onProgress) onProgress((currentProgress = 15));
  const outline = await phase1GenerateOutline(
    topic,
    language,
    tone,
    targetAudience,
    forbiddenWords
  );

  // Phase 2: SEO generation
  if (onProgress) onProgress((currentProgress = 30));
  const seo = await phase2GenerateSeo(topic, outline, language);

  // Phase 3: Section expansion with visual cues
  if (onProgress) onProgress((currentProgress = 50));
  const expandedSections = await phase3ExpandSections(
    outline,
    language,
    forbiddenWords
  );

  // Phase 4: Assemble final script
  if (onProgress) onProgress((currentProgress = 70));

  // Build the full body content from expanded sections
  const bodyChunks = expandedSections.map(
    (s) => s.expandedContent
  ).join("\n\n");

  const fullBody = `
${outline.hook}

${bodyChunks}

${outline.climax}

${outline.cta}
`.trim();

  // Count approximate words
  const wordCount = fullBody.split(/\s+/).filter((w) => w.length > 0).length;

  // Build visual cues array
  const visualCues = expandedSections.map((s) => s.visualCue);

  const script: GeneratedScript = {
    id: scriptId,
    title: `${topic} - Complete Guide`,
    outline,
    seo,
    body: fullBody,
    word_count: fullBody,
    visual_cues: visualCues,
    status: "completed",
    created_at: new Date(),
  };

  if (onProgress) onProgress(100);

  return script;
}

/**
 * Streamed generation for real-time client updates
 * 
 * @param topic The script topic
 * @param language Language code
 * @param tone Tone of the script
 * @param targetAudience Target audience description
 * @param forbiddenWords Words to avoid
 * @param onChunk Callback for each chunk of generated content
 * @returns Promise resolving to the complete GeneratedScript
 */
export async function generateScriptStreaming(
  topic: string,
  language: string = "en",
  tone: string = "engaging",
  targetAudience: string = "content creators",
  forbiddenWords: string[] = [],
  onChunk: (chunk: string, phase: number) => void
): Promise<GeneratedScript> {
  const scriptId = `stream_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 11)}`;
  const script: GeneratedScript = {
    id: scriptId,
    title: `${topic} - Streaming Guide`,
    outline: {} as ScriptOutline,
    seo: {} as SeoVariants,
    body: "",
    word_count: 0,
    visual_cues: [],
    status: "generating",
    created_at: new Date(),
  };

  try {
    // Phase 1: Outline
    onChunk("🔨 Generating script outline...", 1);
    const outline = await phase1GenerateOutline(
      topic,
      language,
      tone,
      targetAudience,
      forbiddenWords
    );
    script.outline = outline;
    onChunk("✅ Outline generated\n", 1);

    // Phase 2: SEO
    onChunk("📊 Generating SEO variants and title options...", 2);
    const seo = await phase2GenerateSeo(topic, outline, language);
    script.seo = seo;
    onChunk("📝 SEO variants ready\n", 2);

    // Phase 3: Section expansion
    onChunk("🎬 Expanding sections with visual cues...", 3);
    const expandedSections = await phase3ExpandSections(
      outline,
      language,
      forbiddenWords
    );
    script.visual_cues = expandedSections.map((s) => s.visualCue);

    // Yield each section as it's generated
    for (let i = 0; i < expandedSections.length; i++) {
      onChunk(
        `📖 Section ${i + 1}/${expandedSections.length}: ${expandedSections[i].expandedContent.substring(
          0,
          100
        )}...\n`,
        3
      );
    }
    onChunk("✅ All sections expanded\n", 3);

    // Assemble final body
    onChunk("🔗 Assembling final script body...", 4);
    const bodyChunks = expandedSections.map(
      (s) => s.expandedContent
    ).join("\n\n");

    script.body = `
${outline.hook}

${bodyChunks}

${outline.climax}

${outline.cta}
`.trim();
    script.word_count = script.body.split(/\s+/).filter((w) => w.length > 0).length;
    script.status = "completed";

    onChunk("✅ Script generation complete!\n", 4);

    return script;
  } catch (error) {
    script.status = "failed";
    onChunk(`❌ Generation failed: ${error instanceof Error ? error.message : String(error)}\n`, 0);
    throw error;
  }
}

export type {
  ScriptOutline,
  SeoVariants,
  VisualCue,
  GeneratedScript,
}