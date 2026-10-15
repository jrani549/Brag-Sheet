import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export function LoadingScreen() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    "Parsing skills and experience",
    "Generating career narrative",
    "Building project showcase",
    "Setting up your AI chatbot"
  ];

  useEffect(() => {
    // Fake progress animation
    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= steps.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 4000); // Advance every 4s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border/40 py-4 px-6 flex items-center justify-between bg-background/95 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <div className="w-6 h-6 rounded bg-foreground text-background flex items-center justify-center font-bold text-sm">B</div>
          Career Page
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full px-6 py-16">
        <div className="w-full space-y-12">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Analysing your resume...</h2>
            <p className="text-muted-foreground">Claude AI is extracting your professional journey.</p>
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-8 shadow-sm">
            <div className="space-y-6">
              {steps.map((step, idx) => {
                const isActive = idx === activeStep;
                const isCompleted = idx < activeStep;
                
                return (
                  <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${!isCompleted && !isActive ? 'opacity-40' : 'opacity-100'}`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-accent" />
                      ) : isActive ? (
                        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-border" />
                      )}
                    </div>
                    <span className={`font-medium ${isCompleted ? 'text-foreground' : isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
