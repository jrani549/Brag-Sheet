import { useState, useCallback, useRef } from "react";
import { useGenerateProfile } from "@workspace/api-client-react";
import type { CareerProfile } from "@workspace/api-client-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  BarChart3,
  Briefcase,
  MessageSquare,
  Share2,
  Zap,
  Bot,
  ArrowRight,
  Star,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += pageText + "\n\n";
  }
  return fullText.trim();
}

interface UploadScreenProps {
  onGenerateStart: () => void;
  onGenerateSuccess: (profile: CareerProfile) => void;
}

const SAMPLE_RESUME = `Marcus Chen
Full Stack Engineer & DevOps Lead | San Francisco, CA
Stanford University B.S. Computer Science

Summary: Full Stack Engineer with 6 years building scalable SaaS products. Led engineering teams at two Series B startups. Passionate about developer tooling, Kubernetes, and shipping products users love.

Experience:
ShipFast (YC W21) | Senior Software Engineer | 2022–Present
- Architected microservices platform handling 50M+ API requests per day
- Reduced CI/CD pipeline time from 18 min to 4 min, saving $80K/year in compute
- Mentored team of 8 engineers across 3 time zones

StrideHQ | Full Stack Engineer | 2020–2022
- Built real-time collaboration features using WebSockets serving 200K users
- Migrated monolith to microservices with zero downtime
- Increased test coverage from 12% to 87%

Freelance | Web Developer | 2018–2020
- Delivered 15+ client projects using React and Node.js

Skills: TypeScript React Node.js Go Python Kubernetes Docker PostgreSQL Redis GraphQL AWS Terraform

Projects:
1. OpenDeploy — Open-source Kubernetes deployment CLI with 2.4K GitHub stars
2. ResumeAI — AI-powered resume optimizer, won 1st place at 48hr hackathon
3. PulseBoard — Real-time engineering metrics dashboard used by 500+ teams

Certifications:
- AWS Solutions Architect Professional
- Certified Kubernetes Administrator (CKA)
- Google Cloud Professional Developer

GitHub: github.com/marcuschen-dev
LinkedIn: linkedin.com/in/marcuschen
Email: marcus@marcuschen.dev`;

