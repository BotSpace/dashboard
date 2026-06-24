import { setRequestLocale } from "next-intl/server";
import { FileIcon } from "lucide-react";
import { FilesAPI } from "@/shared/api/services";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/common/empty-state";
import { FileUploader } from "@/features/files/components/file-uploader";

function expiryLabel(expiresAt?: string | null): { text: string; variant: "secondary" | "destructive" | "outline" } {
  if (!expiresAt) return { text: "Doimiy", variant: "secondary" };
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return { text: "Muddati o'tgan", variant: "destructive" };
  if (days === 0) return { text: "Bugun tugaydi", variant: "destructive" };
  if (days <= 3) return { text: `${days} kun qoldi`, variant: "destructive" };
  const d = new Date(expiresAt);
  return {
    text: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} gacha`,
    variant: "outline",
  };
}

function humanSize(bytes?: number) {
  if (!bytes && bytes !== 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
}

export default async function BotFilesPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const files = await FilesAPI.list(id).catch(() => []);

  return (
    <div className="space-y-6">
      <FileUploader projectId={id} />

      {files.length === 0 ? (
        <EmptyState
          icon={<FileIcon className="h-7 w-7" />}
          title="Bu botda fayllar yo'q"
          description="Yuqoridagi forma orqali fayl yuklang"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {files.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/20">
                  <div className="min-w-0 flex-1">
                    {f.url ? (
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate font-medium hover:underline hover:text-blue-400 transition-colors"
                      >
                        {f.name}
                      </a>
                    ) : (
                      <span className="block truncate font-medium">{f.name}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {f.mime ?? "—"} · {humanSize(f.size)}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">{f.created_at ?? ""}</span>
                    {(() => {
                      const { text, variant } = expiryLabel(f.expires_at);
                      return (
                        <Badge variant={variant} className="text-xs font-normal">
                          {text}
                        </Badge>
                      );
                    })()}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
