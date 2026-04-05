import { useState, useCallback } from "react";
import { useGenerateProfile } from "@workspace/api-client-react";
import type { CareerProfile } from "@workspace/api-client-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Upload, FileText, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Unsupported file",
        description: "Please upload a .txt file or paste your resume directly.",
        variant: "destructive",
      });
    }
  }, [toast]);

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
            className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-accent/50 hover:bg-accent/5 transition-colors cursor-pointer group"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">Drop PDF or click to upload</h3>
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
