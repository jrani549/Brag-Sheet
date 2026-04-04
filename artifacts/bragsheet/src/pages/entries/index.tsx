import { useState } from "react";
import { Link } from "wouter";
import { useListEntries, useListCategories, useDeleteEntry, getListEntriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { PenTool, Search, Trash2, Eye, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const impactColors: Record<string, string> = {
  high: "border-accent text-accent font-medium",
  medium: "border-primary/50 text-primary/80",
  low: "border-muted-foreground text-muted-foreground",
};

const impactLabel: Record<string, string> = {
  high: "High Impact",
  medium: "Medium",
  low: "Low",
};

export default function EntriesIndex() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const queryClient = useQueryClient();

  const { data: entries, isLoading } = useListEntries(
    { search: search || undefined, category: category === "all" ? undefined : category },
    { query: { queryKey: getListEntriesQueryKey({ search: search || undefined, category: category === "all" ? undefined : category }) } }
  );
  const { data: categories } = useListCategories();
  const { mutate: deleteEntry } = useDeleteEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
      },
    },
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-foreground tracking-tight">Journal</h1>
          <p className="text-muted-foreground mt-1">All your recorded achievements</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/entries/new">
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Link>
        </Button>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 rounded-lg border border-border bg-card space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : entries?.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/50">
          <PenTool className="mx-auto h-10 w-10 text-muted-foreground/40 mb-4" />
          <h3 className="text-xl font-serif text-foreground mb-2">No entries found</h3>
          <p className="text-muted-foreground mb-6">
            {search || category !== "all" ? "Try adjusting your search or filter." : "Start recording your wins."}
          </p>
          <Button asChild>
            <Link href="/entries/new">Write first entry</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries?.map((entry, idx) => (
            <div
              key={entry.id}
              className="group p-5 sm:p-6 rounded-lg border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 animate-in slide-in-from-bottom-2"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-serif font-medium text-foreground">{entry.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className={impactColors[entry.impact] ?? ""}>
                      {impactLabel[entry.impact] ?? entry.impact}
                    </Badge>
                    {entry.categoryName && (
                      <Badge variant="secondary" className="bg-secondary/20">
                        {entry.categoryName}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">{entry.description}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {format(parseISO(entry.date), "MMMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/entries/${entry.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-serif">Delete this entry?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{entry.title}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteEntry({ id: entry.id })}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
