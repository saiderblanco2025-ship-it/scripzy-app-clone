/**
 * Script Lab - YouTube Script Generation Interface
 * 
 * Main component for the Scripzy.app Script Lab where creators can:
 * - Generate long-form YouTube scripts using the chained prompt pipeline
 * - Select presets and customize generation parameters
 * - View real-time progress of script generation
 * - Preview and export completed scripts
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  generateScriptStreaming, 
  type GeneratedScript,
  type ScriptOutline,
  type SeoVariants
} from "@/lib/script-engine";
import { 
  Button, 
  Input, 
  Select, 
  SelectTrigger, 
  SelectContent, 
  SelectItem, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Alert, 
  AlertTitle, 
  ProgressRing, 
  Loader2,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormLabel,
  FormDescription,
  FormField,
  useFormStatus,
} from "@/components/ui";
import { 
  lucideMenu, 
  lucideFileText, 
  lucideZap, 
  lucideLoader,
  lucideAlertCircle,
  lucideArrowDown,
  lucideRefreshCcw,
} from "lucide-react";
import { useSupabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * ScriptLab Component
 * Main interface for script generation with real-time streaming updates
 */
export default function ScriptLab() {
  // State management
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("en");
  const [tone, setTone] = useState("engaging");
  const [targetAudience, setTargetAudience] = useState("content creators");
  const [forbiddenWords, setForbiddenWords] = useState<string[]>([]);
  const [presetId, setPresetId] = useState<string | undefined>(undefined);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // SEO state
  const [seoTitles, setSeoTitles] = useState<string[]>([]);
  const [seoDescription, setSeoDescription] = useState("");
  const [seoTags, setSeoTags] = useState<string[]>([]);
  
  // Supabase integration
  const { supabase, user } = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch presets from Supabase if user is authenticated
  useEffect(() => {
    // Presets would be loaded here from Supabase
  }, [user]);

  // Handle script generation with streaming
  const handleGenerate = useCallback(async (
    topic: string,
    language: string,
    tone: string,
    targetAudience: string,
    forbiddenWords: string[]
  ) => {
    if (!topic.trim()) {
      alert("Please enter a topic for your script");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setScript(null);
    setSeoTitles([]);
    setSeoDescription("");
    setSeoTags([]);

    try {
      // Call the streaming generation pipeline
      const result = await generateScriptStreaming(
        topic,
        language,
        tone,
        targetAudience,
        forbiddenWords,
        (chunk: string, phase: number) => {
          // Update progress based on chunk and phase
          const phaseProgress = phase * 25; // 4 phases = 100%
          setProgress(Math.min(100, phaseProgress + 15));
          console.log(`[Phase ${phase}] ${chunk.trim()}`);
        }
      );

      setScript(result);
      setProgress(100);
      setSeoTitles(result.seo?.titles || []);
      setSeoDescription(result.seo?.description || "");
      setSeoTags(result.seo?.tags || []);

      // TODO: Save script to Supabase
      // await supabase.from("scripts").insert({ ...result, user_id: user?.id });

    } catch (error) {
      console.error("Generation failed:", error);
      alert(
        "Failed to generate script. Please try again or check the console for details."
      );
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Handle SEO variants change
  const handleSeoSelect = useCallback((title: string) => {
    // User selected a title variant - could pre-fill the script title
    console.log("Selected SEO title:", title);
  }, []);

  // Format progress as percentage string
  const progressText = `${progress}% complete`;

  // Format word count
  const wordCount = script?.word_count > 0 
    ? `${script.word_count.toLocaleString()} words` 
    : "0 words";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tighter">
            Script Lab
          </h1>
          <Button 
            variant="outline" 
            onClick={() => router.refresh()}
            className="hidden sm:block"
          >
            ↻ Refresh
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        
        {/* Generation Form */}
        <div className="mb-6 rounded-lg border-border/50 bg-card/80 p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <lucideMenu className="h-5 w-5" /> Generate YouTube Script
          </h2>
          
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleGenerate(topic, language, tone, targetAudience, forbiddenWords);
          }}>
            
            {/* Topic Input */}
            <FormField>
              <FormLabel>Video Topic</FormLabel>
              <FormControl>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter your video topic or title"
                  disabled={isGenerating}
                />
              </FormControl>
              <FormDescription>
                Enter the topic or title of your YouTube video. This will be the basis for the script generation.
              </FormDescription>
            </FormField>

            {/* Language Selector */}
            <FormField className="grid grid-cols-2 gap-4">
              <FormField>
                <FormLabel>Language</FormLabel>
                <FormControl>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormField>

              <FormField>
                <FormLabel>Tone</FormLabel>
                <FormControl>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engaging">Engaging</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                      <SelectItem value="entertaining">Entertaining</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormField>
            </FormField>

            {/* Target Audience */}
            <FormField>
              <FormLabel>Target Audience</FormLabel>
              <FormControl>
                <Input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., beginner programmers, small business owners"
                  disabled={isGenerating}
                />
              </FormControl>
              <FormDescription>
                Describe your target audience to tailor the script's approach and complexity.
              </FormDescription>
            </FormField>

            {/* Forbidden Words */}
            <FormField>
              <FormLabel>Forbidden Words (comma-separated)</FormLabel>
              <FormControl>
                <Input
                  value={forbiddenWords.join(", ")}
                  onChange={(e) => {
                    const words = e.target.value
                      .split(",")
                      .map((w: string) => w.trim())
                      .filter((w: string) => w.length > 0);
                    setForbiddenWords(words);
                  }}
                  placeholder="taboo, banned, prohibited"
                  disabled={isGenerating}
                />
              </FormControl>
              <FormDescription>
                Enter words or phrases to avoid in the generated script (comma-separated).
              </FormDescription>
            </FormField>

            {/* Preset Selector */}
            <FormField>
              <FormLabel>Saved Preset</FormLabel>
              <FormControl disabled={isGenerating}>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Presets would be loaded from Supabase */}
                    <SelectItem value="">None</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormField>

            {/* Generate Button */}
            <div className="mt-6 flex gap-3">
              <Button
                type="submit"
                disabled={isGenerating || !topic.trim()}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 me-2" />
                    Generating...
                  </>
                ) : (
                  "Generate Script"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Reset form
                  setTopic("");
                  setLanguage("en");
                  setTone("engaging");
                  setTargetAudience("content creators");
                  setForbiddenWords([]);
                  setProgress(0);
                  setScript(null);
                  setSeoTitles([]);
                  setSeoDescription("");
                  setSeoTags([]);
                }}
                disabled={isGenerating}
              >
                Reset
              </Button>
            </div>
          </Form>
        </div>

        {/* Progress Indicator */}
        {isGenerating && progress > 0 && (
          <div className="mb-4">
            <ProgressRing size={24} className="mr-2" />
            <span className="text-sm text-muted-foreground">
              {progressText}
            </span>
          </div>
        )}

        {/* Generated Script Preview */}
        {script && !isGenerating && (
          <div className="mt-8 rounded-lg border border-border/50 bg-card/80 p-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {script.title}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPreview(!showPreview)}
                    className="ml-auto flex items-center"
                  >
                    {showPreview ? "✕" : "⚙️"}
                  </Button>
                </CardTitle>
              </CardHeader>
              
              {/* SEO Section */}
              {script.seo && (
                <CardContent className="space-y-4">
                  <h3 className="font-medium mb-3 text-sm text-muted-foreground">SEO Variants</h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {script.seo.titles.map((title, index) => (
                      <div
                        key={index}
                        className {
                          "border rounded-lg p-3 flex items-center gap-2 " +
                          (index === 0 ? "border-primary/30 bg-primary/5" : "text-sm")
                        }
                      >
                        <span className="flex-1 truncate">{title}</span>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{script.seo.description}</p>
                  
                  <div>
                    <span className="text-xs text-muted-foreground">Tags: </span>
                    {script.seo.tags.slice(0, 8).map((tag, i) => (
                      <span key={i} className="mx-1 text-capitalize text-xs italic">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              )}

              {/* Script Body Preview */}
              <CardContent className="pt-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {script.body.substring(0, 300)}...
                </p>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPreview(true)}
                  className="mt-2 text-primary hover:text-primary-foreground"
                >
                  View Full Script
                </Button>
              </CardContent>
              
              {/* Visual Cues Summary */}
              {script.visual_cues && script.visual_cues.length > 0 && (
                <CardContent className="pt-4">
                  <h3 className="font-medium mb-3 text-sm text-muted-foreground">
                    Visual Cues ({script.visual_cues.length})
                  </h3>
                  <div className="space-y-2 text-xs">
                    {script.visual_cues.slice(0, 3).map((cue, i) => (
                      <div key={i} className="p-2 rounded bg-primary/5 text-primary">
                        <span className="font-medium">{cue.timestamp}</span>: {cue.description}
                      </div>
                    ))}
                    {script.visual_cues.length > 3 && (
                      <div className="text-primary/50 text-xs">
                        +{script.visual_cues.length - 3} more
                      </div>
                    )}
                  </div>
                </CardContent>
              )}

              {/* Action Buttons */}
              <CardContent className="pt-4 flex gap-3">
                <Button
                  onClick={() => {
                    // TODO: Export script
                    console.log("Export script:", script.id);
                  }}
                  className="flex-1"
                >
                  <lucideFileText className="h-4 w-4 mr-2" /> Export
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // TODO: Save to presets
                    console.log("Save to presets");
                  }}
                >
                  <lucideZap className="h-4 w-4 mr-2" /> Save Preset
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty state or preview dialog */}
        {showPreview && script && (
          <Dialog open={true} onOpenChange={(open) => setShowPreview(!open)}>
            <DialogTrigger asChild>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{script.title}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Outline */}
                  <div>
                    <h4 className="font-medium">Script Outline</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>
                        <strong>Hook:</strong> {script.outline?.hook}
                      </li>
                      <li>
                        <strong>Retention Points:</strong> 
                        {script.outline?.retention_points?.map((p: string) => `• ${p}`).join("\n")}
                      </li>
                      <li>
                        <strong>Climax:</strong> {script.outline?.climax}
                      </li>
                      <li>
                        <strong>CTA:</strong> {script.outline?.cta}
                      </li>
                    </ul>
                  </div>

                  {/* SEO Section in Dialog */}
                  {script.seo && (
                    <div>
                      <h4 className="font-medium">SEO Variants</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {script.seo.titles.map((title, i) => (
                          <div key={i} className="p-2 rounded bg-muted">
                            <strong>Title {i + 1}:</strong> {title}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs mt-2">{script.seo.description}</p>
                    </div>
                  )}

                  {/* Full Script Body */}
                  <div>
                    <h4 className="font-medium">Full Script</h4>
                    <pre 
                      className="bg-muted/50 p-4 rounded overflow-x-auto text-xs"
                    >
                      {script.body}
                    </pre>
                  </div>

                  {/* Visual Cues */}
                  {script.visual_cues && script.visual_cues.length > 0 && (
                    <div>
                      <h4 className="font-medium">Visual Cues</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {script.visual_cues.map((cue, i) => (
                          <li key={i}>
                            <span className="font-medium">{cue.timestamp}</span>: 
                            {cue.b_roll} | {cue.sfx}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 pt-6">
                  <Button
                    onClick={() => setShowPreview(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </DialogContent>
            </DialogTrigger>
          </Dialog>
        )}
      </main>
    </div>
  );
}

/**
 * Helper component for script generation status display
 */
function useScriptGenerationStatus(
  isGenerating: boolean,
  progress: number
) {
  const status = isGenerating ? `${progress}% generating` : "Ready";
  return status;
}