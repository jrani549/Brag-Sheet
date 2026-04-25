import { useState, useCallback, useRef } from "react";
import { useGenerateProfile } from "@workspace/api-client-react";
import type { CareerProfile } from "@workspace/api-client-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Upload, FileText, Sparkles, Loader2 } from "lucide-react";
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
      onSuccess: (profile) => {
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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border/40 py-4 px-6 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <div className="w-6 h-6 rounded bg-foreground text-background flex items-center justify-center font-bold text-sm">B</div>
          BragSheet
        </div>
        <Button variant="outline" size="sm" onClick={() => setResumeText(SAMPLE_RESUME)}>
          Load sample
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center max-w-4xl mx-auto w-full px-6 py-16 gap-12">
        <div className="text-center space-y-6 max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-foreground">
            Your career page, built by AI.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Paste your resume or drop a PDF. BragSheet generates a full personal career page — skill graphs, project showcase, LinkedIn-style contact card, and a chatbot that answers recruiters as you.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {["Skill graphs", "Project showcase", "Contact card", "AI recruiter chatbot", "Export + share"].map((feature, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted/30 text-sm font-medium text-foreground">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div 
            role="button"
            tabIndex={0}
            className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-accent/50 hover:bg-accent/5 transition-colors cursor-pointer group"
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
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              {isParsing ? (
                <Loader2 className="w-6 h-6 text-foreground animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-foreground" />
              )}
            </div>
            <h3 className="text-lg font-medium mb-1">
              {isParsing ? "Reading file..." : "Drop PDF or click to upload"}
            </h3>
            <p className="text-sm text-muted-foreground">Supports .pdf and .txt — or paste below</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-medium">OR</span>
            </div>
          </div>

          <div className="space-y-4">
            <Textarea 
              placeholder="Paste your resume here..." 
              className="min-h-[300px] font-mono text-sm resize-y p-6 bg-card border-border/60 focus:border-accent focus:ring-accent/20 rounded-xl"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="w-full sm:flex-1 text-base h-14 bg-foreground hover:bg-foreground/90 text-background rounded-xl"
                onClick={handleGenerate}
                disabled={isPending}
              >
                Generate my BragSheet <Sparkles className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto h-14 rounded-xl border-border hover:bg-muted"
                onClick={() => setResumeText(SAMPLE_RESUME)}
                disabled={isPending}
              >
                <FileText className="w-4 h-4 mr-2" /> Use sample resume
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
