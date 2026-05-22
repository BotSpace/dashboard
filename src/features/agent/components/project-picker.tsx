"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Bot, ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import type { Project } from "@/shared/types/api";

type Props = {
  projects: Project[];
  current: string;
};

export function ProjectPicker({ projects, current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const select = (id: string) => {
    const next = new URLSearchParams(sp);
    if (id === "global") next.delete("project");
    else next.set("project", id);
    router.push(`${pathname}?${next.toString()}`);
    router.refresh();
  };

  const currentLabel =
    current === "global"
      ? "Umumiy (loyiha tanlanmagan)"
      : projects.find((p) => String(p.id) === current)?.name ?? `Loyiha #${current}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          {current === "global" ? (
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Bot className="h-3.5 w-3.5 text-primary" />
          )}
          <span className="max-w-[180px] truncate">{currentLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Loyiha tanlash</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => select("global")} className="gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span>Umumiy (loyihasiz)</span>
        </DropdownMenuItem>
        {projects.length > 0 && <DropdownMenuSeparator />}
        {projects.map((p) => (
          <DropdownMenuItem
            key={p.id}
            onClick={() => select(String(p.id))}
            className="gap-2"
          >
            <Bot className="h-4 w-4 text-primary" />
            <div className="flex flex-1 items-center justify-between gap-2">
              <span className="truncate">{p.name}</span>
              <code className="text-[10px] text-muted-foreground">#{p.id}</code>
            </div>
          </DropdownMenuItem>
        ))}
        {projects.length === 0 && (
          <DropdownMenuItem disabled>(loyihalar topilmadi)</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
