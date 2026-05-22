"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { createCollectionAction } from "../actions";
import type { CmsField, CmsFieldKind, CmsIndexKind } from "@/shared/types/api";

const KINDS: CmsFieldKind[] = [
  "text", "longtext", "int", "float", "bool", "datetime", "date",
  "email", "url", "phone", "enum", "json", "array",
  "relation", "file", "image", "audio", "video", "geo",
];

const INDEX_KINDS: CmsIndexKind[] = ["none", "asc", "desc", "text", "hashed", "unique", "ttl"];

export function SchemaBuilder({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<CmsField[]>([
    { name: "title", label: "Title", kind: "text", required: true, index: "asc", order: 0 },
  ]);
  const [pending, start] = useTransition();

  const addField = () =>
    setFields((arr) => [
      ...arr,
      { name: "", label: "", kind: "text", required: false, index: "none", order: arr.length },
    ]);

  const updateField = (idx: number, patch: Partial<CmsField>) =>
    setFields((arr) => arr.map((f, i) => (i === idx ? { ...f, ...patch } : f)));

  const removeField = (idx: number) =>
    setFields((arr) => arr.filter((_, i) => i !== idx));

  const submit = () => {
    if (!name.trim()) {
      toast.error("Collection nomi kerak");
      return;
    }
    const dirty = fields.filter((f) => f.name.trim());
    start(async () => {
      const res = await createCollectionAction({
        projectId,
        name: name.trim().toLowerCase(),
        label: label || undefined,
        description: description || undefined,
        fields: dirty,
      });
      if (!res.ok) {
        toast.error(res.message ?? "Yaratishda xatolik");
        return;
      }
      toast.success("Collection yaratildi");
      router.push(`/app/cms/${name.trim().toLowerCase()}?project=${projectId}`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Nom (snake_case)</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value.replace(/[^a-z0-9_]/g, ""))}
            placeholder="orders"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Label (UI)</label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Buyurtmalar" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Tavsif</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
          placeholder="Mijoz buyurtmalari ro'yxati"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium">Maydonlar</div>
          <Button onClick={addField} variant="outline" size="sm">
            <Plus className="h-3.5 w-3.5" /> Qo'shish
          </Button>
        </div>
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div
              key={i}
              className="grid items-center gap-2 rounded-md border p-3 lg:grid-cols-[1fr_140px_140px_120px_100px_auto]"
            >
              <Input
                value={f.name}
                onChange={(e) =>
                  updateField(i, { name: e.target.value.replace(/[^a-z0-9_]/g, "") })
                }
                placeholder="field_name"
                className="h-8"
              />
              <select
                value={f.kind}
                onChange={(e) => updateField(i, { kind: e.target.value as CmsFieldKind })}
                className="h-8 rounded-md border bg-transparent px-2 text-sm"
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <select
                value={f.index}
                onChange={(e) => updateField(i, { index: e.target.value as CmsIndexKind })}
                className="h-8 rounded-md border bg-transparent px-2 text-sm"
              >
                {INDEX_KINDS.map((k) => (
                  <option key={k} value={k}>idx: {k}</option>
                ))}
              </select>
              <Input
                value={f.label ?? ""}
                onChange={(e) => updateField(i, { label: e.target.value })}
                placeholder="Label"
                className="h-8"
              />
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={f.required}
                  onChange={(e) => updateField(i, { required: e.target.checked })}
                />
                <span>required</span>
              </label>
              <Button onClick={() => removeField(i)} variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
        {fields.length === 0 && (
          <Badge variant="secondary">Maydonsiz collection — keyin qo'shasiz</Badge>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => router.back()}>Bekor</Button>
        <Button onClick={submit} disabled={pending}>Yaratish</Button>
      </div>
    </div>
  );
}
