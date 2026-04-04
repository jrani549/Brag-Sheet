import { Link, useLocation } from "wouter";
import { PenTool, Library, LayoutDashboard, Settings, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navigation = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Journal", href: "/entries", icon: BookOpen },
    { name: "New Entry", href: "/entries/new", icon: PenTool },
    { name: "Categories", href: "/categories", icon: Library },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background font-sans text-foreground selection:bg-primary/20">
      <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r border-border bg-sidebar px-4 py-8 flex flex-col hidden md:flex">
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-sm">
            <PenTool className="h-4 w-4" />
          </div>
          <span className="font-serif text-xl font-medium tracking-tight">Bragsheet</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-2">
          <div className="rounded-lg bg-card p-4 border border-border shadow-sm text-sm">
            <h4 className="font-serif font-medium text-foreground mb-1">Stay Confident</h4>
            <p className="text-muted-foreground text-xs">Record your wins while they are fresh.</p>
          </div>
        </div>
      </aside>

      {/* Mobile nav (simple bottom bar for now) */}
      <div className="md:hidden fixed bottom-0 w-full bg-sidebar border-t border-border z-20 flex items-center justify-around p-2 pb-safe">
        {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 text-[10px] font-medium",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
        })}
      </div>

      <main className="flex-1 md:pl-64 flex flex-col min-h-[100dvh] pb-16 md:pb-0">
        <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 lg:p-12 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
