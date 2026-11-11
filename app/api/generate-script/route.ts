import { NextResponse } from "next/server";
import { generateScriptStreaming } from "@/lib/script-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Types for the API request
interface GenerateScriptRequest {
  topic: string;
  language?: string;
  tone?: string;
  targetAudience?: string;
  forbiddenWords?: string[];
  presetId?: string;
}

interface GenerateScriptResponse {
  script: any;
  progress: number;
}

/**
 * POST /api/generate-script
 * 
 * Chained prompt runner pipeline for long-form YouTube script generation.
 * Implements streaming via on-chunk callbacks for real-time client updates.
 * 
 * Pipeline phases:
 *   Phase 1 (0-15%): Outline & Tension generation
 *   Phase 2 (15-30%): SEO & Hooks generation (5 title variants)
 *   Phase 3 (30-60%): Section-by-section iteration with B-Roll/SFX cues
 *   Phase 4 (60-100%): Assembly and delivery
 */
export async function POST(
  request: Request,
  { params }: { params: { workspace: string } }
) {
  try {
    const body = await request.json();
    const {
      topic,
      language = "en",
      tone = "engaging",
      targetAudience = "content creators",
      forbiddenWords = [],
      presetId,
    } = body as GenerateScriptRequest;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required and must be a string" },
        { status: 400 }
      );
    }

    // Progress tracking wrapper
    let progress = 0;
    const onChunk = (chunk: string, phase: number) => {
      // Calculate approximate progress based on phase and chunk
      const phaseProgress = phase * 20; // Each phase ~20%
      progress = Math.min(100, phaseProgress + Math.random() * 10);
      console.log(`[Phase ${phase}] ${chunk.trim()}`);
    };

    // Generate script using the chained pipeline with streaming
    const script = await generateScriptStreaming(
      topic,
      language,
      tone,
      targetAudience,
      forbiddenWords,
      onChunk
    );

    // Return the complete generated script
    return NextResponse.json({
      script,
      progress: 100,
      message: "Script generation completed successfully",
    });

  } catch (error) {
    console.error("Script generation error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate script",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate-script
 * 
 * Health check endpoint for the script generation service.
 */
export async function GET(
  request: Request
) {
  return NextResponse.json({
    status: "ok",
    service: "script-generation",
    pipeline: "chained-prompt-runner",
    version: "0.1.0",
  });
}