/**
 * Home Page - Scripzy.app
 * 
 * Landing page with feature highlights and navigation to key modules.
 */
import { Button } from "@/componentsui/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/componentsui/ui/card";
import { useSupabase } from "@/lib/supabase";

export default function HomePage() {
  const { user } = useSupabase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <header className="relative py-20 md:py-24 bg-gradient-to-b from-violet-950 via-blue-950 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Unleash Your YouTube Potential
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Create compelling, faceless YouTube channels with AI-powered scripts,
            automated thumbnails, and data-driven niche research.
          </p>
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 max-w-md mx-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                // Navigate to script lab
                window.location.href = "/script-lab";
              }}
            >
              Start Creating Scripts
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                // Navigate to pricing/billing
                window.location.href = "/billing";
              }}
            >
              View Plans
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Script Generation Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-primary"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v..."></path>
                  </svg>
                  AI Script Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate long-form YouTube scripts using our chained prompt pipeline.
                  From outlines to full content with SEO optimization and visual cues.
                </p>
              </CardContent>
            </Card>

            {/* Thumbnail Studio Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-primary"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L2 7l..."></path>
                  </svg>
                  Thumbnail Studio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate AI thumbnails using Flux/Replicate models. 16:9 aspect ratio
                  with automatic Supabase Storage integration.
                </p>
              </CardContent>
            </Card>

            {/* Niche Finder Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-primary"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L2 7l..."></path>
                  </svg>
                  Niche Finder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Discover profitable YouTube niches with RPM estimates, search volume,
                  and faceless-friendliness scoring.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-violet-500/10 via-blue-500/10 to-indigo-500/10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to grow your channel?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of creators using AI to automate their YouTube success.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              window.location.href = "/script-lab";
            }}
          >
            Generate Your First Script
          </Button>
        </div>
      </section>
    </div>
  );
}