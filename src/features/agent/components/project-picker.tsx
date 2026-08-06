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

  const currentProject = projects.find((p) => String(p.id) === current);
  const currentLabel =
    current === "global"
      ? "Umumiy"
      : currentProject?.name ?? `#${current}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
          {current === "global" ? (
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Bot className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="hidden max-w-[100px] truncate sm:inline">{currentLabel}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
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
            <Bot className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 truncate">{p.name}</span>
            <code className="text-[10px] text-muted-foreground">#{p.id}</code>
          </DropdownMenuItem>
        ))}
        {projects.length === 0 && (
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            Loyihalar topilmadi
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
