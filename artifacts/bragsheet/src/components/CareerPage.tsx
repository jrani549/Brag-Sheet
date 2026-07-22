import { useEffect, useState, useRef } from "react";
import type { CareerProfile } from "@workspace/api-client-react";
import { Button } from "./ui/button";
import { ArrowLeft, Download, MapPin, Briefcase, GraduationCap, Github, Linkedin, Mail, Send, Copy, CheckCircle2, Share2, Twitter } from "lucide-react";
import { useChatAsCandidate } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface CareerPageProps {
  profile: CareerProfile;
  onStartOver: () => void;
}

export function CareerPage({ profile, onStartOver }: CareerPageProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [draftEmail, setDraftEmail] = useState<string | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [emailCapture, setEmailCapture] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Chatbot State
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([
    { role: 'assistant', content: `Hi, I'm ${profile.name}'s AI assistant. I can answer questions about their experience, skills, and background just as they would. What would you like to know?` }
  ]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { mutate: chatMutate, isPending: isChatting } = useChatAsCandidate();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({ title: "Link copied to clipboard" });
  };

  const shareText = `🚀 Just built my AI career page in 30 seconds using @BragSheet!\n\nCheck it out → ${window.location.href}\n\nBuild yours: https://bragsheet.io\n#OpenToWork #AI #Career`;

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank", "width=600,height=400");
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, "_blank", "width=600,height=500");
  };

  const handleCopySocialCaption = () => {
    navigator.clipboard.writeText(shareText);
    toast({ title: "Caption copied!", description: "Paste it into LinkedIn, X, or anywhere else." });
  };

  const handleEmailCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailCapture.trim()) return;
    // Store in localStorage as lightweight persistence
    const saved = JSON.parse(localStorage.getItem("bragsheet_emails") || "[]") as string[];
    saved.push(emailCapture);
    localStorage.setItem("bragsheet_emails", JSON.stringify(saved));
    setEmailSent(true);
    toast({ title: "Got it!", description: "We'll remind you how to access BragSheet anytime." });
  };

  const handleDownloadHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${profile.name} - Career Profile</title>
    <style>
        body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #111; }
        h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        h2 { font-size: 1.5rem; margin-top: 2rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
        .tag { display: inline-block; background: #eee; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.875rem; margin-right: 0.5rem; margin-bottom: 0.5rem; }
        .experience-item { margin-bottom: 1.5rem; }
        .experience-header { display: flex; justify-content: space-between; align-items: baseline; }
        .project-card { border: 1px solid #eee; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
    </style>
</head>
<body>
    <h1>${profile.name}</h1>
    <p><strong>${profile.role}</strong></p>
    <p>${profile.summary}</p>
    
    <h2>Skills</h2>
    <div>${profile.skills.map(s => `<span class="tag">${s.name} (${s.pct}%)</span>`).join('')}</div>
    
    <h2>Experience</h2>
    ${profile.experience.map(e => `
        <div class="experience-item">
            <div class="experience-header">
                <h3>${e.role} at ${e.company}</h3>
                <span>${e.period}</span>
            </div>
            <ul>${e.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
        </div>
    `).join('')}
    
    <h2>Projects</h2>
    ${profile.projects.map(p => `
        <div class="project-card">
            <h3>${p.title}</h3>
            <p>${p.desc}</p>
            <div>${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        </div>
    `).join('')}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.replace(/\s+/g, '-').toLowerCase()}-profile.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDraftEmail = () => {
    setIsDrafting(true);
    const systemPrompt = `You are ${profile.name}, a ${profile.role}. Write a concise, professional outreach email to a recruiter introducing yourself, highlighting 1-2 key achievements from your profile, and asking for a brief chat. Keep it under 150 words.`;
    
    chatMutate({
      data: {
        messages: [{ role: 'user', content: 'Draft a recruiter outreach email.' }],
        system: systemPrompt
      }
    }, {
      onSuccess: (data) => {
        setDraftEmail(data.reply);
        setIsDrafting(false);
      },
      onError: () => {
        toast({ title: "Failed to draft email", variant: "destructive" });
        setIsDrafting(false);
      }
    });
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, content }];
    setMessages(newMessages);
    setChatInput("");
    
    setTimeout(() => {
      chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);

    const systemPrompt = `You are ${profile.name}, a ${profile.role}. Answer recruiter questions as them, concisely and professionally based on this summary: ${profile.summary}. Focus on facts from the resume. Do not invent new jobs.`;

    chatMutate({
      data: {
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        system: systemPrompt
      }
    }, {
      onSuccess: (data) => {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
        setTimeout(() => {
          chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Button variant="ghost" size="sm" onClick={onStartOver} className="text-muted-foreground hover:text-foreground shrink-0">
              <ArrowLeft className="w-4 h-4 mr-2" /> Start over
            </Button>
            <div className="font-semibold tracking-tight hidden sm:block truncate">{profile.name}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-5 text-sm font-medium text-muted-foreground mr-3">
              <a href="#skills" className="hover:text-foreground transition-colors">Skills</a>
              <a href="#experience" className="hover:text-foreground transition-colors">Experience</a>
              <a href="#projects" className="hover:text-foreground transition-colors">Projects</a>
              <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleShareTwitter}>
              <Twitter className="w-3.5 h-3.5" /> X
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleShareLinkedIn}>
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn
            </Button>
            <Button size="sm" className="gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0" onClick={handleCopySocialCaption}>
              <Share2 className="w-3.5 h-3.5" /> Share
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 md:py-20 space-y-24">
        {/* Hero Section */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium tracking-wide mb-6">
              {profile.tag}
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground mb-4">
              {profile.name}
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground font-medium tracking-tight">
              {profile.role}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-2">
            {profile.meta.map((metaItem, i) => (
              <div key={i} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border border-border/40">
                {i === 0 ? <Briefcase className="w-4 h-4" /> : i === 1 ? <MapPin className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                {metaItem}
              </div>
            ))}
          </div>

          <p className="text-lg md:text-xl leading-relaxed text-foreground max-w-3xl pt-6 border-t border-border/40">
            {profile.summary}
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-24">
            {/* Experience */}
            <section id="experience" className="space-y-8 scroll-m-24">
              <h2 className="text-3xl font-bold tracking-tight border-b border-border/40 pb-4">Experience</h2>
              <div className="space-y-12">
                {profile.experience.map((exp, i) => (
                  <div key={i} className="relative pl-6 border-l border-border/40 space-y-4 group hover:border-accent transition-colors">
                    <div className="absolute w-3 h-3 bg-background border-2 border-border/80 rounded-full -left-[6.5px] top-1.5 group-hover:border-accent transition-colors" />
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{exp.role}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-muted-foreground mt-1">
                        <span className="font-medium text-foreground/80">{exp.company}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-sm">{exp.period}</span>
                      </div>
                    </div>
                    <ul className="space-y-2.5">
                      {exp.bullets.map((bullet, j) => (
                        <li key={j} className="text-foreground/90 leading-relaxed flex">
                          <span className="text-muted-foreground mr-3 shrink-0">—</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Projects */}
            <section id="projects" className="space-y-8 scroll-m-24">
              <h2 className="text-3xl font-bold tracking-tight border-b border-border/40 pb-4">Selected Projects</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {profile.projects.map((project, i) => (
                  <div key={i} className="bg-card border border-border/60 rounded-xl p-6 flex flex-col h-full hover:border-accent/40 hover:shadow-sm transition-all group">
                    <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors">{project.title}</h3>
                    <p className="text-muted-foreground leading-relaxed flex-1 mb-6">{project.desc}</p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {project.tags.map((tag, j) => (
                        <span key={j} className="px-2.5 py-1 bg-muted/60 border border-border/40 rounded-md text-xs font-medium text-foreground/80">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <section className="space-y-8">
                <h2 className="text-3xl font-bold tracking-tight border-b border-border/40 pb-4">Certifications</h2>
                <div className="space-y-4">
                  {profile.certifications.map((cert, i) => (
                    <div key={i} className="flex items-center gap-4 bg-muted/20 border border-border/40 p-4 rounded-xl">
                      <div className="w-10 h-10 bg-background rounded-full border border-border/60 flex items-center justify-center text-xl shrink-0">
                        🎓
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{cert.name}</div>
                        <div className="text-sm text-muted-foreground">{cert.org}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-16">
            {/* Skills */}
            <section id="skills" className="space-y-8 scroll-m-24">
              <h2 className="text-3xl font-bold tracking-tight border-b border-border/40 pb-4">Core Skills</h2>
              <div className="space-y-5">
                {profile.skills.map((skill, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-foreground">{skill.name}</span>
                      <span className="text-muted-foreground">{skill.pct}%</span>
                    </div>
                    <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
                      <SkillBar pct={skill.pct} delay={i * 100} />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 flex flex-wrap gap-2">
                {profile.techTags.map((tag, i) => (
                  <span key={i} className="text-sm font-mono px-2 py-1 bg-background border border-border/60 rounded text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Contact Card */}
            <section id="contact" className="scroll-m-24">
              <div className="bg-foreground text-background rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-background/10 border border-background/20 flex items-center justify-center text-2xl font-bold">
                    {profile.initials}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{profile.name}</h3>
                    <p className="text-background/70 font-medium">{profile.role}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8">
                  {profile.socials.map((social: { label: string; handle: string; bg: string; color: string; icon: string }, i: number) => {
                    const Icon = social.label.toLowerCase() === 'github' ? Github : social.label.toLowerCase() === 'linkedin' ? Linkedin : Mail;
                    return (
                      <a key={i} href={social.handle} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/10 transition-colors group">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: social.bg, color: social.color }}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="font-medium text-background/90 group-hover:text-background transition-colors">
                          {social.label}
                        </div>
                      </a>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <Button variant="secondary" className="w-full bg-background text-foreground hover:bg-background/90 h-12" onClick={handleCopyLink}>
                    {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {isCopied ? 'Copied!' : 'Copy profile link'}
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent border-background/20 text-background hover:bg-background/10 h-12" onClick={handleDraftEmail} disabled={isDrafting}>
                    <FileText className="w-4 h-4 mr-2" />
                    Draft outreach email
                  </Button>
                </div>
              </div>
            </section>

            {/* Chatbot */}
            <section id="chatbot" className="scroll-m-24">
              <div className="bg-card border border-border/60 rounded-2xl overflow-hidden flex flex-col h-[500px] shadow-md">
                <div className="bg-muted/30 p-4 border-b border-border/60 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">
                    {profile.initials}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Ask {profile.name} anything</h3>
                    <p className="text-xs text-muted-foreground">AI agent answering as candidate</p>
                  </div>
                </div>
                
                <div 
                  ref={chatContainerRef}
                  className="flex-1 p-4 overflow-y-auto space-y-4 bg-background"
                >
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === 'user' 
                          ? 'bg-foreground text-background rounded-tr-sm' 
                          : 'bg-muted border border-border/40 text-foreground rounded-tl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isChatting && (
                    <div className="flex justify-start">
                      <div className="bg-muted border border-border/40 rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex gap-1 items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-muted/20 border-t border-border/60 space-y-3">
                  {messages.length === 1 && (
                    <div className="flex flex-wrap gap-2 px-1">
                      {profile.chatSuggestions.map((suggestion: string, i: number) => (
                        <button 
                          key={i}
                          onClick={() => handleSendMessage(suggestion)}
                          className="text-xs font-medium px-3 py-1.5 rounded-full bg-background border border-border/60 text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors text-left"
                        >
                          "{suggestion}"
                        </button>
                      ))}
                    </div>
                  )}
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(chatInput); }}
                    className="flex gap-2"
                  >
                    <Input 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask a question..." 
                      className="bg-background border-border/60 focus-visible:ring-accent/30"
                      disabled={isChatting}
                    />
                    <Button type="submit" size="icon" disabled={!chatInput.trim() || isChatting} className="shrink-0 bg-foreground text-background hover:bg-foreground/90">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Share Section */}
        <section className="pt-12 border-t border-border/40 space-y-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Share your page</h2>
            <p className="text-muted-foreground mb-8">Let recruiters and your network find you — one click to post.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={handleShareTwitter}
                className="flex items-center gap-4 p-5 rounded-xl border border-border/60 bg-card hover:border-foreground/30 hover:shadow-md transition-all group text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Twitter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Post on X</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Pre-filled tweet ready to go</div>
                </div>
              </button>

              <button
                onClick={handleShareLinkedIn}
                className="flex items-center gap-4 p-5 rounded-xl border border-border/60 bg-card hover:border-blue-400/50 hover:shadow-md transition-all group text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-[#0077B5] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Linkedin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Share on LinkedIn</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Perfect for job seekers</div>
                </div>
              </button>

              <button
                onClick={handleCopySocialCaption}
                className="flex items-center gap-4 p-5 rounded-xl border border-border/60 bg-card hover:border-purple-400/50 hover:shadow-md transition-all group text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Copy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Copy caption</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Paste anywhere — caption included</div>
                </div>
              </button>
            </div>
          </div>

          {/* Download */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Export</h3>
            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-4 p-5 rounded-xl border border-border/60 bg-card hover:border-accent/40 hover:shadow-sm transition-all group text-left max-w-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Download className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <div className="font-semibold text-sm">Download HTML</div>
                <div className="text-xs text-muted-foreground mt-0.5">Standalone file, host anywhere</div>
              </div>
            </button>
          </div>

          {/* Email capture */}
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-muted/30 to-muted/10 p-8">
            {emailSent ? (
              <div className="flex items-center gap-3 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
                <div>
                  <div className="font-semibold">You're on the list!</div>
                  <div className="text-sm text-muted-foreground">We'll let you know about new features and updates.</div>
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-lg mb-1">Get notified about updates</h3>
                <p className="text-sm text-muted-foreground mb-5">Drop your email and we'll let you know when new features land — like editable pages and custom domains.</p>
                <form onSubmit={handleEmailCapture} className="flex gap-3 max-w-md">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={emailCapture}
                    onChange={(e) => setEmailCapture(e.target.value)}
                    className="flex-1 bg-background"
                    required
                  />
                  <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90 shrink-0">
                    Notify me
                  </Button>
                </form>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Made with BragSheet badge */}
      <footer className="border-t border-border/40 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Generated by <a href="https://bragsheet.io" target="_blank" rel="noreferrer" className="font-semibold text-foreground hover:text-accent transition-colors">BragSheet</a> — AI Career Page Builder
          </p>
          <a
            href="https://bragsheet.io"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-sm font-medium hover:border-indigo-500/40 transition-colors"
          >
            <span className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xs">B</span>
            Made with BragSheet
          </a>
        </div>
      </footer>

      <Dialog open={!!draftEmail} onOpenChange={(open) => !open && setDraftEmail(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Draft Outreach Email</DialogTitle>
            <DialogDescription>
              Claude drafted this email based on your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted/40 border border-border/60 rounded-md font-sans text-sm whitespace-pre-wrap text-foreground mt-4">
            {draftEmail}
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => {
              if (draftEmail) {
                navigator.clipboard.writeText(draftEmail);
                toast({ title: "Email copied to clipboard" });
                setDraftEmail(null);
              }
            }}>
              <Copy className="w-4 h-4 mr-2" /> Copy to clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SkillBar({ pct, delay }: { pct: number, delay: number }) {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(pct);
    }, delay + 100);
    return () => clearTimeout(timer);
  }, [pct, delay]);
  
  return (
    <div 
      className="h-full bg-foreground rounded-full"
      style={{ 
        width: `${width}%`,
        transition: 'width 1.1s cubic-bezier(.4,0,.2,1)'
      }} 
    />
  );
}
