import { Bot, Plus, ArrowRight } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { initials } from "@/shared/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import type { Project } from "@/shared/types/api";

export function RecentBots({
  bots,
  labels,
}: {
  bots: Project[];
  labels: { title: string; empty: string; createFirst: string; createBot: string };
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{labels.title}</CardTitle>
        <Button size="sm" asChild>
          <Link href="/app/bots/new">
            <Plus className="h-4 w-4" /> {labels.createBot}
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {bots.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed py-12 text-center">
            <Bot className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">{labels.empty}</p>
            <Button className="mt-4" asChild>
              <Link href="/app/bots/new">{labels.createFirst}</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y">
            {bots.slice(0, 6).map((b) => (
              <li key={b.id} className="flex items-center justify-between py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {b.avatar && <AvatarImage src={b.avatar} alt={b.name} />}
                    <AvatarFallback>{initials(b.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{b.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {b.username ? `@${b.username}` : (b.description ?? "—")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={b.status === "active" ? "success" : "secondary"}>
                    {b.status ?? "draft"}
                  </Badge>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/app/bots/${b.id}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
