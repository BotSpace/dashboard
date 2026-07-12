"use client";
import { useState, useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { listAllDocumentsAction } from "../actions";
import type { CmsDocument, CmsField } from "@/shared/types/api";

const MAX_EXPORT = 500;

type Props = {
  projectId: string;
  collectionName: string;
  fields: CmsField[];
};

async function buildXlsx(docs: CmsDocument[], fields: CmsField[], fileName: string) {
  // Dynamic import keeps the spreadsheet library out of SSR and initial bundles.
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Data");
  // Build header row: schema fields + system fields
  const schemaHeaders = fields.map((f) => f.label || f.name);
  const schemaNames = fields.map((f) => f.name);
  const headers = ["_id", ...schemaHeaders, "_created_at", "_updated_at"];

  // Build rows
  const rows = docs.map((doc) => {
    const row: (string | number | boolean | null)[] = [
      String(doc._id ?? ""),
      ...schemaNames.map((name) => {
        const v = doc[name];
        if (v === null || v === undefined) return "";
        if (typeof v === "object") return JSON.stringify(v);
        return v as string | number | boolean;
      }),
      String(doc._created_at ?? ""),
      String(doc._updated_at ?? ""),
    ];
    return row;
  });

  worksheet.addRows([headers, ...rows]);
  const data = await workbook.xlsx.writeBuffer();
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ExcelExportButton({ projectId, collectionName, fields }: Props) {
  const t = useTranslations("cms");
  const [pending, start] = useTransition();
  const [progress, setProgress] = useState<string | null>(null);

  const handleExport = () => {
    start(async () => {
      setProgress(t("exportProgress", { done: 0, total: "?" }));
      const result = await listAllDocumentsAction({
        projectId,
        name: collectionName,
        maxDocs: MAX_EXPORT,
      });

      if (!result.ok) {
        toast.error(t("exportError") + ": " + result.message);
        setProgress(null);
        return;
      }

      if (result.total > MAX_EXPORT) {
        toast.warning(t("exportTooMany", { total: result.total, max: MAX_EXPORT }));
      }

      setProgress(t("exportProgress", { done: result.data.length, total: Math.min(result.total, MAX_EXPORT) }));

      try {
        const fileName = `${collectionName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        await buildXlsx(result.data, fields, fileName);
        toast.success(t("exportDone", { count: result.data.length }));
      } catch {
        toast.error(t("exportError"));
      } finally {
        setProgress(null);
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={pending}
      className="gap-1.5"
    >
      <Download className="h-3.5 w-3.5" />
      {pending && progress ? progress : t("export")}
    </Button>
  );
}
