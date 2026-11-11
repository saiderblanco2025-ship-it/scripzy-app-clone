import { NextResponse } from "next/server";
import { generateScriptStreaming } from "@/lib/script-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tipos para la petición
interface GenerateScriptRequest {
  topic: string;
  language?: string;
  tone?: string;
  targetAudience?: string;
  forbiddenWords?: string[];
  presetId?: string;
}

/**
 * POST /api/generate-script
 *
 * Chained Prompt Runner para guiones largos de YouTube.
 * Fases: 1) Outline 2) SEO 3) Secciones con cues 4) Ensamblado
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      topic,
      language = "es",
      tone = "engaging",
      targetAudience = "creadores de contenido",
      forbiddenWords = [],
      presetId,
    } = body as GenerateScriptRequest;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "El campo 'topic' es obligatorio y debe ser texto" },
        { status: 400 }
      );
    }

    // Logging de progreso en el servidor
    const onChunk = (chunk: string, phase: number) => {
      console.log(`[Fase ${phase}] ${chunk.trim()}`);
    };

    const script = await generateScriptStreaming(
      topic,
      language,
      tone,
      targetAudience,
      forbiddenWords,
      onChunk
    );

    return NextResponse.json({
      script,
      progress: 100,
      message: "Guion generado correctamente",
    });
  } catch (error) {
    console.error("Error generando guion:", error);
    return NextResponse.json(
      {
        error: "Error al generar el guion",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate-script - Health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "script-generation",
    pipeline: "chained-prompt-runner",
    version: "0.1.0",
  });
}