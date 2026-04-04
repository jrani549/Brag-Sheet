import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import {
  useGetEntry,
  useUpdateEntry,
  useDeleteEntry,
  useListCategories,
  getGetEntryQueryKey,
  getListEntriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Pencil, Trash2, Save, X, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

export default function EntriesId() {
  const { id: rawId } = useParams();
  const id = Number(rawId);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: entry, isLoading } = useGetEntry(id, {
    query: { enabled: !!id, queryKey: getGetEntryQueryKey(id) },
  });
  const { data: categories } = useListCategories();

  const [form, setForm] = useState({
    title: "",
    description: "",
    impact: "medium" as "low" | "medium" | "high",
    categoryId: null as number | null,
    date: "",
  });

  const startEdit = () => {
    if (!entry) return;
    setForm({
      title: entry.title,
      description: entry.description,
      impact: entry.impact as "low" | "medium" | "high",
      categoryId: entry.categoryId ?? null,
      date: entry.date,
    });
    setEditing(true);
  };

  const { mutate: updateEntry, isPending: isUpdating } = useUpdateEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetEntryQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
        setEditing(false);
      },
    },
  });

  const { mutate: deleteEntry } = useDeleteEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
        navigate("/entries");
      },
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateEntry({
      id,
      data: {
        title: form.title.trim(),
        description: form.description.trim(),
        impact: form.impact,
        categoryId: form.categoryId,
        date: form.date,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-2xl">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-serif text-foreground mb-4">Entry not found</h2>
        <Button asChild variant="outline">
          <Link href="/entries">Back to Journal</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/entries">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        {!editing && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
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
                    This will permanently delete "{entry.title}". This cannot be undone.
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
        )}
      </div>

      {editing ? (
        <form onSubmit={handleUpdate} className="space-y-6">
          <h1 className="text-3xl font-serif text-foreground">Edit Entry</h1>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={6}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Impact</Label>
              <Select
                value={form.impact}
                onValueChange={(v) => setForm((f) => ({ ...f, impact: v as "low" | "medium" | "high" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Impact</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.categoryId?.toString() ?? "none"}
                onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v === "none" ? null : Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <article className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={impactColors[entry.impact] ?? ""}>
              {entry.impact === "high" ? "High Impact" : entry.impact === "medium" ? "Medium" : "Low"} Impact
            </Badge>
            {entry.categoryName && (
              <Badge variant="secondary" className="bg-secondary/20">
                <Tag className="h-3 w-3 mr-1" />
                {entry.categoryName}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-serif text-foreground tracking-tight leading-tight">
            {entry.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {format(parseISO(entry.date), "MMMM d, yyyy")}
          </div>

          <div className="prose prose-stone max-w-none leading-relaxed text-foreground/90 whitespace-pre-wrap border-l-2 border-primary/20 pl-6 py-2">
            {entry.description}
          </div>
        </article>
      )}
    </div>
  );
}