export function UploadScreen({ onGenerateStart, onGenerateSuccess }: UploadScreenProps) {
  const [resumeText, setResumeText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processFile = useCallback(async (file: File) => {
    const name = file.name.toLowerCase();
    setIsParsing(true);
    try {
      if (name.endsWith(".pdf") || file.type === "application/pdf") {
        const text = await extractTextFromPdf(file);
        if (!text) {
          toast({
            title: "No text found in PDF",
            description: "This PDF may be scanned/image-based. Try pasting the text instead.",
            variant: "destructive",
          });
          return;
        }
        setResumeText(text);
        toast({ title: "PDF loaded", description: `${file.name} parsed successfully.` });
      } else if (name.endsWith(".txt") || file.type === "text/plain") {
        const text = await file.text();
        setResumeText(text);
        toast({ title: "File loaded", description: `${file.name} loaded successfully.` });
      } else {
        toast({
          title: "Unsupported file",
          description: "Please upload a .pdf or .txt file, or paste your resume directly.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Could not read file",
        description: err instanceof Error ? err.message : "Try pasting your resume directly instead.",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  }, [toast]);

  const { mutate, isPending } = useGenerateProfile({
    mutation: {
      onSuccess: (profile: CareerProfile) => {
        onGenerateSuccess(profile);
      },
      onError: () => {
        toast({
          title: "Generation failed",
          description: "There was an error analyzing your resume. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const handleGenerate = () => {
    if (!resumeText.trim()) {
      toast({
        title: "Resume required",
        description: "Please paste your resume or load the sample first.",
        variant: "destructive",
      });
      return;
    }
    onGenerateStart();
    mutate({ data: { resume: resumeText } });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }, [processFile]);

  const features = [
    { icon: BarChart3, label: "Animated skill graphs", color: "from-violet-500 to-fuchsia-500" },
    { icon: Briefcase, label: "Project showcase", color: "from-blue-500 to-cyan-500" },
    { icon: MessageSquare, label: "Contact card", color: "from-emerald-500 to-teal-500" },
    { icon: Bot, label: "AI recruiter chatbot", color: "from-orange-500 to-amber-500" },
    { icon: Share2, label: "Export & share", color: "from-pink-500 to-rose-500" },
  ];

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-fuchsia-500/15 via-pink-500/10 to-transparent blur-3xl animate-pulse" style={{ animationDuration: "10s", animationDelay: "2s" }} />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent blur-3xl animate-pulse" style={{ animationDuration: "12s", animationDelay: "4s" }} />
      </div>

      <header className="border-b border-border/40 py-4 px-6 flex items-center justify-between bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 sticky top-0 z-50">
        <div className="flex items-center gap-2.5 font-semibold text-lg tracking-tight">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-purple-500/30">B</div>
          BragSheet
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live
          </span>
          <Button variant="outline" size="sm" onClick={() => setResumeText(SAMPLE_RESUME)}>
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Load sample
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center max-w-5xl mx-auto w-full px-6 py-16 gap-16">
        {/* HERO */}
        <div className="text-center space-y-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-background/60 backdrop-blur text-sm font-medium shadow-sm">
            <span className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </span>
            <span className="text-muted-foreground">Powered by Claude AI · Built on Replit</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05]">
            Turn your resume into a{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                stunning career page
              </span>
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-full opacity-30" />
            </span>{" "}
            in 30 seconds.
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            BragSheet uses AI to instantly generate a beautiful personal portfolio from your resume — complete with animated skill graphs, project showcase, and a recruiter chatbot that answers as you.
          </p>

          {/* Trust strip */}
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 pt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" /> ~30 seconds</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> No signup needed</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="w-4 h-4" /> Instant results</span>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {features.map((feature, i) => (
              <span
                key={i}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 bg-background/60 backdrop-blur text-sm font-medium hover:border-foreground/20 hover:scale-105 transition-all cursor-default shadow-sm"
              >
                <span className={`w-5 h-5 rounded-md bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-sm`}>
                  <feature.icon className="w-3 h-3 text-white" />
                </span>
                {feature.label}
              </span>
            ))}
          </div>
        </div>

        {/* UPLOAD CARD */}
        <div className="w-full max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />

            <div
              role="button"
              tabIndex={0}
              className="relative border-2 border-dashed border-border bg-card/80 backdrop-blur rounded-2xl p-12 text-center hover:border-purple-500/40 transition-all cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !isParsing && fileInputRef.current?.click()}
              onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !isParsing) fileInputRef.current?.click(); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="relative mx-auto mb-5">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-30" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  {isParsing ? (
                    <Loader2 className="w-7 h-7 text-white animate-spin" />
                  ) : (
                    <Upload className="w-7 h-7 text-white" />
                  )}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-1.5">
                {isParsing ? "Reading your resume..." : "Drop your PDF or click to upload"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Supports <span className="font-medium text-foreground">.pdf</span> and <span className="font-medium text-foreground">.txt</span> — or paste your text below
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background/80 backdrop-blur px-3 text-muted-foreground font-semibold tracking-widest">OR PASTE</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="Paste your resume text here... (any format works — Word, LinkedIn copy, plain text)"
                className="min-h-[260px] font-mono text-sm resize-y p-6 bg-card/80 backdrop-blur border-border/60 focus:border-purple-500/60 focus:ring-purple-500/20 rounded-2xl shadow-sm"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              {resumeText && (
                <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur border border-border text-xs text-muted-foreground">
                  {resumeText.length.toLocaleString()} chars
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                className="w-full sm:flex-1 text-base h-14 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-500 hover:via-purple-500 hover:to-fuchsia-500 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-[1.01] border-0"
                onClick={handleGenerate}
                disabled={isPending || isParsing}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating your page...
                  </>
                ) : (
                  <>
                    Generate my BragSheet <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 rounded-2xl border-border hover:bg-muted"
                onClick={() => setResumeText(SAMPLE_RESUME)}
                disabled={isPending}
              >
                <FileText className="w-4 h-4 mr-2" /> Try sample
              </Button>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="w-full max-w-4xl pt-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2">How it works</h2>
            <p className="text-muted-foreground">Three steps. Thirty seconds.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Drop your resume",
                desc: "PDF, plain text, or paste from anywhere — we handle it all.",
                icon: Upload,
                color: "from-indigo-500 to-purple-500",
              },
              {
                step: "02",
                title: "AI does the magic",
                desc: "Claude reads your resume and structures it into a beautiful page.",
                icon: Sparkles,
                color: "from-purple-500 to-fuchsia-500",
              },
              {
                step: "03",
                title: "Share your page",
                desc: "Download HTML, embed it anywhere, or send recruiters the live link.",
                icon: Share2,
                color: "from-fuchsia-500 to-pink-500",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur hover:border-foreground/20 hover:shadow-lg transition-all group"
              >
                <div className="text-xs font-mono font-bold text-muted-foreground/60 mb-3">{item.step}</div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="text-center text-sm text-muted-foreground pt-6 pb-4">
          Built with <span className="text-pink-500">♥</span> using Claude AI · Replit Agent 4 Buildathon
        </footer>
      </main>
    </div>
  );
}
