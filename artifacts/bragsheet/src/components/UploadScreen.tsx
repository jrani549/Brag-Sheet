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

const SAMPLE_RESUME = `Janshi Rani
Applied Data Scientist & GenAI Engineer | Bengaluru, India
IIT Hyderabad B.Tech | Amazon Development Centre (ex)

Summary: Results-driven Applied Data Scientist and GenAI Engineer with hands-on experience at Amazon Development Centre. Specialising in LLM applications, RAG pipelines, agentic AI, and NLP. Open to hybrid roles in Bengaluru.

Experience:
Amazon Development Centre | Data Scientist | 2022–2024
- Built production ML pipelines serving millions of users
- Reduced inference latency by 30% through model optimisation
- Led NLP and recommendation system development

NSKH Tech | Data Scientist GenAI (Consulting) | 2024–Present
- Architecting RAG document Q&A systems using LangChain and OpenAI API
- Designing vector search pipelines with FAISS and Pinecone

Skills: Python LangChain OpenAI API RAG FAISS Pinecone HuggingFace PyTorch SQL NLP MLOps

Projects:
1. RAG Document Q&A System — End-to-end retrieval augmented generation with citations
2. Multi-Agent Interview Coach — LLM agents that simulate and evaluate interviews
3. NLP Sentiment Dashboard — Real-time sentiment analysis with interactive charts

Certifications:
- Generative AI & LLMs — NVIDIA Deep Learning Institute
- GenAI Practitioner — DataCamp`;

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
