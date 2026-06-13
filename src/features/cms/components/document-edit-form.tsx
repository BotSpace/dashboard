"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { updateDocumentAction } from "../actions";
import type { CmsCollection, CmsDocument, CmsField } from "@/shared/types/api";
import {
  DocumentFields,
  buildInitialValues,
  serializeValues,
  validateFields,
  type FieldValue,
  type FormValues,
} from "./document-fields";

type Props = {
  projectId: string;
  collectionName: string;
  fields: CmsField[];
  collections: CmsCollection[];
  doc: CmsDocument;
};

function fmtDate(v: unknown): string | null {
  if (!v) return null;
  try {
    const d = new Date(String(v));
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  } catch {
    return String(v);
  }
}

export function DocumentEditForm({ projectId, collectionName, fields, collections, doc }: Props) {
  const router = useRouter();
  const initial = useMemo(() => buildInitialValues(fields, doc), [fields, doc]);
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();

  const setValue = (name: string, v: FieldValue) => {
    setValues((prev) => ({ ...prev, [name]: v }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  };

  const dirty = useMemo(
    () => fields.some((f) => values[f.name] !== initial[f.name]),
    [fields, values, initial]
  );

  const submit = () => {
    const errs = validateFields(fields, values);
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Maydonlarni tekshiring");
      return;
    }
    const patch = serializeValues(fields, values);
    start(async () => {
      const res = await updateDocumentAction({
        projectId,
        name: collectionName,
        id: String(doc._id),
        patch,
      });
      if (!res.ok) {
        toast.error(res.message ?? "Xato");
        return;
      }
      toast.success("Hujjat saqlandi");
      router.push(`/app/bots/${projectId}/cms/${collectionName}/data`);
      router.refresh();
    });
  };

  const created = fmtDate(doc._created_at);
  const updated = fmtDate(doc._updated_at);

  return (
    <div className="space-y-5">
      {(created || updated) && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {created && (
            <span>
              Yaratilgan: <span className="text-foreground">{created}</span>
            </span>
          )}
          {updated && (
            <span>
              Yangilangan: <span className="text-foreground">{updated}</span>
            </span>
          )}
          {typeof doc._version === "number" && (
            <span>
              Versiya: <span className="text-foreground">{doc._version}</span>
            </span>
          )}
        </div>
      )}

      <DocumentFields
        fields={fields}
        values={values}
        setValue={setValue}
        projectId={projectId}
        collections={collections}
        errors={errors}
        disabled={pending}
      />

      <div className="sticky bottom-0 -mx-5 -mb-5 flex items-center justify-end gap-2 rounded-b-xl border-t bg-card/95 px-5 pb-5 pt-3 backdrop-blur">
        {dirty && <span className="mr-auto text-xs text-muted-foreground">Saqlanmagan o&apos;zgarishlar</span>}
        <Button variant="ghost" onClick={() => router.back()} disabled={pending}>
          Bekor
        </Button>
        <Button onClick={submit} disabled={pending || !dirty} className="gap-1.5">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Saqlash
        </Button>
      </div>
    </div>
  );
}
