import { setRequestLocale } from "next-intl/server";
import { FileIcon } from "lucide-react";
import { FilesAPI } from "@/shared/api/services";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/common/empty-state";
import { FileUploader } from "@/features/files/components/file-uploader";
import { FileDeleteButton } from "@/features/files/components/file-delete-button";
import { CopyButton } from "@/shared/components/common/copy-button";
import { Pagination } from "@/shared/components/common/pagination";

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

export default async function BotFilesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, id } = await params;
  const { page: pageParam } = await searchParams;
  setRequestLocale(locale);
  const page = Math.max(1, Number(pageParam) || 1);
  const paged = await FilesAPI.listPaged({ project: id, page, page_size: PAGE_SIZE }).catch(() => ({
    results: [],
    total_items: 0,
    total_pages: 1,
    current_page: 1,
    page_size: PAGE_SIZE,
  }));
  const files = paged.results;

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
                    <span className="block text-xs text-muted-foreground">
                      {f.mime ?? "—"} · {humanSize(f.size)}
                    </span>
                    {f.uuid && (
                      <div className="mt-0.5 flex items-center gap-1">
                        <span className="truncate font-mono text-[11px] text-muted-foreground" title={f.uuid}>
                          {f.uuid}
                        </span>
                        <CopyButton value={f.uuid} label="UUID" className="p-1" />
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">{f.created_at ?? ""}</span>
                    {(() => {
                      const { text, variant } = fileExpiryLabel(f.expires_at);
                      return (
                        <Badge variant={variant} className="text-xs font-normal">
                          {text}
                        </Badge>
                      );
                    })()}
                  </div>
                  <FileDeleteButton uuid={f.uuid} project={id} name={f.name} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <Pagination currentPage={page} totalPages={paged.total_pages} />
    </div>
  );
}
