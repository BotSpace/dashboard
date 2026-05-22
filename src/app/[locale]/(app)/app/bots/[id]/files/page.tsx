import { setRequestLocale } from "next-intl/server";
import { FilesAPI } from "@/shared/api/services";
import { Card, CardContent } from "@/shared/components/ui/card";

export default async function BotFilesPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const files = await FilesAPI.list(id).catch(() => []);

  return (
    <Card>
      <CardContent className="p-0">
        {files.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Bu botda fayllar yo'q</p>
        ) : (
          <ul className="divide-y">
            {files.map((f) => (
              <li key={f.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="truncate">{f.name}</span>
                <span className="text-xs text-muted-foreground">{f.created_at ?? ""}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
