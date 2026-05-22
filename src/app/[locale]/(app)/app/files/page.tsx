import { setRequestLocale } from "next-intl/server";
import { FileIcon } from "lucide-react";
import { FilesAPI } from "@/shared/api/services";
import { Card, CardContent } from "@/shared/components/ui/card";
import { formatNumber } from "@/shared/lib/utils";

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
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Fayllar</h1>
        <p className="text-sm text-muted-foreground">{formatNumber(files.length)} ta fayl</p>
      </header>

      <Card>
        <CardContent className="p-0">
          {files.length === 0 ? (
            <div className="grid place-items-center py-16 text-center">
              <FileIcon className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">Hech qanday fayl yo'q</p>
            </div>
          ) : (
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
                  <tr key={f.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {f.url ? (
                        <a href={f.url} target="_blank" rel="noreferrer" className="hover:underline">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
