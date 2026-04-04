import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateEntry, useListCategories, getListEntriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function EntriesNew() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: categories } = useListCategories();

  const [form, setForm] = useState({
    title: "",
    description: "",
    impact: "medium" as "low" | "medium" | "high",
    categoryId: null as number | null,
    date: new Date().toISOString().slice(0, 10),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: createEntry, isPending } = useCreateEntry({
    mutation: {
      onSuccess: (entry) => {
        queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
        navigate(`/entries/${entry.id}`);
      },
    },
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.date) e.date = "Date is required";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    createEntry({
      data: {
        title: form.title.trim(),
        description: form.description.trim(),
        impact: form.impact,
        categoryId: form.categoryId,
        date: form.date,
      },
    });
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/entries">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
      </div>

      <header>
        <h1 className="text-3xl md:text-4xl font-serif text-foreground tracking-tight">New Entry</h1>
        <p className="text-muted-foreground mt-1">Record a win while it is fresh in your mind.</p>
      </header>

      <Card className="border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Achievement Details</CardTitle>
          <CardDescription>Be specific — specificity makes for stronger brag material.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="What did you accomplish?"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the context, what you did, and the outcome. Include numbers and specifics where possible."
                rows={5}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="impact">Impact Level</Label>
                <Select
                  value={form.impact}
                  onValueChange={(v) => setForm((f) => ({ ...f, impact: v as "low" | "medium" | "high" }))}
                >
                  <SelectTrigger id="impact">
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
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.categoryId?.toString() ?? "none"}
                  onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v === "none" ? null : Number(v) }))}
                >
                  <SelectTrigger id="category">
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
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className={errors.date ? "border-destructive" : ""}
                />
                {errors.date && <p className="text-destructive text-sm">{errors.date}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
                <Save className="h-4 w-4 mr-2" />
                {isPending ? "Saving..." : "Save Entry"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/entries">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
