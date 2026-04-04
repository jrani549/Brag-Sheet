import { useState } from "react";
import { useListCategories, useCreateCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const PRESET_COLORS = [
  "#7A3E31", // cordovan
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#f97316", // orange
  "#84cc16", // lime
];

export default function CategoriesIndex() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useListCategories();

  const [form, setForm] = useState({ name: "", color: PRESET_COLORS[0] });
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { mutate: createCategory, isPending } = useCreateCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        setForm({ name: "", color: PRESET_COLORS[0] });
        setShowForm(false);
        setError("");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Category name is required");
      return;
    }
    setError("");
    createCategory({ data: { name: form.name.trim(), color: form.color } });
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-foreground tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize your wins by area of impact</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} variant={showForm ? "outline" : "default"} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancel" : "Add Category"}
        </Button>
      </header>

      {showForm && (
        <Card className="border-primary/20 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <CardTitle className="font-serif text-xl">New Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Name</Label>
                <Input
                  id="cat-name"
                  placeholder="e.g. Engineering, Leadership, Communication"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={error ? "border-destructive" : ""}
                />
                {error && <p className="text-destructive text-sm">{error}</p>}
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className="h-8 w-8 rounded-full transition-all duration-150 ring-offset-2 focus:outline-none"
                      style={{
                        backgroundColor: c,
                        ring: form.color === c ? "2px solid currentColor" : undefined,
                        outline: form.color === c ? `2px solid ${c}` : "none",
                        outlineOffset: "2px",
                      }}
                      aria-label={c}
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Category"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 rounded-lg border border-border bg-card space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      ) : categories?.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/50">
          <Tag className="mx-auto h-10 w-10 text-muted-foreground/40 mb-4" />
          <h3 className="text-xl font-serif text-foreground mb-2">No categories yet</h3>
          <p className="text-muted-foreground mb-6">Create categories to organize your achievements by area.</p>
          <Button onClick={() => setShowForm(true)}>Add your first category</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((cat, idx) => (
            <Card
              key={cat.id}
              className="border-border shadow-sm hover:shadow-md transition-all duration-200 animate-in slide-in-from-bottom-2"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="h-4 w-4 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <h3 className="font-serif text-lg font-medium text-foreground">{cat.name}</h3>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  {cat.entryCount} {cat.entryCount === 1 ? "entry" : "entries"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
