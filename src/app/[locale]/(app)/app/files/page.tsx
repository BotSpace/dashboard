import { setRequestLocale } from "next-intl/server";
import { FileIcon, Files } from "lucide-react";
import { FilesAPI } from "@/shared/api/services";
import { Card, CardContent } from "@/shared/components/ui/card";
import { PageHeader } from "@/shared/components/common/page-header";
import { EmptyState } from "@/shared/components/common/empty-state";
import { formatNumber } from "@/shared/lib/utils";
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

export default async function FilesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const files = await FilesAPI.list().catch(() => []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fayllar"
        subtitle={`${formatNumber(files.length)} ta fayl`}
        icon={<Files className="h-5 w-5" />}
      />

      <FileUploader />

      {files.length === 0 ? (
        <EmptyState
          icon={<FileIcon className="h-7 w-7" />}
          title="Hech qanday fayl yo'q"
          description="Yuqoridagi forma orqali fayl yuklang"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Tur</th>
                  <th className="px-4 py-3 text-right">Hajm</th>
                  <th className="px-4 py-3 text-left">Sana</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {f.url ? (
                        <a href={f.url} target="_blank" rel="noreferrer" className="hover:underline hover:text-violet-400 transition-colors">
                          {f.name}
                        </a>
                      ) : (
                        f.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{f.mime ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{humanSize(f.size)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{f.created_at ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
