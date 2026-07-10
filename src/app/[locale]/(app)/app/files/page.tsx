import { setRequestLocale } from "next-intl/server";
import { FileIcon, Files } from "lucide-react";
import { FilesAPI } from "@/shared/api/services";
import { FileDeleteButton } from "@/features/files/components/file-delete-button";
import { CopyButton } from "@/shared/components/common/copy-button";
import { Pagination } from "@/shared/components/common/pagination";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { PageHeader } from "@/shared/components/common/page-header";
import { EmptyState } from "@/shared/components/common/empty-state";
import { formatNumber } from "@/shared/lib/utils";
import { fileDownloadUrl } from "@/shared/lib/file-url";

import { fileExpiryLabel } from "@/shared/lib/file-expiry";

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

const PAGE_SIZE = 20;

export default async function FilesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  setRequestLocale(locale);
  const page = Math.max(1, Number(pageParam) || 1);
  const paged = await FilesAPI.listPaged({ page, page_size: PAGE_SIZE }).catch(() => ({
    results: [],
    total_items: 0,
    total_pages: 1,
    current_page: 1,
    page_size: PAGE_SIZE,
  }));
  const files = paged.results;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fayllar"
        subtitle={`${formatNumber(files.length)} ta fayl`}
        icon={<Files className="h-5 w-5" />}
      />

      {files.length === 0 ? (
        <EmptyState
          icon={<FileIcon className="h-7 w-7" />}
          title="Hech qanday fayl yo'q"
          description="Fayllar bot ichida (loyiha sahifasida) yuklanadi"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-sm">
              <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Tur</th>
                  <th className="px-4 py-3 text-right">Hajm</th>
                  <th className="px-4 py-3 text-left">Sana</th>
                  <th className="px-4 py-3 text-left">Muddat</th>
                  <th className="px-4 py-3 text-right">Amal</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {(() => {
                        const dl = fileDownloadUrl(f.url);
                        return dl ? (
                          <span className="inline-flex items-center gap-1">
                            <a href={dl} target="_blank" rel="noreferrer" className="hover:underline hover:text-blue-400 transition-colors">
                              {f.name}
                            </a>
                            <CopyButton value={dl} label="Yuklab olish havolasi" className="p-1" />
                          </span>
                        ) : (
                          f.name
                        );
                      })()}
                      {f.uuid && (
                        <div className="mt-0.5 flex items-center gap-1">
                          <span className="truncate font-mono text-[11px] font-normal text-muted-foreground" title={f.uuid}>
                            {f.uuid}
                          </span>
                          <CopyButton value={f.uuid} label="UUID" className="p-1" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{f.mime ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{humanSize(f.size)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{f.created_at ?? "—"}</td>
                    <td className="px-4 py-3">
                      {(() => {
                        const { text, variant } = fileExpiryLabel(f.expires_at);
                        return (
                          <Badge variant={variant} className="text-xs font-normal">
                            {text}
                          </Badge>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <FileDeleteButton uuid={f.uuid} name={f.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </CardContent>
        </Card>
      )}
      <Pagination currentPage={page} totalPages={paged.total_pages} />
    </div>
  );
}
