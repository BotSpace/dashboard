import { setRequestLocale } from "next-intl/server";
import { FilesAPI } from "@/shared/api/services";
import { Card, CardContent } from "@/shared/components/ui/card";
import { FileUploader } from "@/features/files/components/file-uploader";

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

      <Card>
        <CardContent className="p-0">
          {files.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Bu botda fayllar yo'q</p>
          ) : (
            <ul className="divide-y">
              {files.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    {f.url ? (
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate font-medium hover:underline"
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
                  <span className="shrink-0 text-xs text-muted-foreground">{f.created_at ?? ""}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
