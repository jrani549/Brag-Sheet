import { useGetSummary, useGetRecentEntries } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import { Trophy, TrendingUp, Calendar, AlertCircle, ArrowRight, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetSummary();
  const { data: recentEntries, isLoading: isLoadingRecent } = useGetRecentEntries();

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-serif text-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-lg">A summary of your recent accomplishments.</p>
      </header>

      {/* Summary Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Wins</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-serif text-foreground">{summary?.totalEntries || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Impact</CardTitle>
            <Star className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-serif text-foreground">{summary?.highImpactCount || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-serif text-foreground">{summary?.thisMonthCount || 0}</div>
            )}
          </CardContent>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Entries */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif text-foreground">Recent Journal Entries</h2>
            <Button variant="outline" size="sm" asChild className="hover-elevate">
              <Link href="/entries">View all</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {isLoadingRecent ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-6 rounded-lg border border-border bg-card shadow-sm space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))
            ) : recentEntries?.length === 0 ? (
              <div className="text-center py-12 rounded-lg border border-dashed border-border bg-card/50">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-1">No entries yet</h3>
                <p className="text-muted-foreground mb-4">Start recording your achievements.</p>
                <Button asChild>
                  <Link href="/entries/new">Write your first entry</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEntries?.map((entry, idx) => (
                  <Link key={entry.id} href={`/entries/${entry.id}`} className="block group">
                    <div className="p-6 rounded-lg border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 animate-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-serif font-medium text-foreground group-hover:text-primary transition-colors">
                          {entry.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {entry.categoryName && (
                            <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground hover:bg-secondary/30">
                              {entry.categoryName}
                            </Badge>
                          )}
                          <Badge 
                            variant="outline" 
                            className={
                              entry.impact === 'high' ? 'border-accent text-accent' : 
                              entry.impact === 'medium' ? 'border-primary/50 text-primary/80' : 
                              'border-muted-foreground text-muted-foreground'
                            }
                          >
                            {entry.impact}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-4">
                        {entry.description}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground font-medium">
                        <Calendar className="mr-1.5 h-3.5 w-3.5" />
                        {format(parseISO(entry.date), 'MMMM d, yyyy')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Category Breakdown */}
        <section className="space-y-6">
          <h2 className="text-2xl font-serif text-foreground">Categories</h2>
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-0">
              {isLoadingSummary ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : summary?.categoryBreakdown?.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No categories used yet.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {summary?.categoryBreakdown.map((cat, idx) => (
                    <li key={idx} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <span className="font-medium text-foreground">{cat.categoryName}</span>
                      <Badge variant="outline" className="bg-background">
                        {cat.count}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

// Ensure BookOpen is imported if used in empty state
import { BookOpen } from "lucide-react";
