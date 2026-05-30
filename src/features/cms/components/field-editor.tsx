"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { addFieldAction, removeFieldAction, updateFieldAction, updateCollectionAction } from "../actions";
import type { CmsCascadeMode, CmsCollection, CmsField, CmsFieldKind, CmsIndexKind } from "@/shared/types/api";

const KINDS: CmsFieldKind[] = [
  "text", "longtext", "int", "float", "bool", "datetime", "date",
  "email", "url", "phone", "enum", "json", "array",
  "relation", "file", "image", "audio", "video", "geo",
];
const INDEX_KINDS: CmsIndexKind[] = ["none", "asc", "desc", "text", "hashed", "unique", "ttl"];
const CASCADE_MODES: CmsCascadeMode[] = ["cascade", "restrict", "set_null"];

type Props = {
  projectId: string;
  collectionName: string;
  initialFields: CmsField[];
  collections: CmsCollection[];
  primaryField?: string;
};

export function FieldEditor({ projectId, collectionName, initialFields, collections, primaryField: initialPrimaryField }: Props) {
  const router = useRouter();
  const [fields, setFields] = useState<CmsField[]>(initialFields);
  const [primaryField, setPrimaryField] = useState(initialPrimaryField ?? "");
  const [newField, setNewField] = useState<CmsField>({
    name: "",
    label: "",
    kind: "text",
    required: false,
    index: "none",
    order: fields.length,
  });
  const [pending, start] = useTransition();

  const refresh = () => router.refresh();

  const handleAdd = () => {
    if (!newField.name.trim()) {
      toast.error("Field nomi kerak");
      return;
    }
    start(async () => {
      const res = await addFieldAction({
        projectId,
        name: collectionName,
        field: { ...newField, name: newField.name.trim() },
      });
      if (!res.ok) {
        toast.error(res.message ?? "Xato");
        return;
      }
      toast.success("Field qo'shildi");
      setFields((arr) => [...arr, res.data as CmsField]);
      setNewField({ name: "", label: "", kind: "text", required: false, index: "none", order: fields.length + 1 });
      refresh();
    });
  };

  const handleSave = (idx: number) => {
    const f = fields[idx];
    start(async () => {
      const res = await updateFieldAction({
        projectId,
        name: collectionName,
        fieldName: f.name,
        patch: {
          label: f.label,
          kind: f.kind,
          required: f.required,
          index: f.index,
          relation_collection: f.relation_collection ?? null,
          cascade: f.cascade,
        },
      });
      if (!res.ok) {
        toast.error(res.message ?? "Xato");
        return;
      }
      toast.success("Saqlandi");
      refresh();
    });
  };

  const handleRemove = (fieldName: string) => {
    if (!confirm(`Maydon "${fieldName}" o'chirilsinmi?`)) return;
    start(async () => {
      const res = await removeFieldAction({ projectId, name: collectionName, fieldName });
      if (!res.ok) {
        toast.error(res.message ?? "Xato");
        return;
      }
      toast.success("O'chirildi");
      setFields((arr) => arr.filter((f) => f.name !== fieldName));
      refresh();
    });
  };

  const handlePrimaryFieldChange = (value: string) => {
    setPrimaryField(value);
    start(async () => {
      const res = await updateCollectionAction({
        projectId,
        name: collectionName,
        patch: { primary_field: value || undefined },
      });
      if (!res.ok) {
        toast.error(res.message ?? "Xato");
        return;
      }
      toast.success("Primary field saqlandi");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">
          Primary field (relationda ko'rinadi)
        </label>
        <select
          value={primaryField}
          onChange={(e) => handlePrimaryFieldChange(e.target.value)}
          disabled={pending}
          className="h-8 w-full rounded-md border bg-transparent px-2 text-sm disabled:opacity-50"
        >
          <option value="">— tanlanmagan —</option>
          {fields.filter((f) => f.name.trim()).map((f) => (
            <option key={f.name} value={f.name}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {fields.length === 0 && (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            Hozircha field yo'q
          </div>
        )}
        {fields.map((f, i) => (
          <div
            key={f.id ?? f.name}
            className="rounded-md border p-3 space-y-2"
          >
            <div className="grid items-center gap-2 lg:grid-cols-[1fr_140px_140px_120px_100px_auto_auto]">
              <div>
                <code className="text-sm font-medium">{f.name}</code>
              </div>
              <select
                value={f.kind}
                onChange={(e) =>
                  setFields((arr) =>
                    arr.map((x, idx) => (idx === i ? { ...x, kind: e.target.value as CmsFieldKind } : x))
                  )
                }
                className="h-8 rounded-md border bg-transparent px-2 text-sm"
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <select
                value={f.index}
                onChange={(e) =>
                  setFields((arr) =>
                    arr.map((x, idx) => (idx === i ? { ...x, index: e.target.value as CmsIndexKind } : x))
                  )
                }
                className="h-8 rounded-md border bg-transparent px-2 text-sm"
              >
                {INDEX_KINDS.map((k) => (
                  <option key={k} value={k}>idx: {k}</option>
                ))}
              </select>
              <Input
                value={f.label ?? ""}
                onChange={(e) =>
                  setFields((arr) =>
                    arr.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x))
                  )
                }
                placeholder="Label"
                className="h-8"
              />
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={f.required}
                  onChange={(e) =>
                    setFields((arr) =>
                      arr.map((x, idx) => (idx === i ? { ...x, required: e.target.checked } : x))
                    )
                  }
                />
                required
              </label>
              <Button onClick={() => handleSave(i)} size="icon" variant="ghost" className="h-8 w-8" disabled={pending}>
                <Save className="h-3.5 w-3.5" />
              </Button>
              <Button onClick={() => handleRemove(f.name)} size="icon" variant="ghost" className="h-8 w-8" disabled={pending}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            {f.kind === "relation" && (
              <div className="flex flex-wrap items-center gap-2 pl-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Collection:</span>
                  <select
                    value={f.relation_collection ?? ""}
                    onChange={(e) =>
                      setFields((arr) =>
                        arr.map((x, idx) =>
                          idx === i
                            ? { ...x, relation_collection: e.target.value ? Number(e.target.value) : null }
                            : x
                        )
                      )
                    }
                    className="h-8 rounded-md border bg-transparent px-2 text-sm"
                  >
                    <option value="">— tanlang —</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label || c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Cascade:</span>
                  <select
                    value={f.cascade ?? "restrict"}
                    onChange={(e) =>
                      setFields((arr) =>
                        arr.map((x, idx) =>
                          idx === i ? { ...x, cascade: e.target.value as CmsCascadeMode } : x
                        )
                      )
                    }
                    className="h-8 rounded-md border bg-transparent px-2 text-sm"
                  >
                    {CASCADE_MODES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="text-sm font-medium mb-2">Yangi maydon</div>
        <div className="space-y-2">
          <div className="grid items-center gap-2 lg:grid-cols-[1fr_140px_140px_120px_100px_auto]">
            <Input
              value={newField.name}
              onChange={(e) =>
                setNewField({ ...newField, name: e.target.value.replace(/[^a-z0-9_]/g, "") })
              }
              placeholder="field_name"
              className="h-8"
            />
            <select
              value={newField.kind}
              onChange={(e) => setNewField({ ...newField, kind: e.target.value as CmsFieldKind })}
              className="h-8 rounded-md border bg-transparent px-2 text-sm"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <select
              value={newField.index}
              onChange={(e) => setNewField({ ...newField, index: e.target.value as CmsIndexKind })}
              className="h-8 rounded-md border bg-transparent px-2 text-sm"
            >
              {INDEX_KINDS.map((k) => (
                <option key={k} value={k}>idx: {k}</option>
              ))}
            </select>
            <Input
              value={newField.label ?? ""}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              placeholder="Label"
              className="h-8"
            />
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={newField.required}
                onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
              />
              required
            </label>
            <Button onClick={handleAdd} size="sm" disabled={pending}>
              <Plus className="h-3.5 w-3.5" /> Qo'shish
            </Button>
          </div>
          {newField.kind === "relation" && (
            <div className="flex flex-wrap items-center gap-2 pl-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Collection:</span>
                <select
                  value={newField.relation_collection ?? ""}
                  onChange={(e) =>
                    setNewField({
                      ...newField,
                      relation_collection: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="h-8 rounded-md border bg-transparent px-2 text-sm"
                >
                  <option value="">— tanlang —</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label || c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Cascade:</span>
                <select
                  value={newField.cascade ?? "restrict"}
                  onChange={(e) =>
                    setNewField({ ...newField, cascade: e.target.value as CmsCascadeMode })
                  }
                  className="h-8 rounded-md border bg-transparent px-2 text-sm"
                >
                  {CASCADE_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
