import { setRequestLocale } from "next-intl/server";
import { MessagesSquare } from "lucide-react";
import { MessagesAPI } from "@/shared/api/services";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

export default async function BotMessagesPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const items = await MessagesAPI.list(id).catch(() => []);

  return (
    <Card>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="grid place-items-center gap-3 py-16">
            <MessagesSquare className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Xabarlar yo'q</p>
          </div>
        ) : (
          <ul className="divide-y">
            {items.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="truncate">{m.text}</span>
                <Badge variant="secondary">{m.status ?? "draft"}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
