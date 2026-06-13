"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { insertDocumentAction } from "../actions";
import type { CmsCollection, CmsField } from "@/shared/types/api";
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
};

export function DocumentForm({ projectId, collectionName, fields, collections }: Props) {
  const router = useRouter();
  const initial = useMemo(() => buildInitialValues(fields), [fields]);
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();

  const setValue = (name: string, v: FieldValue) => {
    setValues((prev) => ({ ...prev, [name]: v }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  };

  const submit = () => {
    const errs = validateFields(fields, values);
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Maydonlarni tekshiring");
      return;
    }
    const document = serializeValues(fields, values);
    start(async () => {
      const res = await insertDocumentAction({ projectId, name: collectionName, document });
      if (!res.ok) {
        toast.error(res.message ?? "Xato");
        return;
      }
      toast.success("Hujjat qo'shildi");
      router.push(`/app/bots/${projectId}/cms/${collectionName}/data`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
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
        <Button variant="ghost" onClick={() => router.back()} disabled={pending}>
          Bekor
        </Button>
        <Button onClick={submit} disabled={pending} className="gap-1.5">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Saqlash
        </Button>
      </div>
    </div>
  );
}
